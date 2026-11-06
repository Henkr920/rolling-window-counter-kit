/**
 * A counter that tracks events within a sliding time window.
 *
 * The window is defined by a duration in milliseconds. On every record and read,
 * entries older than `now - windowMs` are removed. The clock is injectable so
 * that tests can be deterministic; by default it uses `Date.now`.
 */
export class RollingWindowCounter {
  /**
   * @param {number} windowMs - The duration of the sliding window in milliseconds.
   * @param {() => number} [now] - Optional clock function returning the current time in milliseconds.
   *   Defaults to `Date.now`. Injecting a clock lets tests control time without sleeping.
   */
  constructor(windowMs, now = Date.now) {
    if (typeof windowMs !== 'number' || !Number.isFinite(windowMs) || windowMs <= 0) {
      throw new RangeError('windowMs must be a positive finite number');
    }
    if (typeof now !== 'function') {
      throw new TypeError('now must be a function returning a number');
    }
    this.windowMs = windowMs;
    this.now = now;
    /** @type {number[]} timestamps of recorded events, sorted ascending */
    this.timestamps = [];
  }

  /**
   * Remove timestamps that are outside the current window.
   * A timestamp is stale if it is strictly older than `now - windowMs`.
   * We keep the boundary inclusive: an event exactly at `now - windowMs` is still counted.
   * This is a deliberate choice; changing it would be a breaking change.
   */
  _expire() {
    const cutoff = this.now() - this.windowMs;
    let i = 0;
    while (i < this.timestamps.length && this.timestamps[i] < cutoff) {
      i++;
    }
    if (i > 0) {
      this.timestamps.splice(0, i);
    }
  }

  /**
   * Record a single event at the current time.
   */
  record() {
    this._expire();
    this.timestamps.push(this.now());
  }

  /**
   * Return the number of events currently within the window.
   * @returns {number}
   */
  count() {
    this._expire();
    return this.timestamps.length;
  }

  /**
   * Reset the counter, discarding all recorded events.
   */
  reset() {
    this.timestamps.length = 0;
  }
}
