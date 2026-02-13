import { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
  addListener: (event: string, callback: (data: any) => void) => boolean;
  removeListener: (event: string, callback?: (data: any) => void) => boolean;
}

interface PlayerState {
  paused: boolean;
  track_window: {
    current_track: {
      name: string;
      artists: Array<{ name: string }>;
      album: {
        images: Array<{ url: string; height: number; width: number }>;
      };
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
  const [albumArtUrl, setAlbumArtUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volume, setVolume] = useState(80); // 80% default
  const [currentPosition, setCurrentPosition] = useState(0); // Current position in ms
  const [duration, setDuration] = useState(0); // Track duration in ms
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

  // Check for token in URL hash (from callback)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        console.log('[SpotifyPlayer] Found token in URL hash');
        setAccessToken(token);
        // Clear the hash
        window.history.replaceState(null, '', window.location.pathname);
      }
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
        volume: 0.8,
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

      spotifyPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        setIsPaused(state.paused);
        setTrackName(state.track_window.current_track.name);
        setArtistName(state.track_window.current_track.artists.map((a: any) => a.name).join(', '));
        
        // Get smallest album art (64x64 typically)
        const albumImages = state.track_window.current_track.album.images;
        if (albumImages && albumImages.length > 0) {
          // Use the smallest image (last in array)
          setAlbumArtUrl(albumImages[albumImages.length - 1].url);
        }

        // Update position and duration
        setCurrentPosition(state.position);
        setDuration(state.duration);
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

  const getAuthUrlMutation = trpc.spotify.getAuthUrl.useMutation();

  const handleConnect = async () => {
    console.log('[SpotifyPlayer] Connect button clicked');
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    console.log('[SpotifyPlayer] Client ID:', clientId ? 'Found' : 'Missing');
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
      console.log('[SpotifyPlayer] Calling backend to get auth URL...');
      
      const result = await getAuthUrlMutation.mutateAsync({
        clientId,
        redirectUri,
        scopes,
      });

      console.log('[SpotifyPlayer] Got auth URL from backend, redirecting...');
      console.log('[SpotifyPlayer] Auth URL:', result.authUrl);
      
      // Store state for callback verification
      sessionStorage.setItem('spotify_oauth_state', result.state);
      
      // Redirect to Spotify authorization page
      window.location.href = result.authUrl;
    } catch (err) {
      console.error('[SpotifyPlayer] Authentication error:', err);
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

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (player) {
      try {
        // Spotify volume is 0-1, so divide by 100
        await player.setVolume(newVolume / 100);
      } catch (err) {
        console.error('Volume change error:', err);
      }
    }
  };

  const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseInt(e.target.value);
    setCurrentPosition(newPosition);
    
    if (accessToken && deviceId) {
      try {
        await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newPosition}&device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } catch (err) {
        console.error('Seek error:', err);
      }
    }
  };

  // Format time in mm:ss
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t"
      style={{
        background: '#0b0b0f',
        borderTopColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Progress Bar */}
      {accessToken && duration > 0 && (
        <div className="px-4 pt-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <span className="w-10 text-right">{formatTime(currentPosition)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentPosition}
              onChange={handleSeek}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${(currentPosition / duration) * 100}%, rgba(255,255,255,0.2) ${(currentPosition / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Main Player Controls */}
      <div className="flex items-center gap-4 px-4 py-3">

      {/* Left: Album Art + Track Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {albumArtUrl && (
          <img 
            src={albumArtUrl} 
            alt="Album artwork"
            className="w-12 h-12 rounded-md shadow-lg"
            style={{ objectFit: 'cover' }}
          />
        )}
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
      </div>

      {/* Center: Volume Slider (only when connected) */}
      {accessToken && (
        <div className="flex items-center gap-3 px-4">
          <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
          <span className="text-xs font-medium w-8 text-right" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {volume}%
          </span>
        </div>
      )}

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
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
