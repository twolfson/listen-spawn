// Load in module and dependencies
var ListenSpawn = require('../lib/listen-spawn.js'),
    spawn = require('child_process').spawn,
    assert = require('assert'),
    request = require('request');

describe('ListenSpawn', function () {
  describe('starting an echo process', function () {
    before(function (done) {
      // Start up a new server
      var child = spawn('listen-spawn', ['date', '+%s']);
      // var child = spawn('listen-spawn', ['date', '+%s'], {stdio: [0, 1, 2]});

      // Begin collecting stdout
      var that = this;
      this.stdout = '';
      child.stdout.on('data', function (chunk) {
        that.stdout += chunk;
      });

      // Save the child for teardown
      this.child = child;

      // Give us time to complete the startup
      setTimeout(done, 500);
    });

    it('executes immediately', function () {
      // Assert stdout is near the current time
      var now = +new Date(),
          stdoutDate = this.stdout.match(/\d{5,}/g),
          then = +stdoutDate[0] * 1000;
      assert(Math.abs(now - then) < 5000);
    });

    describe('when touched', function () {
      before(function (done) {
        // DEV: Request is a bit of overkill
        request('http://localhost:3000/', done);
      });

      it('is executed again', function () {
        console.log('HERE:', this.stdout);
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