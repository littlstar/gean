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
        try { next(it.throw(err)); }
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
