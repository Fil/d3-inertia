import { drag } from "d3-drag";
import { mouse } from "d3-selection";
import { timer } from "d3-timer";

export function geoInertiaDragHelper(opt) {
  var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
    r0, // Projection rotation as Euler angles at start.
    q0, // Projection rotation as versor at start.
    v10, // Mouse position in Cartesian coordinates just before end of drag gesture.
    v11, // Mouse position in Cartesian coordinates at end.
    q10; // Projection rotation as versor at end.
  var inertia = inertiaHelper({
    start: function() {
      v0 = versor.cartesian(projection.invert(inertia.position));
      r0 = projection.rotate();
      q0 = versor(r0);
      opt.start && opt.start();
    },
    move: function() {
      var inv = projection.rotate(r0).invert(inertia.position);
      if (isNaN(inv[0])) return;
      var v1 = versor.cartesian(inv),
        q1 = versor.multiply(q0, versor.delta(v0, v1)),
        r1 = versor.rotation(q1);
      opt.render(r1);
      opt.move && opt.move();
    },
    end: function() {
      // velocity
      v10 = versor.cartesian(
        projection.invert(
          inertia.position.map(function(d, i) {
            return d - inertia.velocity[i] / 1000;
          })
        )
      );
      q10 = versor(projection.rotate());
      v11 = versor.cartesian(projection.invert(inertia.position));
      opt.end && opt.end();
    },
    render: function(t) {
      var rotation = versor.rotation(
        versor.multiply(q10, versor.delta(v10, v11, t * 1000))
      );
      opt.render && opt.render(rotation);
    },
    time: opt.time
  });

  return inertia;
}

export function geoInertiaDrag(target, render, proj, opt) {
  // use the "global" projection function if none given
  if (!proj && typeof projection == "function") proj = projection;
  if (!opt) opt = {};
  // complete params: (projection, render, startDrag, dragging, endDrag)
  var inertia = geoInertiaDragHelper({
    projection: proj,
    render: function(rotation) {
      proj.rotate(rotation);
      render && render();
    },
    start: opt.start,
    move: opt.move,
    end: opt.end,
    time: opt.time
  });
  target.call(
    drag()
      .on("start", inertia.start)
      .on("drag", inertia.move)
      .on("end", inertia.end)
  );
  return inertia;
}

export default function inertiaHelper(opt) {
  var A = opt.time || 5000; // reference time in ms
  var limit = 1.0001;
  var B = -Math.log(1 - 1 / limit);
  var inertia = {
    start: function() {
      var position = mouse(this);
      inertia.position = position;
      inertia.velocity = [0, 0];
      if (inertia.timer) inertia.timer.stop(), inertia.timer = null;
      opt.start && opt.start.call(this, position);
    },
    move: function() {
      var position = mouse(this);
      var time = performance.now();
      var deltaTime = time - inertia.time;
      var decay = 1 - Math.exp(-deltaTime / 1000);
      inertia.velocity = inertia.velocity.map(function(d, i) {
        var deltaPos = position[i] - inertia.position[i],
          deltaTime = time - inertia.time;
        return 1000 * (1 - decay) * deltaPos / deltaTime + d * decay;
      });
      inertia.time = time;
      inertia.position = position;
      opt.move && opt.move.call(this, position);
    },
    end: function() {
      var v = inertia.velocity;
      if (v[0] * v[0] + v[1] * v[1] < 100) return;

      opt.end && opt.end();

      inertia.timer = timer(function(e) {
        inertia.t = limit * (1 - Math.exp(-B * e / A));
        opt.render && opt.render(inertia.t);
        if (inertia.t > 1) {
          inertia.timer.stop(), inertia.timer = null;
          inertia.velocity = [0, 0];
          inertia.t = 1;
        }
      });
    },
    position: [0, 0],
    velocity: [0, 0], // in pixels/s
    timer: null,
    time: 0
  };

  return inertia;
}
