HOST_PORT ?= 8000
IMAGE_NAME = pokereanker-api
CONTAINER_NAME = pokereanker-api

.PHONY: build run stop

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
