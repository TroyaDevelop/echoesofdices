
.PHONY: echoes-up echoes-down echoes-build echoes-log echoes-backup echoes-restore echoes-uo

COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yml

PROD_COMPOSE_FILE ?= docker-compose.prod.yml
BACKUP_DIR ?= backups

echoes-up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

echoes-uo: echoes-up

echoes-down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

echoes-build:
	$(COMPOSE) -f $(COMPOSE_FILE) build

echoes-log:
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f --tail=200

echoes-backup:
	@set -e; \
	CF="$(COMPOSE_FILE)"; \
	if [ -f "$(PROD_COMPOSE_FILE)" ] && $(COMPOSE) -f "$(PROD_COMPOSE_FILE)" ps -q mariadb >/dev/null 2>&1; then CF="$(PROD_COMPOSE_FILE)"; fi; \
	mkdir -p "$(BACKUP_DIR)"; \
	OUT="$(BACKUP_DIR)/eotd20_wiki_$$(date +%F_%H%M%S).sql.gz"; \
	echo "Using compose file: $$CF"; \
	echo "Writing backup: $$OUT"; \
	$(COMPOSE) -f "$$CF" exec -T mariadb sh -lc 'mariadb-dump -u"$$MARIADB_USER" -p"$$MARIADB_PASSWORD" --single-transaction --quick --routines --events --triggers --add-drop-table "$$MARIADB_DATABASE"' | gzip -c > "$$OUT"; \
	echo "OK: $$OUT"

echoes-restore:
	@set -e; \
	CF="$(COMPOSE_FILE)"; \
	if [ -f "$(PROD_COMPOSE_FILE)" ] && $(COMPOSE) -f "$(PROD_COMPOSE_FILE)" ps -q mariadb >/dev/null 2>&1; then CF="$(PROD_COMPOSE_FILE)"; fi; \
	FILE="$(FILE)"; \
	if [ -z "$$FILE" ]; then echo "Usage: make echoes-restore FILE=backups/your_dump.sql.gz"; exit 2; fi; \
	if [ ! -f "$$FILE" ]; then echo "File not found: $$FILE"; exit 2; fi; \
	echo "Using compose file: $$CF"; \
	echo "Restoring from: $$FILE"; \
	$(COMPOSE) -f "$$CF" exec -T mariadb sh -lc 'mariadb -uroot -p"$$MARIADB_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $$MARIADB_DATABASE"'; \
	case "$$FILE" in \
	  *.gz) gunzip -c "$$FILE" ;; \
	  *) cat "$$FILE" ;; \
	esac | $(COMPOSE) -f "$$CF" exec -T mariadb sh -lc 'mariadb -u"$$MARIADB_USER" -p"$$MARIADB_PASSWORD" "$$MARIADB_DATABASE"'; \
	echo "OK: restore completed"

