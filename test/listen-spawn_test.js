// Load in module and dependencies
var ListenSpawn = require('../lib/listen-spawn.js'),
    assert = require('assert');

// TODO: Invoke child processes in separate processes to avoid polluting CLI
// TODO: Or implement a proper `silent` option (depends on `events`)
describe('ListenSpawn', function () {
  describe('starting an echo process', function () {
    before(function (done) {
      // Start up a new server
      var server = new ListenSpawn('date', ['+%s']);

      // Begin collecting stdout
      var that = this;
      this.stdout = '';
      process.stdout.on('data', function (chunk) {
        that.stdout += chunk;
      });

      // Give us time to complete the startup
      setTimeout(done, 500);
    });

    it('executes immediately', function () {
      // Assert stdout is near the current time
      var now = +new Date(),
          then = +this.stdout * 1000;
      assert(now - then < 1000);
    });

    describe('when touched', function () {
      it('is executed again', function () {

      });
    });
  });
});