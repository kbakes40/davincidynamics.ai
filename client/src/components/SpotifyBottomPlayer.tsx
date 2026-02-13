/**
 * Spotify Embed Player - No Authentication Required
 * Uses Spotify's embed iframe for universal playback
 */

export default function SpotifyBottomPlayer() {
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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t"
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
          title="Smooth Jazz Radio"
        />
      </div>
    </div>
  );
}
