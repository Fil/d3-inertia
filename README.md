# Inertia

An extension to [d3-drag](https://github.com/d3/d3-drag) that continues the mouse movement with some inertia (by default, 5 seconds).

We currently have no example of using this directly. (TODO)



# Dragging the globe

[<img alt="Versor Dragging with Inertia" src="https://github.com/Fil/d3-inertia/raw/master/img/globe-inertia.gif" width="600" height="409">](https://bl.ocks.org/Fil/f48de8e9207799017093a169031adb02/)

The naïve method to rotate a globe uses `mouse.x` and `mouse.y` as proxies for longitude and latitude. It works when the rotation is small, but try to put the globe "upside-down" and suddenly moving the mouse to the left rotates the globe to the right, and vice versa.

The correct solution is to track the spherical coordinates of the point that is under the mouse, and apply a rotation to the globe that will move the initial point to the current mouse position. Computing that rotation involves quaternions.

This method, introduced by [Jason Davies](https://www.jasondavies.com/maps/rotate/) and Mike Bostock, is called [versor dragging](https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42).

**d3-inertia** packages this method.

Include the script in your page with
```
<script src="https://unpkg.com/d3-inertia"></script>
```

Then, define a `render()` function that draws (and redraws) the globe, and call:

```
var inertia = d3.inertiaDrag(canvas, function() { render(); }, projection);
```


# Credits

Thanks to [Jason Davies](https://www.jasondavies.com/), [Mike Bostock](https://bl.ocks.org/mbostock/) and [Widi Harsojo](https://github.com/earthjs/earthjs).

The quaternion & versor functions are taken from the [versor](https://github.com/Fil/versor) package.


