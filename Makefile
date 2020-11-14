deploy:
	NODE_ENV=production parcel build src/index.html
	git subtree push --prefix dist origin gh-pages

watch:
	npx tsc -w --noEmit

watchparcel:
	parcel watch src/index.html

serve:
	parcel src/index.html