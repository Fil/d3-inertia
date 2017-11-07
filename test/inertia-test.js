var tape = require("tape");
var inertia = require("../");

tape("inertia offers functions", function(test) {
  test.equal(typeof inertia, 'object');
  test.equal(typeof inertia.geoInertiaDragHelper, 'function');
  test.equal(typeof inertia.geoInertiaDrag, 'function');
  test.equal(typeof inertia.inertia, 'function');
  test.end();
});