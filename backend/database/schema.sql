CREATE DATABASE IF NOT EXISTS eotd20_wiki CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eotd20_wiki;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('editor', 'user') DEFAULT 'user',
    nickname VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reg_key VARCHAR(80) UNIQUE NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by INT NULL,
    used_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    INDEX idx_reg_keys_active_used (is_active, used_at),
    INDEX idx_reg_keys_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS news_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    author_id INT,
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_news_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    source VARCHAR(100),
    source_pages VARCHAR(50),
    author_id INT,
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_articles_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS spells (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    level TINYINT UNSIGNED NOT NULL DEFAULT 0,
    school VARCHAR(100),
    theme VARCHAR(32) DEFAULT 'none',
    casting_time VARCHAR(255),
    range_text VARCHAR(255),
    components TEXT,
    duration VARCHAR(255),
    classes VARCHAR(255),
    subclasses VARCHAR(255),
    source VARCHAR(100),
    source_pages VARCHAR(50),
    description LONGTEXT,
    description_eot LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_spells_name (name)
);

CREATE TABLE IF NOT EXISTS traits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    source VARCHAR(100),
    source_pages VARCHAR(50),
    description LONGTEXT,
    description_eot LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_traits_name (name)
);

CREATE TABLE IF NOT EXISTS wondrous_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    item_type VARCHAR(24) NOT NULL DEFAULT 'wondrous',
    rarity VARCHAR(24) NOT NULL DEFAULT 'common',
    recommended_cost VARCHAR(80),
    rarity_eot VARCHAR(24),
    recommended_cost_eot VARCHAR(80),
    attunement_required TINYINT(1) NOT NULL DEFAULT 0,
    attunement_by VARCHAR(120),
    source VARCHAR(100),
    source_pages VARCHAR(50),
    description LONGTEXT,
    description_eot LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wondrous_items_name (name)
);

CREATE TABLE IF NOT EXISTS spell_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spell_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    spell_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_spell_user (spell_id, user_id),
    INDEX idx_spell_likes_spell (spell_id),
    FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS spell_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    spell_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_spell_comments_spell_created (spell_id, created_at),
    FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trait_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trait_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_trait_user (trait_id, user_id),
    INDEX idx_trait_likes_trait (trait_id),
    FOREIGN KEY (trait_id) REFERENCES traits(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trait_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trait_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trait_comments_trait_created (trait_id, created_at),
    FOREIGN KEY (trait_id) REFERENCES traits(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wondrous_item_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wondrous_item_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_wondrous_item_user (wondrous_item_id, user_id),
    INDEX idx_wondrous_item_likes_item (wondrous_item_id),
    FOREIGN KEY (wondrous_item_id) REFERENCES wondrous_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wondrous_item_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wondrous_item_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wondrous_item_comments_item_created (wondrous_item_id, created_at),
    FOREIGN KEY (wondrous_item_id) REFERENCES wondrous_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS market_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(40) NOT NULL DEFAULT 'food_plant',
    region_id INT NULL,
    region VARCHAR(255) NULL,
    damage VARCHAR(60) NULL,
    armor_class VARCHAR(60) NULL,
    armor_type VARCHAR(24) NULL,
    weapon_type VARCHAR(24) NULL,
    short_description TEXT NULL,
    weight DECIMAL(6,2) NULL,
    price_cp INT UNSIGNED NOT NULL DEFAULT 0,
    price_sp INT UNSIGNED NOT NULL DEFAULT 0,
    price_gp INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_market_name (name),
    INDEX idx_market_region (region),
    INDEX idx_market_region_id (region_id)
);

CREATE TABLE IF NOT EXISTS market_regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    markup_percent INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_market_regions_name (name)
);

CREATE TABLE IF NOT EXISTS market_region_category_markups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    season ENUM('spring_summer','autumn_winter') NOT NULL DEFAULT 'spring_summer',
    category VARCHAR(40) NOT NULL,
    markup_percent INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_market_region_season_category (region_id, season, category),
    INDEX idx_market_markups_region (region_id),
    INDEX idx_market_markups_season (season),
    INDEX idx_market_markups_category (category),
    FOREIGN KEY (region_id) REFERENCES market_regions(id) ON DELETE CASCADE
);

ALTER TABLE market_items
    ADD CONSTRAINT fk_market_items_region
    FOREIGN KEY (region_id) REFERENCES market_regions(id)
    ON DELETE SET NULL;
