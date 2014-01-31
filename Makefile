all: web-based cli-based

web-based: lib/ web/
	cp -Rv lib/java/* web/js/java/
	cp -v lib/utils.js web/js/

cli-based: lib/ bin/
