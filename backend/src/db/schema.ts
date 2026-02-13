import bcrypt from 'bcryptjs';
import { query } from './pool';
import { MARKET_CATEGORIES } from '../utils/normalizers';
import { ECHOESROOT_LOGIN, ECHOESROOT_PASSWORD } from '../config/env';

async function safeQuery(sql: string, params: any[] = []): Promise<void> {
  try {
    await query(sql, params);
  } catch {
    return;
  }
}

export async function ensureRuntimeSchema(): Promise<void> {
  await query(
    "CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT, login VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role ENUM('admin','editor','user') DEFAULT 'user', nickname VARCHAR(100), character_level TINYINT, strength SMALLINT, dexterity SMALLINT, constitution SMALLINT, intelligence SMALLINT, wisdom SMALLINT, charisma SMALLINT, skill_acrobatics TINYINT, skill_animal_handling TINYINT, skill_arcana TINYINT, skill_athletics TINYINT, skill_deception TINYINT, skill_history TINYINT, skill_insight TINYINT, skill_intimidation TINYINT, skill_investigation TINYINT, skill_medicine TINYINT, skill_nature TINYINT, skill_perception TINYINT, skill_performance TINYINT, skill_persuasion TINYINT, skill_religion TINYINT, skill_sleight_of_hand TINYINT, skill_stealth TINYINT, skill_survival TINYINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    []
  );

  await safeQuery("ALTER TABLE users MODIFY COLUMN role ENUM('admin','editor','user') DEFAULT 'user'", []);

  await safeQuery('ALTER TABLE users CHANGE COLUMN email login VARCHAR(255) NOT NULL', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS login VARCHAR(255)', []);
  await safeQuery('ALTER TABLE users ADD UNIQUE INDEX uniq_users_login (login)', []);

  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100)', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS character_level TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS strength SMALLINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS dexterity SMALLINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS constitution SMALLINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS intelligence SMALLINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS wisdom SMALLINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS charisma SMALLINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_acrobatics TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_animal_handling TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_arcana TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_athletics TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_persuasion TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_performance TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_intimidation TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_deception TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_history TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_insight TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_investigation TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_medicine TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_nature TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_perception TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_religion TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_sleight_of_hand TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_stealth TINYINT', []);
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_survival TINYINT', []);

  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS character_name VARCHAR(100)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS race VARCHAR(100)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS class_name VARCHAR(100)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS background VARCHAR(100)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS alignment VARCHAR(60)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS hit_dice_type VARCHAR(5)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS hit_dice_count TINYINT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS hit_dice_json TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS character_image_url VARCHAR(500)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS character_images_json TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_current INT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_max INT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS hp_max SMALLINT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS hp_current SMALLINT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_hp SMALLINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS armor_class SMALLINT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS speed SMALLINT DEFAULT 30', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS initiative_bonus SMALLINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS inspiration TINYINT(1) DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS gold_cp INT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS gold_sp INT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS gold_gp INT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS gold_pp INT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS save_strength TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS save_dexterity TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS save_constitution TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS save_intelligence TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS save_wisdom TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS save_charisma TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS attacks_json TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS features_traits TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS other_proficiencies TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS personality TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS ideals TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS bonds TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS flaws TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS conditions VARCHAR(500)', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS equipment TEXT', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS spellcasting_ability VARCHAR(20)', []);

  await query(
    'CREATE TABLE IF NOT EXISTS user_character_sheets (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, character_name VARCHAR(100), race VARCHAR(100), class_name VARCHAR(100), background VARCHAR(100), alignment VARCHAR(60), character_image_url VARCHAR(500), character_images_json TEXT, hit_dice_type VARCHAR(5), hit_dice_count TINYINT, hit_dice_json TEXT, character_level TINYINT, strength SMALLINT, dexterity SMALLINT, constitution SMALLINT, intelligence SMALLINT, wisdom SMALLINT, charisma SMALLINT, skill_acrobatics TINYINT, skill_animal_handling TINYINT, skill_arcana TINYINT, skill_athletics TINYINT, skill_deception TINYINT, skill_history TINYINT, skill_insight TINYINT, skill_intimidation TINYINT, skill_investigation TINYINT, skill_medicine TINYINT, skill_nature TINYINT, skill_perception TINYINT, skill_performance TINYINT, skill_persuasion TINYINT, skill_religion TINYINT, skill_sleight_of_hand TINYINT, skill_stealth TINYINT, skill_survival TINYINT, xp_current INT DEFAULT 0, xp_max INT DEFAULT 0, hp_max SMALLINT, hp_current SMALLINT, temp_hp SMALLINT DEFAULT 0, armor_class SMALLINT, speed SMALLINT DEFAULT 30, initiative_bonus SMALLINT DEFAULT 0, inspiration TINYINT(1) DEFAULT 0, gold_cp INT DEFAULT 0, gold_sp INT DEFAULT 0, gold_gp INT DEFAULT 0, gold_pp INT DEFAULT 0, save_strength TINYINT DEFAULT 0, save_dexterity TINYINT DEFAULT 0, save_constitution TINYINT DEFAULT 0, save_intelligence TINYINT DEFAULT 0, save_wisdom TINYINT DEFAULT 0, save_charisma TINYINT DEFAULT 0, death_save_success TINYINT DEFAULT 0, death_save_failure TINYINT DEFAULT 0, attacks_json TEXT, spells_json TEXT, features_traits TEXT, other_proficiencies TEXT, personality TEXT, ideals TEXT, bonds TEXT, flaws TEXT, conditions VARCHAR(500), notes TEXT, equipment TEXT, spellcasting_ability VARCHAR(20), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_character_sheets_user (user_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS death_save_success TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS death_save_failure TINYINT DEFAULT 0', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS alignment VARCHAR(60)', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS hit_dice_type VARCHAR(5)', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS hit_dice_count TINYINT', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS hit_dice_json TEXT', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS spells_json TEXT', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS character_image_url VARCHAR(500)', []);
  await safeQuery('ALTER TABLE user_character_sheets ADD COLUMN IF NOT EXISTS character_images_json TEXT', []);

  await query(
    'CREATE TABLE IF NOT EXISTS awards (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL, description TEXT, image_url VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)',
    []
  );
  await query(
    'CREATE TABLE IF NOT EXISTS user_awards (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, award_id INT NOT NULL, granted_by INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uniq_user_award (user_id, award_id), INDEX idx_user_awards_user (user_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (award_id) REFERENCES awards(id) ON DELETE CASCADE, FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS spell_favorites (id INT PRIMARY KEY AUTO_INCREMENT, spell_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uniq_spell_fav (spell_id, user_id), INDEX idx_spell_fav_user (user_id), FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS registration_keys (id INT PRIMARY KEY AUTO_INCREMENT, reg_key VARCHAR(80) UNIQUE NOT NULL, is_active TINYINT(1) NOT NULL DEFAULT 1, created_by INT NULL, used_by INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, used_at TIMESTAMP NULL, INDEX idx_reg_keys_active_used (is_active, used_at), INDEX idx_reg_keys_created_at (created_at))',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS spell_likes (id INT PRIMARY KEY AUTO_INCREMENT, spell_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uniq_spell_user (spell_id, user_id), INDEX idx_spell_likes_spell (spell_id), FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS spell_comments (id INT PRIMARY KEY AUTO_INCREMENT, spell_id INT NOT NULL, user_id INT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_spell_comments_spell_created (spell_id, created_at), FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS news_posts (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, content LONGTEXT NOT NULL, excerpt TEXT, author_id INT, status ENUM('draft','published') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL, INDEX idx_news_status_created (status, created_at))",
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS articles (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, content LONGTEXT NOT NULL, excerpt TEXT, source VARCHAR(100), source_pages VARCHAR(50), author_id INT, status ENUM('draft','published') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL, INDEX idx_articles_status_created (status, created_at))",
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS lore_articles (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, year INT NOT NULL, locations TEXT, content LONGTEXT NOT NULL, excerpt TEXT, author_id INT, status ENUM('draft','published') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL, INDEX idx_lore_status_year (status, year), INDEX idx_lore_year (year))",
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS lore_locations (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(120) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_lore_locations_name (name))',
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS spells (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, name_en VARCHAR(255), level TINYINT UNSIGNED NOT NULL DEFAULT 0, school VARCHAR(100), theme VARCHAR(32) DEFAULT 'none', casting_time VARCHAR(255), range_text VARCHAR(255), components TEXT, duration VARCHAR(255), classes VARCHAR(255), subclasses VARCHAR(255), source VARCHAR(100), source_pages VARCHAR(50), description LONGTEXT, description_eot LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_spells_name (name))",
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS traits (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, name_en VARCHAR(255), requirements VARCHAR(255), source VARCHAR(100), description LONGTEXT, description_eot LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_traits_name (name))",
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS wondrous_items (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, name_en VARCHAR(255), item_type VARCHAR(255) NOT NULL DEFAULT 'wondrous', rarity VARCHAR(24) NOT NULL DEFAULT 'common', recommended_cost VARCHAR(80), rarity_eot VARCHAR(24), recommended_cost_eot VARCHAR(80), attunement_required TINYINT(1) NOT NULL DEFAULT 0, attunement_by VARCHAR(120), source VARCHAR(100), description LONGTEXT, description_eot LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_wondrous_items_name (name))",
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS spell_classes (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(80) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS sources (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(80) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_sources_name (name))',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS trait_likes (id INT PRIMARY KEY AUTO_INCREMENT, trait_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uniq_trait_user (trait_id, user_id), INDEX idx_trait_likes_trait (trait_id), FOREIGN KEY (trait_id) REFERENCES traits(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS trait_comments (id INT PRIMARY KEY AUTO_INCREMENT, trait_id INT NOT NULL, user_id INT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_trait_comments_trait_created (trait_id, created_at), FOREIGN KEY (trait_id) REFERENCES traits(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS wondrous_item_likes (id INT PRIMARY KEY AUTO_INCREMENT, wondrous_item_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uniq_wondrous_item_user (wondrous_item_id, user_id), INDEX idx_wondrous_item_likes_item (wondrous_item_id), FOREIGN KEY (wondrous_item_id) REFERENCES wondrous_items(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS wondrous_item_comments (id INT PRIMARY KEY AUTO_INCREMENT, wondrous_item_id INT NOT NULL, user_id INT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_wondrous_item_comments_item_created (wondrous_item_id, created_at), FOREIGN KEY (wondrous_item_id) REFERENCES wondrous_items(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await safeQuery('ALTER TABLE spells MODIFY COLUMN components TEXT', []);

  await query(
    "CREATE TABLE IF NOT EXISTS market_items (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, region VARCHAR(255) NULL, category VARCHAR(40) NOT NULL DEFAULT 'food_plant', region_id INT NULL, damage VARCHAR(60) NULL, armor_class VARCHAR(60) NULL, weapon_type VARCHAR(24) NULL, short_description TEXT NULL, price_cp INT UNSIGNED NOT NULL DEFAULT 0, price_sp INT UNSIGNED NOT NULL DEFAULT 0, price_gp INT UNSIGNED NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_market_name (name), INDEX idx_market_region (region), INDEX idx_market_region_id (region_id))",
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS market_regions (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL UNIQUE, markup_percent INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_market_regions_name (name))',
    []
  );

  await safeQuery("ALTER TABLE market_items ADD COLUMN category VARCHAR(40) NOT NULL DEFAULT 'food_plant'", []);
  await safeQuery('ALTER TABLE market_items ADD COLUMN region_id INT NULL', []);
  await safeQuery('ALTER TABLE market_items ADD INDEX idx_market_region_id (region_id)', []);
  await safeQuery('ALTER TABLE market_items ADD CONSTRAINT fk_market_items_region FOREIGN KEY (region_id) REFERENCES market_regions(id) ON DELETE SET NULL', []);
  await safeQuery('ALTER TABLE market_items MODIFY COLUMN region VARCHAR(255) NULL', []);

  await safeQuery('ALTER TABLE market_items ADD COLUMN damage VARCHAR(60) NULL', []);
  await safeQuery('ALTER TABLE market_items ADD COLUMN armor_class VARCHAR(60) NULL', []);
  await safeQuery('ALTER TABLE market_items ADD COLUMN weapon_type VARCHAR(24) NULL', []);
  await safeQuery('ALTER TABLE market_items ADD COLUMN short_description TEXT NULL', []);
  await safeQuery('ALTER TABLE market_items ADD COLUMN armor_type VARCHAR(24) NULL', []);
  await safeQuery('ALTER TABLE market_items ADD COLUMN weight DECIMAL(6,2) NULL', []);

  await query(
    "CREATE TABLE IF NOT EXISTS market_region_category_markups (id INT PRIMARY KEY AUTO_INCREMENT, region_id INT NOT NULL, season ENUM('spring_summer','autumn_winter') NOT NULL DEFAULT 'spring_summer', category VARCHAR(40) NOT NULL, markup_percent INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uniq_market_region_season_category (region_id, season, category), INDEX idx_market_markups_region (region_id), INDEX idx_market_markups_season (season), INDEX idx_market_markups_category (category), FOREIGN KEY (region_id) REFERENCES market_regions(id) ON DELETE CASCADE)",
    []
  );

  await safeQuery(
    "CREATE TABLE IF NOT EXISTS market_trade_logs (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, item_id INT NULL, item_name VARCHAR(255) NOT NULL, trade_type ENUM('sell','buy') NOT NULL, roll_mode ENUM('normal','adv','dis') NOT NULL DEFAULT 'normal', roll_alt TINYINT NULL, season ENUM('spring_summer','autumn_winter') NOT NULL DEFAULT 'spring_summer', region_id INT NULL, category VARCHAR(40) NOT NULL, markup_percent INT NOT NULL DEFAULT 0, base_cp INT UNSIGNED NOT NULL, roll TINYINT NOT NULL, bonus SMALLINT NOT NULL, extra_bonus SMALLINT NOT NULL DEFAULT 0, extra_dice TEXT NULL, result SMALLINT NOT NULL, percent_value DECIMAL(6,4) NOT NULL, final_cp INT UNSIGNED NOT NULL, skill_id VARCHAR(32) NULL, skill_label VARCHAR(64) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_market_trade_user (user_id), INDEX idx_market_trade_item (item_id), INDEX idx_market_trade_created (created_at), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (item_id) REFERENCES market_items(id) ON DELETE SET NULL)",
    []
  );

  await safeQuery("ALTER TABLE market_trade_logs ADD COLUMN trade_type ENUM('sell','buy') NOT NULL", []);
  await safeQuery("ALTER TABLE market_trade_logs ADD COLUMN roll_mode ENUM('normal','adv','dis') NOT NULL DEFAULT 'normal'", []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN roll_alt TINYINT NULL', []);
  await safeQuery("ALTER TABLE market_trade_logs ADD COLUMN season ENUM('spring_summer','autumn_winter') NOT NULL DEFAULT 'spring_summer'", []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN region_id INT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN category VARCHAR(40) NOT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN markup_percent INT NOT NULL DEFAULT 0', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN base_cp INT UNSIGNED NOT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN roll TINYINT NOT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN bonus SMALLINT NOT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN extra_bonus SMALLINT NOT NULL DEFAULT 0', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN extra_dice TEXT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN result SMALLINT NOT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN percent_value DECIMAL(6,4) NOT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN final_cp INT UNSIGNED NOT NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN skill_id VARCHAR(32) NULL', []);
  await safeQuery('ALTER TABLE market_trade_logs ADD COLUMN skill_label VARCHAR(64) NULL', []);
  await safeQuery("ALTER TABLE market_trade_logs ADD COLUMN item_name VARCHAR(255) NOT NULL DEFAULT ''", []);

  await safeQuery(
    "ALTER TABLE market_region_category_markups ADD COLUMN season ENUM('spring_summer','autumn_winter') NOT NULL DEFAULT 'spring_summer'",
    []
  );
  await safeQuery('ALTER TABLE market_region_category_markups DROP INDEX uniq_market_region_category', []);
  await safeQuery(
    "ALTER TABLE market_region_category_markups ADD UNIQUE KEY uniq_market_region_season_category (region_id, season, category)",
    []
  );
  await safeQuery('ALTER TABLE market_region_category_markups ADD INDEX idx_market_markups_season (season)', []);

  try {
    await query(
      "INSERT IGNORE INTO market_regions (name) SELECT DISTINCT region FROM market_items WHERE region IS NOT NULL AND TRIM(region) <> ''",
      []
    );
    await query(
      'UPDATE market_items mi JOIN market_regions mr ON mr.name = mi.region SET mi.region_id = mr.id WHERE mi.region_id IS NULL',
      []
    );

    const regionRows = await query<any[]>('SELECT id, markup_percent FROM market_regions', []);
    if (Array.isArray(regionRows)) {
      for (const r of regionRows) {
        const baseMarkup = Number(r?.markup_percent || 0);
        for (const cat of Object.keys(MARKET_CATEGORIES)) {
          await safeQuery(
            "INSERT IGNORE INTO market_region_category_markups (region_id, season, category, markup_percent) VALUES (?, 'spring_summer', ?, ?)",
            [r.id, cat, baseMarkup]
          );
        }
      }
    }

    await safeQuery(
      "INSERT IGNORE INTO market_region_category_markups (region_id, season, category, markup_percent) SELECT region_id, 'autumn_winter', category, markup_percent FROM market_region_category_markups WHERE season = 'spring_summer'",
      []
    );
  } catch {
    return;
  }

  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS name_en VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS casting_time VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS range_text VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS duration VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS classes VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS subclasses VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS source VARCHAR(100)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS source_pages VARCHAR(50)', []);
  await query("ALTER TABLE spells ADD COLUMN IF NOT EXISTS theme VARCHAR(32) DEFAULT 'none'", []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS description_eot LONGTEXT', []);

  await query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS source VARCHAR(100)', []);
  await query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_pages VARCHAR(50)', []);

  await safeQuery('ALTER TABLE lore_articles ADD COLUMN year INT NOT NULL DEFAULT 0', []);
  await safeQuery('ALTER TABLE lore_articles ADD COLUMN IF NOT EXISTS locations TEXT', []);

  await query('ALTER TABLE traits ADD COLUMN IF NOT EXISTS name_en VARCHAR(255)', []);
  await query('ALTER TABLE traits ADD COLUMN IF NOT EXISTS requirements VARCHAR(255)', []);
  await query('ALTER TABLE traits ADD COLUMN IF NOT EXISTS source VARCHAR(100)', []);

  await query('ALTER TABLE traits ADD COLUMN IF NOT EXISTS description LONGTEXT', []);
  await query('ALTER TABLE traits ADD COLUMN IF NOT EXISTS description_eot LONGTEXT', []);

  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS name_en VARCHAR(255)', []);
  await query("ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(255) NOT NULL DEFAULT 'wondrous'", []);
  await safeQuery("ALTER TABLE wondrous_items MODIFY COLUMN item_type VARCHAR(255) NOT NULL DEFAULT 'wondrous'", []);
  await query("ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS rarity VARCHAR(24) NOT NULL DEFAULT 'common'", []);
  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS recommended_cost VARCHAR(80)', []);
  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS rarity_eot VARCHAR(24)', []);
  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS recommended_cost_eot VARCHAR(80)', []);
  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS attunement_required TINYINT(1) NOT NULL DEFAULT 0', []);
  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS attunement_by VARCHAR(120)', []);
  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS source VARCHAR(100)', []);

  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS description LONGTEXT', []);
  await query('ALTER TABLE wondrous_items ADD COLUMN IF NOT EXISTS description_eot LONGTEXT', []);

  const anyEditor = await query<any[]>("SELECT id FROM users WHERE role IN ('editor','admin') LIMIT 1", []);
  if (!anyEditor || !anyEditor[0]) {
    const anyUser = await query<any[]>('SELECT id FROM users ORDER BY id ASC LIMIT 1', []);
    if (anyUser && anyUser[0]) {
      await query("UPDATE users SET role = 'admin' WHERE id = ?", [anyUser[0].id]);
    }
  }

  const defaultEditorLogin = String(ECHOESROOT_LOGIN || 'echoesroot').trim() || 'echoesroot';
  const defaultEditorPassword = String(ECHOESROOT_PASSWORD || 'echoesoftimespunguinandpigeon');

  const existing = await query<any[]>('SELECT id, login, password, role FROM users WHERE login = ? LIMIT 1', [defaultEditorLogin]);
  const user = existing && existing[0];
  if (!user) {
    const hashed = await bcrypt.hash(defaultEditorPassword, 10);
    await query('INSERT INTO users (login, password, role, nickname) VALUES (?, ?, ?, ?)', [defaultEditorLogin, hashed, 'admin', defaultEditorLogin]);
  } else {
    const passOk = await bcrypt.compare(defaultEditorPassword, String(user.password));
    if (!passOk) {
      const hashed = await bcrypt.hash(defaultEditorPassword, 10);
      await query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
    }
    if (String(user.role) !== 'admin') {
      await query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
    }
  }
}
