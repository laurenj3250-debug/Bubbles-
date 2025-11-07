const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Get Spotify auth URL
router.get('/auth-url', authenticate, (req, res) => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-read-recently-played'
  ];

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, req.user.id.toString());

  res.json({ url: authorizeURL });
});

// Spotify callback (exchange code for tokens)
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];
    const expiresIn = data.body['expires_in'];

    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const userId = parseInt(state); // state contains user ID

    // Store tokens
    await pool.query(
      `INSERT INTO spotify_tokens (user_id, access_token, refresh_token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET access_token = $2, refresh_token = $3, expires_at = $4, updated_at = CURRENT_TIMESTAMP`,
      [userId, accessToken, refreshToken, expiresAt]
    );

    res.json({
      message: 'Spotify connected successfully',
      expiresIn
    });
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: 'Failed to connect Spotify' });
  }
});

// Helper: Refresh access token
async function refreshAccessToken(userId) {
  try {
    const result = await pool.query(
      'SELECT refresh_token FROM spotify_tokens WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('No Spotify token found');
    }

    spotifyApi.setRefreshToken(result.rows[0].refresh_token);
    const data = await spotifyApi.refreshAccessToken();

    const newAccessToken = data.body['access_token'];
    const expiresIn = data.body['expires_in'];
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await pool.query(
      'UPDATE spotify_tokens SET access_token = $1, expires_at = $2 WHERE user_id = $3',
      [newAccessToken, expiresAt, userId]
    );

    return newAccessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

// Helper: Get valid access token
async function getAccessToken(userId) {
  const result = await pool.query(
    'SELECT access_token, expires_at FROM spotify_tokens WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Spotify not connected');
  }

  const { access_token, expires_at } = result.rows[0];

  // Check if token is expired
  if (new Date(expires_at) <= new Date()) {
    return await refreshAccessToken(userId);
  }

  return access_token;
}

// Get current playing track
router.get('/now-playing', authenticate, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.user.id);
    spotifyApi.setAccessToken(accessToken);

    const data = await spotifyApi.getMyCurrentPlayingTrack();

    if (!data.body || !data.body.item) {
      return res.json({ nowPlaying: null });
    }

    const track = data.body.item;

    res.json({
      nowPlaying: {
        trackName: track.name,
        artistName: track.artists.map(a => a.name).join(', '),
        albumName: track.album.name,
        trackUri: track.uri,
        isPlaying: data.body.is_playing,
        progressMs: data.body.progress_ms,
        durationMs: track.duration_ms,
        albumArtUrl: track.album.images[0]?.url
      }
    });
  } catch (error) {
    if (error.message === 'Spotify not connected') {
      return res.status(404).json({ error: 'Spotify not connected' });
    }
    console.error('Now playing error:', error);
    res.status(500).json({ error: 'Failed to get now playing' });
  }
});

// Get recently played tracks
router.get('/recent', authenticate, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.user.id);
    spotifyApi.setAccessToken(accessToken);

    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 10 });

    const tracks = data.body.items.map(item => ({
      trackName: item.track.name,
      artistName: item.track.artists.map(a => a.name).join(', '),
      albumName: item.track.album.name,
      trackUri: item.track.uri,
      albumArtUrl: item.track.album.images[0]?.url,
      playedAt: item.played_at
    }));

    res.json({ recentTracks: tracks });
  } catch (error) {
    console.error('Recent tracks error:', error);
    res.status(500).json({ error: 'Failed to get recent tracks' });
  }
});

// Check Spotify connection status
router.get('/status', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT expires_at FROM spotify_tokens WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ connected: false });
    }

    res.json({
      connected: true,
      expiresAt: result.rows[0].expires_at
    });
  } catch (error) {
    console.error('Spotify status error:', error);
    res.status(500).json({ error: 'Failed to check Spotify status' });
  }
});

// Disconnect Spotify
router.delete('/disconnect', authenticate, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM spotify_tokens WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ message: 'Spotify disconnected' });
  } catch (error) {
    console.error('Spotify disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Spotify' });
  }
});

module.exports = router;
