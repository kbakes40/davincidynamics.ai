import { describe, expect, it } from "vitest";

describe("Spotify Configuration", () => {
  it("should have valid Spotify Client ID configured", () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    
    expect(clientId).toBeDefined();
    expect(clientId).not.toBe('');
    expect(typeof clientId).toBe('string');
    expect(clientId!.length).toBeGreaterThan(10);
  });

  it("should have valid Spotify Playlist URI configured", () => {
    const playlistUri = process.env.VITE_SPOTIFY_PLAYLIST_URI;
    
    expect(playlistUri).toBeDefined();
    expect(playlistUri).not.toBe('');
    expect(typeof playlistUri).toBe('string');
    expect(playlistUri).toMatch(/^spotify:playlist:[a-zA-Z0-9]+$/);
  });
});
