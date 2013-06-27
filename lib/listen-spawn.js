// Load in dependencies
var http = require('http'),
    EventEmitter = require('events').EventEmitter,
    SingleChild = require('single-child');

// Export a module to spawn servers
function ListenSpawn(cmd, args, options) {
  // If there are arguments, fallback options
  if (Array.isArray(args)) {
    options = options || {};
  } else {
  // Otherwise, fallback args
    options = args || {};
    args = [];
  }

  // Call the EventEmitter constructor
  EventEmitter.call(this);

  // Generate a child singleton
  var child = new SingleChild(cmd, args, options);
  this.child = child;

  // When the child kill starts, log it
  var that = this;
  child.on('killing', function () {
    that.emit('killing');
  });

  // When the child start starts, log it
  child.on('starting', function () {
    that.emit('starting');
  });

  // When the child exited starts, log it
  child.on('exited', function (code, signal) {
    that.emit('exited', code, signal);
  });

  // Start a new server
  var server = http.createServer(function startListenSpawnServer (req, res) {
        // Notify that a request has been received
        that.emit('request');

        // Restart the child
        that.restartChild();

        // Close the connection with a 204
        res.writeHead(204);
        res.end();
      });

  // Begin listening
  var port = options.port || 7060;
  server.listen(port);

  // Notify the server is listening
  this.emit('listen');

  // Start the child
  this.restartChild();
}
var ListenSpawnProto = {
  restartChild: function (cb) {
    var that = this;
    this.child.restart(function childRestarted (err, child) {
      // Callback with the child
      if (cb) {
        cb(child);
      }
    });
  }
};
ListenSpawn.prototype = ListenSpawnProto;

// Duck-punch EventEmitter methods
var EventProto = EventEmitter.prototype,
    key;
for (key in EventProto) {
  ListenSpawnProto[key] = EventProto[key];
}

// Export ListenSpawn
module.exports = ListenSpawn;