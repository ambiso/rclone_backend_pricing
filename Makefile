deploy:
	npx tsc
	git subtree push --prefix dist origin gh-pages
