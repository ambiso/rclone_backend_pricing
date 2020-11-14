deploy:
	NODE_ENV=production parcel build src/index.html
	git switch gh-pages
	cp -r dist/* .
	git add *.js *.css *.html
	git commit -m "Deploy"
	git push

watch:
	npx tsc -w --noEmit

watchparcel:
	parcel watch src/index.html

serve:
	parcel src/index.html