var util = require('util');
var stream = require('stream');
var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');

function WatchifyStream(configure) {
  stream.Duplex.call(this, { objectMode: true });
  this.configure = configure;
}

util.inherits(WatchifyStream, stream.Duplex);

WatchifyStream.prototype._read = function() {};

WatchifyStream.prototype._write = function(input, encoding, callback) {
  var self = this;

  var b = this.configure(browserify, watchify.args);
  var w = watchify(b).add(input.path);

  function createBundle(callback) {
    var output = input.clone({ contents: false });

    w.bundle(function(error, buffer) {
      if (error) {
        self.emit('error', error);
      } else {
        output.contents = buffer;
        self.push(output);
      }
    });
  }

  w.on('update', function(ids) {
    gutil.log('Bundle updated, rebuilding...');
    createBundle();
  });

  createBundle();
  process.nextTick(callback);
};

module.exports = function(configure) {
  return new WatchifyStream(configure);
};
