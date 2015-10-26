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
  const it = scope();
  let state = null;
  return new Promise((yep, nope) => {
    const loop = (value) => {
      try { state = it.next(value); }
      catch (e) { return nope(e); }

      if (null == state || true == state.done) return yep(value);

      if (isPromise(state.value)) state.value.then(loop).catch(nope);
      else if (state.value) setTimeout(_ => {
        try { loop(state.value); }
        catch (e) { nope(e); }
      });
    }

    return loop(null);
  });
}
