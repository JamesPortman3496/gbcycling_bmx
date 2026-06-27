NODE_RUNNER := bash scripts/run-with-node.sh

.PHONY: install dev prepare-data check

install:
	$(NODE_RUNNER) npm install

dev:
	$(NODE_RUNNER) npm run dev

prepare-data:
	$(NODE_RUNNER) npm run prepare:data

check:
	$(NODE_RUNNER) npm run lint && $(NODE_RUNNER) npm run typecheck
