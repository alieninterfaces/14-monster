class Tween {
  constructor(object, targetValues, duration, lerpFunction, callback) {
    this.object = object; // The object whose properties we're interpolating
    this.targetValues = targetValues; // The target values we're interpolating towards
    this.duration = duration; // The duration of the interpolation in milliseconds
    this.initialValues = {}; // Store initial values of properties
    this.elapsedTime = 0; // Track elapsed time
    this.active = false; // Whether the tween is active
    this.lerpFunction = lerpFunction || this.defaultLerp; // Use provided lerp function or default to linear interpolation
    this.callback = callback || (() => {}); // Use provided callback or default to empty function
    this.initialize();
  }

  initialize() {
    // Store the initial values of the properties we're interpolating
    for (let key in this.targetValues) {
      if (this.object.hasOwnProperty(key)) {
        this.initialValues[key] = this.object[key];
      }
    }

    this.start();
  }

  start() {
    this.active = true;
    this.elapsedTime = 0;
    this.update();
  }

  update() {
    if (!this.active) return;

    // Calculate elapsed time
    this.elapsedTime += 16; // Roughly 60 frames per second
    const t = Math.min(this.elapsedTime / this.duration, 1); // Clamp t between 0 and 1

    // Interpolate each property
    for (let key in this.targetValues) {
      if (this.object.hasOwnProperty(key)) {
        this.object[key] = this.lerpFunction(
          this.initialValues[key],
          this.targetValues[key],
          t
        );
      }
    }

    // If we have reached the target values, stop the tween
    if (t === 1) {
      this.active = false;
      this.callback();
    } else {
      // Otherwise, request the next frame
      requestAnimationFrame(() => this.update());
    }
  }

  defaultLerp(start, end, t) {
    return (1 - t) * start + t * end;
  }
}

const linear = (start, end, t) => (1 - t) * start + t * end;

const easeInQuad = (start, end, t) => start + (end - start) * t * t;
const easeOutQuad = (start, end, t) => start - (end - start) * t * (t - 2);
const easeInOutQuad = (start, end, t) =>
  t < 0.5
    ? 2 * (end - start) * t * t + start
    : -1 * (end - start) * (--t * (t - 2) - 1) + start;

const easeInCubic = (start, end, t) => (end - start) * t * t * t + start;
const easeOutCubic = (start, end, t) =>
  (end - start) * ((t = t - 1) * t * t + 1) + start;
const easeInOutCubic = (start, end, t) =>
  t < 0.5
    ? 4 * (end - start) * t * t * t + start
    : (end - start) * ((2 * t - 2) * (2 * t - 2) * (2 * t - 2) + 1) + start;

const easeInQuart = (start, end, t) => (end - start) * t * t * t * t + start;
const easeOutQuart = (start, end, t) =>
  -(end - start) * ((t = t - 1) * t * t * t - 1) + start;
const easeInOutQuart = (start, end, t) =>
  t < 0.5
    ? 8 * (end - start) * t * t * t * t + start
    : -1 * (end - start) * ((t = t - 1) * t * t * t - 1) + start;

const easeInQuint = (start, end, t) =>
  (end - start) * t * t * t * t * t + start;
const easeOutQuint = (start, end, t) =>
  (end - start) * ((t = t - 1) * t * t * t * t + 1) + start;
const easeInOutQuint = (start, end, t) =>
  t < 0.5
    ? 16 * (end - start) * t * t * t * t * t + start
    : (end - start) * (16 * (t -= 0.5) * t * t * t * t + 1) + start;

const easeInExpo = (start, end, t) =>
  (end - start) * Math.pow(2, 10 * (t - 1)) + start;
const easeOutExpo = (start, end, t) =>
  (end - start) * (-Math.pow(2, -10 * t) + 1) + start;
const easeInOutExpo = (start, end, t) =>
  t < 0.5
    ? ((end - start) * Math.pow(2, 10 * (2 * t - 1))) / 2 + start
    : ((end - start) * (2 - Math.pow(2, -10 * (2 * t - 1)))) / 2 + start;

const easeInCirc = (start, end, t) =>
  -(end - start) * (Math.sqrt(1 - t * t) - 1) + start;
const easeOutCirc = (start, end, t) =>
  (end - start) * Math.sqrt(1 - (t = t - 1) * t) + start;
const easeInOutCirc = (start, end, t) =>
  t < 0.5
    ? (-(end - start) / 2) * (Math.sqrt(1 - 4 * t * t) - 1) + start
    : ((end - start) / 2) * (Math.sqrt(1 - (2 * t - 2) * (2 * t - 2)) + 1) +
      start;

// Example usage:
/*
let obj = { x: 0, y: 0 };
let customLerpFunction = (start, end, t) => (1 - t) * start + t * end; // A custom lerp function
let tween = new Tween(obj, { x: 100, y: 200 }, 2000, customLerpFunction); // 2 seconds duration
tween.start();
*/
