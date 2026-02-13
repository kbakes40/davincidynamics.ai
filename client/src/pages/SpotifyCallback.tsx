import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function SpotifyCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const exchangeTokenMutation = trpc.spotify.exchangeToken.useMutation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const errorParam = params.get('error');

      console.log('[Spotify Callback] Code:', code, 'State:', state, 'Error:', errorParam);

      if (errorParam) {
        setError(`Spotify authentication error: ${errorParam}`);
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received from Spotify');
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        return;
      }

      if (!state) {
        setError('No state parameter received');
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        return;
      }

      // Verify state matches what we stored
      const storedState = sessionStorage.getItem('spotify_oauth_state');
      if (state !== storedState) {
        setError('State mismatch - possible security issue');
        sessionStorage.removeItem('spotify_oauth_state');
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        return;
      }

      // Clean up stored state
      sessionStorage.removeItem('spotify_oauth_state');

      try {
        // Exchange code for token via backend
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = `${window.location.origin}/spotify-callback`;
        
        console.log('[Spotify Callback] Exchanging code via backend...');
        const tokenData = await exchangeTokenMutation.mutateAsync({
          code,
          state,
          clientId,
          redirectUri,
        });
        
        console.log('[Spotify Callback] Token received, redirecting to home with token in hash');
        
        // Pass token via URL hash (will be picked up by SpotifyBottomPlayer)
        setLocation(`/#access_token=${tokenData.access_token}`);
      } catch (err) {
        console.error('[Spotify Callback] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete authentication');
        setTimeout(() => {
          setLocation('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [setLocation, exchangeTokenMutation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-500 text-lg">{error}</div>
            <div className="text-muted-foreground text-sm">Redirecting back...</div>
          </>
        ) : (
          <>
            <div className="text-accent text-lg">Completing authentication...</div>
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          </>
        )}
      </div>
    </div>
  );
}
