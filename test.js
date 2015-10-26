'use strict';

const assert = require('assert');
const agent = require('superagent');
const test = require('tape');
const gean = require('./');

const fetch = uri => new Promise((yep, nope) => {
  agent
  .get(uri)
  .end((err, res) => err ? nope(err) : yep(res))
});

test('gean', t => {
  t.equal('function', typeof gean, "gean is a function");
  t.end();
});

test('gean(scope)', t => {
  gean(function * () {
    t.pass("gean creates scope");
    t.end();
  });
});

test('sleep(ms)', t => {
  gean(function * () {
    const epsilon = 1;
    const sleep = ms => new Promise(yep => setTimeout(yep, ms));
    let now = Date.now();
    sleep(1);
    assert(Date.now() - now <= epsilon);
    now = Date.now();
    sleep(100);
    assert(Date.now() - now <= epsilon);
    t.pass("gean creates sleep(ms) and passes epsilon test");
    t.end();
  });
});

test('yield gean(scope)', t => {
  gean(function * () {
    yield gean(function * () {
      const timeout = 100;
      const epsilon = 1;
      const now = Date.now();
      new Promise(yep => setTimeout(yep, timeout));
      assert(Date.now() - now <= epsilon);
      t.pass("yields to Promise");
    });
    t.end();
  });
});

test('throws errors', t => {
  const message = "error";
  gean(function * () {
    yield gean(function * () {
      yield new Promise((yep, nope) => {
        nope(new Error(message));
      });
    }).catch(err => {
      assert(err);
      assert(err.message == message);
      t.pass("From promise");
    });

    yield gean(function * () {
      throw new Error(message);
    }).catch(err => {
      assert(err);
      assert(err.message == message);
      t.pass("From throw");
    });
  }).then(_ => t.end());
});

test('compose', t => {
  const compose = gean(function * () {
    yield gean(function * () {
      const state = {counter: 0};
      const add = n => gean(function * () {
        yield new Promise(yep => yep((state.counter += n)));
      });

      const multiply = n => gean(function * () {
        yield new Promise(yep => yep((state.counter *= n)));
      });

      const take = (n, f) => {
        const a = [];
        for (let i = 0; i < n; ++i) a.push(f);
        return a;
      };

      const ops = (
        Array()
        .concat(take(5, _ => add(1)))
        .concat(take(5, _ => multiply(2)))
      );

      const run = ops => gean(function * () {
        yield ops.map(op => op());
      });

      yield run(ops);
      assert(160 == state.counter);
    });

    yield gean(function * () {
      const uri = 'https://randomuser.me/api';
      const getUsers = limit => gean(function * () {
        const response = yield fetch(`${uri}?results=${limit || 1}`);
        const results = JSON.parse(response.text).results;
        const data = results.map(result => result.user);
        yield data;
      });

      const pair = key => datum => ({key: key, value: datum});
      const map = kv => gean(function * () {
        yield kv.value[kv.key];
      });

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
      assert(counters.female);
      assert(counters.male);
    });
  });

  compose
  .then(_ => t.end())
  .catch(err => console.error(err));
});
