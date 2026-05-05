-- =============================
-- USERS
-- =============================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash BYTEA NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(20),
    birth_date DATE,
    bio TEXT,d
    profile_picture VARCHAR(255),

    rating INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    league VARCHAR(50) NOT NULL DEFAULT 'Green Seed',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_rating_desc ON users (rating DESC);


-- =============================
-- EMAIL VERIFICATION
-- =============================
CREATE TABLE email_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL
);


-- =============================
-- PASSWORD RESETS
-- =============================
CREATE TABLE password_resets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);


-- =============================
-- REFRESH TOKENS
-- =============================
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);


-- =============================
-- NEWS
-- =============================
CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    published_at TIMESTAMP NOT NULL,
    source VARCHAR(255),
    description TEXT
);

CREATE INDEX idx_news_published_at_desc ON news (published_at DESC);


-- =============================
-- ECO QUESTIONS
-- =============================
CREATE TABLE eco_questions (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    max_value INT NOT NULL DEFAULT 5 CHECK (max_value > 0),
    weight NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    is_reverse BOOLEAN NOT NULL DEFAULT FALSE,
    tip TEXT
);

CREATE INDEX idx_eco_questions_category ON eco_questions(category);


-- =============================
-- ECO QUESTION OPTIONS
-- Optional: use if you later want per-option labels/scores from DB
-- =============================
CREATE TABLE eco_question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES eco_questions(id) ON DELETE CASCADE,
    value INT NOT NULL,
    label VARCHAR(100) NOT NULL,
    impact_score INT NOT NULL,
    UNIQUE(question_id, value)
);


-- =============================
-- ECO RESULTS
-- One test pass = one result
-- =============================
CREATE TABLE eco_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    total_score NUMERIC(6,2) NOT NULL,
    max_score NUMERIC(6,2) NOT NULL DEFAULT 0,
    percent NUMERIC(5,2) NOT NULL DEFAULT 0,

    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    strongest_category VARCHAR(50),
    weakest_category VARCHAR(50),

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eco_results_user_created_at ON eco_results (user_id, created_at DESC);


-- =============================
-- ECO ANSWERS
-- Answers linked to a specific result/test pass
-- =============================
CREATE TABLE eco_answers (
    id BIGSERIAL PRIMARY KEY,
    result_id BIGINT NOT NULL REFERENCES eco_results(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES eco_questions(id) ON DELETE CASCADE,
    value INT NOT NULL CHECK (value >= 0 AND value <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eco_answers_result_id ON eco_answers(result_id);
CREATE INDEX idx_eco_answers_user_id ON eco_answers(user_id);


-- =============================
-- ECO RESULT BREAKDOWNS
-- Category analytics for each result
-- =============================
CREATE TABLE eco_result_breakdowns (
    id BIGSERIAL PRIMARY KEY,
    result_id BIGINT NOT NULL REFERENCES eco_results(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    score NUMERIC(6,2) NOT NULL,
    max_score NUMERIC(6,2) NOT NULL,
    percent NUMERIC(5,2) NOT NULL,
    level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(result_id, category)
);

CREATE INDEX idx_eco_result_breakdowns_result_id ON eco_result_breakdowns(result_id);


-- =============================
-- ECO RESULT RECOMMENDATIONS
-- Top weak-answer recommendations for each result
-- =============================
CREATE TABLE eco_result_recommendations (
    id BIGSERIAL PRIMARY KEY,
    result_id BIGINT NOT NULL REFERENCES eco_results(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    answer INT NOT NULL,
    max_value INT NOT NULL,
    impact NUMERIC(6,2) NOT NULL,
    tip TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eco_result_recommendations_result_id ON eco_result_recommendations(result_id);


-- =============================
-- ECO ACTIONS
-- =============================
CREATE TABLE eco_actions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    points INT NOT NULL DEFAULT 5,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    cooldown_type VARCHAR(20) NOT NULL DEFAULT 'daily'
        CHECK (cooldown_type IN ('daily', 'weekly', 'one_time', 'none'))
);
CREATE INDEX idx_eco_actions_category ON eco_actions(category);


-- =============================
-- USER ACTIONS
-- =============================
CREATE TABLE user_actions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_id BIGINT NOT NULL REFERENCES eco_actions(id) ON DELETE CASCADE,
    points INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_actions_user_id_created_at ON user_actions(user_id, created_at DESC);

-- protects from duplicate daily action if cooldown_type == daily logic is used this way
CREATE UNIQUE INDEX ux_user_actions_daily
ON user_actions (user_id, action_id, (created_at::date));


-- =============================
-- NOTIFICATIONS
-- =============================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);


-- =============================
-- STREAKS
-- =============================
CREATE TABLE user_streaks (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_action_date DATE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- =============================
-- ACHIEVEMENTS
-- =============================
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(20),
    category VARCHAR(50) NOT NULL,
    metric VARCHAR(50) NOT NULL,
    target_value NUMERIC(10,2) NOT NULL
);


CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);


-- =============================
-- CHALLENGES
-- =============================
CREATE TABLE user_challenges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('daily', 'weekly')),
    kind VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    target_value INT NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, code, start_date)
);

CREATE INDEX idx_user_challenges_user_dates
ON user_challenges(user_id, start_date, end_date);

CREATE INDEX idx_user_challenges_status
ON user_challenges(user_id, status);

-- FRIENDS
CREATE TABLE IF NOT EXISTS friends (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);


ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS category VARCHAR(100);