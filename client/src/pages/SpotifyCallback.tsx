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

      if (errorParam) {
        setError(`Spotify authorization failed: ${errorParam}`);
        setTimeout(() => setLocation('/'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => setLocation('/'), 3000);
        return;
      }

      try {
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
        const redirectUri = `${window.location.origin}/spotify-callback`;
        
        const token = await exchangeCodeForToken(code, clientId, redirectUri);
        saveTokenToStorage(token);
        
        // Redirect back to home
        setLocation('/');
      } catch (err) {
        console.error('Token exchange error:', err);
        setError(err instanceof Error ? err.message : 'Failed to authenticate with Spotify');
        setTimeout(() => setLocation('/'), 3000);
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-500 text-lg">{error}</div>
            <div className="text-muted-foreground">Redirecting...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-accent text-lg">Connecting to Spotify...</div>
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
