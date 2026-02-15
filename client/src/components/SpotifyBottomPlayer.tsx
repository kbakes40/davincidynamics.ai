/**
 * Spotify Embed Player - No Authentication Required
 * Uses Spotify's embed iframe for universal playback
 * Hidden by default, activated by triple-tapping the screen
 */

import { useState, useEffect } from 'react';

export default function SpotifyBottomPlayer() {
  const [isVisible, setIsVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const playlistUri = import.meta.env.VITE_SPOTIFY_PLAYLIST_URI || '';
  
  // Extract playlist ID from URI (format: spotify:playlist:ID or full URL)
  const getPlaylistId = (uri: string): string => {
    if (!uri) return '37i9dQZEVXbKM896FDX8L1'; // Smooth Jazz playlist
    
    // Handle spotify:playlist:ID format
    if (uri.startsWith('spotify:playlist:')) {
      return uri.replace('spotify:playlist:', '');
    }
    
    // Handle full Spotify URL
    if (uri.includes('open.spotify.com/playlist/')) {
      const match = uri.match(/playlist\/([a-zA-Z0-9]+)/);
      return match ? match[1] : '37i9dQZEVXbKM896FDX8L1';
    }
    
    // Assume it's just the ID
    return uri;
  };

  const playlistId = getPlaylistId(playlistUri);

  useEffect(() => {
    const handleTap = () => {
      // Clear existing timeout
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }

      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);

      // If triple tap detected, toggle visibility
      if (newTapCount === 3) {
        setIsVisible(!isVisible);
        setTapCount(0);
        setTapTimeout(null);
      } else {
        // Reset tap count after 500ms
        const timeout = setTimeout(() => {
          setTapCount(0);
        }, 500);
        setTapTimeout(timeout);
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleTap);

    return () => {
      document.removeEventListener('click', handleTap);
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }
    };
  }, [tapCount, tapTimeout, isVisible]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t animate-in slide-in-from-bottom duration-300"
      style={{
        background: '#0b0b0f',
        borderTopColor: 'rgba(255,255,255,0.08)',
        height: '100px',
      }}
    >
      <div className="flex items-center h-full px-4">
        <iframe
          style={{ borderRadius: '12px' }}
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="House Music Radio"
        />
      </div>
    </div>
  );
}
