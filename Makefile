.PHONY: help dev build start test docker-build docker-run docker-push clean

# Variables
IMAGE_NAME = ghcr.io/bickfordd-bit/hvpe-cloud-portal
VERSION = latest
PLATFORM = linux/amd64,linux/arm64

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install
	npx prisma generate

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm start

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

lint: ## Run linter
	npm run lint

prisma-generate: ## Generate Prisma client
	npx prisma generate

prisma-migrate: ## Run Prisma migrations
	npx prisma migrate dev

prisma-deploy: ## Deploy Prisma migrations (production)
	npx prisma migrate deploy

prisma-studio: ## Open Prisma Studio
	npx prisma studio

docker-dev: ## Start development environment with Docker Compose
	docker-compose -f docker-compose.dev.yml up

docker-dev-build: ## Build and start development environment
	docker-compose -f docker-compose.dev.yml up --build

docker-build: ## Build production Docker image
	docker build -t $(IMAGE_NAME):$(VERSION) -t $(IMAGE_NAME):$(shell git rev-parse --short HEAD) .

docker-build-multi: ## Build multi-architecture image
	docker buildx build --platform $(PLATFORM) -t $(IMAGE_NAME):$(VERSION) .

docker-run: ## Run Docker container locally
	docker run -d -p 3000:3000 --env-file .env --name hvpe-portal $(IMAGE_NAME):$(VERSION)

docker-stop: ## Stop Docker container
	docker stop hvpe-portal || true
	docker rm hvpe-portal || true

docker-logs: ## View Docker container logs
	docker logs -f hvpe-portal

docker-push: ## Push Docker image to registry
	docker push $(IMAGE_NAME):$(VERSION)

docker-push-multi: ## Build and push multi-architecture image
	docker buildx build --platform $(PLATFORM) --push -t $(IMAGE_NAME):$(VERSION) .

docker-compose-up: ## Start production environment with Docker Compose
	docker-compose up -d

docker-compose-down: ## Stop production environment
	docker-compose down

docker-compose-logs: ## View Docker Compose logs
	docker-compose logs -f

health-check: ## Check application health
	@curl -s http://localhost:3000/api/health | jq '.' || echo "Health check failed"

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules .next out dist
	npm cache clean --force

clean-docker: ## Remove Docker images and containers
	docker-compose down -v
	docker rmi $(IMAGE_NAME):$(VERSION) || true
	docker system prune -f

deploy-vercel: ## Deploy to Vercel
	vercel --prod

setup: ## Complete setup (install, generate, migrate)
	make install
	make prisma-generate
	make prisma-migrate

.DEFAULT_GOAL := help
