// Load in module and dependencies
var ListenSpawn = require('../lib/listen-spawn.js'),
    spawn = require('child_process').spawn,
    assert = require('assert'),
    request = require('request');

describe('ListenSpawn', function () {
  describe('starting an echo process', function () {
    before(function (done) {
      // Start up a new server
      var child = spawn('listen-spawn', ['date', '+%s%N']);
      // var child = spawn('listen-spawn', ['date', '+%s'], {stdio: [0, 1, 2]});

      // Begin collecting stdout and stderr
      var that = this;
      this.stdout = '';
      child.stdout.on('data', function (chunk) {
        that.stdout += chunk;
      });

      var stderr = '';
      child.stderr.on('data', function (chunk) {
        stderr += chunk;
      });

      // Save the child for teardown
      this.child = child;

      // Give us time to complete the startup
      setTimeout(function () {
        done(stderr);
      }, 500);
    });

    it('executes immediately', function () {
      // Assert only one execution took place
      var stdoutDates = this.stdout.match(/\d{5,}/g);
      assert.strictEqual(stdoutDates.length, 1);

      // Assert stdout is near the current time
      var now = +new Date(),
          then = +stdoutDates[0] / 1e6;
      assert(Math.abs(now - then) < 5000);
    });

    describe('when touched', function () {
      before(function (done) {
        // DEV: Request is a bit of overkill
        request('http://localhost:7060/', done);
      });

      // ANTI-PATTERN: Copy/pasted section from `executes immediately`. We should move to `doubleshot` for repetition.
      it('is executed again', function () {
        // Assert only two executions took place
        var stdoutDates = this.stdout.match(/\d{5,}/g);
        assert.strictEqual(stdoutDates.length, 2);

        // Assert stdout is near the current time
        var now = +new Date(),
            then = +stdoutDates[1] / 1e6;
        assert(Math.abs(now - then) < 5000);
      });
    });

    // When we are done testing
    after(function (done) {
      // Teardown the child
      var child = this.child;
      child.kill();
      child.on('exit', function (code) {
        done();
      });
    });
  });
});