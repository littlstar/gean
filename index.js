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
  let loop = null;
  let state = null;
  const it = scope();
  return new Promise((resolve, reject) => {
    // begin loop
    setTimeout(_ => loop(undefined));

    /**
     * loop and provide values to promises.
     *
     * @private
     * @function
     * @name loop
     * @param {Mixed} value
     */

    loop = (value) => {
      // get state for value
      try { state = it.next(value); }
      catch (e) { return reject(e); }

      /**
       * provide value to promise if available.
       *
       * @private
       * @function
       * @name next
       * @param {Mixed} value
       */

      const next = (value) => {
        if (isPromise(value))
          value.then(loop).catch(reject);
        else if (value)
          setTimeout(_ => loop(value));
      };

      // resolve if done
      if (null == state || true == state.done)
        return resolve(value);
      else
        return next(state.value);
    };
  });
};
