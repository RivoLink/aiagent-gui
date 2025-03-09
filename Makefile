install:
	npm install
.PHONY: install

re-install:
	rm -rf dist node_modules
	npm install
.PHONY: install

open:
	open http://localhost:5173
.PHONY: open

clean:
	rm -rf dist node_modules
.PHONY: clean

dev:
	npm run dev
.PHONY: dev

prod:
	npm run prod
.PHONY: prod

build:
	npm run build
.PHONY: build

lint:
	npm run lint
.PHONY: lint

lint-fix:
	npm run lint:fix
.PHONY: lint-fix
