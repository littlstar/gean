gean
====

gean provides a mechanism for composable generator control with
promises.

## why ?

* tiny.
* zero dependencies.
* composable.
* `Promise` based.


## installation

```sh
$ npm install gean --save
```

## usage

```js
gean(function * () {
  // flow control here
});
```

`gean` accept a `GeneratorFunction` and returns a `Promise`
that allow for composability.

## example

In this example we read random user data from the `randomuser` API and
sum the number of `male` and `female` gender entries per user.

```js
const gean = require('gean');
gean(function * () {
  const uri = 'https://randomuser.me/api';

  const getUsers = limit => gean(function * () {
    const response = yield fetch(`${uri}?results=${limit || 1}`);
    const results = JSON.parse(response.text).results;
    const data = results.map(result => result.user);
    yield data;
  });

  const pair = key => datum => ({key: key, value: datum});

  const map = kv => gean(function * () { yield kv.value[kv.key]; });

  const reduce = (state, value) => gean(function * () {
    const counters = yield state;
    counters[yield value]++;
    yield counters;
  });

  const count = (key, data, counters) => gean(function * () {
    yield data.map(pair(key)).map(map).reduce(reduce, counters)
  });

  const run = limit => gean(function * () {
    const counters = {female: 0, male: 0};
    const batch = [];
    for (let i = 0; i < limit; ++i)
      yield count('gender', yield getUsers(10), counters);
    yield counters;
  });

  const counters = yield run(1);
  // { female: 8, male: 2 }
});
```

## license

MIT
