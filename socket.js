
module.exports = function (http, app) {
  var io = require("socket.io")(http);
  app.set("socketio", io);
    io.on('connection', client => {
        console.log("new Connection created with socket Id ",client.id)
      client.on('event', data => { 
        console.log("event hit with data ",data)
       });
      client.on('disconnect', () => { 
        console.log("Connection Disconnected")
      });
    });
    app.listen(4001);
}