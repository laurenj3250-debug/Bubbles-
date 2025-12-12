const pool = require('./database');
const { isPostgres, isSQLite } = require('./database');

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (isSQLite) {
      console.log('Creating tables for SQLite...');

      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Partnerships table
      await client.query(`
        CREATE TABLE IF NOT EXISTS partnerships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          accepted_at TIMESTAMP,
          UNIQUE(user1_id, user2_id)
        )
      `);

      // Push tokens
      await client.query(`
        CREATE TABLE IF NOT EXISTS push_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token TEXT NOT NULL,
          device_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, token)
        )
      `);

      // Privacy preferences
      await client.query(`
        CREATE TABLE IF NOT EXISTS privacy_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          share_location BOOLEAN DEFAULT 1,
          share_activity BOOLEAN DEFAULT 1,
          share_music BOOLEAN DEFAULT 1,
          share_calendar BOOLEAN DEFAULT 1,
          share_device_context BOOLEAN DEFAULT 1,
          paused_until TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Location signals
      await client.query(`
        CREATE TABLE IF NOT EXISTS location_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          accuracy DECIMAL(10, 2),
          place_name VARCHAR(255),
          place_type VARCHAR(50),
          weather_temp DECIMAL(5, 2),
          weather_condition VARCHAR(100),
          weather_icon VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Geofences
      await client.query(`
        CREATE TABLE IF NOT EXISTS geofences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          radius INTEGER NOT NULL,
          type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Activity/fitness signals
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          activity_type VARCHAR(100),
          steps INTEGER,
          distance DECIMAL(10, 2),
          calories INTEGER,
          heart_rate INTEGER,
          workout_type VARCHAR(100),
          workout_duration INTEGER,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          date DATE DEFAULT CURRENT_DATE
        )
      `);

      // Music signals
      await client.query(`
        CREATE TABLE IF NOT EXISTS music_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          track_name VARCHAR(255),
          artist_name VARCHAR(255),
          album_name VARCHAR(255),
          track_uri VARCHAR(255),
          is_playing BOOLEAN DEFAULT 0,
          progress_ms INTEGER,
          duration_ms INTEGER,
          album_art_url TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Calendar signals
      await client.query(`
        CREATE TABLE IF NOT EXISTS calendar_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          event_title VARCHAR(255),
          event_type VARCHAR(100),
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          is_current BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Device context signals
      await client.query(`
        CREATE TABLE IF NOT EXISTS device_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          battery_level INTEGER,
          is_charging BOOLEAN,
          timezone VARCHAR(100),
          do_not_disturb BOOLEAN,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Spotify auth tokens
      await client.query(`
        CREATE TABLE IF NOT EXISTS spotify_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Daily Capsules
      await client.query(`
        CREATE TABLE IF NOT EXISTS daily_capsules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          partnership_id INTEGER REFERENCES partnerships(id) ON DELETE CASCADE,
          date DATE DEFAULT CURRENT_DATE,
          content TEXT, -- JSON stored as text in SQLite
          stats TEXT,   -- JSON stored as text in SQLite
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(partnership_id, date)
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_location_signals_user_timestamp
        ON location_signals(user_id, timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_activity_signals_user_date
        ON activity_signals(user_id, date DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_music_signals_user_timestamp
        ON music_signals(user_id, timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_daily_capsules_partnership_date
        ON daily_capsules(partnership_id, date DESC)
      `);

    } else {
      console.log('Creating tables for PostgreSQL...');

      // PostgreSQL tables (original migration)
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS partnerships (
          id SERIAL PRIMARY KEY,
          user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          user1_alias VARCHAR(100), -- What user1 calls user2
          user2_alias VARCHAR(100), -- What user2 calls user1
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          accepted_at TIMESTAMP,
          UNIQUE(user1_id, user2_id)
        )
      `);

      // Indexes for Partnerships
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_partnerships_users
        ON partnerships(user1_id, user2_id, status)
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS push_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token TEXT NOT NULL,
          device_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, token)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS privacy_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          share_location BOOLEAN DEFAULT true,
          share_activity BOOLEAN DEFAULT true,
          share_music BOOLEAN DEFAULT true,
          share_calendar BOOLEAN DEFAULT true,
          share_device_context BOOLEAN DEFAULT true,
          paused_until TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Index for Privacy
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_privacy_user
        ON privacy_settings(user_id)
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS location_signals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          accuracy DECIMAL(10, 2),
          place_name VARCHAR(255),
          place_type VARCHAR(50),
          weather_temp DECIMAL(5, 2),
          weather_condition VARCHAR(100),
          weather_icon VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS geofences (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          radius INTEGER NOT NULL,
          type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_signals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          activity_type VARCHAR(100),
          steps INTEGER,
          distance DECIMAL(10, 2),
          calories INTEGER,
          heart_rate INTEGER,
          workout_type VARCHAR(100),
          workout_duration INTEGER,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          date DATE DEFAULT CURRENT_DATE
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS music_signals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          track_name VARCHAR(255),
          artist_name VARCHAR(255),
          album_name VARCHAR(255),
          track_uri VARCHAR(255),
          is_playing BOOLEAN DEFAULT false,
          progress_ms INTEGER,
          duration_ms INTEGER,
          album_art_url TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS calendar_signals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          event_title VARCHAR(255),
          event_type VARCHAR(100),
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          is_current BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS device_signals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          battery_level INTEGER,
          is_charging BOOLEAN,
          timezone VARCHAR(100),
          do_not_disturb BOOLEAN,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS spotify_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS daily_capsules (
          id SERIAL PRIMARY KEY,
          partnership_id INTEGER REFERENCES partnerships(id) ON DELETE CASCADE,
          date DATE DEFAULT CURRENT_DATE,
          content JSONB,
          stats JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(partnership_id, date)
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_location_signals_user_timestamp
        ON location_signals(user_id, timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_activity_signals_user_date
        ON activity_signals(user_id, date DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_music_signals_user_timestamp
        ON music_signals(user_id, timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_device_signals_user_timestamp
        ON device_signals(user_id, timestamp DESC)
      `);
    }

    await client.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migrations
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = createTables;
