// Load in module and dependencies
var ListenSpawn = require('../lib/listen-spawn.js'),
    spawn = require('child_process').spawn,
    assert = require('assert'),
    request = require('request');

describe('ListenSpawn', function () {
  describe('starting an echo process', function () {
    before(function (done) {
      // Start up a new server
      var child = spawn('listen-spawn', ['--', 'node', '-e', 'console.log(+new Date());']);

      // Begin collecting stdout and stderr
      var that = this;
      this.stdout = '';
      child.stdout.on('data', function (chunk) {
        // console.log(chunk + '');
        that.stdout += chunk;
      });

      var stderr = '';
      child.stderr.on('data', function (chunk) {
        // console.log(chunk + '');
        stderr += chunk;
      });

      // Save the child for teardown
      this.child = child;

      // Give us time to complete the startup
      setTimeout(function () {
        var err = stderr ? new Error(stderr) : null;
        done(err);
      }, 500);
    });

    it('executes immediately', function () {
      // Assert only one execution took place
      var stdoutDates = this.stdout.match(/\d{5,}/g);
      assert.strictEqual(stdoutDates.length, 1);

      // Assert stdout is near the current time
      var now = +new Date(),
          then = +stdoutDates[0];
      assert(Math.abs(now - then) < 5000);
    });

    describe('when touched', function () {
      before(function (done) {
        // DEV: Request is a bit of overkill
        request('http://localhost:7060/', function (err) {
          setTimeout(function () {
            done(err);
          }, 200);
        });
      });

      // ANTI-PATTERN: Copy/pasted section from `executes immediately`. We should move to `doubleshot` for repetition.
      it('is executed again', function () {
        // Assert only two executions took place
        var stdoutDates = this.stdout.match(/\d{5,}/g);
        assert.strictEqual(stdoutDates.length, 2);

        // Assert stdout is near the current time
        var now = +new Date(),
            then = +stdoutDates[1];
        assert(Math.abs(now - then) < 5000);
      });
    });

    // When we are done testing
    after(function (done) {
      // Teardown the child
      var child = this.child;
      child.kill('SIGTERM');
      child.on('exit', function (code) {
        done();
      });
    });
  });

  describe('executing a non-immediate command', function () {
    before(function (done) {
      // Start up a new server
      var child = spawn('listen-spawn', [
            '--',
            'node',
            '-e',
            [
              'setTimeout(function () {',
              '  console.log("hey");',
              '}, 100);'
            ].join('')
          ]);

      // Begin collecting stdout and stderr
      var that = this;
      this.stdout = '';
      child.stdout.on('data', function (chunk) {
        // console.log(chunk + '');
        that.stdout += chunk;
      });

      var stderr = '';
      child.stderr.on('data', function (chunk) {
        // console.log(chunk + '');
        stderr += chunk;
      });

      // Save the child for teardown
      this.child = child;

      // Give us time to complete the startup
      setTimeout(function () {
        var err = stderr ? new Error(stderr) : null;
        done(err);
      }, 200);
    });

    describe('when touched in rapid succession', function () {
      before(function (done) {
        // Clear out stdout for good measure
        this.stdout = '';

        // Fire 3 concurrent requests
        request('http://localhost:7060/', function () {});
        request('http://localhost:7060/', function () {});
        request('http://localhost:7060/', function () {});
        setTimeout(function () {
          done();
        }, 500);
      });

      it('does not start a new command before the other has terminated', function () {
        var exitLogs = this.stdout.match(/App exited cleanly/g);
        assert(exitLogs.length <= 2);
      });
    });

    // When we are done testing
    after(function (done) {
      // Teardown the child
      var child = this.child;
      child.kill('SIGTERM');
      child.on('exit', function (code) {
        done();
      });
    });
  });
});