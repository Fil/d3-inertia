# Inertia

An extension to [d3-drag](https://github.com/d3/d3-drag) that continues the mouse movement with some inertia (by default, 5 seconds).

The `inertia` object exposes a `position` and a `velocity`, that correspond to the mouse coordinates relative to the target of the `d3.drag` method. During the drag gesture, the position just follows the mouse, and the velocity accumulates the movement. When the drag gesture ends, the `render()` method is called repeatedly with a tweening argument `t` that goes from 0 to 1. It is up to you to know what to do with these vectors.

The most simple case is: `currentPosition = last position + t * velocity`.

This [example](https://bl.ocks.org/Fil/a034e32156b7b25ee9054c1bc50dc0ca) demonstrates a more creative use of the parameters. As you can see, `d3.inertia` can be used on its own, but you will need to manage quite a few parameters.

(TODO: a helping function for common use cases).



# Dragging the globe

[<img alt="Versor Dragging with Inertia" src="https://github.com/Fil/d3-inertia/raw/master/img/globe-inertia.gif" width="600" height="409">](https://bl.ocks.org/Fil/f48de8e9207799017093a169031adb02/)
<br>*[Canvas example + code](https://bl.ocks.org/Fil/f48de8e9207799017093a169031adb02/)*

The naïve method to rotate a globe uses `mouse.x` and `mouse.y` as proxies for longitude and latitude. It works when the rotation is small, but try to put the globe "upside-down" and suddenly moving the mouse to the left rotates the globe to the right, and vice versa.

The correct solution is to track the spherical coordinates of the point that is under the mouse, and apply a rotation to the globe that will move the initial point to the current mouse position. Computing that rotation involves quaternions.

This method, introduced by [Jason Davies](https://www.jasondavies.com/maps/rotate/) and Mike Bostock, is called [versor dragging](https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42).

**d3-inertia** packages this method.

Include the scripts in your page with
```
<script src="https://unpkg.com/versor"></script>
<script src="https://unpkg.com/d3-inertia"></script>
```

Then, define a `render()` function that redraws the globe, and call:

```
var inertia = d3.geoInertiaDrag(canvas, function() { render(); }, [projection], [opt]);
```

[<img alt="Versor Dragging with Inertia" src="https://github.com/Fil/d3-inertia/raw/master/img/eclipses.gif" width="400" height="392">](https://visionscarto.net/empreintes-d-eclipses)
<br>*[SVG example](https://visionscarto.net/empreintes-d-eclipses)  + [code](https://bl.ocks.org/Fil/63366253a5d2f00640c15b096c29a38c)*

*canvas* is the target container (it can also be *svg*)

*projection* is an object with two methods:

- *projection.rotate([r])* gets and sets the rotation.

- *projection.invert([x,y])* transforms screen coordinates into spherical coordinates *lambda, phi*; most [projections](https://github.com/d3/d3-geo-projection) have an exact invert, but for the few which do not, this doesn't have to be very accurate to give an “almost correct” movement.

If a projection is defined globally, and not specified in the function call, the plugin will use it.

*opt* is an array of options, which can include:

- *start*, *move*, *end*: callback functions on the corresponding events (*end* is invoked only if conditions for inertia are met)

- *stop*, *finish*: extra callback functions invoked if the conditions for inertia are not met or after it finishes respectively

- *time*: reference time for the inertia (in ms, default 5000)

- *hold*: threshold time beteen the final *move* and *end* events after which inertia will be cancelled (in ms, default 50)


# Credits

Thanks to [Jason Davies](https://www.jasondavies.com/), [Mike Bostock](https://bl.ocks.org/mbostock/) and [Widi Harsojo](https://github.com/earthjs/earthjs).

The quaternion & versor functions are taken from the [versor](https://github.com/Fil/versor) package.


