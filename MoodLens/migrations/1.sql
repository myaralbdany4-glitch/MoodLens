
CREATE TABLE mood_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_type TEXT NOT NULL, -- 'face', 'voice', or 'combined'
  mood_analysis TEXT, -- JSON string with analysis results
  emotions_detected TEXT, -- JSON string with detected emotions
  confidence_score REAL,
  ai_recommendations TEXT, -- JSON string with AI-generated recommendations
  user_feedback INTEGER, -- 1-5 rating of recommendations helpfulness
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  age_range TEXT, -- 'teen', 'young_adult', 'adult', 'middle_age', 'senior'
  preferred_language TEXT DEFAULT 'ar',
  timezone TEXT,
  mood_tracking_enabled BOOLEAN DEFAULT 1,
  notification_preferences TEXT, -- JSON string
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_mood_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  average_mood_score REAL,
  emotions_summary TEXT, -- JSON string
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mood_sessions_user_id ON mood_sessions(user_id);
CREATE INDEX idx_mood_sessions_created_at ON mood_sessions(created_at);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_daily_mood_tracking_user_date ON daily_mood_tracking(user_id, date);
