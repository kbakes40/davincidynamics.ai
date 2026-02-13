/**
 * Spotify OAuth Client - Uses Backend Proxy
 * All OAuth logic is handled server-side to avoid browser security restrictions
 */

export interface SpotifyAuthParams {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// These functions are no longer used - kept for compatibility
// The backend proxy handles all OAuth logic now
export async function redirectToSpotifyAuth(params: SpotifyAuthParams): Promise<void> {
  console.log('[spotifyAuth] This function is deprecated - use backend proxy instead');
  throw new Error('Use backend proxy for authentication');
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<TokenResponse> {
  console.log('[spotifyAuth] This function is deprecated - use backend proxy instead');
  throw new Error('Use backend proxy for token exchange');
}
