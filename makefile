HOST_PORT ?= 4000
IMAGE_NAME = pokereanker
CONTAINER_NAME = pokereanker
HEROKU_APP_NAME ?= pokeranker
HEROKU_PROCESS_TYPE ?= web

.PHONY: build run stop deploy-heroku

build:
	docker build -t $(IMAGE_NAME) .

run:
	@if [ -z "$(docker images -q $(IMAGE_NAME) 2>/dev/null)" ]; then \
		echo "Image '$(IMAGE_NAME)' not found. Building..."; \
		$(MAKE) build; \
	fi
	docker run -d -p 4004:80 --name $(CONTAINER_NAME) -v $(CURDIR):/app $(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

deploy-heroku:
	heroku container:login
	docker build --platform linux/amd64 -t registry.heroku.com/$(HEROKU_APP_NAME)/$(HEROKU_PROCESS_TYPE) .
	docker push registry.heroku.com/$(HEROKU_APP_NAME)/$(HEROKU_PROCESS_TYPE)
	heroku container:release $(HEROKU_PROCESS_TYPE) --app $(HEROKU_APP_NAME)


