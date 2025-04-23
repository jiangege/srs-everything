/**
 * Functional Programming Utility Functions
 */

/**
 * Function composition (right to left)
 * compose(f, g, h)(x) is equivalent to f(g(h(x)))
 */
export const compose = <R>(
  ...fns: Array<(a: any) => any>
): ((arg: any) => R) => {
  if (fns.length === 0) {
    return (arg: any) => arg as unknown as R;
  }

  if (fns.length === 1) {
    return fns[0] as (arg: any) => R;
  }

  return fns.reduce((prev, curr) => (arg: any) => prev(curr(arg))) as (
    arg: any
  ) => R;
};

/**
 * Function composition (left to right)
 * pipe(f, g, h)(x) is equivalent to h(g(f(x)))
 */
export const pipe = <T, R>(...fns: Array<(a: any) => any>): ((arg: T) => R) => {
  if (fns.length === 0) {
    return (arg: T) => arg as unknown as R;
  }

  if (fns.length === 1) {
    return fns[0] as (arg: T) => R;
  }

  return fns.reduce((prev, curr) => (arg: any) => curr(prev(arg))) as (
    arg: T
  ) => R;
};

/**
 * Currying function
 * Transforms a function that takes multiple arguments into a sequence of functions each taking a single argument
 */
export const curry = <T extends any[], R>(
  fn: (...args: T) => R
): ((...args: any[]) => any) => {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...(args as any));
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  };
};

/**
 * Partial application
 * Fixes some parameters of a function, returning a new function that handles the remaining parameters
 */
export const partial = <T extends any[], R>(
  fn: (...args: T) => R,
  ...boundArgs: any[]
): ((...args: any[]) => R) => {
  return (...remainingArgs: any[]) =>
    fn(...(boundArgs.concat(remainingArgs) as T));
};

/**
 * Memoization function
 * Caches function results to avoid repeated calculations
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Identity function
 * Returns the input parameter
 */
export const identity = <T>(x: T): T => x;

/**
 * Constant function
 * Returns a function that always returns the given value
 */
export const constant =
  <T>(x: T) =>
  (): T =>
    x;

/**
 * Converts an async function to a Promise-returning form
 */
export const promisify = <T extends any[], R>(
  fn: (...args: T) => R
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    return fn(...args);
  };
};

/**
 * Function throttling
 * Limits a function to be executed only once within a specific time period
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeout: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>): void => {
    const now = Date.now();

    if (now - lastCall < wait) {
      lastArgs = args;
      if (timeout === null) {
        timeout = setTimeout(() => {
          lastCall = Date.now();
          timeout = null;
          if (lastArgs) fn(...lastArgs);
        }, wait - (now - lastCall));
      }
      return;
    }

    lastCall = now;
    fn(...args);
  };
};

/**
 * Function debounce
 * Delays function execution until after a specified time period has passed since the last invocation
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
};

/**
 * Converts a binary function to one that accepts a pair parameter
 */
export const uncurry = <A, B, C>(
  fn: (a: A) => (b: B) => C
): ((pair: [A, B]) => C) => {
  return ([a, b]: [A, B]): C => fn(a)(b);
};

/**
 * Converts a function that accepts a pair parameter to a curried binary function
 */
export const curry2 = <A, B, C>(
  fn: (pair: [A, B]) => C
): ((a: A) => (b: B) => C) => {
  return (a: A) =>
    (b: B): C =>
      fn([a, b]);
};

/**
 * Reverses function parameters
 */
export const flip = <A, B, C>(fn: (a: A, b: B) => C): ((b: B, a: A) => C) => {
  return (b: B, a: A): C => fn(a, b);
};

/**
 * Function call, used for "execution" in function composition
 */
export const call = <T>(fn: () => T): T => fn();

/**
 * Applies a function to an argument
 */
export const apply = <T, R>(fn: (arg: T) => R, arg: T): R => fn(arg);

/**
 * Conditional function application
 */
export const when = <T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
): ((value: T) => T) => {
  return (value: T): T => (predicate(value) ? fn(value) : value);
};

/**
 * Function OR
 * Tries the first function, if it returns a falsy value, then tries the second function
 */
export const either = <T, R>(
  f: (x: T) => R | null | undefined | false | 0 | "",
  g: (x: T) => R
): ((x: T) => R) => {
  return (x: T): R => {
    const result = f(x);
    return result ? result : g(x);
  };
};

/**
 * Function AND
 * If the first function returns a truthy value, applies the second function
 */
export const both = <T, R>(
  f: (x: T) => boolean,
  g: (x: T) => R
): ((x: T) => R | T) => {
  return (x: T): R | T => (f(x) ? g(x) : x);
};

/**
 * Logical AND for any number of functions
 */
export const allPass = <T>(
  fns: Array<(x: T) => boolean>
): ((x: T) => boolean) => {
  return (x: T): boolean => fns.every((fn) => fn(x));
};

/**
 * Logical OR for any number of functions
 */
export const anyPass = <T>(
  fns: Array<(x: T) => boolean>
): ((x: T) => boolean) => {
  return (x: T): boolean => fns.some((fn) => fn(x));
};
