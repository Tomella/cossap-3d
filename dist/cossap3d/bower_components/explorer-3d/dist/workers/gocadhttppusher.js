(function (context) {

   if(!context["Promise"]) {
      importScripts('../resources/es6-promise.js');
   }
   importScripts('../resources/proj4.js',
              '../libs.js');

   var eventList = [
      {
         name: "start",
         handler: defaultHandler
      },
      {
         name: "complete",
         handler: defaultHandler
      },
      {
         name: "bstones",
         handler: defaultHandler
      },
      {
         name: "borders",
         handler: defaultHandler
      },
      {
         name: "header",
         handler: defaultHandler
      },
      {
         name: "vertices",
         handler: defaultHandler
      },
      {
         name: "faces",
         handler: defaultHandler
      },
      {
         name: "lines",
         handler: defaultHandler
      },
      {
         name: "properties",
         handler: defaultHandler
      }
   ];

   context.addEventListener('message', function (e) {
      Explorer3d.Logger.level = e.data.options.logLevel;
      var self = this;
      var t = Date.now();
      var data = e.data
      var pusher = new Explorer3d.DocumentPusher(e.data.options, proj4);


      eventList.forEach(function(entry) {
         Explorer3d.Logger.log("Adding listener: " + entry.name);
         pusher.addEventListener(entry.name, entry.handler);
      });

      new Explorer3d.HttpPusher(data.url, function(line) {
           pusher.push(line);
      }).start().then(function() {
         Explorer3d.Logger.log("******************* Http Kaput ****************************");
         setTimeout(function() {
            // Just a fail safe. Say no more data after about 10 seconds.
            context.postMessage(JSON.stringify({
               eventName: "readComplete",
               data: {}
            }));
         }, 20000);
      });

   }, false);

   function defaultHandler(event) {
      Explorer3d.Logger.log("GPW: " + event.type);
      sendDocument = false;
      context.postMessage(JSON.stringify({
         eventName: event.type,
         data: event.data
      }));
   }
})(this);