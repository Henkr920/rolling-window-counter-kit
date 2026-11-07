# rolling-window-counter-kit

Maintains a count of events within a sliding time window of fixed duration by expiring stale entries on each record and read.

## Usage

```js
import { RollingWindowCounter } from 'rolling-window-counter-kit';

const counter = new RollingWindowCounter(1000); // 1 second window
counter.record();
counter.record();
console.log(counter.count()); // 2
// after 1 second, count() will return 0
```

## Why this exists

Counting events in a sliding window is a common need — rate limiting, monitoring, analytics — but most implementations either rely on timers or keep unbounded history. This library keeps only the timestamps inside the window and prunes them lazily on access. The trade-off is that memory grows with the number of events in the window; for very high throughput with long windows, a bucketed approach would be more memory-efficient. This library favours simplicity and exact counting.

## Edge cases

The window boundary is inclusive: an event recorded exactly at `now - windowMs` is still counted. If you need exclusive bounds, you would need to adjust the comparison in `_expire`.

The clock is injectable. Pass a function returning milliseconds as the second constructor argument to make tests deterministic.
