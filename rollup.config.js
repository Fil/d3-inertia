export default {
  input: "index",
  external: [
    "d3-drag",
    "d3-selection",
    "d3-timer",
    "versor"
  ],
  output: {
    extend: true,
    file: "build/d3-inertia.js",
    format: "umd",
    globals: {
      "d3-drag": "d3",
      "d3-selection": "d3",
      "d3-timer": "d3",
      "versor": "versor"
    },
    name: "d3"
  }
};
