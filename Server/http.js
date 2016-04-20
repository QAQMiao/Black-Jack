var http = require('http');
var urlSystem = require('url');
var fileSystem = require("fs");
var pathSystem = require("path");

var getContentType = function (filePath){
	var contentType = "";
	var extension = pathSystem.extname(filePath);
	switch(extension){
		case ".html":
			contentType = "text/html";
			break;
		case ".js":
			contentType = "text/javascript";
			break;
		case ".css":
			contentType = "text/css";
			break;
		case ".jpg":
			contentType = "image/jpeg";
			break;
		case ".png":
			contentType = "image/png";
			break;
	}
	return contentType;
};

var initHttpServer = function (request, response){
	var requestUrl = request.url;
	console.log(requestUrl);

	var pathName = urlSystem.parse(requestUrl).pathname;
	if (pathSystem.extname(pathName) == "") {
		pathName += "/";
	}

	if (pathName.charAt(pathName.length - 1) == "/"){
		pathName += "index.html";
	}

	var filePath = pathSystem.join("../", pathName);
	response.writeHead( 200, { "Content-Type" : getContentType(filePath) } );
	var stream = fileSystem.createReadStream(filePath, { flags : "r"} );
	stream.pipe(response);
};

var httpServer = http.createServer(initHttpServer);

httpServer.on("error", function (error){
	console.log(error);
});

httpServer.listen(360, function (){
	console.log('Visit http://127.0.0.1:360/ to access the project');
});