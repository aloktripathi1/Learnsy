-- Learnsy Database Schema for Neon
-- This schema replaces Supabase's auth.users with a simple users table
-- RLS policies are removed since we'll handle authorization in the application layer

-- Create users table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail TEXT,
    video_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_playlist_id ON courses(playlist_id);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail TEXT,
    duration TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_course_id ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    bookmarked BOOLEAN DEFAULT FALSE,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_video_id ON user_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed);
CREATE INDEX IF NOT EXISTS idx_user_progress_bookmarked ON user_progress(bookmarked);

-- Create streak_activity table
CREATE TABLE IF NOT EXISTS streak_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    videos_watched INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_streak_activity_user_id ON streak_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_activity_date ON streak_activity(date);

-- Create video_timestamps table for resume playback functionality
CREATE TABLE IF NOT EXISTS video_timestamps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_timestamps_user_video ON video_timestamps(user_id, video_id);

-- Add a function to check playlist limit per user (max 4 playlists)
CREATE OR REPLACE FUNCTION check_playlist_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM courses WHERE user_id = NEW.user_id) >= 4 THEN
        RAISE EXCEPTION 'User has reached the maximum limit of 4 playlists';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce playlist limit on insert
DROP TRIGGER IF EXISTS enforce_playlist_limit ON courses;
CREATE TRIGGER enforce_playlist_limit
    BEFORE INSERT ON courses
    FOR EACH ROW
    EXECUTE FUNCTION check_playlist_limit();

COMMENT ON TRIGGER enforce_playlist_limit ON courses IS 'Enforces maximum of 4 playlists per user';
