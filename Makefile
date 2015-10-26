BRFY := node_modules/.bin/browserify

all: dist

.PHONY: dist
dist: dist/gean.js
dist: dist/gean.min.js
dist/: node_modules
	mkdir -p $@

.PHONY: dist/gean.js
dist/gean.js: dist/
	$(BRFY) index.js -o $@

.PHONY: dist/gean.min.js
dist/gean.min.js: dist/gean.js
	@echo "$@:" 'TODO(werle) - Use uglifyjs bin'

test: node_modules
	node test

node_modules: package.json
	npm install

.PHONY: clean
clean:
	rm -rf node_modules
