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
.PHONY: help install dev build preview lint test e2e e2e-live clean \
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

# Runs in Microsoft's Playwright image (browsers preinstalled; keep its tag
# in step with @playwright/test in package.json). node_modules lives in a
# Docker volume so the Linux build never mixes with a host install.
PLAYWRIGHT_IMAGE ?= mcr.microsoft.com/playwright:v1.49.1-noble
e2e: ## Run Playwright end-to-end tests (mocked API) in Docker
	docker run --rm --init --ipc=host -v "$(CURDIR)":/app -v i-dolly-frontend-e2e-node-modules:/app/node_modules \
		-w /app -e CI=1 $(PLAYWRIGHT_IMAGE) sh -c "npm ci && npx playwright test $(ARGS)"

# Against a real backend stack (see e2e/live/README.md): joins its Docker
# network, forwards localhost:8001 to its API, and reads its logs/DB
# through the Docker socket.
LIVE_NETWORK ?= idolly-e2e_default
e2e-live: ## Run Playwright tests against the live backend stack in Docker
	docker run --rm --init --ipc=host --network $(LIVE_NETWORK) -v /var/run/docker.sock:/var/run/docker.sock \
		-v "$(CURDIR)":/app -v i-dolly-frontend-e2e-node-modules:/app/node_modules -w /app \
		-e LIVE_API_PROXY_TARGET=app:8000 $(PLAYWRIGHT_IMAGE) \
		sh -c "npm ci && npx playwright test -c playwright.live.config.js $(ARGS)"

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
