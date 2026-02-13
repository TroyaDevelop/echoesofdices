
.PHONY: echoes-up echoes-down echoes-build echoes-log echoes-backup echoes-restore echoes-uo echoes-deploy echoes-prune

-include .env

COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yml

PROD_COMPOSE_FILE ?= docker-compose.prod.yml
BACKUP_DIR ?= backups

MODE ?= $(ECHOES_MODE)
MODE := $(strip $(MODE))

ifeq ($(MODE),prod)
ACTIVE_COMPOSE_FILE := $(PROD_COMPOSE_FILE)
else
ACTIVE_COMPOSE_FILE := $(COMPOSE_FILE)
endif

echoes-up:
	$(COMPOSE) -f $(ACTIVE_COMPOSE_FILE) up -d

echoes-uo: echoes-up

echoes-down:
	$(COMPOSE) -f $(ACTIVE_COMPOSE_FILE) down

echoes-build:
	$(COMPOSE) -f $(ACTIVE_COMPOSE_FILE) build

echoes-prune:
	@echo "Cleaning up dangling Docker images and build cache..."
	docker image prune -f
	docker builder prune -f
	@echo "Docker cleanup done."

echoes-deploy: echoes-build echoes-up echoes-prune

echoes-log:
	$(COMPOSE) -f $(ACTIVE_COMPOSE_FILE) logs -f --tail=200

echoes-backup:
	@set -e; \
	CF="$(ACTIVE_COMPOSE_FILE)"; \
	mkdir -p "$(BACKUP_DIR)"; \
	OUT="$(BACKUP_DIR)/eotd20_wiki_$$(date +%F_%H%M%S).sql.gz"; \
	TMP="$$OUT.tmp"; \
	echo "Using compose file: $$CF"; \
	echo "Writing backup: $$OUT"; \
	rm -f "$$TMP"; \
	$(COMPOSE) -f "$$CF" exec -T mariadb sh -lc 'mariadb-dump -u"$$MARIADB_USER" -p"$$MARIADB_PASSWORD" --single-transaction --quick --routines --events --triggers --add-drop-table "$$MARIADB_DATABASE"' | gzip -c > "$$TMP"; \
	mv "$$TMP" "$$OUT"; \
	KEEP_NAME="$$(basename "$$OUT")"; \
	find "$(BACKUP_DIR)" -maxdepth 1 -type f -name 'eotd20_wiki_*.sql.gz' ! -name "$$KEEP_NAME" -print -delete; \
	echo "OK: $$OUT"

echoes-restore:
	@set -e; \
	CF="$(ACTIVE_COMPOSE_FILE)"; \
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

