.DEFAULT_GOAL = local

local:
	COMPOSE_FILE=infra/compose.yml docker compose up --build
