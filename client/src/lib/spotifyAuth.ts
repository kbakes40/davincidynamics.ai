/**
 * Spotify OAuth PKCE Flow Utilities
 * Implements Authorization Code with PKCE for secure client-side authentication
 * Uses full-page redirect for better compatibility and reliability
 */

// Generate a random code verifier for PKCE
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Generate code challenge from verifier
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
}

export interface SpotifyAuthParams {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export async function redirectToSpotifyAuth(params: SpotifyAuthParams): Promise<void> {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier and return path for later use
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  localStorage.setItem('spotify_return_path', window.location.pathname);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', params.clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', params.redirectUri);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('scope', params.scopes.join(' '));

  // Redirect to Spotify authorization page
  window.location.href = authUrl.toString();
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<TokenResponse> {
  const codeVerifier = localStorage.getItem('spotify_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  const data: TokenResponse = await response.json();
  
  // Clean up code verifier
  localStorage.removeItem('spotify_code_verifier');
  
  return data;
}

export function saveTokenToStorage(token: TokenResponse): void {
  localStorage.setItem('spotify_access_token', token.access_token);
  localStorage.setItem('spotify_token_expires_at', String(Date.now() + token.expires_in * 1000));
  if (token.refresh_token) {
    localStorage.setItem('spotify_refresh_token', token.refresh_token);
  }
}

export function getTokenFromStorage(): string | null {
  const token = localStorage.getItem('spotify_access_token');
  const expiresAt = localStorage.getItem('spotify_token_expires_at');
  
  if (!token || !expiresAt) {
    return null;
  }
  
  // Check if token is expired
  if (Date.now() >= parseInt(expiresAt)) {
    clearTokenFromStorage();
    return null;
  }
  
  return token;
}

export function clearTokenFromStorage(): void {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expires_at');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_return_path');
}
