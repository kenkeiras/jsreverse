all: web-based cli-based

web-based: lib/ web/
	cp -Rv lib/* web/js/

cli-based: lib/ bin/
