# listen-spawn [![Donate on Gittip](http://badgr.co/gittip/twolfson.png)](https://www.gittip.com/twolfson/)

Start a HTTP server which runs commands when pinged.

It was designed to allow for execution of semi-frequent commands (e.g. a blocking command, starting a browser). This is complimented by [text editor specific plugins][plugins] which make requests to the server.

Below is a screenshot of using [Sublime Text 2][subl] with [sublime-request][request] and a keyboard shortcut to launch [browser-launcher][launcher] tests.

TODO: subl link

![Sublime Text 2 using sublime-request and browser-launcher][screenshot]

[plugins]: #sublime-text-plugin
[subl]: http://sublimetext.com/
[screenshot]: screenshot.png
[launcher]: https://github.com/substack/browser-launcher

## Getting Started
Install the module globally with: `npm install -g listen-spawn`

```sh
# Navigate to your working directory
cd my_project

# Set up listen-spawn to run `npm test`
listen-spawn -- npm test # Listening at http://localhost:7060/ [...]

# In a separate process, curl the server to run `npm test` again
curl http://localhost:7060/ # > my_project@0.1.0 test [...]
```

### Integrating with Sublime Text 2
#### sublime-request
[sublime-request][request] is a [Sublime Text 2][subl] plugin which adds the command `request`. The following shortcut makes a `curl` request to `http://localhost:7060/`.

```js
// Add the following to your "Key Bindings - User" inside the []
{ "keys": ["alt+x"], "command": "request", "args": {"open_args": ["http://localhost:7060/"]} }
```

[request]: https://github.com/twolfson/sublime-request

#### Out of the box solution
The following shortcut invokes a `curl` request to `http://localhost:7060/` when `alt+x` is pressed. The downside is this opens a panel every time it is executed.

```js
// Add the following to your "Key Bindings - User" inside the []
{ "keys": ["alt+x"], "command": "exec", "args": {"cmd": ["curl", "http://localhost:7060/"]} }
```

## Documentation
`listen-spawn` installs a CLI endpoint via `npm`. It is good practice to always use `--` to separate `options` from `command` as this can lead to unintended parsing.

```sh
$ listen-spawn
Usage: listen-spawn [options] -- command [args...]
Starts server and invokes command with arguments whenever touched.

Options:
  --port  Port to start server on  [default: 7060]
```

## Examples
### Run a specific test
```sh
$ listen-spawn -- mocha test/assert.js
20 Jun 04:17:58 - [listen-spawn] Listening at http://localhost:7060/
20 Jun 04:17:58 - [listen-spawn] Starting new process -- mocha test/assert.js

  ․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․․

  42 tests complete (16 ms)

20 Jun 04:17:58 - [listen-spawn] App exited cleanly
```

### Script testing a browser launcher
```sh
$ listen-spawn -- node example/launch.js
20 Jun 04:20:25 - [listen-spawn] Listening at http://localhost:7060/
20 Jun 04:20:25 - [listen-spawn] Starting new process -- node example/launch.js
Starting browser
[...]
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
