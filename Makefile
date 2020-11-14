deploy:
	NODE_ENV=production parcel build src/index.html --public-url /rclone_backend_pricing/
	git switch gh-pages
	cp -r dist/* .
	git add *.js *.css *.html *.map
	git commit -m "Deploy"
	git push -u origin gh-pages
	git switch main

watch:
	npx tsc -w --noEmit

watchparcel:
	parcel watch src/index.html

serve:
	parcel src/index.html