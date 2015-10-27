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

We can use `gean` to create simple a `fetch` function backed by
[superagent](https://github.com/visionmedia/superagent). We'll use it to
read from the `randomuser` API and sum the number of `male` and `female`
gender entries per user.

```js
import agent from 'superagent';
import gean from 'gean';

const fetch = uri => new Promise((yep, nope) => {
  agent.get(uri).end((err, res) ? nope(err) : yep(res));
};

gean(function * () {
  const uri = 'https://randomuser.me/api?results=10';
  const res = yield fetch(uri);
  const users = res.body.results;
  const counter = {female: 0, male: 0};

  for (let user of users)
    counter[user.gender]++;

  console.log(counter)
  // { female: 8, male: 2 }
});
```

## license

MIT
