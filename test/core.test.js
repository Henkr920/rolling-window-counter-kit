import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RollingWindowCounter } from '../src/core.js';

test('records and counts events within the window', () => {
  let now = 0;
  const counter = new RollingWindowCounter(1000, () => now);
  counter.record(); // t=0
  now = 500;
  counter.record(); // t=500
  assert.equal(counter.count(), 2);
  now = 999;
  assert.equal(counter.count(), 2);
});

test('expires events that fall outside the window', () => {
  let now = 0;
  const counter = new RollingWindowCounter(1000, () => now);
  counter.record(); // t=0
  now = 500;
  counter.record(); // t=500
  now = 1001; // first event is now older than 1000ms
  assert.equal(counter.count(), 1);
  now = 1501; // second event is now older than 1000ms
  assert.equal(counter.count(), 0);
});

test('includes events exactly at the window boundary', () => {
  let now = 0;
  const counter = new RollingWindowCounter(1000, () => now);
  counter.record(); // t=0
  now = 1000; // exactly at boundary, should still count
  assert.equal(counter.count(), 1);
});

test('expires on record as well as on count', () => {
  let now = 0;
  const counter = new RollingWindowCounter(1000, () => now);
  counter.record(); // t=0
  now = 2000;
  counter.record(); // t=2000, should expire the first one
  assert.equal(counter.count(), 1);
  assert.equal(counter.timestamps.length, 1);
  assert.equal(counter.timestamps[0], 2000);
});

test('reset clears all events', () => {
  let now = 0;
  const counter = new RollingWindowCounter(1000, () => now);
  counter.record();
  counter.record();
  assert.equal(counter.count(), 2);
  counter.reset();
  assert.equal(counter.count(), 0);
  assert.equal(counter.timestamps.length, 0);
});

test('rejects invalid windowMs', () => {
  assert.throws(() => new RollingWindowCounter(0), RangeError);
  assert.throws(() => new RollingWindowCounter(-1), RangeError);
  assert.throws(() => new RollingWindowCounter(NaN), RangeError);
  assert.throws(() => new RollingWindowCounter(Infinity), RangeError);
});

test('rejects non-function now', () => {
  assert.throws(() => new RollingWindowCounter(1000, 123), TypeError);
});

test('count is zero initially', () => {
  const counter = new RollingWindowCounter(1000, () => 0);
  assert.equal(counter.count(), 0);
});
