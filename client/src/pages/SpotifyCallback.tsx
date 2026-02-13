import { useEffect } from 'react';

export default function SpotifyCallback() {
  useEffect(() => {
    const handleCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (window.opener) {
        if (error) {
          window.opener.postMessage({
            type: 'spotify-auth-error',
            error: error
          }, window.location.origin);
        } else if (code) {
          window.opener.postMessage({
            type: 'spotify-auth-success',
            code: code
          }, window.location.origin);
        } else {
          window.opener.postMessage({
            type: 'spotify-auth-error',
            error: 'No authorization code received'
          }, window.location.origin);
        }
        
        // Close the popup after sending message
        window.close();
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-accent text-lg">Completing authentication...</div>
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
}
