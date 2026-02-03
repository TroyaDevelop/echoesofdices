CREATE DATABASE IF NOT EXISTS eotd20_wiki CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eotd20_wiki;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'admin',
    nickname VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

CREATE TABLE IF NOT EXISTS spells (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    level TINYINT UNSIGNED NOT NULL DEFAULT 0,
    school VARCHAR(100),
    theme VARCHAR(32) DEFAULT 'none',
    casting_time VARCHAR(255),
    range_text VARCHAR(255),
    components VARCHAR(50),
    duration VARCHAR(255),
    classes VARCHAR(255),
    subclasses VARCHAR(255),
    source VARCHAR(100),
    source_pages VARCHAR(50),
    description LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_spells_name (name)
);
