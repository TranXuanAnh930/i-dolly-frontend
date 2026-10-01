# Convenience wrapper around the npm scripts and Docker commands.
# Run `make` or `make help` to list targets.

IMAGE        ?= i-dolly-frontend
TAG          ?= latest
PORT         ?= 8080
CONTAINER    ?= i-dolly-frontend
# Inlined into the bundle at build time (see README "Docker"). Empty falls
# back to src/env.js's default (http://localhost:8000).
VITE_API_URL ?=
# Only forwarded when set, so an unset value doesn't mask .env.local.
API_ENV := $(if $(VITE_API_URL),VITE_API_URL=$(VITE_API_URL))

.DEFAULT_GOAL := help
.PHONY: help install dev build preview lint test clean \
        docker-build docker-run docker-stop up down logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

## --- Local development ---

install: ## Install dependencies (clean install from package-lock.json)
	npm ci

node_modules: package.json package-lock.json
	npm ci
	@touch node_modules

dev: node_modules ## Start the Vite dev server on http://localhost:8080
	npm run dev

build: node_modules ## Build for production into dist/
	$(API_ENV) npm run build

preview: build ## Build, then preview the production build
	npm run preview

lint: node_modules ## Lint src/
	npm run lint

test: node_modules ## Run unit tests (vitest)
	npm test

clean: ## Remove dist/ and node_modules/
	rm -rf dist node_modules

## --- Docker ---

docker-build: ## Build the Docker image (IMAGE:TAG, default i-dolly-frontend:latest)
	docker build --build-arg VITE_API_URL=$(VITE_API_URL) -t $(IMAGE):$(TAG) .

docker-run: ## Run the image detached on http://localhost:PORT (default 8080)
	docker run -d --rm --name $(CONTAINER) -p $(PORT):80 $(IMAGE):$(TAG)

docker-stop: ## Stop the container started by docker-run
	docker stop $(CONTAINER)

up: ## Build and start with docker compose
	$(API_ENV) docker compose up -d --build

down: ## Stop docker compose services
	docker compose down

logs: ## Follow docker compose logs
	docker compose logs -f
