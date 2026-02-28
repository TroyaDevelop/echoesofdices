CREATE TABLE IF NOT EXISTS user_daily_likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    like_day DATE NOT NULL DEFAULT (CURDATE()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_daily_like_sender_day (from_user_id, like_day),
    INDEX idx_user_daily_likes_to_user (to_user_id),
    INDEX idx_user_daily_likes_day (like_day),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_master_honors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    master_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_master_honor (user_id, master_user_id),
    INDEX idx_master_honors_master (master_user_id),
    INDEX idx_master_honors_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (master_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS master_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    master_user_id INT NOT NULL,
    reviewer_user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_master_reviews_master_created (master_user_id, created_at),
    INDEX idx_master_reviews_reviewer (reviewer_user_id),
    FOREIGN KEY (master_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE
);
