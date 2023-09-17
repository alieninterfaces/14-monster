class Tween {
  constructor(options) {
    this.object = options.object;
    this.initialValue = Object.assign({}, this.object);
    this.targetValue = options.targetValue;
    this.duration = options.duration || 1000; // Default duration is 1000 milliseconds (1 second)
    this.easingFunction = options.easingFunction || this.linearEasing;
    this.onUpdate = options.onUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});

    this.startTime = null;
    this.requestAnimationFrameId = null;

    this.start();
  }

  start() {
    this.startTime = performance.now();
    this.animate();
  }

  animate() {
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.startTime;

    if (elapsedTime >= this.duration) {
      this.onUpdate(this.targetValue);
      this.onComplete();
    } else {
      const t = elapsedTime / this.duration;
      const interpolatedValue = this.easingFunction(t);

      for (const key in this.targetValue) {
        if (this.targetValue.hasOwnProperty(key)) {
          const start = this.initialValue[key];
          const end = this.targetValue[key];
          const currentValue = start + (end - start) * interpolatedValue;
          this.object[key] = currentValue;
        }
      }

      this.onUpdate(this.object);

      this.requestAnimationFrameId = requestAnimationFrame(() => {
        this.animate();
      });
    }
  }

  linearEasing(t) {
    return t; // Linear easing
  }

  stop() {
    cancelAnimationFrame(this.requestAnimationFrameId);
  }
}

const linearEasing = (t) => t;

const easeInQuad = (t) => t * t;

const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const easeInCubic = (t) => t * t * t;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeInQuart = (t) => t * t * t * t;

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const easeInOutQuart = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
