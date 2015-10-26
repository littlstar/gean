(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Predicate function to determine
 * if a value is a promise or at
 * the bery leasts supports a method
 * named `then()'.
 *
 * @private
 * @function
 * @name isPromise
 * @param {Mixed} p
 * @return {Boolean}
 */

const isPromise = p => p && (p instanceof Promise ||
                            'function' == typeof p.then);

/**
 * Calls a generator as a scope for yielding
 * promise values.
 *
 * @public
 * @function
 * @name gean
 * @param {GeneratorFunction} scope
 * @return {Promise}
 */

module.exports = (scope) => {
  let state = null;
  const it = scope();
  return new Promise((resolve, reject) => {

    /**
     * loop and provide values to promises.
     *
     * @private
     * @function
     * @name loop
     * @param {Mixed} value
     */

    const loop = (value) => {
      const yep = value => resolve(value);
      const nope = err => {
        try { next(gen.throw(err)); }
        catch (_) {}
        reject(err);
      };

      try { state = it.next(value); }
      catch (e) { return nope(e); }

      /**
       * provide value to promise if available.
       *
       * @private
       * @function
       * @name next
       * @param {Mixed} value
       */

      const next = value => {
        if (isPromise(value)) value.then(loop).catch(nope);
        else if (value) setTimeout(_ => loop(value));
      };

      // resolve if done
      if (null == state || true == state.done) return yep(value);
      else next(state.value);
    };

    // begin loop
    loop(null);
  });
}

},{}]},{},[1]);
