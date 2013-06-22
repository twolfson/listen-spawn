// Load in the EventEmitter
var spawn = require('child_process').spawn,
    EventEmitter = require('events').EventEmitter;

/**
 * Spawn for a single child. Always guarantees only one child exists
 * @see child_process.spawn
 * @param {String} cmd Command to run
 * @param {String[]} [args] Array of arguments to pass with cmd
 * @param {Object} [options] Options to pass to `spawn` and for ourselves
 * @param {Mixed} [options.killSignal] Signal to pass to `kill` executions
 */
function SingleChild(cmd, args, options) {
  // If there are arguments, fallback options
  if (Array.isArray(args)) {
    options = options || {};
  } else {
  // Otherwise, fallback args
    options = args || {};
    args = [];
  }

  // Save arguments to starting/restarting
  this.cmd = cmd;
  this.args = args;
  this.options = options || {};

  // When the process is leaving, die as well
  var that = this;
  process.on('SIGTERM', function killSelf () {
    that.kill('SIGTERM');
  });

  // Call the EventEmitter constructor
  EventEmitter.call(this);
}
var SingleChildProto = {
  start: function (cb) {
    // Emit a start and proxy to restart
    return this.restart.apply(this, arguments);
  },
  restart: function (cb) {
    // Stop the child
    var that = this;
    this.stop(function killedChild (code) {
      // Spawn a new child and emit start events
      this.emit('starting');
      var child = spawn(that.cmd, that.args, that.options);
      this.emit('started');

      // Callback with the child
      if (cb) {
        cb(null, child);
      }
    });
  },
  stop: function (cb) {
    // Emit a stop and proxy a SIGTERM to kill
    return this.kill({signal: 'SIGTERM'}, cb);
  },
  kill: function (options, cb) {
    // If there is no child, callback shortly
    var child = this.child;
    if (!child) {
      if (cb) {
        process.nextTick(cb);
      }
      return;
    }

    // Fallback options
    if (!cb) {
      cb = options;
      options = {};
    }

    // Emit a killing event
    that.emit('killing');

    // Grab the signal and send it
    child.kill(options.signal || this.options.killSignal);

    // When we leave, callback with the exit code
    var that = this;
    child.on('exit', function cleanupChild () {
      // Unset the child
      that.child = null;

      // Emit a killed event
      that.emit('killed');

      // Callback with info
      if (cb) {
        cb.apply(this, arguments);
      }
    });
  }
};
SingleChild.prototype = SingleChildProto;

// Duck-punch EventEmitter methods
var EventProto = EventProto.prototype,
    key;
for (key in EventProto) {
  SingleChildProto = EventProto[key];
}

// Export the child
module.exports = SingleChild;