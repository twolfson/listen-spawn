# listen-spawn [![Donate on Gittip](http://badgr.co/gittip/twolfson.png)](https://www.gittip.com/twolfson/)

Start a server to run commands when touched.

It was designed to allow for execution of semi-frequent commands but not on *every* save.

This is accomplished by being a generic HTTP server with the ability to write [text editor specific plugins][plugins] to ping the server.

![Sublime Text 2][subl-screenshot]

[plugins]: #sublime-text-plugin
[subl-screenshot]: sublime_text_2.png

## Getting Started
Install the module globally with: `npm install -g listen-spawn`

```sh
# Navigate to your working directory
cd my_project

# Set up listen-spawn to run `npm test`
listen-spawn npm test # Listening at http://localhost:3000/ [...]

# In a separate process, curl the server to run `npm test` again
curl http://localhost:3000/ # > my_project@0.1.0 test [...]
```

### Integrating with Sublime Text 2
I am still looking for a silent yet plugin-free solution. If really want a one-off plugin, please open a [GitHub issue][issues].

For the time being, the following shortcut invokes a `curl` request to `http://localhost:3000/` when `alt+x` is pressed.

```js
// Add the following to your "Key Bindings - User" inside the []
{ "keys": ["alt+x"], "command": "exec", "args": {"cmd": ["curl", "http://localhost:3000/"]} }
```

For the Windows users, please install [MinGW][mingw] (should be installed with [msysgit][msysgit]) and add it to your `PATH`.

[issues]: https://github.com/twolfson/listen-spawn/issues
[mingw]: http://www.mingw.org/
[msysgit]: http://msysgit.github.io/

## Documentation
listen-spawn [options --] command [args...]
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
