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
  console.log(cmd, args);
  var child = new SingleChild(cmd, args, options);
  this.child = child;

  // Forward a bunch of events
  // ANTI-PATTERN: Losing stack trace for each item by using same line
  var that = this;
  ['killing', 'killed', 'starting', 'started', 'exited'].forEach(function listenEvent (event) {
    // When the event occurs
    child.on(event, function forwardEvent () {
      // Add the event name to our arguments
      var args = [].slice.call(arguments);
      args.unshift(event);

      // Emit our event
      return that.emit.apply(that, args);
    });
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
    // Save `that` for later
    var that = this;

    // If the child is restarting
    if (this._restartingChild) {
      // When the child is completed starting, callback
      this.child.once('started', function () {
        console.log('wat');
        if (cb) {
          return cb.apply(this, arguments);
        }
      });

      // Emit an ignore event
      this.emit('restart-ignored');
    } else {
    // Otherwise...
      // Mark the child as restarting
      this._restartingChild = true;

      // Restart the child
      console.log('xx');
      this.child.restart(function childRestarted (err, child) {
        // Mark the child as done restarting
        console.log('there');
        that._restartingChild = false;

        // Callback with the child
        if (cb) {
          cb(err, child);
        }
      });
    }
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