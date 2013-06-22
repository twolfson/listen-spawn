function SingleChild(cmd, args, options) {
  // Perform fallbacks
  var argLen = arguments.length;
  if (argLen === 1) {
    // If there is only one argument, fallback args and options
    args = [];
    options = {};
  } else if (argLen === 2) {
    // If there are arguments, fallback options
    if (Array.isArray(args)) {
      options = {};
    } else {
    // Otherwise, fallback options
      options = args;
      args = [];
    }
  }
  // Save arguments to starting/restarting
  this.cmd = cmd;
  this.args = args;
  this.options = options || {};
}
SingleChild.prototype = {
  start: function () {

  },
  restart: function () {
    // If there is a child,
  },
  stop: function (cb) {

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