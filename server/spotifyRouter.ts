/**
 * Backend Spotify OAuth Proxy
 * Handles OAuth flow server-side to avoid browser security restrictions
 */

import { publicProcedure, router } from './_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Generate random string for PKCE
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Generate code challenge from verifier
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const crypto = await import('crypto');
  return crypto.webcrypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, 'binary')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
}

// In-memory store for PKCE verifiers (in production, use Redis or database)
const pkceStore = new Map<string, { verifier: string; timestamp: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  pkceStore.forEach((value, key) => {
    if (value.timestamp < fiveMinutesAgo) {
      pkceStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

export const spotifyRouter = router({
  // Generate auth URL with PKCE
  getAuthUrl: publicProcedure
    .input(z.object({
      clientId: z.string(),
      redirectUri: z.string(),
      scopes: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const state = generateRandomString(16);
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store verifier with state as key
      pkceStore.set(state, {
        verifier: codeVerifier,
        timestamp: Date.now(),
      });

      const authUrl = new URL('https://accounts.spotify.com/authorize');
      authUrl.searchParams.append('client_id', input.clientId);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', input.redirectUri);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('scope', input.scopes.join(' '));
      authUrl.searchParams.append('state', state);

      console.log('[Spotify Backend] Generated auth URL with state:', state);
      
      return {
        authUrl: authUrl.toString(),
        state,
      };
    }),

  // Exchange authorization code for access token
  exchangeToken: publicProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
      clientId: z.string(),
      redirectUri: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log('[Spotify Backend] Exchanging token for state:', input.state);

      // Retrieve verifier from store
      const stored = pkceStore.get(input.state);
      if (!stored) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired state parameter',
        });
      }

      // Clean up used verifier
      pkceStore.delete(input.state);

      const params = new URLSearchParams({
        client_id: input.clientId,
        grant_type: 'authorization_code',
        code: input.code,
        redirect_uri: input.redirectUri,
        code_verifier: stored.verifier,
      });

      console.log('[Spotify Backend] Calling Spotify token endpoint...');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Spotify Backend] Token exchange failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Token exchange failed: ${error.error_description || error.error}`,
        });
      }

      const data = await response.json();
      console.log('[Spotify Backend] Token exchange successful');

      return {
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
        scope: data.scope,
      };
    }),
});
