import { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { openSpotifyAuthPopup, exchangeCodeForToken, saveTokenToStorage, getTokenFromStorage, clearTokenFromStorage } from '@/lib/spotifyAuth';

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  addListener: (event: string, callback: (data: any) => void) => boolean;
  removeListener: (event: string, callback?: (data: any) => void) => boolean;
}

interface PlayerState {
  paused: boolean;
  track_window: {
    current_track: {
      name: string;
      artists: Array<{ name: string }>;
    };
  };
}

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export default function SpotifyBottomPlayer() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [trackName, setTrackName] = useState('Boss Hookah Radio');
  const [artistName, setArtistName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);

  // Load Spotify SDK
  useEffect(() => {
    // Define the callback BEFORE loading the script
    window.onSpotifyWebPlaybackSDKReady = () => {
      // This will be called when SDK is ready
      // Actual initialization happens in the next useEffect
    };

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window.onSpotifyWebPlaybackSDKReady;
    };
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = getTokenFromStorage();
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // Initialize player when SDK is ready and we have a token
  useEffect(() => {
    if (!accessToken || !window.Spotify) return;

    const initializePlayer = () => {
      if (!window.Spotify) return;

      const spotifyPlayer = new window.Spotify.Player({
        name: 'Boss Hookah Web Player',
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setErrorMessage(null);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        setErrorMessage('Spotify player unavailable. Please reconnect.');
      });

      spotifyPlayer.addListener('player_state_changed', (state: PlayerState | null) => {
        if (!state) return;

        setIsPaused(state.paused);
        setTrackName(state.track_window.current_track.name);
        setArtistName(state.track_window.current_track.artists.map(a => a.name).join(', '));
      });

      spotifyPlayer.connect().catch((err) => {
        console.error('Failed to connect player:', err);
        setErrorMessage('Failed to connect to Spotify. Please try again.');
      });

      setPlayer(spotifyPlayer);
      playerRef.current = spotifyPlayer;
    };

    // If SDK is already loaded, initialize immediately
    if (window.Spotify) {
      initializePlayer();
    } else {
      // Otherwise wait for SDK ready callback
      const originalCallback = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (originalCallback) originalCallback();
        initializePlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [accessToken]);

  // Start playback when device is ready
  useEffect(() => {
    if (!deviceId || !accessToken) return;

    const playlistUri = import.meta.env.VITE_SPOTIFY_PLAYLIST_URI;
    if (!playlistUri) {
      setErrorMessage('Playlist not configured');
      return;
    }

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        context_uri: playlistUri,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error?.message || 'Failed to start playback');
          });
        }
      })
      .catch((err) => {
        console.error('Playback error:', err);
        if (err.message.includes('Premium')) {
          setErrorMessage('Spotify Premium required for playback.');
        } else {
          setErrorMessage('Failed to start playback. Please try again.');
        }
      });
  }, [deviceId, accessToken]);

  const handleConnect = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/spotify-callback`;
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-modify-playback-state',
      'user-read-playback-state',
    ];

    try {
      setErrorMessage(null);
      const code = await openSpotifyAuthPopup({ clientId, redirectUri, scopes });
      const token = await exchangeCodeForToken(code, clientId, redirectUri);
      saveTokenToStorage(token);
      setAccessToken(token.access_token);
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to authenticate with Spotify');
    }
  };

  const handleTogglePlay = async () => {
    if (player) {
      try {
        await player.togglePlay();
      } catch (err) {
        console.error('Toggle play error:', err);
      }
    }
  };

  const handleNext = async () => {
    if (player) {
      try {
        await player.nextTrack();
      } catch (err) {
        console.error('Next track error:', err);
      }
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center gap-4 px-4 py-3 border-t"
      style={{
        height: '80px',
        background: '#0b0b0f',
        borderTopColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Left: Track Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: 'rgba(255,255,255,0.92)' }}>
          {trackName}
        </div>
        {artistName && (
          <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {artistName}
          </div>
        )}
        {errorMessage && (
          <div className="text-xs mt-1" style={{ color: 'rgba(255,80,80,0.92)' }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {!accessToken ? (
          <button
            onClick={handleConnect}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: '#1DB954',
              color: '#0b0b0f',
              height: '40px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1ed760';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1DB954';
            }}
          >
            Connect Spotify
          </button>
        ) : (
          <>
            <button
              onClick={handleTogglePlay}
              className="flex items-center justify-center px-4 py-2 rounded-xl transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.92)',
                height: '40px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={handleNext}
              className="flex items-center justify-center px-4 py-2 rounded-xl transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.92)',
                height: '40px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
