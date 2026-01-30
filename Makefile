.PHONY: help build clean serve
PORT ?= 8080

help: ## Show command options
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the blogs
	@echo "Building blogs..."
	@cd scripts && go build -o ../blogs-builder
	@./blogs-builder
	@rm blogs-builder

clean: ## Clean generated files and cache
	@echo "Cleaning generated files..."
	rm -rf blog/*
	rm -f blog/index.html
	rm -f .blogcache
	@echo "Clean complete!"

serve: ## Serve generated files locally
	@echo "Serving generated files..."
	@go run github.com/absmach/watchdoc@latest -port=$(PORT) -watch-dirs="content/blogs" -cmd="make build"
