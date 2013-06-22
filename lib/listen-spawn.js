// Load in dependencies
var http = require('http'),
    SingleChild = require('./single-child'),
    util = require('util'),
    colors = require('fn-colors');

// Export a module to spawn servers
// TODO: Instead of logging inline, emit events
function ListenSpawn(cmd, args, options) {
  // If there are arguments, fallback options
  if (Array.isArray(args)) {
    options = options || {};
  } else {
  // Otherwise, fallback args
    options = args || {};
    args = [];
  }

  // Generate a child singleton
  var child = new SingleChild(cmd, args, options);
  this.child = child;

  // When the child kill starts, log it
  child.on('killing', function () {
    util.log.green('[listen-spawn] Killing existing child');
  });

  // When the child start starts, log it
  child.on('starting', function () {
    util.log.green('[listen-spawn] Starting new process -- ' + cmd + ' ' + args.join(' '));
  });

  // // Start the process
  // child = spawn(cmd, args, {stdio: [0, 1, 2]});

  // Start a new server
  var server = http.createServer(function startListenSpawnServer (req, res) {
        // Notify that a request has been received
        util.log.green('[listen-spawn] Request received');

        // Restart the child
        child.restart();

        // Close the connection with a 204
        res.writeHead(204);
        res.end();
      });

  // Begin listening
  var port = options.port || 7060;
  server.listen(port);

  // Notify the server is listening
  util.log('[listen-spawn] Listening at http://localhost:' + port + '/');

  // Start the child
  child.restart();
}
var ListenSpawnProto = {
  restartChild: function (cb) {
    this.child.restart(function childRestarted (err, child) {
      // If the child leaves, notify them of the exit code and whatnot
      child.on('exit', function (code) {
        if (code === 0) {
          util.log.green('[listen-spawn] App exited cleanly');
        } else {
          util.log.green('[listen-spawn] App left with exit code ' + code);
        }
      });

      // Callback with the child
      if (cb) {
        cb(child);
      }
    });
  }
};
ListenSpawn.prototype = ListenSpawnProto;

// Duck-punch EventEmitter methods
var EventProto = EventProto.prototype,
    key;
for (key in EventProto) {
  ListenSpawnProto = EventProto[key];
}

// Export ListenSpawn
module.exports = ListenSpawn;