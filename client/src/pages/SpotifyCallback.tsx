import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { exchangeCodeForToken, saveTokenToStorage } from '@/lib/spotifyAuth';

export default function SpotifyCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      console.log('[Spotify Callback] Code:', code, 'Error:', errorParam);

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

      try {
        // Exchange code for token
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = `${window.location.origin}/spotify-callback`;
        
        console.log('[Spotify Callback] Exchanging code for token...');
        const token = await exchangeCodeForToken(code, clientId, redirectUri);
        
        console.log('[Spotify Callback] Token received, saving to storage');
        saveTokenToStorage(token);
        
        // Redirect back to home page
        const returnPath = localStorage.getItem('spotify_return_path') || '/';
        localStorage.removeItem('spotify_return_path');
        
        console.log('[Spotify Callback] Redirecting to:', returnPath);
        setLocation(returnPath);
      } catch (err) {
        console.error('[Spotify Callback] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete authentication');
        setTimeout(() => {
          setLocation('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [setLocation]);

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
