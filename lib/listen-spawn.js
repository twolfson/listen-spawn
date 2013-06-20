// Load in dependencies
var http = require('http');

// Export a module to spawn servers
function ListenSpawn(cmd, args, options) {
  // TODO: Fallback args
  // Fallback options
  options = options || {};

  // Define a method to start/restart the child
  var child;
  function restartChild() {
    // If there is a previous process running, kill it
    if (child) {
      // Notify that we are killing the child
      console.log('Killing existing child');

      // TODO: Kill
    }

    // Notify that the command is starting
    console.log('Starting new process -- ' + cmd + ' ' + args.join(' '));

    // TODO: Start the process
  }

  // Start a new server
  var server = http.createServer(function startListenSpawnServer (req, res) {
        // Notify that a request has been received
        console.log('Request received');

        // Restart the child
        restartChild();

        // Close the connection with a 204
        res.close(204);
      });

  // Begin listening
  var port = options.port || 3000;
  server.listen(port);

  // Notify the server is listening
  console.log('listen-spawn is listening at http://localhost:' + port + '/');

  // Start the child
  restartChild();
}