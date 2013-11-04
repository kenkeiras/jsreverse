all: web-based cli-based

web-based: common/ web/
	cp -Rv common/* web/js/

cli-based: common/ cli/
