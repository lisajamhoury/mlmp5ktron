var osc = require('node-osc');
var io = require('socket.io')(8081);


var oscServer, oscClient;

var isConnected = false;
console.log('hello');
io.sockets.on('connection', function (socket) {
	console.log('connection');
	socket.on("config", function (obj) {
		console.log(obj);
		isConnected = true;
    	oscServer = new osc.Server(obj.server.port, obj.server.host);
	    oscClient = new osc.Client(obj.client.host, obj.client.port);
	    oscClient.send('/status', socket.sessionId + ' connected');
		oscServer.on("message", function(msg, rinfo) {
			console.log('osc server receiving');
			socket.emit("message", msg);
		});
		socket.emit("connected", 1);
	});
 	socket.on("message", function (obj) {
 		console.log('receiving from p5');
		oscClient.send.apply(oscClient, obj);
  	});
	socket.on('disconnect', function(){
		if (isConnected) {
			oscServer.kill();
			oscClient.kill();
		}
  	});
});


//Sending OSC messages:

// var client = new osc.Client('127.0.0.1', 12000);
// client.send('/oscAddress', 200, function () {
//   client.kill();
// });

// //Listening for OSC messages:

// var oscServer = new osc.Server(3334, '0.0.0.0');
// oscServer.on("message", function (msg, rinfo) {
//       console.log("TUIO message:");
//       console.log(msg);
// });