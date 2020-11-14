deploy:
	NODE_ENV=production parcel build src/index.html
	git switch gh-pages
	shopt -s extglob
	rm -rfvi !dist
	cp -r dist/*
	git add !dist

watch:
	npx tsc -w --noEmit

watchparcel:
	parcel watch src/index.html

serve:
	parcel src/index.html