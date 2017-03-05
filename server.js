process.env.NO_PROXY = "localhost";

var express = require("express");
var request = require('request');

var app = express();

var port = process.env.PORT || 3000;
var SERVICES_ROOT = "http://web.geospeedster.com/explorer-rocks";

// eventually this mime type configuration will need to change
// https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
var mime = express.static.mime;
mime.define({
     'application/json' : ['czml', 'json', 'geojson', 'topojson'],
     'model/vnd.gltf+json' : ['gltf'],
     'model/vnd.gltf.binary' : ['bgltf'],
     'text/plain' : ['glsl']
});

// serve static files
app.use(express.static("dist"));

app.all('/service/*', function(req, res, next) {
    var method, r;

    method = req.method.toLowerCase();

    console.log("URL: " + method + " " + SERVICES_ROOT + req.url);

    switch (method) {
        case "get":
            r = request.get({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "put":
            r = request.put({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "post":
            r = request.post({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "delete":
            r = request.del({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        default:
            return res.send("invalid method");
    }
    return req.pipe(r).pipe(res);
});

app.listen(port, function(err){
	console.log("running server on port "+ port);
});
