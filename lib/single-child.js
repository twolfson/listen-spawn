// Create a store for all children in case of exit
var CHILDREN = [];

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

  // Save a reference to the constructor in case of exit
  CHILDREN.push(this);
}
SingleChild.prototype = {
  start: function (cb) {
    return this.restart.apply(this, arguments);
  },
  restart: function (cb) {
    // Stop the child
    var that = this;
    this.stop(function killedChild (code) {
      // Spawn and callback with a new child
      var child = spawn(that.cmd, that.args, that.options);
      cb(null, child);
    });
  },
  stop: function (cb) {
    return this.kill({signal: 'SIGTERM'}, cb);
  },
  kill: function (options, cb) {
    // If there is no child, callback shortly
    var child = this.child;
    if (!child) {
      process.nextTick(cb);
    }

    // Fallback options
    if (!cb) {
      cb = options;
      options = {};
    }

    // Grab the signal and send it
    child.kill(options.signal || this.options.killSignal);

    // When we leave, callback with the exit code
    var that = this;
    child.on('exit', function cleanupChild () {
      // Unset the child
      that.child = null;

      // Callback with info
      cb.apply(this, arguments);
    });
  }
};