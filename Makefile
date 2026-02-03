.PHONY: echoes-up echoes-down echoes-build echoes-log

COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yml

echoes-up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

echoes-down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

echoes-build:
	$(COMPOSE) -f $(COMPOSE_FILE) build

echoes-log:
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f --tail=200
