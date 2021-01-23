import { select } from "d3-selection"; // for d3-selection v2
import { drag } from "d3-drag";
import { timer } from "d3-timer";
import { default as versor } from "versor";

export function geoInertiaDragHelper(opt) {
  var projection = opt.projection,
    v0, // Mouse position in Cartesian coordinates at start of drag gesture.
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
    stop: opt.stop,
    finish: opt.finish,
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
  if (!opt) opt = {};
  // target can be an element, a selector, a function, or a selection
  // but in case of a selection we make sure to reselect it with d3-selection@2
  if (target.node) target = target.node();
  target = select(target);
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
    stop: opt.stop,
    finish: opt.finish,
    time: opt.time,
    hold: opt.hold
  });
  target.call(
    drag()
      .on("start", inertia.start)
      .on("drag", inertia.move)
      .on("end", inertia.end)
  );
  return inertia;
}

export function inertiaHelper(opt) {
  var A = opt.time || 5000; // reference time in ms
  var limit = 1.0001;
  var B = -Math.log(1 - 1 / limit);
  var inertia = {
    start: function(e) {
      var position = [e.x, e.y];
      inertia.position = position;
      inertia.velocity = [0, 0];
      inertia.timer.stop(), this.classList.remove('inertia');
      this.classList.add('dragging');
      opt.start && opt.start.call(this, position);
    },
    move: function(e) {
      var position = [e.x, e.y];
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
      this.classList.remove('dragging', 'inertia');
      
      var v = inertia.velocity;
      if (v[0] * v[0] + v[1] * v[1] < 100) return inertia.timer.stop(), opt.stop && opt.stop();

      var time = performance.now();
      var deltaTime = time - inertia.time;
      
      if (opt.hold == undefined) opt.hold = 100; // default flick->drag threshold time (0 disables inertia)
      
      if (deltaTime >= opt.hold) return inertia.timer.stop(), opt.stop && opt.stop();
      
      this.classList.add('inertia');
      opt.end && opt.end();

      var me = this;
      inertia.timer.restart(function(e) {
        inertia.t = limit * (1 - Math.exp(-B * e / A));
        opt.render && opt.render(inertia.t);
        if (inertia.t > 1) {
          inertia.timer.stop(), me.classList.remove('inertia');
          inertia.velocity = [0, 0];
          inertia.t = 1;
          opt.finish && opt.finish();
        }
      });
    },
    position: [0, 0],
    velocity: [0, 0], // in pixels/s
    timer: timer(function(){}),
    time: 0
  };

  inertia.timer.stop();

  return inertia;
}
