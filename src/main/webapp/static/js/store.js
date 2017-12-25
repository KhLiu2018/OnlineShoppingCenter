//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate, context) {
    predicate = lookupIterator(predicate);
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate.call(context, elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);
;//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var slice = array.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;

      // Remove all callbacks for all events.
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }

      var names = name ? [name] : _.keys(this._events);
      for (var i = 0, length = names.length; i < length; i++) {
        name = names[i];

        // Bail out if there are no events stored.
        var events = this._events[name];
        if (!events) continue;

        // Remove all callbacks for this event.
        if (!callback && !context) {
          delete this._events[name];
          continue;
        }

        // Find any remaining events.
        var remaining = [];
        for (var j = 0, k = events.length; j < k; j++) {
          var event = events[j];
          if (
            callback && callback !== event.callback &&
            callback !== event.callback._callback ||
            context && context !== event.context
          ) {
            remaining.push(event);
          }
        }

        // Replace events if there are any remaining.  Otherwise, clean up.
        if (remaining.length) {
          this._events[name] = remaining;
        } else {
          delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, length = names.length; i < length; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, length = changes.length; i < length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    if (!_[method]) return;
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      for (var i = 0, length = models.length; i < length; i++) {
        var model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : models.slice();
      var id, model, attrs, existing, sort;
      var at = options.at;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (var i = 0, length = models.length; i < length; i++) {
        attrs = models[i] || {};
        if (this._isModel(attrs)) {
          id = model = attrs;
        } else {
          id = attrs[this.model.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (!model) continue;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (var i = 0, length = this.length; i < length; i++) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (var i = 0, length = toAdd.length; i < length; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (var i = 0, length = orderedModels.length; i < length; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (var i = 0, length = toAdd.length; i < length; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, length = this.models.length; i < length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function (model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    if (!_[method]) return;
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    if (!_[method]) return;
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el` and a hash of `attributes`. `el` can be a CSS selector or an
    // HTML string, a jQuery context or an element. Subclasses can override
    // this to utilize an alternative DOM manipulation API and are only required
    // to set the `this.el` property.
    _setElement: function(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.apply(this, arguments);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.location.search;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = decodeURI(this.location.pathname + this.location.search);
      var root = this.root.slice(0, -1);
      if (!path.indexOf(root)) path = path.slice(root.length);
      return path.slice(1);
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      this.fragment         = this.getFragment();

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function (eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && (!this._wantsPushState || !this._hasPushState)) {
        var iframe = document.createElement('iframe');
        iframe.src = 'javascript:0';
        iframe.style.display = 'none';
        iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        this.iframe = body.insertBefore(iframe, body.firstChild).contentWindow;
        this.navigate(this.fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._wantsHashChange && this._hasHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.location.replace(this.root + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), {replace: true});
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function (eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._hasPushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._wantsHashChange && this._hasHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe.frameElement);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe);
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash and decode for matching.
      fragment = decodeURI(fragment.replace(pathStripper, ''));

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getHash(this.iframe))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));
;// MarionetteJS (Backbone.Marionette)
// ----------------------------------
// v1.8.3
//
// Copyright (c)2014 Derick Bailey, Muted Solutions, LLC.
// Distributed under MIT license
//
// http://marionettejs.com


/*!
 * Includes BabySitter
 * https://github.com/marionettejs/backbone.babysitter/
 *
 * Includes Wreqr
 * https://github.com/marionettejs/backbone.wreqr/
 */


// Backbone.BabySitter
// -------------------
// v0.1.0
//
// Copyright (c)2014 Derick Bailey, Muted Solutions, LLC.
// Distributed under MIT license
//
// http://github.com/marionettejs/backbone.babysitter

// Backbone.ChildViewContainer
// ---------------------------
//
// Provide a container to store, retrieve and
// shut down child views.

Backbone.ChildViewContainer = (function(Backbone, _){
  
  // Container Constructor
  // ---------------------

  var Container = function(views){
    this._views = {};
    this._indexByModel = {};
    this._indexByCustom = {};
    this._updateLength();

    _.each(views, this.add, this);
  };

  // Container Methods
  // -----------------

  _.extend(Container.prototype, {

    // Add a view to this container. Stores the view
    // by `cid` and makes it searchable by the model
    // cid (and model itself). Optionally specify
    // a custom key to store an retrieve the view.
    add: function(view, customIndex){
      var viewCid = view.cid;

      // store the view
      this._views[viewCid] = view;

      // index it by model
      if (view.model){
        this._indexByModel[view.model.cid] = viewCid;
      }

      // index by custom
      if (customIndex){
        this._indexByCustom[customIndex] = viewCid;
      }

      this._updateLength();
      return this;
    },

    // Find a view by the model that was attached to
    // it. Uses the model's `cid` to find it.
    findByModel: function(model){
      return this.findByModelCid(model.cid);
    },

    // Find a view by the `cid` of the model that was attached to
    // it. Uses the model's `cid` to find the view `cid` and
    // retrieve the view using it.
    findByModelCid: function(modelCid){
      var viewCid = this._indexByModel[modelCid];
      return this.findByCid(viewCid);
    },

    // Find a view by a custom indexer.
    findByCustom: function(index){
      var viewCid = this._indexByCustom[index];
      return this.findByCid(viewCid);
    },

    // Find by index. This is not guaranteed to be a
    // stable index.
    findByIndex: function(index){
      return _.values(this._views)[index];
    },

    // retrieve a view by its `cid` directly
    findByCid: function(cid){
      return this._views[cid];
    },

    // Remove a view
    remove: function(view){
      var viewCid = view.cid;

      // delete model index
      if (view.model){
        delete this._indexByModel[view.model.cid];
      }

      // delete custom index
      _.any(this._indexByCustom, function(cid, key) {
        if (cid === viewCid) {
          delete this._indexByCustom[key];
          return true;
        }
      }, this);

      // remove the view from the container
      delete this._views[viewCid];

      // update the length
      this._updateLength();
      return this;
    },

    // Call a method on every view in the container,
    // passing parameters to the call method one at a
    // time, like `function.call`.
    call: function(method){
      this.apply(method, _.tail(arguments));
    },

    // Apply a method on every view in the container,
    // passing parameters to the call method one at a
    // time, like `function.apply`.
    apply: function(method, args){
      _.each(this._views, function(view){
        if (_.isFunction(view[method])){
          view[method].apply(view, args || []);
        }
      });
    },

    // Update the `.length` attribute on this container
    _updateLength: function(){
      this.length = _.size(this._views);
    }
  });

  // Borrowing this code from Backbone.Collection:
  // http://backbonejs.org/docs/backbone.html#section-106
  //
  // Mix in methods from Underscore, for iteration, and other
  // collection related features.
  var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter', 
    'select', 'reject', 'every', 'all', 'some', 'any', 'include', 
    'contains', 'invoke', 'toArray', 'first', 'initial', 'rest', 
    'last', 'without', 'isEmpty', 'pluck'];

  _.each(methods, function(method) {
    Container.prototype[method] = function() {
      var views = _.values(this._views);
      var args = [views].concat(_.toArray(arguments));
      return _[method].apply(_, args);
    };
  });

  // return the public API
  return Container;
})(Backbone, _);

// Backbone.Wreqr (Backbone.Marionette)
// ----------------------------------
// v1.1.0
//
// Copyright (c)2014 Derick Bailey, Muted Solutions, LLC.
// Distributed under MIT license
//
// http://github.com/marionettejs/backbone.wreqr


Backbone.Wreqr = (function(Backbone, Marionette, _){
  "use strict";
  var Wreqr = {};

  // Handlers
// --------
// A registry of functions to call, given a name

Wreqr.Handlers = (function(Backbone, _){
  "use strict";
  
  // Constructor
  // -----------

  var Handlers = function(options){
    this.options = options;
    this._wreqrHandlers = {};
    
    if (_.isFunction(this.initialize)){
      this.initialize(options);
    }
  };

  Handlers.extend = Backbone.Model.extend;

  // Instance Members
  // ----------------

  _.extend(Handlers.prototype, Backbone.Events, {

    // Add multiple handlers using an object literal configuration
    setHandlers: function(handlers){
      _.each(handlers, function(handler, name){
        var context = null;

        if (_.isObject(handler) && !_.isFunction(handler)){
          context = handler.context;
          handler = handler.callback;
        }

        this.setHandler(name, handler, context);
      }, this);
    },

    // Add a handler for the given name, with an
    // optional context to run the handler within
    setHandler: function(name, handler, context){
      var config = {
        callback: handler,
        context: context
      };

      this._wreqrHandlers[name] = config;

      this.trigger("handler:add", name, handler, context);
    },

    // Determine whether or not a handler is registered
    hasHandler: function(name){
      return !! this._wreqrHandlers[name];
    },

    // Get the currently registered handler for
    // the specified name. Throws an exception if
    // no handler is found.
    getHandler: function(name){
      var config = this._wreqrHandlers[name];

      if (!config){
        return;
      }

      return function(){
        var args = Array.prototype.slice.apply(arguments);
        return config.callback.apply(config.context, args);
      };
    },

    // Remove a handler for the specified name
    removeHandler: function(name){
      delete this._wreqrHandlers[name];
    },

    // Remove all handlers from this registry
    removeAllHandlers: function(){
      this._wreqrHandlers = {};
    }
  });

  return Handlers;
})(Backbone, _);

  // Wreqr.CommandStorage
// --------------------
//
// Store and retrieve commands for execution.
Wreqr.CommandStorage = (function(){
  "use strict";

  // Constructor function
  var CommandStorage = function(options){
    this.options = options;
    this._commands = {};

    if (_.isFunction(this.initialize)){
      this.initialize(options);
    }
  };

  // Instance methods
  _.extend(CommandStorage.prototype, Backbone.Events, {

    // Get an object literal by command name, that contains
    // the `commandName` and the `instances` of all commands
    // represented as an array of arguments to process
    getCommands: function(commandName){
      var commands = this._commands[commandName];

      // we don't have it, so add it
      if (!commands){

        // build the configuration
        commands = {
          command: commandName, 
          instances: []
        };

        // store it
        this._commands[commandName] = commands;
      }

      return commands;
    },

    // Add a command by name, to the storage and store the
    // args for the command
    addCommand: function(commandName, args){
      var command = this.getCommands(commandName);
      command.instances.push(args);
    },

    // Clear all commands for the given `commandName`
    clearCommands: function(commandName){
      var command = this.getCommands(commandName);
      command.instances = [];
    }
  });

  return CommandStorage;
})();

  // Wreqr.Commands
// --------------
//
// A simple command pattern implementation. Register a command
// handler and execute it.
Wreqr.Commands = (function(Wreqr){
  "use strict";

  return Wreqr.Handlers.extend({
    // default storage type
    storageType: Wreqr.CommandStorage,

    constructor: function(options){
      this.options = options || {};

      this._initializeStorage(this.options);
      this.on("handler:add", this._executeCommands, this);

      var args = Array.prototype.slice.call(arguments);
      Wreqr.Handlers.prototype.constructor.apply(this, args);
    },

    // Execute a named command with the supplied args
    execute: function(name, args){
      name = arguments[0];
      args = Array.prototype.slice.call(arguments, 1);

      if (this.hasHandler(name)){
        this.getHandler(name).apply(this, args);
      } else {
        this.storage.addCommand(name, args);
      }

    },

    // Internal method to handle bulk execution of stored commands
    _executeCommands: function(name, handler, context){
      var command = this.storage.getCommands(name);

      // loop through and execute all the stored command instances
      _.each(command.instances, function(args){
        handler.apply(context, args);
      });

      this.storage.clearCommands(name);
    },

    // Internal method to initialize storage either from the type's
    // `storageType` or the instance `options.storageType`.
    _initializeStorage: function(options){
      var storage;

      var StorageType = options.storageType || this.storageType;
      if (_.isFunction(StorageType)){
        storage = new StorageType();
      } else {
        storage = StorageType;
      }

      this.storage = storage;
    }
  });

})(Wreqr);

  // Wreqr.RequestResponse
// ---------------------
//
// A simple request/response implementation. Register a
// request handler, and return a response from it
Wreqr.RequestResponse = (function(Wreqr){
  "use strict";

  return Wreqr.Handlers.extend({
    request: function(){
      var name = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      if (this.hasHandler(name)) {
        return this.getHandler(name).apply(this, args);
      }
    }
  });

})(Wreqr);

  // Event Aggregator
// ----------------
// A pub-sub object that can be used to decouple various parts
// of an application through event-driven architecture.

Wreqr.EventAggregator = (function(Backbone, _){
  "use strict";
  var EA = function(){};

  // Copy the `extend` function used by Backbone's classes
  EA.extend = Backbone.Model.extend;

  // Copy the basic Backbone.Events on to the event aggregator
  _.extend(EA.prototype, Backbone.Events);

  return EA;
})(Backbone, _);

  // Wreqr.Channel
// --------------
//
// An object that wraps the three messaging systems:
// EventAggregator, RequestResponse, Commands
Wreqr.Channel = (function(Wreqr){
  "use strict";

  var Channel = function(channelName) {
    this.vent        = new Backbone.Wreqr.EventAggregator();
    this.reqres      = new Backbone.Wreqr.RequestResponse();
    this.commands    = new Backbone.Wreqr.Commands();
    this.channelName = channelName;
  };

  _.extend(Channel.prototype, {

    // Remove all handlers from the messaging systems of this channel
    reset: function() {
      this.vent.off();
      this.vent.stopListening();
      this.reqres.removeAllHandlers();
      this.commands.removeAllHandlers();
      return this;
    },

    // Connect a hash of events; one for each messaging system
    connectEvents: function(hash, context) {
      this._connect('vent', hash, context);
      return this;
    },

    connectCommands: function(hash, context) {
      this._connect('commands', hash, context);
      return this;
    },

    connectRequests: function(hash, context) {
      this._connect('reqres', hash, context);
      return this;
    },

    // Attach the handlers to a given message system `type`
    _connect: function(type, hash, context) {
      if (!hash) {
        return;
      }

      context = context || this;
      var method = (type === 'vent') ? 'on' : 'setHandler';

      _.each(hash, function(fn, eventName) {
        this[type][method](eventName, _.bind(fn, context));
      }, this);
    }
  });


  return Channel;
})(Wreqr);

  // Wreqr.Radio
// --------------
//
// An object that lets you communicate with many channels.
Wreqr.radio = (function(Wreqr){
  "use strict";

  var Radio = function() {
    this._channels = {};
    this.vent = {};
    this.commands = {};
    this.reqres = {};
    this._proxyMethods();
  };

  _.extend(Radio.prototype, {

    channel: function(channelName) {
      if (!channelName) {
        throw new Error('Channel must receive a name');
      }

      return this._getChannel( channelName );
    },

    _getChannel: function(channelName) {
      var channel = this._channels[channelName];

      if(!channel) {
        channel = new Wreqr.Channel(channelName);
        this._channels[channelName] = channel;
      }

      return channel;
    },

    _proxyMethods: function() {
      _.each(['vent', 'commands', 'reqres'], function(system) {
        _.each( messageSystems[system], function(method) {
          this[system][method] = proxyMethod(this, system, method);
        }, this);
      }, this);
    }
  });


  var messageSystems = {
    vent: [
      'on',
      'off',
      'trigger',
      'once',
      'stopListening',
      'listenTo',
      'listenToOnce'
    ],

    commands: [
      'execute',
      'setHandler',
      'setHandlers',
      'removeHandler',
      'removeAllHandlers'
    ],

    reqres: [
      'request',
      'setHandler',
      'setHandlers',
      'removeHandler',
      'removeAllHandlers'
    ]
  };

  var proxyMethod = function(radio, system, method) {
    return function(channelName) {
      var messageSystem = radio._getChannel(channelName)[system];
      var args = Array.prototype.slice.call(arguments, 1);

      messageSystem[method].apply(messageSystem, args);
    };
  };

  return new Radio();

})(Wreqr);


  return Wreqr;
})(Backbone, Backbone.Marionette, _);

var Marionette = (function(global, Backbone, _){
  "use strict";

  // Define and export the Marionette namespace
  var Marionette = {};
  Backbone.Marionette = Marionette;

  // Get the DOM manipulator for later use
  Marionette.$ = Backbone.$;

// Helpers
// -------

// For slicing `arguments` in functions
var slice = Array.prototype.slice;

function throwError(message, name) {
  var error = new Error(message);
  error.name = name || 'Error';
  throw error;
}

// Marionette.extend
// -----------------

// Borrow the Backbone `extend` method so we can use it as needed
Marionette.extend = Backbone.Model.extend;

// Marionette.getOption
// --------------------

// Retrieve an object, function or other value from a target
// object or its `options`, with `options` taking precedence.
Marionette.getOption = function(target, optionName){
  if (!target || !optionName){ return; }
  var value;

  if (target.options && (optionName in target.options) && (target.options[optionName] !== undefined)){
    value = target.options[optionName];
  } else {
    value = target[optionName];
  }

  return value;
};

// Marionette.normalizeMethods
// ----------------------

// Pass in a mapping of events => functions or function names
// and return a mapping of events => functions
Marionette.normalizeMethods = function(hash) {
  var normalizedHash = {}, method;
  _.each(hash, function(fn, name) {
    method = fn;
    if (!_.isFunction(method)) {
      method = this[method];
    }
    if (!method) {
      return;
    }
    normalizedHash[name] = method;
  }, this);
  return normalizedHash;
};


// allows for the use of the @ui. syntax within
// a given key for triggers and events
// swaps the @ui with the associated selector
Marionette.normalizeUIKeys = function(hash, ui) {
  if (typeof(hash) === "undefined") {
    return;
  }

  _.each(_.keys(hash), function(v) {
    var pattern = /@ui.[a-zA-Z_$0-9]*/g;
    if (v.match(pattern)) {
      hash[v.replace(pattern, function(r) {
        return ui[r.slice(4)];
      })] = hash[v];
      delete hash[v];
    }
  });

  return hash;
};

// Mix in methods from Underscore, for iteration, and other
// collection related features.
// Borrowing this code from Backbone.Collection:
// http://backbonejs.org/docs/backbone.html#section-106
Marionette.actAsCollection = function(object, listProperty) {
  var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter',
    'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
    'last', 'without', 'isEmpty', 'pluck'];

  _.each(methods, function(method) {
    object[method] = function() {
      var list = _.values(_.result(this, listProperty));
      var args = [list].concat(_.toArray(arguments));
      return _[method].apply(_, args);
    };
  });
};

// Trigger an event and/or a corresponding method name. Examples:
//
// `this.triggerMethod("foo")` will trigger the "foo" event and
// call the "onFoo" method.
//
// `this.triggerMethod("foo:bar")` will trigger the "foo:bar" event and
// call the "onFooBar" method.
Marionette.triggerMethod = (function(){

  // split the event name on the ":"
  var splitter = /(^|:)(\w)/gi;

  // take the event section ("section1:section2:section3")
  // and turn it in to uppercase name
  function getEventName(match, prefix, eventName) {
    return eventName.toUpperCase();
  }

  // actual triggerMethod implementation
  var triggerMethod = function(event) {
    // get the method name from the event name
    var methodName = 'on' + event.replace(splitter, getEventName);
    var method = this[methodName];

    // trigger the event, if a trigger method exists
    if(_.isFunction(this.trigger)) {
      this.trigger.apply(this, arguments);
    }

    // call the onMethodName if it exists
    if (_.isFunction(method)) {
      // pass all arguments, except the event name
      return method.apply(this, _.tail(arguments));
    }
  };

  return triggerMethod;
})();

// DOMRefresh
// ----------
//
// Monitor a view's state, and after it has been rendered and shown
// in the DOM, trigger a "dom:refresh" event every time it is
// re-rendered.

Marionette.MonitorDOMRefresh = (function(documentElement){
  // track when the view has been shown in the DOM,
  // using a Marionette.Region (or by other means of triggering "show")
  function handleShow(view){
    view._isShown = true;
    triggerDOMRefresh(view);
  }

  // track when the view has been rendered
  function handleRender(view){
    view._isRendered = true;
    triggerDOMRefresh(view);
  }

  // Trigger the "dom:refresh" event and corresponding "onDomRefresh" method
  function triggerDOMRefresh(view){
    if (view._isShown && view._isRendered && isInDOM(view)){
      if (_.isFunction(view.triggerMethod)){
        view.triggerMethod("dom:refresh");
      }
    }
  }

  function isInDOM(view) {
    return documentElement.contains(view.el);
  }

  // Export public API
  return function(view){
    view.listenTo(view, "show", function(){
      handleShow(view);
    });

    view.listenTo(view, "render", function(){
      handleRender(view);
    });
  };
})(document.documentElement);


// Marionette.bindEntityEvents & unbindEntityEvents
// ---------------------------
//
// These methods are used to bind/unbind a backbone "entity" (collection/model)
// to methods on a target object.
//
// The first parameter, `target`, must have a `listenTo` method from the
// EventBinder object.
//
// The second parameter is the entity (Backbone.Model or Backbone.Collection)
// to bind the events from.
//
// The third parameter is a hash of { "event:name": "eventHandler" }
// configuration. Multiple handlers can be separated by a space. A
// function can be supplied instead of a string handler name.

(function(Marionette){
  "use strict";

  // Bind the event to handlers specified as a string of
  // handler names on the target object
  function bindFromStrings(target, entity, evt, methods){
    var methodNames = methods.split(/\s+/);

    _.each(methodNames, function(methodName) {

      var method = target[methodName];
      if(!method) {
        throwError("Method '"+ methodName +"' was configured as an event handler, but does not exist.");
      }

      target.listenTo(entity, evt, method);
    });
  }

  // Bind the event to a supplied callback function
  function bindToFunction(target, entity, evt, method){
      target.listenTo(entity, evt, method);
  }

  // Bind the event to handlers specified as a string of
  // handler names on the target object
  function unbindFromStrings(target, entity, evt, methods){
    var methodNames = methods.split(/\s+/);

    _.each(methodNames, function(methodName) {
      var method = target[methodName];
      target.stopListening(entity, evt, method);
    });
  }

  // Bind the event to a supplied callback function
  function unbindToFunction(target, entity, evt, method){
      target.stopListening(entity, evt, method);
  }


  // generic looping function
  function iterateEvents(target, entity, bindings, functionCallback, stringCallback){
    if (!entity || !bindings) { return; }

    // allow the bindings to be a function
    if (_.isFunction(bindings)){
      bindings = bindings.call(target);
    }

    // iterate the bindings and bind them
    _.each(bindings, function(methods, evt){

      // allow for a function as the handler,
      // or a list of event names as a string
      if (_.isFunction(methods)){
        functionCallback(target, entity, evt, methods);
      } else {
        stringCallback(target, entity, evt, methods);
      }

    });
  }

  // Export Public API
  Marionette.bindEntityEvents = function(target, entity, bindings){
    iterateEvents(target, entity, bindings, bindToFunction, bindFromStrings);
  };

  Marionette.unbindEntityEvents = function(target, entity, bindings){
    iterateEvents(target, entity, bindings, unbindToFunction, unbindFromStrings);
  };

})(Marionette);


// Callbacks
// ---------

// A simple way of managing a collection of callbacks
// and executing them at a later point in time, using jQuery's
// `Deferred` object.
Marionette.Callbacks = function(){
  this._deferred = Marionette.$.Deferred();
  this._callbacks = [];
};

_.extend(Marionette.Callbacks.prototype, {

  // Add a callback to be executed. Callbacks added here are
  // guaranteed to execute, even if they are added after the
  // `run` method is called.
  add: function(callback, contextOverride){
    this._callbacks.push({cb: callback, ctx: contextOverride});

    this._deferred.done(function(context, options){
      if (contextOverride){ context = contextOverride; }
      callback.call(context, options);
    });
  },

  // Run all registered callbacks with the context specified.
  // Additional callbacks can be added after this has been run
  // and they will still be executed.
  run: function(options, context){
    this._deferred.resolve(context, options);
  },

  // Resets the list of callbacks to be run, allowing the same list
  // to be run multiple times - whenever the `run` method is called.
  reset: function(){
    var callbacks = this._callbacks;
    this._deferred = Marionette.$.Deferred();
    this._callbacks = [];

    _.each(callbacks, function(cb){
      this.add(cb.cb, cb.ctx);
    }, this);
  }
});

// Marionette Controller
// ---------------------
//
// A multi-purpose object to use as a controller for
// modules and routers, and as a mediator for workflow
// and coordination of other objects, views, and more.
Marionette.Controller = function(options){
  this.triggerMethod = Marionette.triggerMethod;
  this.options = options || {};

  if (_.isFunction(this.initialize)){
    this.initialize(this.options);
  }
};

Marionette.Controller.extend = Marionette.extend;

// Controller Methods
// --------------

// Ensure it can trigger events with Backbone.Events
_.extend(Marionette.Controller.prototype, Backbone.Events, {
  close: function(){
    this.stopListening();
    var args = Array.prototype.slice.call(arguments);
    this.triggerMethod.apply(this, ["close"].concat(args));
    this.off();
  }
});

// Region
// ------
//
// Manage the visual regions of your composite application. See
// http://lostechies.com/derickbailey/2011/12/12/composite-js-apps-regions-and-region-managers/

Marionette.Region = function(options){
  this.options = options || {};
  this.el = Marionette.getOption(this, "el");

  if (!this.el){
    throwError("An 'el' must be specified for a region.", "NoElError");
  }

  if (this.initialize){
    var args = Array.prototype.slice.apply(arguments);
    this.initialize.apply(this, args);
  }
};


// Region Type methods
// -------------------

_.extend(Marionette.Region, {

  // Build an instance of a region by passing in a configuration object
  // and a default region type to use if none is specified in the config.
  //
  // The config object should either be a string as a jQuery DOM selector,
  // a Region type directly, or an object literal that specifies both
  // a selector and regionType:
  //
  // ```js
  // {
  //   selector: "#foo",
  //   regionType: MyCustomRegion
  // }
  // ```
  //
  buildRegion: function(regionConfig, defaultRegionType){
    var regionIsString = _.isString(regionConfig);
    var regionSelectorIsString = _.isString(regionConfig.selector);
    var regionTypeIsUndefined = _.isUndefined(regionConfig.regionType);
    var regionIsType = _.isFunction(regionConfig);

    if (!regionIsType && !regionIsString && !regionSelectorIsString) {
      throwError("Region must be specified as a Region type, a selector string or an object with selector property");
    }

    var selector, RegionType;

    // get the selector for the region

    if (regionIsString) {
      selector = regionConfig;
    }

    if (regionConfig.selector) {
      selector = regionConfig.selector;
      delete regionConfig.selector;
    }

    // get the type for the region

    if (regionIsType){
      RegionType = regionConfig;
    }

    if (!regionIsType && regionTypeIsUndefined) {
      RegionType = defaultRegionType;
    }

    if (regionConfig.regionType) {
      RegionType = regionConfig.regionType;
      delete regionConfig.regionType;
    }

    if (regionIsString || regionIsType) {
      regionConfig = {};
    }

    regionConfig.el = selector;

    // build the region instance
    var region = new RegionType(regionConfig);

    // override the `getEl` function if we have a parentEl
    // this must be overridden to ensure the selector is found
    // on the first use of the region. if we try to assign the
    // region's `el` to `parentEl.find(selector)` in the object
    // literal to build the region, the element will not be
    // guaranteed to be in the DOM already, and will cause problems
    if (regionConfig.parentEl){
      region.getEl = function(selector) {
        var parentEl = regionConfig.parentEl;
        if (_.isFunction(parentEl)){
          parentEl = parentEl();
        }
        return parentEl.find(selector);
      };
    }

    return region;
  }

});

// Region Instance Methods
// -----------------------

_.extend(Marionette.Region.prototype, Backbone.Events, {

  // Displays a backbone view instance inside of the region.
  // Handles calling the `render` method for you. Reads content
  // directly from the `el` attribute. Also calls an optional
  // `onShow` and `close` method on your view, just after showing
  // or just before closing the view, respectively.
  // The `preventClose` option can be used to prevent a view from being destroyed on show.
  show: function(view, options){
    this.ensureEl();

    var showOptions = options || {};
    var isViewClosed = view.isClosed || _.isUndefined(view.$el);
    var isDifferentView = view !== this.currentView;
    var preventClose =  !!showOptions.preventClose;

    // only close the view if we don't want to preventClose and the view is different
    var _shouldCloseView = !preventClose && isDifferentView;

    if (_shouldCloseView) {
      this.close();
    }

    view.render();
    Marionette.triggerMethod.call(this, "before:show", view);
    Marionette.triggerMethod.call(view, "before:show");

    if (isDifferentView || isViewClosed) {
      this.open(view);
    }

    this.currentView = view;

    Marionette.triggerMethod.call(this, "show", view);
    Marionette.triggerMethod.call(view, "show");
  },

  ensureEl: function(){
    if (!this.$el || this.$el.length === 0){
      this.$el = this.getEl(this.el);
    }
  },

  // Override this method to change how the region finds the
  // DOM element that it manages. Return a jQuery selector object.
  getEl: function(selector){
    return Marionette.$(selector);
  },

  // Override this method to change how the new view is
  // appended to the `$el` that the region is managing
  open: function(view){
    this.$el.empty().append(view.el);
  },

  // Close the current view, if there is one. If there is no
  // current view, it does nothing and returns immediately.
  close: function(){
    var view = this.currentView;
    if (!view || view.isClosed){ return; }

    // call 'close' or 'remove', depending on which is found
    if (view.close) { view.close(); }
    else if (view.remove) { view.remove(); }

    Marionette.triggerMethod.call(this, "close", view);

    delete this.currentView;
  },

  // Attach an existing view to the region. This
  // will not call `render` or `onShow` for the new view,
  // and will not replace the current HTML for the `el`
  // of the region.
  attachView: function(view){
    this.currentView = view;
  },

  // Reset the region by closing any existing view and
  // clearing out the cached `$el`. The next time a view
  // is shown via this region, the region will re-query the
  // DOM for the region's `el`.
  reset: function(){
    this.close();
    delete this.$el;
  }
});

// Copy the `extend` function used by Backbone's classes
Marionette.Region.extend = Marionette.extend;

// Marionette.RegionManager
// ------------------------
//
// Manage one or more related `Marionette.Region` objects.
Marionette.RegionManager = (function(Marionette){

  var RegionManager = Marionette.Controller.extend({
    constructor: function(options){
      this._regions = {};
      Marionette.Controller.prototype.constructor.call(this, options);
    },

    // Add multiple regions using an object literal, where
    // each key becomes the region name, and each value is
    // the region definition.
    addRegions: function(regionDefinitions, defaults){
      var regions = {};

      _.each(regionDefinitions, function(definition, name){
        if (_.isString(definition)){
          definition = { selector: definition };
        }

        if (definition.selector){
          definition = _.defaults({}, definition, defaults);
        }

        var region = this.addRegion(name, definition);
        regions[name] = region;
      }, this);

      return regions;
    },

    // Add an individual region to the region manager,
    // and return the region instance
    addRegion: function(name, definition){
      var region;

      var isObject = _.isObject(definition);
      var isString = _.isString(definition);
      var hasSelector = !!definition.selector;

      if (isString || (isObject && hasSelector)){
        region = Marionette.Region.buildRegion(definition, Marionette.Region);
      } else if (_.isFunction(definition)){
        region = Marionette.Region.buildRegion(definition, Marionette.Region);
      } else {
        region = definition;
      }

      this._store(name, region);
      this.triggerMethod("region:add", name, region);
      return region;
    },

    // Get a region by name
    get: function(name){
      return this._regions[name];
    },

    // Remove a region by name
    removeRegion: function(name){
      var region = this._regions[name];
      this._remove(name, region);
    },

    // Close all regions in the region manager, and
    // remove them
    removeRegions: function(){
      _.each(this._regions, function(region, name){
        this._remove(name, region);
      }, this);
    },

    // Close all regions in the region manager, but
    // leave them attached
    closeRegions: function(){
      _.each(this._regions, function(region, name){
        region.close();
      }, this);
    },

    // Close all regions and shut down the region
    // manager entirely
    close: function(){
      this.removeRegions();
      Marionette.Controller.prototype.close.apply(this, arguments);
    },

    // internal method to store regions
    _store: function(name, region){
      this._regions[name] = region;
      this._setLength();
    },

    // internal method to remove a region
    _remove: function(name, region){
      region.close();
      region.stopListening();
      delete this._regions[name];
      this._setLength();
      this.triggerMethod("region:remove", name, region);
    },

    // set the number of regions current held
    _setLength: function(){
      this.length = _.size(this._regions);
    }

  });

  Marionette.actAsCollection(RegionManager.prototype, '_regions');

  return RegionManager;
})(Marionette);


// Template Cache
// --------------

// Manage templates stored in `<script>` blocks,
// caching them for faster access.
Marionette.TemplateCache = function(templateId){
  this.templateId = templateId;
};

// TemplateCache object-level methods. Manage the template
// caches from these method calls instead of creating
// your own TemplateCache instances
_.extend(Marionette.TemplateCache, {
  templateCaches: {},

  // Get the specified template by id. Either
  // retrieves the cached version, or loads it
  // from the DOM.
  get: function(templateId){
    var cachedTemplate = this.templateCaches[templateId];

    if (!cachedTemplate){
      cachedTemplate = new Marionette.TemplateCache(templateId);
      this.templateCaches[templateId] = cachedTemplate;
    }

    return cachedTemplate.load();
  },

  // Clear templates from the cache. If no arguments
  // are specified, clears all templates:
  // `clear()`
  //
  // If arguments are specified, clears each of the
  // specified templates from the cache:
  // `clear("#t1", "#t2", "...")`
  clear: function(){
    var i;
    var args = slice.call(arguments);
    var length = args.length;

    if (length > 0){
      for(i=0; i<length; i++){
        delete this.templateCaches[args[i]];
      }
    } else {
      this.templateCaches = {};
    }
  }
});

// TemplateCache instance methods, allowing each
// template cache object to manage its own state
// and know whether or not it has been loaded
_.extend(Marionette.TemplateCache.prototype, {

  // Internal method to load the template
  load: function(){
    // Guard clause to prevent loading this template more than once
    if (this.compiledTemplate){
      return this.compiledTemplate;
    }

    // Load the template and compile it
    var template = this.loadTemplate(this.templateId);
    this.compiledTemplate = this.compileTemplate(template);

    return this.compiledTemplate;
  },

  // Load a template from the DOM, by default. Override
  // this method to provide your own template retrieval
  // For asynchronous loading with AMD/RequireJS, consider
  // using a template-loader plugin as described here:
  // https://github.com/marionettejs/backbone.marionette/wiki/Using-marionette-with-requirejs
  loadTemplate: function(templateId){
    var template = Marionette.$(templateId).html();

    if (!template || template.length === 0){
      throwError("Could not find template: '" + templateId + "'", "NoTemplateError");
    }

    return template;
  },

  // Pre-compile the template before caching it. Override
  // this method if you do not need to pre-compile a template
  // (JST / RequireJS for example) or if you want to change
  // the template engine used (Handebars, etc).
  compileTemplate: function(rawTemplate){
    return _.template(rawTemplate);
  }
});

// Renderer
// --------

// Render a template with data by passing in the template
// selector and the data to render.
Marionette.Renderer = {

  // Render a template with data. The `template` parameter is
  // passed to the `TemplateCache` object to retrieve the
  // template function. Override this method to provide your own
  // custom rendering and template handling for all of Marionette.
  render: function(template, data){

    if (!template) {
      throwError("Cannot render the template since it's false, null or undefined.", "TemplateNotFoundError");
    }

    var templateFunc;
    if (typeof template === "function"){
      templateFunc = template;
    } else {
      templateFunc = Marionette.TemplateCache.get(template);
    }

    return templateFunc(data);
  }
};


// Marionette.View
// ---------------

// The core view type that other Marionette views extend from.
Marionette.View = Backbone.View.extend({

  constructor: function(options){
    _.bindAll(this, "render");

    // this exposes view options to the view initializer
    // this is a backfill since backbone removed the assignment
    // of this.options
    // at some point however this may be removed
    this.options = _.extend({}, _.result(this, 'options'), _.isFunction(options) ? options.call(this) : options);

    // parses out the @ui DSL for events
    this.events = this.normalizeUIKeys(_.result(this, 'events'));

    if (_.isObject(this.behaviors)) {
      new Marionette.Behaviors(this);
    }

    Backbone.View.prototype.constructor.apply(this, arguments);

    Marionette.MonitorDOMRefresh(this);
    this.listenTo(this, "show", this.onShowCalled);
  },

  // import the "triggerMethod" to trigger events with corresponding
  // methods if the method exists
  triggerMethod: Marionette.triggerMethod,

  // Imports the "normalizeMethods" to transform hashes of
  // events=>function references/names to a hash of events=>function references
  normalizeMethods: Marionette.normalizeMethods,

  // Get the template for this view
  // instance. You can set a `template` attribute in the view
  // definition or pass a `template: "whatever"` parameter in
  // to the constructor options.
  getTemplate: function(){
    return Marionette.getOption(this, "template");
  },

  // Mix in template helper methods. Looks for a
  // `templateHelpers` attribute, which can either be an
  // object literal, or a function that returns an object
  // literal. All methods and attributes from this object
  // are copies to the object passed in.
  mixinTemplateHelpers: function(target){
    target = target || {};
    var templateHelpers = Marionette.getOption(this, "templateHelpers");
    if (_.isFunction(templateHelpers)){
      templateHelpers = templateHelpers.call(this);
    }
    return _.extend(target, templateHelpers);
  },


  normalizeUIKeys: function(hash) {
    var ui = _.result(this, 'ui');
    return Marionette.normalizeUIKeys(hash, ui);
  },

  // Configure `triggers` to forward DOM events to view
  // events. `triggers: {"click .foo": "do:foo"}`
  configureTriggers: function(){
    if (!this.triggers) { return; }

    var triggerEvents = {};

    // Allow `triggers` to be configured as a function
    var triggers = this.normalizeUIKeys(_.result(this, "triggers"));

    // Configure the triggers, prevent default
    // action and stop propagation of DOM events
    _.each(triggers, function(value, key){

      var hasOptions = _.isObject(value);
      var eventName = hasOptions ? value.event : value;

      // build the event handler function for the DOM event
      triggerEvents[key] = function(e){

        // stop the event in its tracks
        if (e) {
          var prevent = e.preventDefault;
          var stop = e.stopPropagation;

          var shouldPrevent = hasOptions ? value.preventDefault : prevent;
          var shouldStop = hasOptions ? value.stopPropagation : stop;

          if (shouldPrevent && prevent) { prevent.apply(e); }
          if (shouldStop && stop) { stop.apply(e); }
        }

        // build the args for the event
        var args = {
          view: this,
          model: this.model,
          collection: this.collection
        };

        // trigger the event
        this.triggerMethod(eventName, args);
      };

    }, this);

    return triggerEvents;
  },

  // Overriding Backbone.View's delegateEvents to handle
  // the `triggers`, `modelEvents`, and `collectionEvents` configuration
  delegateEvents: function(events){
    this._delegateDOMEvents(events);
    Marionette.bindEntityEvents(this, this.model, Marionette.getOption(this, "modelEvents"));
    Marionette.bindEntityEvents(this, this.collection, Marionette.getOption(this, "collectionEvents"));
  },

  // internal method to delegate DOM events and triggers
  _delegateDOMEvents: function(events){
    events = events || this.events;
    if (_.isFunction(events)){ events = events.call(this); }

    var combinedEvents = {};

    // look up if this view has behavior events
    var behaviorEvents = _.result(this, 'behaviorEvents') || {};
    var triggers = this.configureTriggers();

    // behavior events will be overriden by view events and or triggers
    _.extend(combinedEvents, behaviorEvents, events, triggers);

    Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
  },

  // Overriding Backbone.View's undelegateEvents to handle unbinding
  // the `triggers`, `modelEvents`, and `collectionEvents` config
  undelegateEvents: function(){
    var args = Array.prototype.slice.call(arguments);
    Backbone.View.prototype.undelegateEvents.apply(this, args);

    Marionette.unbindEntityEvents(this, this.model, Marionette.getOption(this, "modelEvents"));
    Marionette.unbindEntityEvents(this, this.collection, Marionette.getOption(this, "collectionEvents"));
  },

  // Internal method, handles the `show` event.
  onShowCalled: function(){},

  // Default `close` implementation, for removing a view from the
  // DOM and unbinding it. Regions will call this method
  // for you. You can specify an `onClose` method in your view to
  // add custom code that is called after the view is closed.
  close: function(){
    if (this.isClosed) { return; }

    var args = Array.prototype.slice.call(arguments);

    // allow the close to be stopped by returning `false`
    // from the `onBeforeClose` method
    var shouldClose = this.triggerMethod.apply(this, ["before:close"].concat(args));
    if (shouldClose === false){
      return;
    }

    // mark as closed before doing the actual close, to
    // prevent infinite loops within "close" event handlers
    // that are trying to close other views
    this.isClosed = true;
    this.triggerMethod.apply(this, ["close"].concat(args));

    // unbind UI elements
    this.unbindUIElements();

    // remove the view from the DOM
    this.remove();
  },

  // This method binds the elements specified in the "ui" hash inside the view's code with
  // the associated jQuery selectors.
  bindUIElements: function(){
    if (!this.ui) { return; }

    // store the ui hash in _uiBindings so they can be reset later
    // and so re-rendering the view will be able to find the bindings
    if (!this._uiBindings){
      this._uiBindings = this.ui;
    }

    // get the bindings result, as a function or otherwise
    var bindings = _.result(this, "_uiBindings");

    // empty the ui so we don't have anything to start with
    this.ui = {};

    // bind each of the selectors
    _.each(_.keys(bindings), function(key) {
      var selector = bindings[key];
      this.ui[key] = this.$(selector);
    }, this);
  },

  // This method unbinds the elements specified in the "ui" hash
  unbindUIElements: function(){
    if (!this.ui || !this._uiBindings){ return; }

    // delete all of the existing ui bindings
    _.each(this.ui, function($el, name){
      delete this.ui[name];
    }, this);

    // reset the ui element to the original bindings configuration
    this.ui = this._uiBindings;
    delete this._uiBindings;
  }
});

// Item View
// ---------

// A single item view implementation that contains code for rendering
// with underscore.js templates, serializing the view's model or collection,
// and calling several methods on extended views, such as `onRender`.
Marionette.ItemView = Marionette.View.extend({

  // Setting up the inheritance chain which allows changes to
  // Marionette.View.prototype.constructor which allows overriding
  constructor: function(){
    Marionette.View.prototype.constructor.apply(this, arguments);
  },

  // Serialize the model or collection for the view. If a model is
  // found, `.toJSON()` is called. If a collection is found, `.toJSON()`
  // is also called, but is used to populate an `items` array in the
  // resulting data. If both are found, defaults to the model.
  // You can override the `serializeData` method in your own view
  // definition, to provide custom serialization for your view's data.
  serializeData: function(){
    var data = {};

    if (this.model) {
      data = this.model.toJSON();
    }
    else if (this.collection) {
      data = { items: this.collection.toJSON() };
    }

    return data;
  },

  // Render the view, defaulting to underscore.js templates.
  // You can override this in your view definition to provide
  // a very specific rendering for your view. In general, though,
  // you should override the `Marionette.Renderer` object to
  // change how Marionette renders views.
  render: function(){
    this.isClosed = false;

    this.triggerMethod("before:render", this);
    this.triggerMethod("item:before:render", this);

    var data = this.serializeData();
    data = this.mixinTemplateHelpers(data);

    var template = this.getTemplate();
    var html = Marionette.Renderer.render(template, data);

    this.$el.html(html);
    this.bindUIElements();

    this.triggerMethod("render", this);
    this.triggerMethod("item:rendered", this);

    return this;
  },

  // Override the default close event to add a few
  // more events that are triggered.
  close: function(){
    if (this.isClosed){ return; }

    this.triggerMethod('item:before:close');

    Marionette.View.prototype.close.apply(this, arguments);

    this.triggerMethod('item:closed');
  }
});

// Collection View
// ---------------

// A view that iterates over a Backbone.Collection
// and renders an individual ItemView for each model.
Marionette.CollectionView = Marionette.View.extend({
  // used as the prefix for item view events
  // that are forwarded through the collectionview
  itemViewEventPrefix: "itemview",

  // constructor
  constructor: function(options){
    this._initChildViewStorage();

    Marionette.View.prototype.constructor.apply(this, arguments);

    this._initialEvents();
    this.initRenderBuffer();
  },

  // Instead of inserting elements one by one into the page,
  // it's much more performant to insert elements into a document
  // fragment and then insert that document fragment into the page
  initRenderBuffer: function() {
    this.elBuffer = document.createDocumentFragment();
    this._bufferedChildren = [];
  },

  startBuffering: function() {
    this.initRenderBuffer();
    this.isBuffering = true;
  },

  endBuffering: function() {
    this.isBuffering = false;
    this.appendBuffer(this, this.elBuffer);
    this._triggerShowBufferedChildren();
    this.initRenderBuffer();
  },

  _triggerShowBufferedChildren: function () {
    if (this._isShown) {
      _.each(this._bufferedChildren, function (child) {
        Marionette.triggerMethod.call(child, "show");
      });
      this._bufferedChildren = [];
    }
  },

  // Configured the initial events that the collection view
  // binds to.
  _initialEvents: function(){
    if (this.collection){
      this.listenTo(this.collection, "add", this.addChildView);
      this.listenTo(this.collection, "remove", this.removeItemView);
      this.listenTo(this.collection, "reset", this.render);
    }
  },

  // Handle a child item added to the collection
  addChildView: function(item, collection, options){
    this.closeEmptyView();
    var ItemView = this.getItemView(item);
    var index = this.collection.indexOf(item);
    this.addItemView(item, ItemView, index);
  },

  // Override from `Marionette.View` to guarantee the `onShow` method
  // of child views is called.
  onShowCalled: function(){
    this.children.each(function(child){
      Marionette.triggerMethod.call(child, "show");
    });
  },

  // Internal method to trigger the before render callbacks
  // and events
  triggerBeforeRender: function(){
    this.triggerMethod("before:render", this);
    this.triggerMethod("collection:before:render", this);
  },

  // Internal method to trigger the rendered callbacks and
  // events
  triggerRendered: function(){
    this.triggerMethod("render", this);
    this.triggerMethod("collection:rendered", this);
  },

  // Render the collection of items. Override this method to
  // provide your own implementation of a render function for
  // the collection view.
  render: function(){
    this.isClosed = false;
    this.triggerBeforeRender();
    this._renderChildren();
    this.triggerRendered();
    return this;
  },

  // Internal method. Separated so that CompositeView can have
  // more control over events being triggered, around the rendering
  // process
  _renderChildren: function(){
    this.startBuffering();

    this.closeEmptyView();
    this.closeChildren();

    if (!this.isEmpty(this.collection)) {
      this.showCollection();
    } else {
      this.showEmptyView();
    }

    this.endBuffering();
  },

  // Internal method to loop through each item in the
  // collection view and show it
  showCollection: function(){
    var ItemView;
    this.collection.each(function(item, index){
      ItemView = this.getItemView(item);
      this.addItemView(item, ItemView, index);
    }, this);
  },

  // Internal method to show an empty view in place of
  // a collection of item views, when the collection is
  // empty
  showEmptyView: function(){
    var EmptyView = this.getEmptyView();

    if (EmptyView && !this._showingEmptyView){
      this._showingEmptyView = true;
      var model = new Backbone.Model();
      this.addItemView(model, EmptyView, 0);
    }
  },

  // Internal method to close an existing emptyView instance
  // if one exists. Called when a collection view has been
  // rendered empty, and then an item is added to the collection.
  closeEmptyView: function(){
    if (this._showingEmptyView){
      this.closeChildren();
      delete this._showingEmptyView;
    }
  },

  // Retrieve the empty view type
  getEmptyView: function(){
    return Marionette.getOption(this, "emptyView");
  },

  // Retrieve the itemView type, either from `this.options.itemView`
  // or from the `itemView` in the object definition. The "options"
  // takes precedence.
  getItemView: function(item){
    var itemView = Marionette.getOption(this, "itemView");

    if (!itemView){
      throwError("An `itemView` must be specified", "NoItemViewError");
    }

    return itemView;
  },

  // Render the child item's view and add it to the
  // HTML for the collection view.
  addItemView: function(item, ItemView, index){
    // get the itemViewOptions if any were specified
    var itemViewOptions = Marionette.getOption(this, "itemViewOptions");
    if (_.isFunction(itemViewOptions)){
      itemViewOptions = itemViewOptions.call(this, item, index);
    }

    // build the view
    var view = this.buildItemView(item, ItemView, itemViewOptions);

    // set up the child view event forwarding
    this.addChildViewEventForwarding(view);

    // this view is about to be added
    this.triggerMethod("before:item:added", view);

    // Store the child view itself so we can properly
    // remove and/or close it later
    this.children.add(view);

    // Render it and show it
    this.renderItemView(view, index);

    // call the "show" method if the collection view
    // has already been shown
    if (this._isShown && !this.isBuffering){
      Marionette.triggerMethod.call(view, "show");
    }

    // this view was added
    this.triggerMethod("after:item:added", view);

    return view;
  },

  // Set up the child view event forwarding. Uses an "itemview:"
  // prefix in front of all forwarded events.
  addChildViewEventForwarding: function(view){
    var prefix = Marionette.getOption(this, "itemViewEventPrefix");

    // Forward all child item view events through the parent,
    // prepending "itemview:" to the event name
    this.listenTo(view, "all", function(){
      var args = slice.call(arguments);
      var rootEvent = args[0];
      var itemEvents = this.normalizeMethods(this.getItemEvents());

      args[0] = prefix + ":" + rootEvent;
      args.splice(1, 0, view);

      // call collectionView itemEvent if defined
      if (typeof itemEvents !== "undefined" && _.isFunction(itemEvents[rootEvent])) {
        itemEvents[rootEvent].apply(this, args);
      }

      Marionette.triggerMethod.apply(this, args);
    }, this);
  },

  // returns the value of itemEvents depending on if a function
  getItemEvents: function() {
    if (_.isFunction(this.itemEvents)) {
      return this.itemEvents.call(this);
    }

    return this.itemEvents;
  },

  // render the item view
  renderItemView: function(view, index) {
    view.render();
    this.appendHtml(this, view, index);
  },

  // Build an `itemView` for every model in the collection.
  buildItemView: function(item, ItemViewType, itemViewOptions){
    var options = _.extend({model: item}, itemViewOptions);
    return new ItemViewType(options);
  },

  // get the child view by item it holds, and remove it
  removeItemView: function(item){
    var view = this.children.findByModel(item);
    this.removeChildView(view);
    this.checkEmpty();
  },

  // Remove the child view and close it
  removeChildView: function(view){

    // shut down the child view properly,
    // including events that the collection has from it
    if (view){
      // call 'close' or 'remove', depending on which is found
      if (view.close) { view.close(); }
      else if (view.remove) { view.remove(); }

      this.stopListening(view);
      this.children.remove(view);
    }

    this.triggerMethod("item:removed", view);
  },

  // helper to check if the collection is empty
  isEmpty: function(collection){
    // check if we're empty now
    return !this.collection || this.collection.length === 0;
  },

  // If empty, show the empty view
  checkEmpty: function (){
    if (this.isEmpty(this.collection)){
      this.showEmptyView();
    }
  },

  // You might need to override this if you've overridden appendHtml
  appendBuffer: function(collectionView, buffer) {
    collectionView.$el.append(buffer);
  },

  // Append the HTML to the collection's `el`.
  // Override this method to do something other
  // than `.append`.
  appendHtml: function(collectionView, itemView, index){
    if (collectionView.isBuffering) {
      // buffering happens on reset events and initial renders
      // in order to reduce the number of inserts into the
      // document, which are expensive.
      collectionView.elBuffer.appendChild(itemView.el);
      collectionView._bufferedChildren.push(itemView);
    }
    else {
      // If we've already rendered the main collection, just
      // append the new items directly into the element.
      collectionView.$el.append(itemView.el);
    }
  },

  // Internal method to set up the `children` object for
  // storing all of the child views
  _initChildViewStorage: function(){
    this.children = new Backbone.ChildViewContainer();
  },

  // Handle cleanup and other closing needs for
  // the collection of views.
  close: function(){
    if (this.isClosed){ return; }

    this.triggerMethod("collection:before:close");
    this.closeChildren();
    this.triggerMethod("collection:closed");

    Marionette.View.prototype.close.apply(this, arguments);
  },

  // Close the child views that this collection view
  // is holding on to, if any
  closeChildren: function(){
    this.children.each(function(child){
      this.removeChildView(child);
    }, this);
    this.checkEmpty();
  }
});

// Composite View
// --------------

// Used for rendering a branch-leaf, hierarchical structure.
// Extends directly from CollectionView and also renders an
// an item view as `modelView`, for the top leaf
Marionette.CompositeView = Marionette.CollectionView.extend({

  // Setting up the inheritance chain which allows changes to
  // Marionette.CollectionView.prototype.constructor which allows overriding
  constructor: function(){
    Marionette.CollectionView.prototype.constructor.apply(this, arguments);
  },

  // Configured the initial events that the composite view
  // binds to. Override this method to prevent the initial
  // events, or to add your own initial events.
  _initialEvents: function(){

    // Bind only after composite view is rendered to avoid adding child views
    // to nonexistent itemViewContainer
    this.once('render', function () {
      if (this.collection){
        this.listenTo(this.collection, "add", this.addChildView);
        this.listenTo(this.collection, "remove", this.removeItemView);
        this.listenTo(this.collection, "reset", this._renderChildren);
      }
    });

  },

  // Retrieve the `itemView` to be used when rendering each of
  // the items in the collection. The default is to return
  // `this.itemView` or Marionette.CompositeView if no `itemView`
  // has been defined
  getItemView: function(item){
    var itemView = Marionette.getOption(this, "itemView") || this.constructor;

    if (!itemView){
      throwError("An `itemView` must be specified", "NoItemViewError");
    }

    return itemView;
  },

  // Serialize the collection for the view.
  // You can override the `serializeData` method in your own view
  // definition, to provide custom serialization for your view's data.
  serializeData: function(){
    var data = {};

    if (this.model){
      data = this.model.toJSON();
    }

    return data;
  },

  // Renders the model once, and the collection once. Calling
  // this again will tell the model's view to re-render itself
  // but the collection will not re-render.
  render: function(){
    this.isRendered = true;
    this.isClosed = false;
    this.resetItemViewContainer();

    this.triggerBeforeRender();
    var html = this.renderModel();
    this.$el.html(html);
    // the ui bindings is done here and not at the end of render since they
    // will not be available until after the model is rendered, but should be
    // available before the collection is rendered.
    this.bindUIElements();
    this.triggerMethod("composite:model:rendered");

    this._renderChildren();

    this.triggerMethod("composite:rendered");
    this.triggerRendered();
    return this;
  },

  _renderChildren: function(){
    if (this.isRendered){
      this.triggerMethod("composite:collection:before:render");
      Marionette.CollectionView.prototype._renderChildren.call(this);
      this.triggerMethod("composite:collection:rendered");
    }
  },

  // Render an individual model, if we have one, as
  // part of a composite view (branch / leaf). For example:
  // a treeview.
  renderModel: function(){
    var data = {};
    data = this.serializeData();
    data = this.mixinTemplateHelpers(data);

    var template = this.getTemplate();
    return Marionette.Renderer.render(template, data);
  },


  // You might need to override this if you've overridden appendHtml
  appendBuffer: function(compositeView, buffer) {
    var $container = this.getItemViewContainer(compositeView);
    $container.append(buffer);
  },

  // Appends the `el` of itemView instances to the specified
  // `itemViewContainer` (a jQuery selector). Override this method to
  // provide custom logic of how the child item view instances have their
  // HTML appended to the composite view instance.
  appendHtml: function(compositeView, itemView, index){
    if (compositeView.isBuffering) {
      compositeView.elBuffer.appendChild(itemView.el);
      compositeView._bufferedChildren.push(itemView);
    }
    else {
      // If we've already rendered the main collection, just
      // append the new items directly into the element.
      var $container = this.getItemViewContainer(compositeView);
      $container.append(itemView.el);
    }
  },

  // Internal method to ensure an `$itemViewContainer` exists, for the
  // `appendHtml` method to use.
  getItemViewContainer: function(containerView){
    if ("$itemViewContainer" in containerView){
      return containerView.$itemViewContainer;
    }

    var container;
    var itemViewContainer = Marionette.getOption(containerView, "itemViewContainer");
    if (itemViewContainer){

      var selector = _.isFunction(itemViewContainer) ? itemViewContainer.call(containerView) : itemViewContainer;

      if (selector.charAt(0) === "@" && containerView.ui) {
        container = containerView.ui[selector.substr(4)];
      } else {
        container = containerView.$(selector);
      }

      if (container.length <= 0) {
        throwError("The specified `itemViewContainer` was not found: " + containerView.itemViewContainer, "ItemViewContainerMissingError");
      }

    } else {
      container = containerView.$el;
    }

    containerView.$itemViewContainer = container;
    return container;
  },

  // Internal method to reset the `$itemViewContainer` on render
  resetItemViewContainer: function(){
    if (this.$itemViewContainer){
      delete this.$itemViewContainer;
    }
  }
});

// Layout
// ------

// Used for managing application layouts, nested layouts and
// multiple regions within an application or sub-application.
//
// A specialized view type that renders an area of HTML and then
// attaches `Region` instances to the specified `regions`.
// Used for composite view management and sub-application areas.
Marionette.Layout = Marionette.ItemView.extend({
  regionType: Marionette.Region,

  // Ensure the regions are available when the `initialize` method
  // is called.
  constructor: function (options) {
    options = options || {};

    this._firstRender = true;
    this._initializeRegions(options);

    Marionette.ItemView.prototype.constructor.call(this, options);
  },

  // Layout's render will use the existing region objects the
  // first time it is called. Subsequent calls will close the
  // views that the regions are showing and then reset the `el`
  // for the regions to the newly rendered DOM elements.
  render: function(){

    if (this.isClosed){
      // a previously closed layout means we need to
      // completely re-initialize the regions
      this._initializeRegions();
    }
    if (this._firstRender) {
      // if this is the first render, don't do anything to
      // reset the regions
      this._firstRender = false;
    } else if (!this.isClosed){
      // If this is not the first render call, then we need to
      // re-initializing the `el` for each region
      this._reInitializeRegions();
    }

    return Marionette.ItemView.prototype.render.apply(this, arguments);
  },

  // Handle closing regions, and then close the view itself.
  close: function () {
    if (this.isClosed){ return; }
    this.regionManager.close();
    Marionette.ItemView.prototype.close.apply(this, arguments);
  },

  // Add a single region, by name, to the layout
  addRegion: function(name, definition){
    var regions = {};
    regions[name] = definition;
    return this._buildRegions(regions)[name];
  },

  // Add multiple regions as a {name: definition, name2: def2} object literal
  addRegions: function(regions){
    this.regions = _.extend({}, this.regions, regions);
    return this._buildRegions(regions);
  },

  // Remove a single region from the Layout, by name
  removeRegion: function(name){
    delete this.regions[name];
    return this.regionManager.removeRegion(name);
  },

  // Provides alternative access to regions
  // Accepts the region name
  // getRegion('main')
  getRegion: function(region) {
    return this.regionManager.get(region);
  },

  // internal method to build regions
  _buildRegions: function(regions){
    var that = this;

    var defaults = {
      regionType: Marionette.getOption(this, "regionType"),
      parentEl: function(){ return that.$el; }
    };

    return this.regionManager.addRegions(regions, defaults);
  },

  // Internal method to initialize the regions that have been defined in a
  // `regions` attribute on this layout.
  _initializeRegions: function (options) {
    var regions;
    this._initRegionManager();

    if (_.isFunction(this.regions)) {
      regions = this.regions(options);
    } else {
      regions = this.regions || {};
    }

    this.addRegions(regions);
  },

  // Internal method to re-initialize all of the regions by updating the `el` that
  // they point to
  _reInitializeRegions: function(){
    this.regionManager.closeRegions();
    this.regionManager.each(function(region){
      region.reset();
    });
  },

  // Internal method to initialize the region manager
  // and all regions in it
  _initRegionManager: function(){
    this.regionManager = new Marionette.RegionManager();

    this.listenTo(this.regionManager, "region:add", function(name, region){
      this[name] = region;
      this.trigger("region:add", name, region);
    });

    this.listenTo(this.regionManager, "region:remove", function(name, region){
      delete this[name];
      this.trigger("region:remove", name, region);
    });
  }
});


// Behavior
// -----------

// A Behavior is an isolated set of DOM /
// user interactions that can be mixed into any View.
// Behaviors allow you to blackbox View specific interactions
// into portable logical chunks, keeping your views simple and your code DRY.

Marionette.Behavior = (function(_, Backbone){
  function Behavior(options, view){
    // Setup reference to the view.
    // this comes in handle when a behavior
    // wants to directly talk up the chain
    // to the view.
    this.view = view;
    this.defaults = _.result(this, "defaults") || {};
    this.options  = _.extend({}, this.defaults, options);

    // proxy behavior $ method to the view
    // this is useful for doing jquery DOM lookups
    // scoped to behaviors view.
    this.$ = function() {
      return this.view.$.apply(this.view, arguments);
    };

    // Call the initialize method passing
    // the arguments from the instance constructor
    this.initialize.apply(this, arguments);
  }

  _.extend(Behavior.prototype, Backbone.Events, {
    initialize: function(){},

    // stopListening to behavior `onListen` events.
    close: function() {
      this.stopListening();
    },

    // Setup class level proxy for triggerMethod.
    triggerMethod: Marionette.triggerMethod
  });

  // Borrow Backbones extend implementation
  // this allows us to setup a proper
  // inheritence pattern that follow in suite
  // with the rest of Marionette views.
  Behavior.extend = Marionette.extend;

  return Behavior;
})(_, Backbone);

// Marionette.Behaviors
// --------

// Behaviors is a utility class that takes care of
// glueing your behavior instances to their given View.
// The most important part of this class is that you
// **MUST** override the class level behaviorsLookup
// method for things to work properly.

Marionette.Behaviors = (function(Marionette, _) {

  function Behaviors(view) {
    // Behaviors defined on a view can be a flat object literal
    // or it can be a function that returns an object.
    this.behaviors = Behaviors.parseBehaviors(view, _.result(view, 'behaviors'));

    // Wraps several of the view's methods
    // calling the methods first on each behavior
    // and then eventually calling the method on the view.
    Behaviors.wrap(view, this.behaviors, [
      'bindUIElements', 'unbindUIElements',
      'delegateEvents', 'undelegateEvents',
      'onShow', 'onClose',
      'behaviorEvents', 'triggerMethod',
      'setElement', 'close'
    ]);
  }

  var methods = {
    setElement: function(setElement, behaviors) {
      setElement.apply(this, _.tail(arguments, 2));

      // proxy behavior $el to the view's $el.
      // This is needed because a view's $el proxy
      // is not set until after setElement is called.
      _.each(behaviors, function(b) {
        b.$el = this.$el;
      }, this);
    },

    close: function(close, behaviors) {
      var args = _.tail(arguments, 2);
      close.apply(this, args);

      // Call close on each behavior after
      // closing down the view.
      // This unbinds event listeners
      // that behaviors have registerd for.
      _.invoke(behaviors, 'close', args);
    },

    onShow: function(onShow, behaviors) {
      var args = _.tail(arguments, 2);

      _.each(behaviors, function(b) {
        Marionette.triggerMethod.apply(b, ["show"].concat(args));
      });

      if (_.isFunction(onShow)) {
        onShow.apply(this, args);
      }
    },

    onClose: function(onClose, behaviors){
      var args = _.tail(arguments, 2);

      _.each(behaviors, function(b) {
        Marionette.triggerMethod.apply(b, ["close"].concat(args));
      });

      if (_.isFunction(onClose)) {
        onClose.apply(this, args);
      }
    },

    bindUIElements: function(bindUIElements, behaviors) {
      bindUIElements.apply(this);
      _.invoke(behaviors, bindUIElements);
    },

    unbindUIElements: function(unbindUIElements, behaviors) {
      unbindUIElements.apply(this);
      _.invoke(behaviors, unbindUIElements);
    },

    triggerMethod: function(triggerMethod, behaviors) {
      var args = _.tail(arguments, 2);
      triggerMethod.apply(this, args);

      _.each(behaviors, function(b) {
        triggerMethod.apply(b, args);
      });
    },

    delegateEvents: function(delegateEvents, behaviors) {
      var args = _.tail(arguments, 2);
      delegateEvents.apply(this, args);

      _.each(behaviors, function(b){
        Marionette.bindEntityEvents(b, this.model, Marionette.getOption(b, "modelEvents"));
        Marionette.bindEntityEvents(b, this.collection, Marionette.getOption(b, "collectionEvents"));
      }, this);
    },

    undelegateEvents: function(undelegateEvents, behaviors) {
      var args = _.tail(arguments, 2);
      undelegateEvents.apply(this, args);

      _.each(behaviors, function(b) {
        Marionette.unbindEntityEvents(b, this.model, Marionette.getOption(b, "modelEvents"));
        Marionette.unbindEntityEvents(b, this.collection, Marionette.getOption(b, "collectionEvents"));
      }, this);
    },

    behaviorEvents: function(behaviorEvents, behaviors) {
      var _behaviorsEvents = {};
      var viewUI = _.result(this, 'ui');

      _.each(behaviors, function(b, i) {
        var _events = {};
        var behaviorEvents = _.result(b, 'events') || {};
        var behaviorUI = _.result(b, 'ui');

        // Construct an internal UI hash first using
        // the views UI hash and then the behaviors UI hash.
        // This allows the user to use UI hash elements
        // defined in the parent view as well as those
        // defined in the given behavior.
        var ui = _.extend({}, viewUI, behaviorUI);

        // Normalize behavior events hash to allow
        // a user to use the @ui. syntax.
        behaviorEvents = Marionette.normalizeUIKeys(behaviorEvents, ui);

        _.each(_.keys(behaviorEvents), function(key) {
          // append white-space at the end of each key to prevent behavior key collisions
          // this is relying on the fact backbone events considers "click .foo" the same  "click .foo "
          // starts with an array of two so the first behavior has one space

          // +2 is uses becauce new Array(1) or 0 is "" and not " "
          var whitespace = (new Array(i+2)).join(" ");
          var eventKey   = key + whitespace;
          var handler    = _.isFunction(behaviorEvents[key]) ? behaviorEvents[key] : b[behaviorEvents[key]];

          _events[eventKey] = _.bind(handler, b);
        });

        _behaviorsEvents = _.extend(_behaviorsEvents, _events);
      });

      return _behaviorsEvents;
    }
  };

  _.extend(Behaviors, {

    // placeholder method to be extended by the user
    // should define the object that stores the behaviors
    // i.e.
    //
    // Marionette.Behaviors.behaviorsLookup: function() {
    //   return App.Behaviors
    // }
    behaviorsLookup: function() {
      throw new Error("You must define where your behaviors are stored. See https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.behaviors.md#behaviorslookup");
    },

    // Takes care of getting the behavior class
    // given options and a key.
    // If a user passes in options.behaviorClass
    // default to using that. Otherwise delegate
    // the lookup to the users behaviorsLookup implementation.
    getBehaviorClass: function(options, key) {
      if (options.behaviorClass) {
        return options.behaviorClass;
      }

      // Get behavior class can be either a flat object or a method
      return _.isFunction(Behaviors.behaviorsLookup) ? Behaviors.behaviorsLookup.apply(this, arguments)[key] : Behaviors.behaviorsLookup[key];
    },

    // Maps over a view's behaviors. Performing
    // a lookup on each behavior and the instantiating
    // said behavior passing its options and view.
    parseBehaviors: function(view, behaviors){
      return _.map(behaviors, function(options, key){
        var BehaviorClass = Behaviors.getBehaviorClass(options, key);
        return new BehaviorClass(options, view);
      });
    },

    // wrap view internal methods so that they delegate to behaviors.
    // For example, onClose should trigger close on all of the behaviors and then close itself.
    // i.e.
    //
    // view.delegateEvents = _.partial(methods.delegateEvents, view.delegateEvents, behaviors);
    wrap: function(view, behaviors, methodNames) {
      _.each(methodNames, function(methodName) {
        view[methodName] = _.partial(methods[methodName], view[methodName], behaviors);
      });
    }
  });

  return Behaviors;

})(Marionette, _);


// AppRouter
// ---------

// Reduce the boilerplate code of handling route events
// and then calling a single method on another object.
// Have your routers configured to call the method on
// your object, directly.
//
// Configure an AppRouter with `appRoutes`.
//
// App routers can only take one `controller` object.
// It is recommended that you divide your controller
// objects in to smaller pieces of related functionality
// and have multiple routers / controllers, instead of
// just one giant router and controller.
//
// You can also add standard routes to an AppRouter.

Marionette.AppRouter = Backbone.Router.extend({

  constructor: function(options){
    Backbone.Router.prototype.constructor.apply(this, arguments);

    this.options = options || {};

    var appRoutes = Marionette.getOption(this, "appRoutes");
    var controller = this._getController();
    this.processAppRoutes(controller, appRoutes);
    this.on("route", this._processOnRoute, this);
  },

  // Similar to route method on a Backbone Router but
  // method is called on the controller
  appRoute: function(route, methodName) {
    var controller = this._getController();
    this._addAppRoute(controller, route, methodName);
  },

  // process the route event and trigger the onRoute
  // method call, if it exists
  _processOnRoute: function(routeName, routeArgs){
    // find the path that matched
    var routePath = _.invert(this.appRoutes)[routeName];

    // make sure an onRoute is there, and call it
    if (_.isFunction(this.onRoute)){
      this.onRoute(routeName, routePath, routeArgs);
    }
  },

  // Internal method to process the `appRoutes` for the
  // router, and turn them in to routes that trigger the
  // specified method on the specified `controller`.
  processAppRoutes: function(controller, appRoutes) {
    if (!appRoutes){ return; }

    var routeNames = _.keys(appRoutes).reverse(); // Backbone requires reverted order of routes

    _.each(routeNames, function(route) {
      this._addAppRoute(controller, route, appRoutes[route]);
    }, this);
  },

  _getController: function(){
    return Marionette.getOption(this, "controller");
  },

  _addAppRoute: function(controller, route, methodName){
    var method = controller[methodName];

    if (!method) {
      throwError("Method '" + methodName + "' was not found on the controller");
    }

    this.route(route, methodName, _.bind(method, controller));
  }
});

// Application
// -----------

// Contain and manage the composite application as a whole.
// Stores and starts up `Region` objects, includes an
// event aggregator as `app.vent`
Marionette.Application = function(options){
  this._initRegionManager();
  this._initCallbacks = new Marionette.Callbacks();
  this.vent = new Backbone.Wreqr.EventAggregator();
  this.commands = new Backbone.Wreqr.Commands();
  this.reqres = new Backbone.Wreqr.RequestResponse();
  this.submodules = {};

  _.extend(this, options);

  this.triggerMethod = Marionette.triggerMethod;
};

_.extend(Marionette.Application.prototype, Backbone.Events, {
  // Command execution, facilitated by Backbone.Wreqr.Commands
  execute: function(){
    this.commands.execute.apply(this.commands, arguments);
  },

  // Request/response, facilitated by Backbone.Wreqr.RequestResponse
  request: function(){
    return this.reqres.request.apply(this.reqres, arguments);
  },

  // Add an initializer that is either run at when the `start`
  // method is called, or run immediately if added after `start`
  // has already been called.
  addInitializer: function(initializer){
    this._initCallbacks.add(initializer);
  },

  // kick off all of the application's processes.
  // initializes all of the regions that have been added
  // to the app, and runs all of the initializer functions
  start: function(options){
    this.triggerMethod("initialize:before", options);
    this._initCallbacks.run(options, this);
    this.triggerMethod("initialize:after", options);

    this.triggerMethod("start", options);
  },

  // Add regions to your app.
  // Accepts a hash of named strings or Region objects
  // addRegions({something: "#someRegion"})
  // addRegions({something: Region.extend({el: "#someRegion"}) });
  addRegions: function(regions){
    return this._regionManager.addRegions(regions);
  },

  // Close all regions in the app, without removing them
  closeRegions: function(){
    this._regionManager.closeRegions();
  },

  // Removes a region from your app, by name
  // Accepts the regions name
  // removeRegion('myRegion')
  removeRegion: function(region) {
    this._regionManager.removeRegion(region);
  },

  // Provides alternative access to regions
  // Accepts the region name
  // getRegion('main')
  getRegion: function(region) {
    return this._regionManager.get(region);
  },

  // Create a module, attached to the application
  module: function(moduleNames, moduleDefinition){

    // Overwrite the module class if the user specifies one
    var ModuleClass = Marionette.Module.getClass(moduleDefinition);

    // slice the args, and add this application object as the
    // first argument of the array
    var args = slice.call(arguments);
    args.unshift(this);

    // see the Marionette.Module object for more information
    return ModuleClass.create.apply(ModuleClass, args);
  },

  // Internal method to set up the region manager
  _initRegionManager: function(){
    this._regionManager = new Marionette.RegionManager();

    this.listenTo(this._regionManager, "region:add", function(name, region){
      this[name] = region;
    });

    this.listenTo(this._regionManager, "region:remove", function(name, region){
      delete this[name];
    });
  }
});

// Copy the `extend` function used by Backbone's classes
Marionette.Application.extend = Marionette.extend;

// Module
// ------

// A simple module system, used to create privacy and encapsulation in
// Marionette applications
Marionette.Module = function(moduleName, app, options){
  this.moduleName = moduleName;
  this.options = _.extend({}, this.options, options);
  // Allow for a user to overide the initialize
  // for a given module instance.
  this.initialize = options.initialize || this.initialize;

  // Set up an internal store for sub-modules.
  this.submodules = {};

  this._setupInitializersAndFinalizers();

  // Set an internal reference to the app
  // within a module.
  this.app = app;

  // By default modules start with their parents.
  this.startWithParent = true;

  // Setup a proxy to the trigger method implementation.
  this.triggerMethod = Marionette.triggerMethod;

  if (_.isFunction(this.initialize)){
    this.initialize(this.options, moduleName, app);
  }
};

Marionette.Module.extend = Marionette.extend;

// Extend the Module prototype with events / listenTo, so that the module
// can be used as an event aggregator or pub/sub.
_.extend(Marionette.Module.prototype, Backbone.Events, {

  // Initialize is an empty function by default. Override it with your own
  // initialization logic when extending Marionette.Module.
  initialize: function(){},

  // Initializer for a specific module. Initializers are run when the
  // module's `start` method is called.
  addInitializer: function(callback){
    this._initializerCallbacks.add(callback);
  },

  // Finalizers are run when a module is stopped. They are used to teardown
  // and finalize any variables, references, events and other code that the
  // module had set up.
  addFinalizer: function(callback){
    this._finalizerCallbacks.add(callback);
  },

  // Start the module, and run all of its initializers
  start: function(options){
    // Prevent re-starting a module that is already started
    if (this._isInitialized){ return; }

    // start the sub-modules (depth-first hierarchy)
    _.each(this.submodules, function(mod){
      // check to see if we should start the sub-module with this parent
      if (mod.startWithParent){
        mod.start(options);
      }
    });

    // run the callbacks to "start" the current module
    this.triggerMethod("before:start", options);

    this._initializerCallbacks.run(options, this);
    this._isInitialized = true;

    this.triggerMethod("start", options);
  },

  // Stop this module by running its finalizers and then stop all of
  // the sub-modules for this module
  stop: function(){
    // if we are not initialized, don't bother finalizing
    if (!this._isInitialized){ return; }
    this._isInitialized = false;

    Marionette.triggerMethod.call(this, "before:stop");

    // stop the sub-modules; depth-first, to make sure the
    // sub-modules are stopped / finalized before parents
    _.each(this.submodules, function(mod){ mod.stop(); });

    // run the finalizers
    this._finalizerCallbacks.run(undefined,this);

    // reset the initializers and finalizers
    this._initializerCallbacks.reset();
    this._finalizerCallbacks.reset();

    Marionette.triggerMethod.call(this, "stop");
  },

  // Configure the module with a definition function and any custom args
  // that are to be passed in to the definition function
  addDefinition: function(moduleDefinition, customArgs){
    this._runModuleDefinition(moduleDefinition, customArgs);
  },

  // Internal method: run the module definition function with the correct
  // arguments
  _runModuleDefinition: function(definition, customArgs){
    // If there is no definition short circut the method.
    if (!definition){ return; }

    // build the correct list of arguments for the module definition
    var args = _.flatten([
      this,
      this.app,
      Backbone,
      Marionette,
      Marionette.$, _,
      customArgs
    ]);

    definition.apply(this, args);
  },

  // Internal method: set up new copies of initializers and finalizers.
  // Calling this method will wipe out all existing initializers and
  // finalizers.
  _setupInitializersAndFinalizers: function(){
    this._initializerCallbacks = new Marionette.Callbacks();
    this._finalizerCallbacks = new Marionette.Callbacks();
  }
});

// Type methods to create modules
_.extend(Marionette.Module, {

  // Create a module, hanging off the app parameter as the parent object.
  create: function(app, moduleNames, moduleDefinition){
    var module = app;

    // get the custom args passed in after the module definition and
    // get rid of the module name and definition function
    var customArgs = slice.call(arguments);
    customArgs.splice(0, 3);

    // Split the module names and get the number of submodules.
    // i.e. an example module name of `Doge.Wow.Amaze` would
    // then have the potential for 3 module definitions.
    moduleNames = moduleNames.split(".");
    var length = moduleNames.length;

    // store the module definition for the last module in the chain
    var moduleDefinitions = [];
    moduleDefinitions[length-1] = moduleDefinition;

    // Loop through all the parts of the module definition
    _.each(moduleNames, function(moduleName, i){
      var parentModule = module;
      module = this._getModule(parentModule, moduleName, app, moduleDefinition);
      this._addModuleDefinition(parentModule, module, moduleDefinitions[i], customArgs);
    }, this);

    // Return the last module in the definition chain
    return module;
  },

  _getModule: function(parentModule, moduleName, app, def, args){
    var options = _.extend({}, def);
    var ModuleClass = this.getClass(def);

    // Get an existing module of this name if we have one
    var module = parentModule[moduleName];

    if (!module){
      // Create a new module if we don't have one
      module = new ModuleClass(moduleName, app, options);
      parentModule[moduleName] = module;
      // store the module on the parent
      parentModule.submodules[moduleName] = module;
    }

    return module;
  },

  // ## Module Classes
  //
  // Module classes can be used as an alternative to the define pattern.
  // The extend function of a Module is identical to the extend functions
  // on other Backbone and Marionette classes.
  // This allows module lifecyle events like `onStart` and `onStop` to be called directly.
  getClass: function(moduleDefinition) {
    var ModuleClass = Marionette.Module;

    if (!moduleDefinition) {
      return ModuleClass;
    }

    // If all of the module's functionality is defined inside its class,
    // then the class can be passed in directly. `MyApp.module("Foo", FooModule)`.
    if (moduleDefinition.prototype instanceof ModuleClass) {
      return moduleDefinition;
    }

    return moduleDefinition.moduleClass || ModuleClass;
  },

  // Add the module definition and add a startWithParent initializer function.
  // This is complicated because module definitions are heavily overloaded
  // and support an anonymous function, module class, or options object
  _addModuleDefinition: function(parentModule, module, def, args){
    var fn = this._getDefine(def);
    var startWithParent = this._getStartWithParent(def, module);

    if (fn){
      module.addDefinition(fn, args);
    }

    this._addStartWithParent(parentModule, module, startWithParent);
  },

  _getStartWithParent: function(def, module) {
    var swp;

    if (_.isFunction(def) && (def.prototype instanceof Marionette.Module)) {
      swp = module.constructor.prototype.startWithParent;
      return _.isUndefined(swp) ? true : swp;
    }

    if (_.isObject(def)){
      swp = def.startWithParent;
      return _.isUndefined(swp) ? true : swp;
    }

    return true;
  },

  _getDefine: function(def) {
    if (_.isFunction(def) && !(def.prototype instanceof Marionette.Module)) {
      return def;
    }

    if (_.isObject(def)){
      return def.define;
    }

    return null;
  },

  _addStartWithParent: function(parentModule, module, startWithParent) {
    module.startWithParent = module.startWithParent && startWithParent;

    if (!module.startWithParent || !!module.startWithParentIsConfigured){
      return;
    }

    module.startWithParentIsConfigured = true;

    parentModule.addInitializer(function(options){
      if (module.startWithParent){
        module.start(options);
      }
    });
  }
});


  return Marionette;
})(this, Backbone, _);
;/*

 Software License Agreement (BSD License)
 http://taffydb.com
 Copyright (c)
 All rights reserved.


 Redistribution and use of this software in source and binary forms, with or without modification, are permitted provided that the following condition is met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */

/*jslint        browser : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 500,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true
*/

// BUILD 193d48d, modified by mmikowski to pass jslint

// Setup TAFFY name space to return an object with methods
var TAFFY, exports, T;
(function () {
  'use strict';
  var
    typeList,     makeTest,     idx,    typeKey,
    version,      TC,           idpad,  cmax,
    API,          protectJSON,  each,   eachin,
    isIndexable,  returnFilter, runFilters,
    numcharsplit, orderByCol,   run,    intersection,
    filter,       makeCid,      safeForJson,
    isRegexp
    ;


  if ( ! TAFFY ){
    // TC = Counter for Taffy DBs on page, used for unique IDs
    // cmax = size of charnumarray conversion cache
    // idpad = zeros to pad record IDs with
    version = '2.7';
    TC      = 1;
    idpad   = '000000';
    cmax    = 1000;
    API     = {};

    protectJSON = function ( t ) {
      // ****************************************
      // *
      // * Takes: a variable
      // * Returns: the variable if object/array or the parsed variable if JSON
      // *
      // ****************************************  
      if ( TAFFY.isArray( t ) || TAFFY.isObject( t ) ){
        return t;
      }
      else {
        return JSON.parse( t );
      }
    };
    
    // gracefully stolen from underscore.js
    intersection = function(array1, array2) {
        return filter(array1, function(item) {
          return array2.indexOf(item) >= 0;
        });
    };

    // gracefully stolen from underscore.js
    filter = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (Array.prototype.filter && obj.filter === Array.prototype.filter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
          if (iterator.call(context, value, index, list)) results[results.length] = value;
        });
        return results;
    };
    
    isRegexp = function(aObj) {
        return Object.prototype.toString.call(aObj)==='[object RegExp]';
    }
    
    safeForJson = function(aObj) {
        var myResult = T.isArray(aObj) ? [] : T.isObject(aObj) ? {} : null;
        if(aObj===null) return aObj;
        for(var i in aObj) {
            myResult[i]  = isRegexp(aObj[i]) ? aObj[i].toString() : T.isArray(aObj[i]) || T.isObject(aObj[i]) ? safeForJson(aObj[i]) : aObj[i];
        }
        return myResult;
    }
    
    makeCid = function(aContext) {
        var myCid = JSON.stringify(aContext);
        if(myCid.match(/regex/)===null) return myCid;
        return JSON.stringify(safeForJson(aContext));
    }
    
    each = function ( a, fun, u ) {
      var r, i, x, y;
      // ****************************************
      // *
      // * Takes:
      // * a = an object/value or an array of objects/values
      // * f = a function
      // * u = optional flag to describe how to handle undefined values
      //   in array of values. True: pass them to the functions,
      //   False: skip. Default False;
      // * Purpose: Used to loop over arrays
      // *
      // ****************************************  
      if ( a && ((T.isArray( a ) && a.length === 1) || (!T.isArray( a ))) ){
        fun( (T.isArray( a )) ? a[0] : a, 0 );
      }
      else {
        for ( r, i, x = 0, a = (T.isArray( a )) ? a : [a], y = a.length;
              x < y; x++ )
        {
          i = a[x];
          if ( !T.isUndefined( i ) || (u || false) ){
            r = fun( i, x );
            if ( r === T.EXIT ){
              break;
            }

          }
        }
      }
    };

    eachin = function ( o, fun ) {
      // ****************************************
      // *
      // * Takes:
      // * o = an object
      // * f = a function
      // * Purpose: Used to loop over objects
      // *
      // ****************************************  
      var x = 0, r, i;

      for ( i in o ){
        if ( o.hasOwnProperty( i ) ){
          r = fun( o[i], i, x++ );
          if ( r === T.EXIT ){
            break;
          }
        }
      }

    };

    API.extend = function ( m, f ) {
      // ****************************************
      // *
      // * Takes: method name, function
      // * Purpose: Add a custom method to the API
      // *
      // ****************************************  
      API[m] = function () {
        return f.apply( this, arguments );
      };
    };

    isIndexable = function ( f ) {
      var i;
      // Check to see if record ID
      if ( T.isString( f ) && /[t][0-9]*[r][0-9]*/i.test( f ) ){
        return true;
      }
      // Check to see if record
      if ( T.isObject( f ) && f.___id && f.___s ){
        return true;
      }

      // Check to see if array of indexes
      if ( T.isArray( f ) ){
        i = true;
        each( f, function ( r ) {
          if ( !isIndexable( r ) ){
            i = false;

            return TAFFY.EXIT;
          }
        });
        return i;
      }

      return false;
    };

    runFilters = function ( r, filter ) {
      // ****************************************
      // *
      // * Takes: takes a record and a collection of filters
      // * Returns: true if the record matches, false otherwise
      // ****************************************
      var match = true;


      each( filter, function ( mf ) {
        switch ( T.typeOf( mf ) ){
          case 'function':
            // run function
            if ( !mf.apply( r ) ){
              match = false;
              return TAFFY.EXIT;
            }
            break;
          case 'array':
            // loop array and treat like a SQL or
            match = (mf.length === 1) ? (runFilters( r, mf[0] )) :
              (mf.length === 2) ? (runFilters( r, mf[0] ) ||
                runFilters( r, mf[1] )) :
                (mf.length === 3) ? (runFilters( r, mf[0] ) ||
                  runFilters( r, mf[1] ) || runFilters( r, mf[2] )) :
                  (mf.length === 4) ? (runFilters( r, mf[0] ) ||
                    runFilters( r, mf[1] ) || runFilters( r, mf[2] ) ||
                    runFilters( r, mf[3] )) : false;
            if ( mf.length > 4 ){
              each( mf, function ( f ) {
                if ( runFilters( r, f ) ){
                  match = true;
                }
              });
            }
            break;
        }
      });

      return match;
    };

    returnFilter = function ( f ) {
      // ****************************************
      // *
      // * Takes: filter object
      // * Returns: a filter function
      // * Purpose: Take a filter object and return a function that can be used to compare
      // * a TaffyDB record to see if the record matches a query
      // ****************************************  
      var nf = [];
      if ( T.isString( f ) && /[t][0-9]*[r][0-9]*/i.test( f ) ){
        f = { ___id : f };
      }
      if ( T.isArray( f ) ){
        // if we are working with an array

        each( f, function ( r ) {
          // loop the array and return a filter func for each value
          nf.push( returnFilter( r ) );
        });
        // now build a func to loop over the filters and return true if ANY of the filters match
        // This handles logical OR expressions
        f = function () {
          var that = this, match = false;
          each( nf, function ( f ) {
            if ( runFilters( that, f ) ){
              match = true;
            }
          });
          return match;
        };
        return f;

      }
      // if we are dealing with an Object
      if ( T.isObject( f ) ){
        if ( T.isObject( f ) && f.___id && f.___s ){
          f = { ___id : f.___id };
        }

        // Loop over each value on the object to prep match type and match value
        eachin( f, function ( v, i ) {

          // default match type to IS/Equals
          if ( !T.isObject( v ) ){
            v = {
              'is' : v
            };
          }
          // loop over each value on the value object  - if any
          eachin( v, function ( mtest, s ) {
            // s = match type, e.g. is, hasAll, like, etc
            var c = [], looper;

            // function to loop and apply filter
            looper = (s === 'hasAll') ?
              function ( mtest, func ) {
                func( mtest );
              } : each;

            // loop over each test
            looper( mtest, function ( mtest ) {

              // su = match success
              // f = match false
              var su = true, f = false, matchFunc;


              // push a function onto the filter collection to do the matching
              matchFunc = function () {

                // get the value from the record
                var
                  mvalue   = this[i],
                  eqeq     = '==',
                  bangeq   = '!=',
                  eqeqeq   = '===',
                  lt   = '<',
                  gt   = '>',
                  lteq   = '<=',
                  gteq   = '>=',
                  bangeqeq = '!==',
                  r
                  ;

                if (typeof mvalue === 'undefined') {
                  return false;
                }
                
                if ( (s.indexOf( '!' ) === 0) && s !== bangeq &&
                  s !== bangeqeq )
                {
                  // if the filter name starts with ! as in '!is' then reverse the match logic and remove the !
                  su = false;
                  s = s.substring( 1, s.length );
                }
                // get the match results based on the s/match type
                /*jslint eqeq : true */
                r = (
                  (s === 'regex') ? (mtest.test( mvalue )) : (s === 'lt' || s === lt)
                  ? (mvalue < mtest)  : (s === 'gt' || s === gt)
                  ? (mvalue > mtest)  : (s === 'lte' || s === lteq)
                  ? (mvalue <= mtest) : (s === 'gte' || s === gteq)
                  ? (mvalue >= mtest) : (s === 'left')
                  ? (mvalue.indexOf( mtest ) === 0) : (s === 'leftnocase')
                  ? (mvalue.toLowerCase().indexOf( mtest.toLowerCase() )
                    === 0) : (s === 'right')
                  ? (mvalue.substring( (mvalue.length - mtest.length) )
                    === mtest) : (s === 'rightnocase')
                  ? (mvalue.toLowerCase().substring(
                    (mvalue.length - mtest.length) ) === mtest.toLowerCase())
                    : (s === 'like')
                  ? (mvalue.indexOf( mtest ) >= 0) : (s === 'likenocase')
                  ? (mvalue.toLowerCase().indexOf(mtest.toLowerCase()) >= 0)
                    : (s === eqeqeq || s === 'is')
                  ? (mvalue ===  mtest) : (s === eqeq)
                  ? (mvalue == mtest) : (s === bangeqeq)
                  ? (mvalue !==  mtest) : (s === bangeq)
                  ? (mvalue != mtest) : (s === 'isnocase')
                  ? (mvalue.toLowerCase
                    ? mvalue.toLowerCase() === mtest.toLowerCase()
                      : mvalue === mtest) : (s === 'has')
                  ? (T.has( mvalue, mtest )) : (s === 'hasall')
                  ? (T.hasAll( mvalue, mtest )) : (s === 'contains')
                  ? (TAFFY.isArray(mvalue) && mvalue.indexOf(mtest) > -1) : (
                    s.indexOf( 'is' ) === -1
                      && !TAFFY.isNull( mvalue )
                      && !TAFFY.isUndefined( mvalue )
                      && !TAFFY.isObject( mtest )
                      && !TAFFY.isArray( mtest )
                    )
                  ? (mtest === mvalue[s])
                    : (T[s] && T.isFunction( T[s] )
                    && s.indexOf( 'is' ) === 0)
                  ? T[s]( mvalue ) === mtest
                    : (T[s] && T.isFunction( T[s] ))
                  ? T[s]( mvalue, mtest ) : (false)
                );
                /*jslint eqeq : false */
                r = (r && !su) ? false : (!r && !su) ? true : r;

                return r;
              };
              c.push( matchFunc );

            });
            // if only one filter in the collection push it onto the filter list without the array
            if ( c.length === 1 ){

              nf.push( c[0] );
            }
            else {
              // else build a function to loop over all the filters and return true only if ALL match
              // this is a logical AND
              nf.push( function () {
                var that = this, match = false;
                each( c, function ( f ) {
                  if ( f.apply( that ) ){
                    match = true;
                  }
                });
                return match;
              });
            }
          });
        });
        // finally return a single function that wraps all the other functions and will run a query
        // where all functions have to return true for a record to appear in a query result
        f = function () {
          var that = this, match = true;
          // faster if less than  4 functions
          match = (nf.length === 1 && !nf[0].apply( that )) ? false :
            (nf.length === 2 &&
              (!nf[0].apply( that ) || !nf[1].apply( that ))) ? false :
              (nf.length === 3 &&
                (!nf[0].apply( that ) || !nf[1].apply( that ) ||
                  !nf[2].apply( that ))) ? false :
                (nf.length === 4 &&
                  (!nf[0].apply( that ) || !nf[1].apply( that ) ||
                    !nf[2].apply( that ) || !nf[3].apply( that ))) ? false
                  : true;
          if ( nf.length > 4 ){
            each( nf, function ( f ) {
              if ( !runFilters( that, f ) ){
                match = false;
              }
            });
          }
          return match;
        };
        return f;
      }

      // if function
      if ( T.isFunction( f ) ){
        return f;
      }
    };

    orderByCol = function ( ar, o ) {
      // ****************************************
      // *
      // * Takes: takes an array and a sort object
      // * Returns: the array sorted
      // * Purpose: Accept filters such as "[col], [col2]" or "[col] desc" and sort on those columns
      // *
      // ****************************************

      var sortFunc = function ( a, b ) {
        // function to pass to the native array.sort to sort an array
        var r = 0;

        T.each( o, function ( sd ) {
          // loop over the sort instructions
          // get the column name
          var o, col, dir, c, d;
          o = sd.split( ' ' );
          col = o[0];

          // get the direction
          dir = (o.length === 1) ? "logical" : o[1];


          if ( dir === 'logical' ){
            // if dir is logical than grab the charnum arrays for the two values we are looking at
            c = numcharsplit( a[col] );
            d = numcharsplit( b[col] );
            // loop over the charnumarrays until one value is higher than the other
            T.each( (c.length <= d.length) ? c : d, function ( x, i ) {
              if ( c[i] < d[i] ){
                r = -1;
                return TAFFY.EXIT;
              }
              else if ( c[i] > d[i] ){
                r = 1;
                return TAFFY.EXIT;
              }
            } );
          }
          else if ( dir === 'logicaldesc' ){
            // if logicaldesc than grab the charnum arrays for the two values we are looking at
            c = numcharsplit( a[col] );
            d = numcharsplit( b[col] );
            // loop over the charnumarrays until one value is lower than the other
            T.each( (c.length <= d.length) ? c : d, function ( x, i ) {
              if ( c[i] > d[i] ){
                r = -1;
                return TAFFY.EXIT;
              }
              else if ( c[i] < d[i] ){
                r = 1;
                return TAFFY.EXIT;
              }
            } );
          }
          else if ( dir === 'asec' && a[col] < b[col] ){
            // if asec - default - check to see which is higher
            r = -1;
            return T.EXIT;
          }
          else if ( dir === 'asec' && a[col] > b[col] ){
            // if asec - default - check to see which is higher
            r = 1;
            return T.EXIT;
          }
          else if ( dir === 'desc' && a[col] > b[col] ){
            // if desc check to see which is lower
            r = -1;
            return T.EXIT;

          }
          else if ( dir === 'desc' && a[col] < b[col] ){
            // if desc check to see which is lower
            r = 1;
            return T.EXIT;

          }
          // if r is still 0 and we are doing a logical sort than look to see if one array is longer than the other
          if ( r === 0 && dir === 'logical' && c.length < d.length ){
            r = -1;
          }
          else if ( r === 0 && dir === 'logical' && c.length > d.length ){
            r = 1;
          }
          else if ( r === 0 && dir === 'logicaldesc' && c.length > d.length ){
            r = -1;
          }
          else if ( r === 0 && dir === 'logicaldesc' && c.length < d.length ){
            r = 1;
          }

          if ( r !== 0 ){
            return T.EXIT;
          }


        } );
        return r;
      };
      // call the sort function and return the newly sorted array
      return (ar && ar.push) ? ar.sort( sortFunc ) : ar;


    };

    // ****************************************
    // *
    // * Takes: a string containing numbers and letters and turn it into an array
    // * Returns: return an array of numbers and letters
    // * Purpose: Used for logical sorting. String Example: 12ABC results: [12,'ABC']
    // **************************************** 
    (function () {
      // creates a cache for numchar conversions
      var cache = {}, cachcounter = 0;
      // creates the numcharsplit function
      numcharsplit = function ( thing ) {
        // if over 1000 items exist in the cache, clear it and start over
        if ( cachcounter > cmax ){
          cache = {};
          cachcounter = 0;
        }

        // if a cache can be found for a numchar then return its array value
        return cache['_' + thing] || (function () {
          // otherwise do the conversion
          // make sure it is a string and setup so other variables
          var nthing = String( thing ),
            na = [],
            rv = '_',
            rt = '',
            x, xx, c;

          // loop over the string char by char
          for ( x = 0, xx = nthing.length; x < xx; x++ ){
            // take the char at each location
            c = nthing.charCodeAt( x );
            // check to see if it is a valid number char and append it to the array.
            // if last char was a string push the string to the charnum array
            if ( ( c >= 48 && c <= 57 ) || c === 46 ){
              if ( rt !== 'n' ){
                rt = 'n';
                na.push( rv.toLowerCase() );
                rv = '';
              }
              rv = rv + nthing.charAt( x );
            }
            else {
              // check to see if it is a valid string char and append to string
              // if last char was a number push the whole number to the charnum array
              if ( rt !== 's' ){
                rt = 's';
                na.push( parseFloat( rv ) );
                rv = '';
              }
              rv = rv + nthing.charAt( x );
            }
          }
          // once done, push the last value to the charnum array and remove the first uneeded item
          na.push( (rt === 'n') ? parseFloat( rv ) : rv.toLowerCase() );
          na.shift();
          // add to cache
          cache['_' + thing] = na;
          cachcounter++;
          // return charnum array
          return na;
        }());
      };
    }());

    // ****************************************
    // *
    // * Runs a query
    // **************************************** 


    run = function () {
      this.context( {
        results : this.getDBI().query( this.context() )
      });

    };

    API.extend( 'filter', function () {
      // ****************************************
      // *
      // * Takes: takes unlimited filter objects as arguments
      // * Returns: method collection
      // * Purpose: Take filters as objects and cache functions for later lookup when a query is run
      // **************************************** 
      var
        nc = TAFFY.mergeObj( this.context(), { run : null } ),
        nq = []
      ;
      each( nc.q, function ( v ) {
        nq.push( v );
      });
      nc.q = nq;
      // Hadnle passing of ___ID or a record on lookup.
      each( arguments, function ( f ) {
        nc.q.push( returnFilter( f ) );
        nc.filterRaw.push( f );
      });

      return this.getroot( nc );
    });

    API.extend( 'order', function ( o ) {
      // ****************************************
      // *
      // * Purpose: takes a string and creates an array of order instructions to be used with a query
      // ****************************************

      o = o.split( ',' );
      var x = [], nc;

      each( o, function ( r ) {
        x.push( r.replace( /^\s*/, '' ).replace( /\s*$/, '' ) );
      });

      nc = TAFFY.mergeObj( this.context(), {sort : null} );
      nc.order = x;

      return this.getroot( nc );
    });

    API.extend( 'limit', function ( n ) {
      // ****************************************
      // *
      // * Purpose: takes a limit number to limit the number of rows returned by a query. Will update the results
      // * of a query
      // **************************************** 
      var nc = TAFFY.mergeObj( this.context(), {}),
        limitedresults
        ;

      nc.limit = n;

      if ( nc.run && nc.sort ){
        limitedresults = [];
        each( nc.results, function ( i, x ) {
          if ( (x + 1) > n ){
            return TAFFY.EXIT;
          }
          limitedresults.push( i );
        });
        nc.results = limitedresults;
      }

      return this.getroot( nc );
    });

    API.extend( 'start', function ( n ) {
      // ****************************************
      // *
      // * Purpose: takes a limit number to limit the number of rows returned by a query. Will update the results
      // * of a query
      // **************************************** 
      var nc = TAFFY.mergeObj( this.context(), {} ),
        limitedresults
        ;

      nc.start = n;

      if ( nc.run && nc.sort && !nc.limit ){
        limitedresults = [];
        each( nc.results, function ( i, x ) {
          if ( (x + 1) > n ){
            limitedresults.push( i );
          }
        });
        nc.results = limitedresults;
      }
      else {
        nc = TAFFY.mergeObj( this.context(), {run : null, start : n} );
      }

      return this.getroot( nc );
    });

    API.extend( 'update', function ( arg0, arg1, arg2 ) {
      // ****************************************
      // *
      // * Takes: a object and passes it off DBI update method for all matched records
      // **************************************** 
      var runEvent = true, o = {}, args = arguments, that;
      if ( TAFFY.isString( arg0 ) &&
        (arguments.length === 2 || arguments.length === 3) )
      {
        o[arg0] = arg1;
        if ( arguments.length === 3 ){
          runEvent = arg2;
        }
      }
      else {
        o = arg0;
        if ( args.length === 2 ){
          runEvent = arg1;
        }
      }

      that = this;
      run.call( this );
      each( this.context().results, function ( r ) {
        var c = o;
        if ( TAFFY.isFunction( c ) ){
          c = c.apply( TAFFY.mergeObj( r, {} ) );
        }
        else {
          if ( T.isFunction( c ) ){
            c = c( TAFFY.mergeObj( r, {} ) );
          }
        }
        if ( TAFFY.isObject( c ) ){
          that.getDBI().update( r.___id, c, runEvent );
        }
      });
      if ( this.context().results.length ){
        this.context( { run : null });
      }
      return this;
    });
    API.extend( 'remove', function ( runEvent ) {
      // ****************************************
      // *
      // * Purpose: removes records from the DB via the remove and removeCommit DBI methods
      // **************************************** 
      var that = this, c = 0;
      run.call( this );
      each( this.context().results, function ( r ) {
        that.getDBI().remove( r.___id );
        c++;
      });
      if ( this.context().results.length ){
        this.context( {
          run : null
        });
        that.getDBI().removeCommit( runEvent );
      }

      return c;
    });


    API.extend( 'count', function () {
      // ****************************************
      // *
      // * Returns: The length of a query result
      // **************************************** 
      run.call( this );
      return this.context().results.length;
    });

    API.extend( 'callback', function ( f, delay ) {
      // ****************************************
      // *
      // * Returns null;
      // * Runs a function on return of run.call
      // **************************************** 
      if ( f ){
        var that = this;
        setTimeout( function () {
          run.call( that );
          f.call( that.getroot( that.context() ) );
        }, delay || 0 );
      }


      return null;
    });

    API.extend( 'get', function () {
      // ****************************************
      // *
      // * Returns: An array of all matching records
      // **************************************** 
      run.call( this );
      return this.context().results;
    });

    API.extend( 'stringify', function () {
      // ****************************************
      // *
      // * Returns: An JSON string of all matching records
      // **************************************** 
      return JSON.stringify( this.get() );
    });
    API.extend( 'first', function () {
      // ****************************************
      // *
      // * Returns: The first matching record
      // **************************************** 
      run.call( this );
      return this.context().results[0] || false;
    });
    API.extend( 'last', function () {
      // ****************************************
      // *
      // * Returns: The last matching record
      // **************************************** 
      run.call( this );
      return this.context().results[this.context().results.length - 1] ||
        false;
    });


    API.extend( 'sum', function () {
      // ****************************************
      // *
      // * Takes: column to sum up
      // * Returns: Sums the values of a column
      // **************************************** 
      var total = 0, that = this;
      run.call( that );
      each( arguments, function ( c ) {
        each( that.context().results, function ( r ) {
          total = total + (r[c] || 0);
        });
      });
      return total;
    });

    API.extend( 'min', function ( c ) {
      // ****************************************
      // *
      // * Takes: column to find min
      // * Returns: the lowest value
      // **************************************** 
      var lowest = null;
      run.call( this );
      each( this.context().results, function ( r ) {
        if ( lowest === null || r[c] < lowest ){
          lowest = r[c];
        }
      });
      return lowest;
    });

    //  Taffy innerJoin Extension (OCD edition)
    //  =======================================
    //
    //  How to Use
    //  **********
    //
    //  left_table.innerJoin( right_table, condition1 <,... conditionN> )
    //
    //  A condition can take one of 2 forms:
    //
    //    1. An ARRAY with 2 or 3 values:
    //    A column name from the left table, an optional comparison string,
    //    and column name from the right table.  The condition passes if the test
    //    indicated is true.   If the condition string is omitted, '===' is assumed.
    //    EXAMPLES: [ 'last_used_time', '>=', 'current_use_time' ], [ 'user_id','id' ]
    //
    //    2. A FUNCTION:
    //    The function receives a left table row and right table row during the
    //    cartesian join.  If the function returns true for the rows considered,
    //    the merged row is included in the result set.
    //    EXAMPLE: function (l,r){ return l.name === r.label; }
    //
    //  Conditions are considered in the order they are presented.  Therefore the best
    //  performance is realized when the least expensive and highest prune-rate
    //  conditions are placed first, since if they return false Taffy skips any
    //  further condition tests.
    //
    //  Other notes
    //  ***********
    //
    //  This code passes jslint with the exception of 2 warnings about
    //  the '==' and '!=' lines.  We can't do anything about that short of
    //  deleting the lines.
    //
    //  Credits
    //  *******
    //
    //  Heavily based upon the work of Ian Toltz.
    //  Revisions to API by Michael Mikowski.
    //  Code convention per standards in http://manning.com/mikowski
    (function () {
      var innerJoinFunction = (function () {
        var fnCompareList, fnCombineRow, fnMain;

        fnCompareList = function ( left_row, right_row, arg_list ) {
          var data_lt, data_rt, op_code, error;

          if ( arg_list.length === 2 ){
            data_lt = left_row[arg_list[0]];
            op_code = '===';
            data_rt = right_row[arg_list[1]];
          }
          else {
            data_lt = left_row[arg_list[0]];
            op_code = arg_list[1];
            data_rt = right_row[arg_list[2]];
          }

          /*jslint eqeq : true */
          switch ( op_code ){
            case '===' :
              return data_lt === data_rt;
            case '!==' :
              return data_lt !== data_rt;
            case '<'   :
              return data_lt < data_rt;
            case '>'   :
              return data_lt > data_rt;
            case '<='  :
              return data_lt <= data_rt;
            case '>='  :
              return data_lt >= data_rt;
            case '=='  :
              return data_lt == data_rt;
            case '!='  :
              return data_lt != data_rt;
            default :
              throw String( op_code ) + ' is not supported';
          }
          // 'jslint eqeq : false'  here results in
          // "Unreachable '/*jslint' after 'return'".
          // We don't need it though, as the rule exception
          // is discarded at the end of this functional scope
        };

        fnCombineRow = function ( left_row, right_row ) {
          var out_map = {}, i, prefix;

          for ( i in left_row ){
            if ( left_row.hasOwnProperty( i ) ){
              out_map[i] = left_row[i];
            }
          }
          for ( i in right_row ){
            if ( right_row.hasOwnProperty( i ) && i !== '___id' &&
              i !== '___s' )
            {
              prefix = !TAFFY.isUndefined( out_map[i] ) ? 'right_' : '';
              out_map[prefix + String( i ) ] = right_row[i];
            }
          }
          return out_map;
        };

        fnMain = function ( table ) {
          var
            right_table, i,
            arg_list = arguments,
            arg_length = arg_list.length,
            result_list = []
            ;

          if ( typeof table.filter !== 'function' ){
            if ( table.TAFFY ){ right_table = table(); }
            else {
              throw 'TAFFY DB or result not supplied';
            }
          }
          else { right_table = table; }

          this.context( {
            results : this.getDBI().query( this.context() )
          } );

          TAFFY.each( this.context().results, function ( left_row ) {
            right_table.each( function ( right_row ) {
              var arg_data, is_ok = true;
              CONDITION:
                for ( i = 1; i < arg_length; i++ ){
                  arg_data = arg_list[i];
                  if ( typeof arg_data === 'function' ){
                    is_ok = arg_data( left_row, right_row );
                  }
                  else if ( typeof arg_data === 'object' && arg_data.length ){
                    is_ok = fnCompareList( left_row, right_row, arg_data );
                  }
                  else {
                    is_ok = false;
                  }

                  if ( !is_ok ){ break CONDITION; } // short circuit
                }

              if ( is_ok ){
                result_list.push( fnCombineRow( left_row, right_row ) );
              }
            } );
          } );
          return TAFFY( result_list )();
        };

        return fnMain;
      }());

      API.extend( 'join', innerJoinFunction );
    }());

    API.extend( 'max', function ( c ) {
      // ****************************************
      // *
      // * Takes: column to find max
      // * Returns: the highest value
      // ****************************************
      var highest = null;
      run.call( this );
      each( this.context().results, function ( r ) {
        if ( highest === null || r[c] > highest ){
          highest = r[c];
        }
      });
      return highest;
    });

    API.extend( 'select', function () {
      // ****************************************
      // *
      // * Takes: columns to select values into an array
      // * Returns: array of values
      // * Note if more than one column is given an array of arrays is returned
      // **************************************** 

      var ra = [], args = arguments;
      run.call( this );
      if ( arguments.length === 1 ){

        each( this.context().results, function ( r ) {

          ra.push( r[args[0]] );
        });
      }
      else {
        each( this.context().results, function ( r ) {
          var row = [];
          each( args, function ( c ) {
            row.push( r[c] );
          });
          ra.push( row );
        });
      }
      return ra;
    });
    API.extend( 'distinct', function () {
      // ****************************************
      // *
      // * Takes: columns to select unique alues into an array
      // * Returns: array of values
      // * Note if more than one column is given an array of arrays is returned
      // **************************************** 
      var ra = [], args = arguments;
      run.call( this );
      if ( arguments.length === 1 ){

        each( this.context().results, function ( r ) {
          var v = r[args[0]], dup = false;
          each( ra, function ( d ) {
            if ( v === d ){
              dup = true;
              return TAFFY.EXIT;
            }
          });
          if ( !dup ){
            ra.push( v );
          }
        });
      }
      else {
        each( this.context().results, function ( r ) {
          var row = [], dup = false;
          each( args, function ( c ) {
            row.push( r[c] );
          });
          each( ra, function ( d ) {
            var ldup = true;
            each( args, function ( c, i ) {
              if ( row[i] !== d[i] ){
                ldup = false;
                return TAFFY.EXIT;
              }
            });
            if ( ldup ){
              dup = true;
              return TAFFY.EXIT;
            }
          });
          if ( !dup ){
            ra.push( row );
          }
        });
      }
      return ra;
    });
    API.extend( 'supplant', function ( template, returnarray ) {
      // ****************************************
      // *
      // * Takes: a string template formated with key to be replaced with values from the rows, flag to determine if we want array of strings
      // * Returns: array of values or a string
      // **************************************** 
      var ra = [];
      run.call( this );
      each( this.context().results, function ( r ) {
        // TODO: The curly braces used to be unescaped
        ra.push( template.replace( /\{([^\{\}]*)\}/g, function ( a, b ) {
          var v = r[b];
          return typeof v === 'string' || typeof v === 'number' ? v : a;
        } ) );
      });
      return (!returnarray) ? ra.join( "" ) : ra;
    });


    API.extend( 'each', function ( m ) {
      // ****************************************
      // *
      // * Takes: a function
      // * Purpose: loops over every matching record and applies the function
      // **************************************** 
      run.call( this );
      each( this.context().results, m );
      return this;
    });
    API.extend( 'map', function ( m ) {
      // ****************************************
      // *
      // * Takes: a function
      // * Purpose: loops over every matching record and applies the function, returing the results in an array
      // **************************************** 
      var ra = [];
      run.call( this );
      each( this.context().results, function ( r ) {
        ra.push( m( r ) );
      });
      return ra;
    });



    T = function ( d ) {
      // ****************************************
      // *
      // * T is the main TAFFY object
      // * Takes: an array of objects or JSON
      // * Returns a new TAFFYDB
      // **************************************** 
      var TOb = [],
        ID = {},
        RC = 1,
        settings = {
          template          : false,
          onInsert          : false,
          onUpdate          : false,
          onRemove          : false,
          onDBChange        : false,
          storageName       : false,
          forcePropertyCase : null,
          cacheSize         : 100,
          name              : ''
        },
        dm = new Date(),
        CacheCount = 0,
        CacheClear = 0,
        Cache = {},
        DBI, runIndexes, root
        ;
      // ****************************************
      // *
      // * TOb = this database
      // * ID = collection of the record IDs and locations within the DB, used for fast lookups
      // * RC = record counter, used for creating IDs
      // * settings.template = the template to merge all new records with
      // * settings.onInsert = event given a copy of the newly inserted record
      // * settings.onUpdate = event given the original record, the changes, and the new record
      // * settings.onRemove = event given the removed record
      // * settings.forcePropertyCase = on insert force the proprty case to be lower or upper. default lower, null/undefined will leave case as is
      // * dm = the modify date of the database, used for query caching
      // **************************************** 


      runIndexes = function ( indexes ) {
        // ****************************************
        // *
        // * Takes: a collection of indexes
        // * Returns: collection with records matching indexed filters
        // **************************************** 

        var records = [], UniqueEnforce = false;

        if ( indexes.length === 0 ){
          return TOb;
        }

        each( indexes, function ( f ) {
          // Check to see if record ID
          if ( T.isString( f ) && /[t][0-9]*[r][0-9]*/i.test( f ) &&
            TOb[ID[f]] )
          {
            records.push( TOb[ID[f]] );
            UniqueEnforce = true;
          }
          // Check to see if record
          if ( T.isObject( f ) && f.___id && f.___s &&
            TOb[ID[f.___id]] )
          {
            records.push( TOb[ID[f.___id]] );
            UniqueEnforce = true;
          }
          // Check to see if array of indexes
          if ( T.isArray( f ) ){
            each( f, function ( r ) {
              each( runIndexes( r ), function ( rr ) {
                records.push( rr );
              });

            });
          }
        });
        if ( UniqueEnforce && records.length > 1 ){
          records = [];
        }

        return records;
      };

      DBI = {
        // ****************************************
        // *
        // * The DBI is the internal DataBase Interface that interacts with the data
        // **************************************** 
        dm           : function ( nd ) {
          // ****************************************
          // *
          // * Takes: an optional new modify date
          // * Purpose: used to get and set the DB modify date
          // **************************************** 
          if ( nd ){
            dm = nd;
            Cache = {};
            CacheCount = 0;
            CacheClear = 0;
          }
          if ( settings.onDBChange ){
            setTimeout( function () {
              settings.onDBChange.call( TOb );
            }, 0 );
          }
          if ( settings.storageName ){
            setTimeout( function () {
              localStorage.setItem( 'taffy_' + settings.storageName,
                JSON.stringify( TOb ) );
            });
          }
          return dm;
        },
        insert       : function ( i, runEvent ) {
          // ****************************************
          // *
          // * Takes: a new record to insert
          // * Purpose: merge the object with the template, add an ID, insert into DB, call insert event
          // **************************************** 
          var columns = [],
            records   = [],
            input     = protectJSON( i )
            ;
          each( input, function ( v, i ) {
            var nv, o;
            if ( T.isArray( v ) && i === 0 ){
              each( v, function ( av ) {

                columns.push( (settings.forcePropertyCase === 'lower')
                  ? av.toLowerCase()
                    : (settings.forcePropertyCase === 'upper')
                  ? av.toUpperCase() : av );
              });
              return true;
            }
            else if ( T.isArray( v ) ){
              nv = {};
              each( v, function ( av, ai ) {
                nv[columns[ai]] = av;
              });
              v = nv;

            }
            else if ( T.isObject( v ) && settings.forcePropertyCase ){
              o = {};

              eachin( v, function ( av, ai ) {
                o[(settings.forcePropertyCase === 'lower') ? ai.toLowerCase()
                  : (settings.forcePropertyCase === 'upper')
                  ? ai.toUpperCase() : ai] = v[ai];
              });
              v = o;
            }

            RC++;
            v.___id = 'T' + String( idpad + TC ).slice( -6 ) + 'R' +
              String( idpad + RC ).slice( -6 );
            v.___s = true;
            records.push( v.___id );
            if ( settings.template ){
              v = T.mergeObj( settings.template, v );
            }
            TOb.push( v );

            ID[v.___id] = TOb.length - 1;
            if ( settings.onInsert &&
              (runEvent || TAFFY.isUndefined( runEvent )) )
            {
              settings.onInsert.call( v );
            }
            DBI.dm( new Date() );
          });
          return root( records );
        },
        sort         : function ( o ) {
          // ****************************************
          // *
          // * Purpose: Change the sort order of the DB itself and reset the ID bucket
          // **************************************** 
          TOb = orderByCol( TOb, o.split( ',' ) );
          ID = {};
          each( TOb, function ( r, i ) {
            ID[r.___id] = i;
          });
          DBI.dm( new Date() );
          return true;
        },
        update       : function ( id, changes, runEvent ) {
          // ****************************************
          // *
          // * Takes: the ID of record being changed and the changes
          // * Purpose: Update a record and change some or all values, call the on update method
          // ****************************************

          var nc = {}, or, nr, tc, hasChange;
          if ( settings.forcePropertyCase ){
            eachin( changes, function ( v, p ) {
              nc[(settings.forcePropertyCase === 'lower') ? p.toLowerCase()
                : (settings.forcePropertyCase === 'upper') ? p.toUpperCase()
                : p] = v;
            });
            changes = nc;
          }

          or = TOb[ID[id]];
          nr = T.mergeObj( or, changes );

          tc = {};
          hasChange = false;
          eachin( nr, function ( v, i ) {
            if ( TAFFY.isUndefined( or[i] ) || or[i] !== v ){
              tc[i] = v;
              hasChange = true;
            }
          });
          if ( hasChange ){
            if ( settings.onUpdate &&
              (runEvent || TAFFY.isUndefined( runEvent )) )
            {
              settings.onUpdate.call( nr, TOb[ID[id]], tc );
            }
            TOb[ID[id]] = nr;
            DBI.dm( new Date() );
          }
        },
        remove       : function ( id ) {
          // ****************************************
          // *
          // * Takes: the ID of record to be removed
          // * Purpose: remove a record, changes its ___s value to false
          // **************************************** 
          TOb[ID[id]].___s = false;
        },
        removeCommit : function ( runEvent ) {
          var x;
          // ****************************************
          // *
          // * 
          // * Purpose: loop over all records and remove records with ___s = false, call onRemove event, clear ID
          // ****************************************
          for ( x = TOb.length - 1; x > -1; x-- ){

            if ( !TOb[x].___s ){
              if ( settings.onRemove &&
                (runEvent || TAFFY.isUndefined( runEvent )) )
              {
                settings.onRemove.call( TOb[x] );
              }
              ID[TOb[x].___id] = undefined;
              TOb.splice( x, 1 );
            }
          }
          ID = {};
          each( TOb, function ( r, i ) {
            ID[r.___id] = i;
          });
          DBI.dm( new Date() );
        },
        query : function ( context ) {
          // ****************************************
          // *
          // * Takes: the context object for a query and either returns a cache result or a new query result
          // **************************************** 
          var returnq, cid, results, indexed, limitq, ni;

          if ( settings.cacheSize ) {
            cid = '';
            each( context.filterRaw, function ( r ) {
              if ( T.isFunction( r ) ){
                cid = 'nocache';
                return TAFFY.EXIT;
              }
            });
            if ( cid === '' ){
              cid = makeCid( T.mergeObj( context,
                {q : false, run : false, sort : false} ) );
            }
          }
          // Run a new query if there are no results or the run date has been cleared
          if ( !context.results || !context.run ||
            (context.run && DBI.dm() > context.run) )
          {
            results = [];

            // check Cache

            if ( settings.cacheSize && Cache[cid] ){

              Cache[cid].i = CacheCount++;
              return Cache[cid].results;
            }
            else {
              // if no filter, return DB
              if ( context.q.length === 0 && context.index.length === 0 ){
                each( TOb, function ( r ) {
                  results.push( r );
                });
                returnq = results;
              }
              else {
                // use indexes

                indexed = runIndexes( context.index );

                // run filters
                each( indexed, function ( r ) {
                  // Run filter to see if record matches query
                  if ( context.q.length === 0 || runFilters( r, context.q ) ){
                    results.push( r );
                  }
                });

                returnq = results;
              }
            }


          }
          else {
            // If query exists and run has not been cleared return the cache results
            returnq = context.results;
          }
          // If a custom order array exists and the run has been clear or the sort has been cleared
          if ( context.order.length > 0 && (!context.run || !context.sort) ){
            // order the results
            returnq = orderByCol( returnq, context.order );
          }

          // If a limit on the number of results exists and it is less than the returned results, limit results
          if ( returnq.length &&
            ((context.limit && context.limit < returnq.length) ||
              context.start)
          ) {
            limitq = [];
            each( returnq, function ( r, i ) {
              if ( !context.start ||
                (context.start && (i + 1) >= context.start) )
              {
                if ( context.limit ){
                  ni = (context.start) ? (i + 1) - context.start : i;
                  if ( ni < context.limit ){
                    limitq.push( r );
                  }
                  else if ( ni > context.limit ){
                    return TAFFY.EXIT;
                  }
                }
                else {
                  limitq.push( r );
                }
              }
            });
            returnq = limitq;
          }

          // update cache
          if ( settings.cacheSize && cid !== 'nocache' ){
            CacheClear++;

            setTimeout( function () {
              var bCounter, nc;
              if ( CacheClear >= settings.cacheSize * 2 ){
                CacheClear = 0;
                bCounter = CacheCount - settings.cacheSize;
                nc = {};
                eachin( function ( r, k ) {
                  if ( r.i >= bCounter ){
                    nc[k] = r;
                  }
                });
                Cache = nc;
              }
            }, 0 );

            Cache[cid] = { i : CacheCount++, results : returnq };
          }
          return returnq;
        }
      };


      root = function () {
        var iAPI, context;
        // ****************************************
        // *
        // * The root function that gets returned when a new DB is created
        // * Takes: unlimited filter arguments and creates filters to be run when a query is called
        // **************************************** 
        // ****************************************
        // *
        // * iAPI is the the method collection valiable when a query has been started by calling dbname
        // * Certain methods are or are not avaliable once you have started a query such as insert -- you can only insert into root
        // ****************************************
        iAPI = TAFFY.mergeObj( TAFFY.mergeObj( API, { insert : undefined } ),
          { getDBI  : function () { return DBI; },
            getroot : function ( c ) { return root.call( c ); },
          context : function ( n ) {
            // ****************************************
            // *
            // * The context contains all the information to manage a query including filters, limits, and sorts
            // **************************************** 
            if ( n ){
              context = TAFFY.mergeObj( context,
                n.hasOwnProperty('results')
                  ? TAFFY.mergeObj( n, { run : new Date(), sort: new Date() })
                  : n
              );
            }
            return context;
          },
          extend  : undefined
        });

        context = (this && this.q) ? this : {
          limit     : false,
          start     : false,
          q         : [],
          filterRaw : [],
          index     : [],
          order     : [],
          results   : false,
          run       : null,
          sort      : null,
          settings  : settings
        };
        // ****************************************
        // *
        // * Call the query method to setup a new query
        // **************************************** 
        each( arguments, function ( f ) {

          if ( isIndexable( f ) ){
            context.index.push( f );
          }
          else {
            context.q.push( returnFilter( f ) );
          }
          context.filterRaw.push( f );
        });


        return iAPI;
      };

      // ****************************************
      // *
      // * If new records have been passed on creation of the DB either as JSON or as an array/object, insert them
      // **************************************** 
      TC++;
      if ( d ){
        DBI.insert( d );
      }


      root.insert = DBI.insert;

      root.merge = function ( i, key, runEvent ) {
        var
          search      = {},
          finalSearch = [],
          obj         = {}
          ;

        runEvent    = runEvent || false;
        key         = key      || 'id';

        each( i, function ( o ) {
          var existingObject;
          search[key] = o[key];
          finalSearch.push( o[key] );
          existingObject = root( search ).first();
          if ( existingObject ){
            DBI.update( existingObject.___id, o, runEvent );
          }
          else {
            DBI.insert( o, runEvent );
          }
        });

        obj[key] = finalSearch;
        return root( obj );
      };

      root.TAFFY = true;
      root.sort = DBI.sort;
      // ****************************************
      // *
      // * These are the methods that can be accessed on off the root DB function. Example dbname.insert;
      // **************************************** 
      root.settings = function ( n ) {
        // ****************************************
        // *
        // * Getting and setting for this DB's settings/events
        // **************************************** 
        if ( n ){
          settings = TAFFY.mergeObj( settings, n );
          if ( n.template ){

            root().update( n.template );
          }
        }
        return settings;
      };

      // ****************************************
      // *
      // * These are the methods that can be accessed on off the root DB function. Example dbname.insert;
      // **************************************** 
      root.store = function ( n ) {
        // ****************************************
        // *
        // * Setup localstorage for this DB on a given name
        // * Pull data into the DB as needed
        // **************************************** 
        var r = false, i;
        if ( localStorage ){
          if ( n ){
            i = localStorage.getItem( 'taffy_' + n );
            if ( i && i.length > 0 ){
              root.insert( i );
              r = true;
            }
            if ( TOb.length > 0 ){
              setTimeout( function () {
                localStorage.setItem( 'taffy_' + settings.storageName,
                  JSON.stringify( TOb ) );
              });
            }
          }
          root.settings( {storageName : n} );
        }
        return root;
      };

      // ****************************************
      // *
      // * Return root on DB creation and start having fun
      // **************************************** 
      return root;
    };
    // ****************************************
    // *
    // * Sets the global TAFFY object
    // **************************************** 
    TAFFY = T;


    // ****************************************
    // *
    // * Create public each method
    // *
    // ****************************************   
    T.each = each;

    // ****************************************
    // *
    // * Create public eachin method
    // *
    // ****************************************   
    T.eachin = eachin;
    // ****************************************
    // *
    // * Create public extend method
    // * Add a custom method to the API
    // *
    // ****************************************   
    T.extend = API.extend;


    // ****************************************
    // *
    // * Creates TAFFY.EXIT value that can be returned to stop an each loop
    // *
    // ****************************************  
    TAFFY.EXIT = 'TAFFYEXIT';

    // ****************************************
    // *
    // * Create public utility mergeObj method
    // * Return a new object where items from obj2
    // * have replaced or been added to the items in
    // * obj1
    // * Purpose: Used to combine objs
    // *
    // ****************************************   
    TAFFY.mergeObj = function ( ob1, ob2 ) {
      var c = {};
      eachin( ob1, function ( v, n ) { c[n] = ob1[n]; });
      eachin( ob2, function ( v, n ) { c[n] = ob2[n]; });
      return c;
    };


    // ****************************************
    // *
    // * Create public utility has method
    // * Returns true if a complex object, array
    // * or taffy collection contains the material
    // * provided in the second argument
    // * Purpose: Used to comare objects
    // *
    // ****************************************
    TAFFY.has = function ( var1, var2 ) {

      var re = false, n;

      if ( (var1.TAFFY) ){
        re = var1( var2 );
        if ( re.length > 0 ){
          return true;
        }
        else {
          return false;
        }
      }
      else {

        switch ( T.typeOf( var1 ) ){
          case 'object':
            if ( T.isObject( var2 ) ){
              eachin( var2, function ( v, n ) {
                if ( re === true && !T.isUndefined( var1[n] ) &&
                  var1.hasOwnProperty( n ) )
                {
                  re = T.has( var1[n], var2[n] );
                }
                else {
                  re = false;
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isArray( var2 ) ){
              each( var2, function ( v, n ) {
                re = T.has( var1, var2[n] );
                if ( re ){
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isString( var2 ) ){
              if ( !TAFFY.isUndefined( var1[var2] ) ){
                return true;
              }
              else {
                return false;
              }
            }
            return re;
          case 'array':
            if ( T.isObject( var2 ) ){
              each( var1, function ( v, i ) {
                re = T.has( var1[i], var2 );
                if ( re === true ){
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isArray( var2 ) ){
              each( var2, function ( v2, i2 ) {
                each( var1, function ( v1, i1 ) {
                  re = T.has( var1[i1], var2[i2] );
                  if ( re === true ){
                    return TAFFY.EXIT;
                  }
                });
                if ( re === true ){
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isString( var2 ) || T.isNumber( var2 ) ){
             re = false;
              for ( n = 0; n < var1.length; n++ ){
                re = T.has( var1[n], var2 );
                if ( re ){
                  return true;
                }
              }
            }
            return re;
          case 'string':
            if ( T.isString( var2 ) && var2 === var1 ){
              return true;
            }
            break;
          default:
            if ( T.typeOf( var1 ) === T.typeOf( var2 ) && var1 === var2 ){
              return true;
            }
            break;
        }
      }
      return false;
    };

    // ****************************************
    // *
    // * Create public utility hasAll method
    // * Returns true if a complex object, array
    // * or taffy collection contains the material
    // * provided in the call - for arrays it must
    // * contain all the material in each array item
    // * Purpose: Used to comare objects
    // *
    // ****************************************
    TAFFY.hasAll = function ( var1, var2 ) {

      var T = TAFFY, ar;
      if ( T.isArray( var2 ) ){
        ar = true;
        each( var2, function ( v ) {
          ar = T.has( var1, v );
          if ( ar === false ){
            return TAFFY.EXIT;
          }
        });
        return ar;
      }
      else {
        return T.has( var1, var2 );
      }
    };


    // ****************************************
    // *
    // * typeOf Fixed in JavaScript as public utility
    // *
    // ****************************************
    TAFFY.typeOf = function ( v ) {
      var s = typeof v;
      if ( s === 'object' ){
        if ( v ){
          if ( typeof v.length === 'number' &&
            !(v.propertyIsEnumerable( 'length' )) )
          {
            s = 'array';
          }
        }
        else {
          s = 'null';
        }
      }
      return s;
    };

    // ****************************************
    // *
    // * Create public utility getObjectKeys method
    // * Returns an array of an objects keys
    // * Purpose: Used to get the keys for an object
    // *
    // ****************************************   
    TAFFY.getObjectKeys = function ( ob ) {
      var kA = [];
      eachin( ob, function ( n, h ) {
        kA.push( h );
      });
      kA.sort();
      return kA;
    };

    // ****************************************
    // *
    // * Create public utility isSameArray
    // * Returns an array of an objects keys
    // * Purpose: Used to get the keys for an object
    // *
    // ****************************************   
    TAFFY.isSameArray = function ( ar1, ar2 ) {
      return (TAFFY.isArray( ar1 ) && TAFFY.isArray( ar2 ) &&
        ar1.join( ',' ) === ar2.join( ',' )) ? true : false;
    };

    // ****************************************
    // *
    // * Create public utility isSameObject method
    // * Returns true if objects contain the same
    // * material or false if they do not
    // * Purpose: Used to comare objects
    // *
    // ****************************************   
    TAFFY.isSameObject = function ( ob1, ob2 ) {
      var T = TAFFY, rv = true;

      if ( T.isObject( ob1 ) && T.isObject( ob2 ) ){
        if ( T.isSameArray( T.getObjectKeys( ob1 ),
          T.getObjectKeys( ob2 ) ) )
        {
          eachin( ob1, function ( v, n ) {
            if ( ! ( (T.isObject( ob1[n] ) && T.isObject( ob2[n] ) &&
              T.isSameObject( ob1[n], ob2[n] )) ||
              (T.isArray( ob1[n] ) && T.isArray( ob2[n] ) &&
                T.isSameArray( ob1[n], ob2[n] )) || (ob1[n] === ob2[n]) )
            ) {
              rv = false;
              return TAFFY.EXIT;
            }
          });
        }
        else {
          rv = false;
        }
      }
      else {
        rv = false;
      }
      return rv;
    };

    // ****************************************
    // *
    // * Create public utility is[DataType] methods
    // * Return true if obj is datatype, false otherwise
    // * Purpose: Used to determine if arguments are of certain data type
    // *
    // * mmikowski 2012-08-06 refactored to make much less "magical":
    // *   fewer closures and passes jslint
    // *
    // ****************************************

    typeList = [
      'String',  'Number', 'Object',   'Array',
      'Boolean', 'Null',   'Function', 'Undefined'
    ];
  
    makeTest = function ( thisKey ) {
      return function ( data ) {
        return TAFFY.typeOf( data ) === thisKey.toLowerCase() ? true : false;
      };
    };
  
    for ( idx = 0; idx < typeList.length; idx++ ){
      typeKey = typeList[idx];
      TAFFY['is' + typeKey] = makeTest( typeKey );
    }
  }
}());

if ( typeof(exports) === 'object' ){
  exports.taffy = TAFFY;
}

;Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
};

Backbone.Marionette.CompositeView.prototype.mixinTemplateHelpers = function (target) {
    var self = this;
    var templateHelpers = Marionette.getOption(self, "templateHelpers");
    var result = {};

    target = target || {};

    if (_.isFunction(templateHelpers)){
        templateHelpers = templateHelpers.call(self);
    }

    // This _.each block is what we're adding
    _.each(templateHelpers, function (helper, index) {
        if (_.isFunction(helper)) {
            result[index] = helper.call(self);
        } else {
            result[index] = helper;
        }
    });

    return _.extend(target, result);
};

Store = (function(Backbone, Marionette, WOS) {
	'use strict';
	
	var App = new Marionette.Application();
	
	App.addInitializer(function(options) {
		App.config = options.config;
		
		// When in debug mode, track all events that happens and its arguments
		if (App.config.debug) {
			App.vent.on('all', function(event) {
				console.info('[[APP.VENT]]: ', event, arguments);
			});
		}
		
		// Create our local db
		App.db = {
			added: {},
			available: {}
		};
	});
	
	App.on('initialize:after', function() {
		if (Backbone.history) {
			Backbone.history.start();
		}
	});
	
	return App;
})(Backbone, Marionette, WOS);

;Store.module('CondimentsApp.AddedCondiments', function(AddedCondiments, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		update: function(condiment, change, qty) {
			AddedCondiments.Controller.update(condiment, change, qty);
		}
	};
	
	AddedCondiments.addInitializer(function() {
		App.vent.on('addedcondiments:quantitychange', API.update);
	});
	
}, WOS);
;Store.module('CondimentsApp.AddedCondiments', function(AddedCondiments, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	this.Controller = {
		update: function(condiment, change, qty) {
			App.commands.execute('addedcondiments:entity:update', condiment, change, qty);
		}
	};
	
}, WOS);
;Store.module('CondimentsApp.AvailableCondiments', function(AvailableCondiments, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		list: function(condimentsAppView) {
			AvailableCondiments.Controller.list(condimentsAppView);
		}
	};
	
	AvailableCondiments.addInitializer(function() {
		App.vent.on('condiments:loaded', API.list);
	});
	
}, WOS);
;Store.module('CondimentsApp.AvailableCondiments', function(AvailableCondiments, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	this.Controller = {
		list: function(condimentsAppView) {
			var fn = _.bind(function(availablecondiments, addedcondiments) {
				var listView = this._getView(availablecondiments, addedcondiments);
				
				listView.on('addedcondiments:quantitychange', function(view, condiment, change, qty) {
					App.vent.trigger('addedcondiments:quantitychange', condiment, change, qty);
				});
				
				condimentsAppView.availableCondimentsRegion.show(listView);
			}, this);
			
			$.when(
				App.request('addedcondiments:entity:findAll')
			).then(fn);
		},
		
		_getView: function(availablecondiments, addedcondiments) {
			return new AvailableCondiments.ListView({
				collection: availablecondiments,
				addedCondimentsCollection: addedcondiments
			});
		}
	};
	
}, WOS);
;Store.module('CondimentsApp.AvailableCondiments', function(AvailableCondiments, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	AvailableCondiments.ItemView = Marionette.ItemView.extend({
		tagName: 'tr',
		template: '#productset-template',
		events: {
			'click .action-decrease': 'changeQuantity',
			'click .action-increase': 'changeQuantity',
			'change .form-control': 'changeQuantity'
		},
		ui: {
			quantityinput: '.form-control'
		},
		onShow: function() {
			WOS.Components.QuantityInput.init(this.$el);
			this.updateQuantity(null, this.options.addedCondimentsCollection);
		},
		initialize: function(options) {
			this.listenTo(this.options.addedCondimentsCollection, 'add remove', this.updateQuantity);
		},
		changeQuantity: function() {
			var 
				input = this.ui.quantityinput,
				oldvalue = parseInt(input.data('oldvalue'), 10),
				newvalue = parseInt(input.data('newvalue'), 10),
				change = newvalue-oldvalue,
				qty = newvalue
			;
			
			this.$el.toggleClass('selected', !!qty);
			this.trigger('quantitychange', this.model, change, qty);
		},
		updateQuantity: function(condiments, addedCondiments) {
			var matchedCondiments = addedCondiments.where({
				productCode: this.model.get('productCode')
			});
			
			var qty = matchedCondiments.length;
			
			this.ui.quantityinput.val(qty);
			this.ui.quantityinput.data('newvalue', qty);
			this.ui.quantityinput.data('oldvalue', qty);
			
			this.$el.toggleClass('selected', !!qty);
		}
	});
	
	AvailableCondiments.ListView = Marionette.CompositeView.extend({
		template: '#productsets-template',
		itemView: AvailableCondiments.ItemView,
		itemViewEventPrefix: 'addedcondiments',
		itemViewContainer: 'tbody',
		itemViewOptions: function(model, index) {
			return {
				addedCondimentsCollection: this.options.addedCondimentsCollection
			};
		}
	});
	
}, WOS);
;Store.module('CondimentsApp', function(CondimentsApp, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var Router = Marionette.AppRouter.extend({
		appRoutes: {
			'choose-condiments': 'chooseCondiments'
		}
	});
	
	var API = {
		chooseCondiments: function() {
			CondimentsApp.Controller.chooseCondiments();
		}
	};
	
	CondimentsApp.addInitializer(function() {
		App.addInitializer(function() {
			new Router({
				controller: API
			});
			
			App.addRegions({
				menuRegion: 			'#food-menu',
				productCardsRegion: 	'#product-cards',
				configuratorRegion: 	'#product-configurator',
				orderWidgetRegion: 		'#order-widget',
				choicesModalsRegion: 	'#modals-choices' // Since modals need to be at document root level
			});
			
			App.commands.execute('availablecondiments:entity:reset');
			App.commands.execute('addedcondiments:entity:reset');
		});
		
		// clear the db on init and when configurator closes.
		App.vent.on('condiments:closed', function() {
			App.commands.execute('addedcondiments:entity:reset');
			App.commands.execute('availablecondiments:entity:reset');
		});
		
		// announce that the app has started.
		App.vent.trigger('app:started', 'condiments');
	});
	
}, WOS);
;Store.module('CondimentsApp', function(CondimentsApp, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	this.Controller = {
		chooseCondiments: function() {
			var fn = _.bind(this._showView, this);
			
			$.when(
				App.request('addedcondiments:entity:findAll')
			).then(fn);
		},
		
		cancelOrder: function(view) {
			App.vent.trigger('condiments:cancelorder', view);
			this._hideView();
		},
		
		saveOrder: function(view) {
			var fn = _.bind(function() {
				App.vent.trigger('condiments:saveorder', view);
				this._hideView();
				
				location.reload();
			}, this);
			
			$.when(
				App.request('addedcondiments:save')
			).then(fn);
		},
		
		_showView: function(availableCondiments, addedCondiments) {
			
			// Need to make sure that a product is found. If not, JS error will be thrown
			if (availableCondiments.length) {
				
				var condimentsAppView = new CondimentsApp.View({ 
					addedCondimentsCollection: addedCondiments,
					isNewOrder: !addedCondiments.length
				});
				
				condimentsAppView.on('condiments:loaded', function(view) {
					App.vent.trigger('condiments:loaded', view);
				});
				
				condimentsAppView.on('condiments:cancelorder', function(view) {
					CondimentsApp.Controller.cancelOrder(view);
				});
				
				condimentsAppView.on('condiments:saveorder', function(view) {
					CondimentsApp.Controller.saveOrder(view);
				});
				
				App.configuratorRegion.show(condimentsAppView);	
			}
		},
		
		_hideView: function() {
			App.configuratorRegion.close();
			Backbone.history.navigate('');
			App.vent.trigger('condiments:closed');
		}
	};
	
}, WOS);
;Store.module('CondimentsApp', function(CondimentsApp, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	CondimentsApp.View = Marionette.Layout.extend({
		template: '#condiments-configurator-template',
		
		templateHelpers: function() {
			return {
				isNewOrder: this.options.isNewOrder
			};
		},
		
		regions: {
			availableCondimentsRegion: '#available-sets',
		},
		
		ui: {
			header: '.configurator-header',
			body: '.configurator-body',
			footer: '.configurator-footer',
			quantity: '.added-quantity'
		},
		
		triggers: {
			'click .action-cancel': 'condiments:cancelorder',
			'click .action-saveorder': 'condiments:saveorder'
		},
		
		initialize: function(options) {
			this.listenTo(this.options.addedCondimentsCollection, 'add remove reset', this.updateQuantity);
		},
		
		onShow: function() {
			$('body').addClass('show-configurator');
			$(window).on('scroll.configurator', _.bind(this.onScroll, this));
			document.body.scrollTop = document.documentElement.scrollTop = 0;
			
			this.updateQuantity();
			this.trigger('condiments:loaded', this);
		},
		
		onClose: function() {
			$('body').removeClass('show-configurator');
			$(window).off('scroll.configurator');
		},
		
		onScroll: WOS.Poll(function() {
			var scrollTop = $(window).scrollTop();
			
			// if user scrolls more than 90px, we will collapse the header
			this.ui.header[scrollTop < 90 ? 'removeClass':'addClass']('collapsed');
			this.ui.body[scrollTop < 90 ? 'removeClass':'addClass']('expanded');
		}, 25), // run this every 25 milliseconds so its not so intensive on the browser
		
		updateQuantity: function() {
			// Update quantity on insert/delete of AddedMeals records
			this.ui.quantity.text(this.options.addedCondimentsCollection.length);
		}
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals', function(AddedMeals, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		list: function(configuratorAppView) {
			AddedMeals.Controller.list(configuratorAppView);
		},
		update: function(meal, change, qty) {
			AddedMeals.Controller.update(meal, change, qty);
		}
	};
	
	AddedMeals.addInitializer(function() {
		App.vent.on('configurator:loaded', API.list);
		App.vent.on('addedmeals:quantitychange', API.update);
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals', function(AddedMeals, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	AddedMeals.Controller = {
		list: function(configuratorAppView) {
			var fn = _.bind(function(addedMeals) {
				var listView = this._getView(addedMeals);
				
				listView.on('addedmeals:meal:removed', function(removedMeal, remainingAddedMeals) {
					App.vent.trigger('addedmeals:meal:removed', removedMeal, remainingAddedMeals);
				});
				
				listView.on('addedmeals:view:loaded', function(addedMealView) {
					App.vent.trigger('addedmeals:view:loaded', addedMealView);
				});
				
				configuratorAppView.addedMealsRegion.show(listView);
			}, this);
			
			$.when(
				App.request('addedmeals:entity:findAll')
			).then(fn);
		},
		
		update: function(meal, change, qty) {
			// Execute a command to change the quantity in the database.
			App.commands.execute('addedmeals:entity:update', meal, change, qty);
		},
		
		_getView: function(addedMeals) {
			return new AddedMeals.ListView({
				collection: addedMeals
			});
		}
	};
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals', function(AddedMeals, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	AddedMeals.ItemView = Marionette.Layout.extend({
		className: 'selected-meal-item',
		template: '#addedset-template',
		regions: {
			componentsRegion: '.components-column',
			choicesRegion: '.choices-column',
			customizeRegion: '.customize-items'
		},
		ui: {
			toggleCustomization: '.action-customize'
		},
		initialize: function() {
			this.customising = false;
		},
		events: {
			'click .action-delete': 'destroy',
			'click .action-customize': 'toggleCustomization'
		},
		onShow: function() {
			this.trigger('loaded');
		},
		destroy: function(event) {
			event.preventDefault();
			this.model.destroy();
		},
		toggleCustomization: function(event) {
			
			// var customizableItemIds = this._getCustomizableItems();
			
			this[ !this.customizing ? 'showCustomization':'hideCustomization' ]();
			this.customizing = !this.customizing;
		},
		showCustomization: function() {
			// TODO: AJAX get customization data and expand the selected meal item
			
			this.$el.addClass('selected-meal-expanded');
			this.ui.toggleCustomization.find('span').text(this.ui.toggleCustomization.data('expanded-text'));
		},
		hideCustomization: function() {
			this.$el.removeClass('selected-meal-expanded');
			this.ui.toggleCustomization.find('span').text(this.ui.toggleCustomization.data('collapsed-text'));
		}
	});
	
	AddedMeals.EmptyView = Marionette.ItemView.extend({
		template: '#addedsetempty-template'
	});
	
	AddedMeals.ListView = Marionette.CollectionView.extend({
		itemView: AddedMeals.ItemView,
		emptyView: AddedMeals.EmptyView,
		itemViewEventPrefix: 'addedmeals:view',
		collectionEvents: {
			'remove': 'mealRemoved'
		},
		mealRemoved: function(removedMeal, remainingAddedMeals) {
			this.trigger('addedmeals:meal:removed', removedMeal, remainingAddedMeals);
		}
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AvailableChoices', function(AvailableChoices, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		list: function(addedChoiceView, args) {
			AvailableChoices.Controller.list(addedChoiceView, args);
		}
	};
	
	AvailableChoices.addInitializer(function() {
		App.vent.on('addedmeals:choice:changing', function(addedChoiceView, args) {
			API.list(addedChoiceView, args);
		});
	});

}, WOS);
;Store.module('ConfiguratorApp.AvailableChoices', function(AvailableChoices, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	AvailableChoices.Controller = {
		list: function(addedChoiceView, args) {
			var fn = _.bind(function(availableChoices, displayOptions) {
				
				// switch (displayOptions.displayType) {
					// case 'radioList':
						// break;
					// case 'quantityPicker':
				// }
				
				if (displayOptions.displayType == 'radioList') {
					var listView = this._getRadioListView(displayOptions, availableChoices, args.model);
					listView.on('availablechoices:view:hidden', listView.close);
					App.choicesModalsRegion.show(listView);
				} else {
					// will need to get the collection of the same group
					$.when(
						App.request('addedchoices:entity:findAllByListId', args.model)
					).then(_.bind(function(addedChoices) {
						
						var listView = this._getQuantityPickerListView(displayOptions, availableChoices, addedChoices, args.model);
						listView.on('availablechoices:view:hidden', listView.close);
						listView.on('availablechoices:choices:save', function(mealid, listid, selectedChoices) {
							App.commands.execute('addedchoices:entity:update', mealid, listid, selectedChoices);
							
							args.view.trigger('changed');
							// App.vent.trigger()
						});
						App.choicesModalsRegion.show(listView);
					
					}, this));
				}
			}, this);
			
			$.when(
				App.request('availablechoices:entity:findAll', args.model)
			).then(fn);
		},
		
		_getRadioListView: function(displayOptions, availableChoices, currentChoice) {
			return new AvailableChoices.RadioListView({
				collection: availableChoices,
				model: currentChoice,
				displayOptions: displayOptions
			});
		},
		
		_getQuantityPickerListView: function(displayOptions, availableChoices, addedChoices, currentChoice) {
			return new AvailableChoices.QuantityPickerListView({
				collection: availableChoices,
				addedChoicesCollection: addedChoices,
				model: currentChoice,
				displayOptions: displayOptions
			});
		}
	};
	
}, WOS);
;Store.module('ConfiguratorApp.AvailableChoices', function(AvailableChoices, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	AvailableChoices.RadioItemView = Marionette.ItemView.extend({
		template: '#available-choice-template',
		triggers: {
			'ifChecked :radio': 'selected'
		},
		ui: {
			radio: 'input:radio',
			radioGroup: '.radio'
		},
		onRender: function() {
			// somehow after changing the radio from display table implementation to media object implementation (in CSS), the hover doesnt work
			// On further investigation, the label wasn't found unless a delay happens.
			setTimeout(_.bind(function() {
				WOS.Forms.InputStates.init(this.ui.radioGroup);
			}, this), 1);
		},
		onShow: function() {
			if (this.model.get('productCode') == this.options.productCode) {
				this.ui.radio.iCheck('check');
			}
		}
	});
	
	AvailableChoices.RadioListView = Marionette.CompositeView.extend({
		template: '#available-choices-template',
		
		templateHelpers: function() {
			return {
				columnsToDisplay: this.getColumnsToDisplay()
			};
		},
		
		className: 'modal-available-choices modal fade',
		itemView: AvailableChoices.RadioItemView,
		itemViewOptions: function() {
			return {
				productCode: this.model.get('selectedSolutionCode')
			};
		},
		itemViewContainer: '.available-choices-list',
		itemViewEventPrefix: 'availablechoice',
		itemEvents: {
			'selected': 'onChoiceSelected'
		},
		events: {
			'click .btn-submit': 'onSave'
		},
		ui: {
			radioGroups: '.radio',
			choiceImage: '.choice-image',
			dialog: '.modal-dialog',
			choicesContainer: '.available-choices-list'
		},
		initialize: function() {
			this.$el.on('hidden.bs.modal', _.bind(function() {
				this.trigger('availablechoices:view:hidden');
			}, this));
		},
		
		onShow: function() {
			this.$el.modal('show');
		},
		
		onChoiceSelected: function(eventName, itemView, args) {
			this.selectedChoice = args.model;
			this.ui.choiceImage.attr('src', args.model.get('images')[0].imageUrl);
		},
		
		onSave: function(event) {
			event.preventDefault();
			
			if (this.selectedChoice) {
				
				// we will only save the selectedChoice once it has been set, i.e. not null
				this.model.set({
					selectedSolutionCode: this.selectedChoice.get('productCode'),
					selectedSolutionCartName: this.selectedChoice.get('cartName')
				});
				
				this.model.save();
				
				//console.log('is it saved not? ', App.request('addedmeals:entity:findAll'));
			}
			
			this.$el.modal('hide');
		},
		
		getColumnsToDisplay: function() {
			var cols = Math.ceil( this.collection.length / 8 ); // maximum 8 per columns
			return cols > 3 ? 3 : cols; // only show a max of 3 columns
		},
		
		appendHtml: function(compositeView, itemView, index) {
			var $itemsContainer = this.getItemViewContainer(compositeView);
			var columnsToDisplay = this.getColumnsToDisplay();
			var gridClass = 'col-xs-' + (12 / columnsToDisplay).toString();
			var itemsPerColumn = Math.ceil( this.collection.length / columnsToDisplay );
			
			for ( var i=0; i < columnsToDisplay; i++ ) {
				var $columnContainer = $itemsContainer.find('.column-'+i);
				
				if (!$columnContainer.length) {
					$columnContainer = $('<div class="choices-column '+gridClass+' column-'+i+'"></div>');
				}
				
				$itemsContainer.append($columnContainer);
			}
			
			var whichColumn = Math.floor( index / itemsPerColumn );
			$itemsContainer.find('.choices-column').eq(whichColumn).append(itemView.el);
		}
	});
	
	
	AvailableChoices.QuantityPickerItemView = Marionette.ItemView.extend({
		template: '#available-choice-quantity-picker-template',
		className: 'col-xs-6',
		ui: {
			title: '.product-title',
			quantityinput: '.form-control',
			increase: '.action-increase',
			decrease: '.action-decrease'
		},
		events: {
			'click @ui.increase': 'changeQuantity',
			'click @ui.decrease': 'changeQuantity',
			'change @ui.quantityinput': 'changeQuantity'
		},
		initialize: function(options) {
			this.listenTo(this.options.addedChoicesCollection, 'add remove', this.updateQuantity);
		},
		onShow: function() {
			WOS.Components.QuantityInput.init(this.$el);
			this.updateQuantity(null, this.options.addedChoicesCollection);
		},
		adjustHeight: function(height) {
			// Setting the height based on the tallest title
			// This ensures all our upsell product are of the same height
			this.ui.title.css('height', height);
		},
		getHeight: function() {
			// Remove the height so that we can get a correct height
			return this.ui.title.css('height', 'auto').innerHeight();
		},
		getQuantity: function() {
			return parseInt(this.ui.quantityinput.val(), 10);
		},
		updateQuantity: function(choice, addedChoices) {
			
			var matchedChoices = addedChoices.where({
				selectedSolutionCode: this.model.get('productCode')
			});
			
			var qty = matchedChoices.length;
			this.setQuantity(qty);
		},
		setQuantity: function(qty) {
			this.ui.quantityinput.val(qty);
			this.ui.quantityinput.data('newvalue', qty);
			this.ui.quantityinput.data('oldvalue', qty);
		},
		setNoSelection: function(selectNone) {
			this.setQuantity(0);
			this.ui.increase.prop('disabled', selectNone);
			this.ui.decrease.prop('disabled', selectNone);
			this.ui.quantityinput.prop('disabled', selectNone);
		}
	});
	AvailableChoices.QuantityPickerListView = Marionette.CompositeView.extend({
		itemView: AvailableChoices.QuantityPickerItemView,
		template: '#available-choices-quantity-picker-template',
		templateHelpers: {
			noSelection: function() {
				return this.options.displayOptions.noSelection;
			}
		},
		className: 'modal-available-choices modal fade',
		itemViewContainer: '.available-choices-list',
		itemViewEventPrefix: 'availablechoice',
		itemViewOptions: function(model, index) {
			return {
				addedChoicesCollection: this.options.addedChoicesCollection
			};
		},
		initialize: function() {
			this.$el.on('hidden.bs.modal', _.bind(function() {
				this.trigger('availablechoices:view:hidden');
			}, this));
			
			this.selectNone = false;
		},
		ui: {
			selectNone: '.clear-selection input:checkbox',
		},
		events: {
			'ifChanged @ui.selectNone': 'clearSelection',
			'click .btn-submit': 'onSave'
		},
		onShow: function() {
			this.$el.on('shown.bs.modal.quantitypicker', _.bind(this.adjustHeight, this)).modal('show');
			
			setTimeout(_.bind(function() {
				WOS.Forms.InputStates.init(this.ui.selectNone.parent());
			}, this), 1);
		},
		onClose: function() {
			this.$el.off('shown.bs.modal.quantitypicker');
		},
		adjustHeight: function() {
			var tallestHeight = 0;
			this.children.each(function(itemView) {
				var itemHeight = itemView.getHeight();
				if (itemHeight > tallestHeight) {
					tallestHeight = itemHeight;
				}
			});
			
			this.children.each(function(itemView) {
				itemView.adjustHeight(tallestHeight);
			});
		},
		clearSelection: function(event) {
			
			var selectNone = $(event.target).prop('checked');
			this.selectNone = selectNone;
			
			this.children.each(function(itemView) {
				itemView.setNoSelection(selectNone);
			});
		},
		onSave: function(event) {
			event.preventDefault();
			var selectedItems = [];
			var mealid = this.model.get('mealid');
			var listid = this.model.get('productCode');
			
			this.children.each(function(itemView) {
				//var attrs = itemView.model.toJSON();
				var qty = itemView.getQuantity();
				var attrs = {
					mealid: mealid,
					productCode: listid,
					selectedSolutionCode: itemView.model.get('productCode'),
					selectedSolutionCartName: itemView.model.get('cartName'),
					selectedSolutionPath: itemView.model.get('solutionPath'),
					selectedQuantity: 1
				};
				
				if (qty) {
					for (var i=0; i<qty; i++) {
						selectedItems.push( $.extend(true, {}, attrs) );
					}
				}
			});
			
			if (!selectedItems.length) {
				// add the noselection item
				selectedItems.push({
					mealid: mealid,
					productCode: listid,
					selectedSolutionCode: 0,
					selectedSolutionCartName: this.options.displayOptions.noSelection
				});
			}
			
			this.trigger('availablechoices:choices:save', this.model.get('mealid'), this.model.get('productCode'), selectedItems);
		}
	});
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals.Choices', function(Choices, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		list: function(addedMealView) {
			Choices.Controller.list(addedMealView);
		}
	};
	
	Choices.addInitializer(function() {
		App.vent.on('addedmeals:view:loaded', function(addedMealView) {
			setTimeout(function() {
				// somehow this is fired even before addedmeals:view:loaded is being triggered
				// applying a delay.. but may need to look into order of events...
				API.list(addedMealView);
			}, 50);
		});
		
		App.vent.on('addedmeals:choice:changed', function(addedMealView) {
			setTimeout(function() {
				// somehow this is fired even before addedmeals:view:loaded is being triggered
				// applying a delay.. but may need to look into order of events...
				API.list(addedMealView);
			}, 50);
		});
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals.Choices', function(Choices, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	Choices.Controller = {
		list: function(addedMealView) {
			var fn = _.bind(function(choices) {
				var listView = this._getView(choices);
				
				listView.on('addedmeals:choice:changing', function(view, args) {
					App.vent.trigger('addedmeals:choice:changing', view, args);
				});
				
				listView.on('addedmeals:choice:changed', function(view, args) {
					//console.log('addedmeals:choice:changed happened!');
					App.vent.trigger('addedmeals:choice:changed', addedMealView, view, args);
				});
				
				addedMealView.choicesRegion.show(listView);
			}, this);
			
			$.when(
				App.request('addedchoices:entity:findAllByMeal', addedMealView.model)
			).then(fn);
		},
		
		_getView: function(choices) {
			return new Choices.ListView({
				collection: choices
			});
		}
	};
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals.Choices', function(Choices, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	Choices.ItemView = Marionette.Layout.extend({
		template: '#addedset-choice-template',
		ui: {
			'changeLink': '.action-change'
		},
		regions: {
			availableChoices: '.modal-available-choices'
		},
		triggers: {
			'click .action-change': 'changing'
		},
		initialize: function() {
			// TODO: Not sure why this isn't automated.
			this.listenTo(this.model, 'change', this.render);
		}
	});
	
	Choices.ListView = Marionette.CollectionView.extend({
		itemView: Choices.ItemView,
		className: 'fooditem',
		itemViewEventPrefix: 'addedmeals:choice'
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals.Components', function(Components, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		list: function(addedMealView) {
			Components.Controller.list(addedMealView);
		}
	};
	
	Components.addInitializer(function() {
		App.vent.on('addedmeals:view:loaded', function(addedMealView) {
			setTimeout(function() {
				// somehow this is fired even before addedmeals:view:loaded is being triggered
				// applying a delay.. but may need to look into order of events...
				API.list(addedMealView);
			}, 50);
		});
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals.Components', function(Components, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	Components.Controller = {
		list: function(addedMealView) {
			var fn = _.bind(function(components) {
				var listView = this._getView(components);
				
				addedMealView.componentsRegion.show(listView);
			}, this);
			
			$.when(
				App.request('addedcomponents:entity:findAllByMeal', addedMealView.model)
			).then(fn);
		},
		_getView: function(components) {
			return new Components.ListView({
				collection: components
			});
		}
	};
	
}, WOS);
;Store.module('ConfiguratorApp.AddedMeals.Components', function(Components, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	Components.ItemView = Marionette.ItemView.extend({
		template: '#addedset-component-template',
		className: 'fooditem'
	});
	
	Components.ListView = Marionette.CollectionView.extend({
		itemView: Components.ItemView
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AvailableMeals', function(AvailableMeals, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		list: function(configuratorAppView) {
			AvailableMeals.Controller.list(configuratorAppView);
		}
	};
	
	AvailableMeals.addInitializer(function() {
		App.vent.on('configurator:loaded', API.list);
	});
	
}, WOS);
;Store.module('ConfiguratorApp.AvailableMeals', function(AvailableMeals, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	this.Controller = {
		list: function(configuratorAppView) {
			var fn = _.bind(function(availablemeals, addedmeals) {
				var listView = this._getView(availablemeals, addedmeals);
				
				listView.on('addedmeals:quantitychange', function(view, meal, change, qty) {
					App.vent.trigger('addedmeals:quantitychange', meal, change, qty);
				});
				
				configuratorAppView.availableMealsRegion.show(listView);
			}, this);
			
			$.when(
				App.request('availablemeals:entity:findAll', configuratorAppView.model.get('productCode')),
				App.request('addedmeals:entity:findAll')
			).then(fn);
		},
		
		_getView: function(availablemeals, addedMeals) {
			return new AvailableMeals.ListView({
				collection: availablemeals,
				addedMealsCollection: addedMeals
			});
		}
	};
	
}, WOS);
;Store.module('ConfiguratorApp.AvailableMeals', function(AvailableMeals, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	AvailableMeals.ItemView = Marionette.ItemView.extend({
		tagName: 'tr',
		template: '#productset-template',
		templateHelpers: {
			calories: function() {
				var calories = _.findWhere(this.addditionInfo.nutrition, { unit: 'cal' });
				return calories.value;
			}
		},
		events: {
			'click .action-decrease': 'changeQuantity',
			'click .action-increase': 'changeQuantity',
			'change .form-control': 'changeQuantity'
		},
		ui: {
			quantityinput: '.form-control'
		},
		onShow: function() {
			WOS.Components.QuantityInput.init(this.$el);
			this.updateQuantity(null, this.options.addedMealsCollection);
		},
		initialize: function(options) {
			this.listenTo(this.options.addedMealsCollection, 'add remove', this.updateQuantity);
		},
		changeQuantity: function() {
			var 
				input = this.ui.quantityinput,
				oldvalue = parseInt(input.data('oldvalue'), 10),
				newvalue = parseInt(input.data('newvalue'), 10),
				change = newvalue-oldvalue,
				qty = newvalue
			;
			
			this.$el.toggleClass('selected', !!qty);
			this.trigger('quantitychange', this.model, change, qty);
		},
		updateQuantity: function(meal, addedMeals) {
			var matchedMeals = addedMeals.where({
				productCode: this.model.get('productCode')
			});
			
			var qty = matchedMeals.length;
			
			this.ui.quantityinput.val(qty);
			this.ui.quantityinput.data('newvalue', qty);
			this.ui.quantityinput.data('oldvalue', qty);
			
			this.$el.toggleClass('selected', !!qty);
		}
	});
	
	AvailableMeals.ListView = Marionette.CompositeView.extend({
		template: '#productsets-template',
		itemView: AvailableMeals.ItemView,
		itemViewEventPrefix: 'addedmeals',
		itemViewContainer: 'tbody',
		itemViewOptions: function(model, index) {
			return {
				addedMealsCollection: this.options.addedMealsCollection
			};
		}
	});
	
}, WOS);
;Store.module('ConfiguratorApp', function(ConfiguratorApp, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var Router = Marionette.AppRouter.extend({
		appRoutes: {
			'add/:productCode': 'createOrder',
			'edit/:cartId': 'editOrder'
		}
	});
	
	var API = {
		browseCategory: function() {},
		createOrder: function(productCode) {
			ConfiguratorApp.Controller.createOrder(parseInt(productCode, 10));
		},
		editOrder: function(cartId) {
			ConfiguratorApp.Controller.editOrder(parseInt(cartId, 10));
		}
	};
	
	ConfiguratorApp.addInitializer(function() {
		
		App.addInitializer(function() {
			new Router({
				controller: API
			});
			
			App.addRegions({
				menuRegion: 			'#food-menu',
				productCardsRegion: 	'#product-cards',
				configuratorRegion: 	'#product-configurator',
				orderWidgetRegion: 		'#order-widget',
				choicesModalsRegion: 	'#modals-choices' // Since modals need to be at document root level
			});
			
			App.commands.execute('availablemeals:entity:reset');
			App.commands.execute('availablechoices:entity:reset');
			App.commands.execute('availableupsells:entity:reset');
			App.commands.execute('addedmeals:entity:reset');
		});
		
		
		
		// clear the db on init and when configurator closes.
		App.vent.on('configurator:closed', function() {
			App.commands.execute('addedmeals:entity:reset');
			App.commands.execute('availablemeals:entity:reset');
			App.commands.execute('availableupsells:entity:reset');
		});
		
		// announce that the app has started.
		App.vent.trigger('app:started', 'configurator');
	});
	
}, WOS);
;Store.module('ConfiguratorApp', function(ConfiguratorApp, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	this.Controller = {
		createOrder: function(productCode) {
			this.cartId = null;
			var fn = _.bind(this._showView, this);
			
			$.when(
				App.request('availablemeals:entity:findOne', productCode),
				App.request('addedmeals:entity:findAll')
			).then(fn);
		},
		
		editOrder: function(cartId) {
			this.cartId = cartId;
			var fn = _.bind(this._showView, this);
			
			$.when(
				App.request('addedmeals:entity:findAllByCartId', cartId)
			).then(fn);
		},
		
		cancelOrder: function(view) {
			App.vent.trigger('configurator:cancelorder', view);
			this._hideView();
		},
		
		saveOrder: function(view) {
			var fn = _.bind(function() {
				App.vent.trigger('configurator:saveorder', view);
				this._hideView();
				
				location.reload();
			}, this);
			
			$.when(
				App.request('cart:save', this.cartId, view.model.id)
			).then(fn);
		},
		
		_showView: function(product, addedMeals) {
			
			// Need to make sure that a product is found. If not, JS error will be thrown
			if (product) {
				var configuratorAppView = new ConfiguratorApp.View({ 
					model: product,
					addedMealsCollection: addedMeals,
					isNewOrder: !this.cartId
				});
				
				configuratorAppView.on('configurator:loaded', function(view) {
					App.vent.trigger('configurator:loaded', view);
				});
				
				configuratorAppView.on('configurator:cancelorder', function(view) {
					ConfiguratorApp.Controller.cancelOrder(view);
				});
				
				configuratorAppView.on('configurator:saveorder', function(view) {
					ConfiguratorApp.Controller.saveOrder(view);
				});
				
				App.configuratorRegion.show(configuratorAppView);	
			}
		},
		
		_hideView: function() {
			App.configuratorRegion.close();
			Backbone.history.navigate('');
			App.vent.trigger('configurator:closed');
		}
	};
	
}, WOS);
;Store.module('ConfiguratorApp', function(ConfiguratorApp, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	ConfiguratorApp.View = Marionette.Layout.extend({
		template: '#configurator-template',
		
		templateHelpers: function() {
			return {
				isNewOrder: this.options.isNewOrder
			};
		},
		
		regions: {
			availableMealsRegion: '#available-sets',
			addedMealsRegion: '#added-sets',
			upsellsRegion: '#upsell-items'
		},
		
		ui: {
			header: '.configurator-header',
			body: '.configurator-body',
			footer: '.configurator-footer',
			quantity: '.added-quantity'
		},
		
		triggers: {
			'click .action-cancel': 'configurator:cancelorder',
			'click .action-saveorder': 'configurator:saveorder'
		},
		
		initialize: function(options) {
			this.listenTo(this.options.addedMealsCollection, 'add remove reset', this.updateQuantity);
		},
		
		onShow: function() {
			$('body').addClass('show-configurator');
			WOS.Components.Popovers.init(this.ui.header);
			$(window).on('scroll.configurator', _.bind(this.onScroll, this));
			document.body.scrollTop = document.documentElement.scrollTop = 0;
			
			this.updateQuantity();
			this.trigger('configurator:loaded', this);
		},
		
		onClose: function() {
			$('body').removeClass('show-configurator');
			$(window).off('scroll.configurator');
		},
		
		onScroll: WOS.Poll(function() {
			var scrollTop = $(window).scrollTop();
			
			// if user scrolls more than 90px, we will collapse the header
			this.ui.header[scrollTop < 90 ? 'removeClass':'addClass']('collapsed');
			this.ui.body[scrollTop < 90 ? 'removeClass':'addClass']('expanded');
		}, 25), // run this every 25 milliseconds so its not so intensive on the browser
		
		updateQuantity: function() {
			// Update quantity on insert/delete of AddedMeals records
			this.ui.quantity.text(this.options.addedMealsCollection.length);
		}
	});
	
}, WOS);
;Store.module('ConfiguratorApp.Upsells', function(Upsells, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	var API = {
		list: function(configuratorAppView) {
			Upsells.Controller.list(configuratorAppView);
		},
		update: function(item, change, qty) {
			Upsells.Controller.update(item, change, qty);
		}
	};
	
	Upsells.addInitializer(function() {
		App.vent.on('configurator:loaded', API.list);
		App.vent.on('addedupsells:quantitychange', API.update);
	});
	
}, WOS);
;Store.module('ConfiguratorApp.Upsells', function(Upsells, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	this.Controller = {
		list: function(configuratorAppView) {
			var fn = _.bind(function(availableupsells) {
				var listView = this._getView(availableupsells);
				
				listView.on('addedupsells:quantitychange', function(view, meal, change, qty) {
					App.vent.trigger('addedupsells:quantitychange', meal, change, qty);
				});
				
				configuratorAppView.upsellsRegion.show(listView);
			}, this);
			
			$.when(
				App.request('availableupsells:entity:findAll', configuratorAppView.model.get('productCode'))
			).then(fn);
		},
		
		update: function(item, change, qty) {
			// Execute a command to change the quantity in the database.
			App.commands.execute('addedupsells:entity:update', item, change, qty);
		},
		
		_getView: function(availableupsells) {
			return new Upsells.ListView({
				collection: availableupsells
			});
		}
	};
	
}, WOS);
;Store.module('ConfiguratorApp.Upsells', function(Upsells, App, Backbone, Marionette, $, _, WOS) {
	'use strict';
	
	Upsells.ItemView = Marionette.ItemView.extend({
		template: '#upsellitem-template',
		className: 'colsize-5 colsize-5-1of5',
		ui: {
			title: '.product-title',
			quantityinput: '.form-control'
		},
		events: {
			'click .action-decrease': 'changeQuantity',
			'click .action-increase': 'changeQuantity',
			'change .form-control': 'changeQuantity'
		},
		onShow: function() {
			WOS.Components.QuantityInput.init(this.$el);
		},
		changeQuantity: function() {
			var 
				input = this.ui.quantityinput,
				oldvalue = parseInt(input.data('oldvalue'), 10),
				newvalue = parseInt(input.data('newvalue'), 10),
				change = newvalue-oldvalue,
				qty = newvalue
			;
			
			this.trigger('quantitychange', this.model, change, qty);
		},
		adjustHeight: function(height) {
			// Setting the height based on the tallest title
			// This ensures all our upsell product are of the same height
			this.ui.title.css('height', height);
		},
		getHeight: function() {
			// Remove the height so that we can get a correct height
			return this.ui.title.css('height', 'auto').innerHeight();
		}
	});
	
	Upsells.ListView = Marionette.CollectionView.extend({
		itemView: Upsells.ItemView,
		itemViewEventPrefix: 'addedupsells',
		className: 'colsize-5-row',
		onShow: function() {
			$(window).on('resize.configurator', _.bind(this.adjustHeight, this));
			this.adjustHeight();
		},
		onClose: function() {
			$(window).off('resize.configurator');
		},
		adjustHeight: function() {
			var tallestHeight = 0;
			this.children.each(function(itemView) {
				var itemHeight = itemView.getHeight();
				if (itemHeight > tallestHeight) {
					tallestHeight = itemHeight;
				}
			});
			
			this.children.each(function(itemView) {
				itemView.adjustHeight(tallestHeight);
			});
		}
	});
	
}, WOS);
;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _) {
	Entities.Model = Backbone.Model.extend({});
	Entities.Collection = Backbone.Collection.extend({});
});
;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _) {
	'use strict';
	
	var AddedChoice = App.Entities.Model.extend({
		idAttribute: '___id',
		services: {
			'create': function(model, options) {
				var dfd = $.Deferred();
				
				dfd.done(options.success);
				return dfd.promise();
			},
			'read': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.choices(model.id).get()[0];
				
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'update': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.choices(model.id).update(model.toJSON()).first();
				
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'delete': function(model, options) {
				var dfd = $.Deferred();
				var removed = App.db.added.choices(model.id).remove();
				dfd.done(options.success);
				
				if (removed) {
					dfd.resolve(model.toJSON());
				}
				return dfd.promise();
			}
		},
		sync: function(method, model, options) {
			return model.services[method.toLowerCase()].call(model, model, options);
		}
	});
	var AddedChoices = App.Entities.Collection.extend({
		model: AddedChoice
	});
	
	var API = {
		findAllByMeal: function(meal) {
			var dfd = $.Deferred();
			var filteredChoices = App.db.added.choices().filter({
				mealid: meal.id
			});
			
			var choices = new AddedChoices(filteredChoices.get());
			
			dfd.resolve(choices);
			return dfd.promise();
		},
		findAllByListId: function(choice) {
			var dfd = $.Deferred();
			
			var filteredChoices = App.db.added.choices().filter({
				mealid: choice.get('mealid'),
				productCode: choice.get('productCode')
			});
			
			var choices = new AddedChoices(filteredChoices.get());
			
			dfd.resolve(choices);
			return dfd.promise();
		},
		update: function(mealid, listid, choices) {
			
			// Need to retrieve the minQuantity and maxQuantity before removing them
			var existingChoices = App.db.added.choices().filter({
				mealid: mealid,
				productCode: listid
			});
			
			var existingChoice = existingChoices.first();
			
			_.each(choices, function(choice) {
				choice.minQuantity = existingChoice.minQuantity;
				choice.maxQuantity = existingChoice.maxQuantity;
			});
			
			existingChoices.remove();
			
			App.db.added.choices.insert(choices);
		}
	};
	
	App.reqres.setHandlers({
		'addedchoices:entity:findAllByMeal': function(meal) {
			return API.findAllByMeal(meal);
		},
		'addedchoices:entity:findAllByListId': function(choice) {
			return API.findAllByListId(choice);
		}
	});
	
	App.commands.setHandlers({
		'addedchoices:entity:update': function(mealid, listid, choices) {
			API.update(mealid, listid, choices);
		}
	});
});
;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _) {
	'use strict';
	
	var AddedComponent = App.Entities.Model.extend({
		idAttribute: '___id'
	});
	var AddedComponents = App.Entities.Collection.extend({
		model: AddedComponent
	});
	
	var API = {
		findAllByMeal: function(meal) {
			var dfd = $.Deferred();
			var filteredComponents = App.db.added.components().filter({
				mealid: meal.id
			});
			
			var components = new AddedComponents(filteredComponents.get());
			dfd.resolve(components);
			return dfd.promise();
		}
	};
	
	App.reqres.setHandlers({
		'addedcomponents:entity:findAllByMeal': function(meal) {
			return API.findAllByMeal(meal);
		}
	});
	
});
;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	var AddedCondiment = App.Entities.Model.extend({
		idAttribute: '___id',
		services: {
			'create': function(model, options) {
				var dfd = $.Deferred();
				var created = App.db.added.condiments.insert(
					$.extend(true, {}, model.toJSON())
				);
				dfd.done(options.success);
				dfd.resolve(created.get()[0]);
				return dfd.promise();
			},
			'read': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.condiments(model.id);
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'update': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.condiments(model.id).update(model.toJSON()).get()[0];
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'delete': function(model, options) {
				var dfd = $.Deferred();
				var removed = App.db.added.condiments(model.id).remove();
				if (removed) {
					dfd.resolve(model.toJSON());
				}
				dfd.done(options.success);
				return dfd.promise();
			}
		},
		sync: function(method, model, options) {
			return model.services[method.toLowerCase()].call(model, model, options);
		}
	});
	
	var AddedCondiments = App.Entities.Collection.extend({
		model: AddedCondiment,
		services: {
			'read': function(collection, options) {
				var dfd = $.Deferred();
				var response = new AddedCondiments(App.db.added.condiments().get());
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			}
		},
		sync: function(method, collection, options) {
			return collection.services[method.toLowerCase()].call(collection, collection, options);
		}
	});
	
	var addedCondimentsCollection;
	
	var API = {
		gatherAll: function() {
			var dfd = $.Deferred();
			dfd.resolve(addedCondimentsCollection);
			return dfd.promise();
		},
		findAll: function() {
			var dfd = $.Deferred();
			
			$.ajax(App.config.api.condiments.edit)
			.done(function(response, status, xhr) {
				var condiments = response.cartItems;
				
				// As we are reading the saved condiments from server, we need to make sure the local db is cleared to prevent duplication
				App.commands.execute('addedcondiments:entity:reset');
				
				$.when(
					// we need to make sure available condiments DB is populated first.
					App.request('availablecondiments:entity:findAll')
				).done(function(availableCondimentsCollection) {
					
					_.each(condiments, function(cartItem, index, list) {
						
						// Find the default condiment for this productCode
						var defaultCondiment = App.db.available.condiments().filter({
							productCode: cartItem.productCode
						}).get()[0];
						
						// remove the primary key. if not, collection.create will only add one model
						delete defaultCondiment.___id;
						
						var cartItem = $.extend(true, {}, defaultCondiment, cartItem);
						var quantity = cartItem.selectedQuantity;
						
						for ( var i=0; i<quantity; i++ ) {
							var condiment = $.extend(true, {}, cartItem); // we extend it to get a pure JSON object
							condiment.selectedQuantity = 1;
							
							addedCondimentsCollection.create(condiment);
						}
					});
					
					dfd.resolve(availableCondimentsCollection, addedCondimentsCollection);
				});
			});
			return dfd.promise();
		},
		update: function(condiment, change, qty) {
			var attrs = condiment.unset('___id').toJSON();
			
			if (change > 0) {
				// add
				for ( var i=0; i<change; i++ ) {
					addedCondimentsCollection.create( $.extend(true, {}, attrs) );
				}
			} else {
				// remove
				var matchedCondiments = addedCondimentsCollection.where({
					productCode: condiment.get('productCode')
				});
				var condimentsToRemove = _.last(matchedCondiments, Math.abs(change));
				_.each(condimentsToRemove, function(model) {
					model.destroy();
				});
			}
		},
		save: function() {
			var dfd = $.Deferred();
			
			var data = {};
			
			data.status = {
				refCartId: null,
				refProductCode: null
			};
			
			var condimentItems = _.map(addedCondimentsCollection.toJSON(), function(item, index) {
				return {
					productCode: item.productCode,
					selectedQuantity: 1
				};
			});
			
			data.condimentItems = condimentItems;
			
			if (App.config.debug) {
				console.log('Saving: ');
				console.dir(data);
			}
			
			$.ajax(App.config.api.condiments.save, {
				data: JSON.stringify(data),
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				complete: function(xhr, status) {
					dfd.resolve();
				}
			});
			
			return dfd.promise();
		},
		init: function() {
			App.db.added.condiments = TAFFY();
		},
		reset: function() {
			this.init();
			if (addedCondimentsCollection) 
				addedCondimentsCollection.reset();
		}
	};
	
	Entities.addInitializer(function() {
		API.init();
		addedCondimentsCollection = new AddedCondiments(
			App.db.added.condiments().get()
		);
		//addedMealsCollection.fetch();
	});
	
	// Exposing the API to the App.reqres for app-wide access
	App.reqres.setHandlers({
		'addedcondiments:entity:findAll': function() {
			return API.findAll();
		},
		'addedcondiments:entity:gatherAll': function() {
			return API.gatherAll();
		},
		'addedcondiments:save': function() {
			return API.save();
		}
	});
	
	App.commands.setHandlers({
		'addedcondiments:entity:update': function(condiment, change, qty) {
			API.update(condiment, change, qty);
		},
		'addedcondiments:entity:init': function() {
			API.init();
		},
		'addedcondiments:entity:reset': function() {
			API.reset();
		}
	});
	
}, WOS, TAFFY);;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	// http://stackoverflow.com/questions/17603363/marionettejs-using-a-collection-with-two-or-more-views-for-different-layouts
	var AddedMeal = App.Entities.Model.extend({
		idAttribute: '___id',
		services: {
			'create': function(model, options) {
				var dfd = $.Deferred();
				var created = App.db.added.meals.insert(
					$.extend(true, {}, model.toJSON())
				);
				
				dfd.done(function(response) {
					// Act like a SQL's onInsert trigger -> to insert Choices/Components 
					var choices = [];
					var components = [];
					
					_.each(response.choices, function(item) {
						item.mealid = response['___id'];
						
						// When editing cart, the choice.selectedQuantity may be more than 1
						// therefore we add the choice the number of items based on the selected quantity
						var selectedQuantity = item.selectedQuantity;
						for (var i=0; i<selectedQuantity; i++) {
							var toInsert = $.extend({}, item);
							App.db.added.choices.insert(toInsert);
						}
					});
					
					// App.db.added.choices.insert(choices);
					
					_.each(response.components, function(item) {
						item.mealid = response['___id'];
						
						// When editing cart, the choice.selectedQuantity may be more than 1
						// therefore we add the choice the number of items based on the selected quantity
						var selectedQuantity = item.selectedQuantity;
						for (var i=0; i<selectedQuantity; i++) {
							var toInsert = $.extend({}, item);
							App.db.added.components.insert(toInsert);
						}
					});
				});
				
				dfd.done(options.success);
				
				dfd.resolve(created.get()[0]);
				return dfd.promise();
			},
			'read': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.meals(model.id);
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'update': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.meals(model.id).update(model.toJSON()).get()[0];
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'delete': function(model, options) {
				var dfd = $.Deferred();
				var removed = App.db.added.meals(model.id).remove();
				dfd.done(options.success);
				if (removed) {
					// When meal is removed, cascade the removal on the related choices and components 
					App.db.added.choices().filter({
						mealid: model.id
					}).remove();
					
					App.db.added.components().filter({
						mealid: model.id
					}).remove();
					
					dfd.resolve(model.toJSON());
				}
				return dfd.promise();
			}
		},
		sync: function(method, model, options) {
			return model.services[method.toLowerCase()].call(model, model, options);
		}
	});
	
	var AddedMeals = App.Entities.Collection.extend({
		model: AddedMeal,
		services: {
			'read': function(collection, options) {
				var dfd = $.Deferred();
				var response = new AddedMeals(App.db.added.meals().get());
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			}
		},
		sync: function(method, collection, options) {
			return collection.services[method.toLowerCase()].call(collection, collection, options);
		}
	});
	
	var addedMealsCollection;
	
	var API = {
		findAll: function() {
			// TODO: Cannot do a simple find all... Find All only get the default values... Need to join all tables once again.
			var dfd = $.Deferred();
			dfd.resolve(addedMealsCollection);
			return dfd.promise();
		},
		findAllByCartId: function(cartId) {
			var dfd = $.Deferred();
			
			// Retrieve the entire cart object 
			$.ajax(App.config.api.cart.edit, {
				data: { cartId: cartId }
			}).done(function(response, status, xhr) {
				
				// this is the refProductCode, we will use this to display the information on the configurator header
				var productCode = response.status.refProductCode;
				
				// retrieving the mainProduct and its information
				$.when(
					App.request('availablemeals:entity:findOne', productCode)
				).done(function(mainProduct) {
					
					var cartItems = response.cartItems;
					_.each(cartItems, function(cartItem, index, list) {
						
						// we select from the availableMeals table for the default meal
						var defaultMeal = App.db.available.meals().filter({
							productCode: cartItem.productCode
						}).get()[0];
						
						// remove the primary key. if not, collection.create will only add one model
						delete defaultMeal.___id;
						delete defaultMeal.choices;
						delete defaultMeal.components;
						
						// Combine with the ones from the server to get full product details
						var cartItem = $.extend(true, {}, defaultMeal, cartItem);
						
						// Replicate base on the number of selected quantity
						var quantity = cartItem.selectedQuantity;
						
						for ( var i=0; i<quantity; i++ ) {
							var meal = $.extend(true, {}, cartItem); // we extend it to get a pure JSON object
							meal.selectedQuantity = 1;
							
							//var addedMeal = new AddedMeal(meal);
							addedMealsCollection.create(meal);
						}
					});
					
					dfd.resolve(mainProduct, addedMealsCollection);
				});
			});
			
			return dfd.promise();
		},
		update: function(meal, change, qty) {
			var attrs = meal.unset('___id').toJSON();
			
			if (change > 0) {
				// add
				for ( var i=0; i<change; i++ ) {
					
					addedMealsCollection.create( $.extend(true, {}, attrs) );
				}
			} else {
				// remove
				var matchedMeals = addedMealsCollection.where({
					productCode: meal.get('productCode')
				});
				var mealsToRemove = _.last(matchedMeals, Math.abs(change));
				_.each(mealsToRemove, function(model) {
					model.destroy();
				});
			}
		},
		init: function() {
			App.db.added.meals = TAFFY();
			App.db.added.choices = TAFFY();
			App.db.added.components = TAFFY();
		},
		reset: function() {
			this.init();
			if (addedMealsCollection) 
				addedMealsCollection.reset();
		}
	};
	
	Entities.addInitializer(function() {
		API.init();
		addedMealsCollection = new AddedMeals(
			App.db.added.meals().get()
		);
		//addedMealsCollection.fetch();
	});
	
	// Exposing the API to the App.reqres for app-wide access
	App.reqres.setHandlers({
		'addedmeals:entity:findAll': function() {
			return API.findAll();
		},
		'addedmeals:entity:findAllByCartId': function(cartId) {
			return API.findAllByCartId(cartId);
		}
	});
	
	App.commands.setHandlers({
		'addedmeals:entity:update': function(meal, change, qty) {
			API.update(meal, change, qty);
		},
		'addedmeals:entity:init': function() {
			API.init();
		},
		'addedmeals:entity:reset': function() {
			API.reset();
		}
	});
}, WOS, TAFFY);
;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	var AddedUpsell = App.Entities.Model.extend({
		idAttribute: '___id',
		services: {
			'create': function(model, options) {
				var dfd = $.Deferred();
				var created = App.db.added.upsells.insert(
					$.extend(true, {}, model.toJSON())
				);
				dfd.done(options.success);
				dfd.resolve(created.get()[0]);
				return dfd.promise();
			},
			'read': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.upsells(model.id);
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'update': function(model, options) {
				var dfd = $.Deferred();
				var response = App.db.added.upsells(model.id).update(model.toJSON()).get()[0];
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			},
			'delete': function(model, options) {
				var dfd = $.Deferred();
				var removed = App.db.added.upsells(model.id).remove();
				dfd.done(options.success);
				dfd.resolve(model.toJSON());
				return dfd.promise();
			}
		},
		sync: function(method, model, options) {
			return model.services[method.toLowerCase()].call(model, model, options);
		}
	});
	
	var AddedUpsells = App.Entities.Collection.extend({
		model: AddedUpsell,
		services: {
			'read': function(collection, options) {
				var dfd = $.Deferred();
				var response = new AddedUpsells(App.db.added.upsells().get());
				dfd.done(options.success);
				dfd.resolve(response);
				return dfd.promise();
			}
		},
		sync: function(method, collection, options) {
			return collection.services[method.toLowerCase()].call(collection, collection, options);
		}
	});
	
	var addedUpsellsCollection;
	
	var API = {
		findAll: function() {
			var dfd = $.Deferred();
			dfd.resolve(addedUpsellsCollection);
			return dfd.promise();
		},
		update: function(item, change, qty) {
			var attrs = item.unset('___id').toJSON();
			
			if (change > 0) {
				// Add
				for ( var i=0; i<change; i++ ) {
					addedUpsellsCollection.create( $.extend(true, {}, attrs) );
					
					
				}
			} else {
				// remove
				var matchedItems = addedUpsellsCollection.where({
					productCode: item.get('productCode')
				});
				var itemsToRemove = _.last(matchedItems, Math.abs(change));
				_.each(itemsToRemove, function(model) {
					model.destroy();
				});
			}
		},
		init: function() {
			App.db.added.upsells = TAFFY();
		},
		reset: function() {
			this.init();
			addedUpsellsCollection.reset();
		}
	};
	
	Entities.addInitializer(function() {
		API.init();
		addedUpsellsCollection = new AddedUpsells(
			App.db.added.upsells().get()
		);
		//addedUpsellsCollection.fetch();
	});
	
	// Exposing the API to the App.reqres for app-wide access
	App.reqres.setHandlers({
		'addedupsells:entity:findAll': function() {
			return API.findAll();
		}
	});
	
	App.commands.setHandlers({
		'addedupsells:entity:update': function(item, change, qty) {
			API.update(item, change, qty);
		},
		'addedupsells:entity:init': function() {
			API.init();
		},
		'addedupsells:entity:reset': function() {
			API.reset();
		}
	});
	
}, WOS, TAFFY);;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	var AvailableChoice = App.Entities.Model.extend({
		idAttribute: 'productCode'
	});
	var AvailableChoices = App.Entities.Collection.extend({
		model: AvailableChoice
	});
	
	var API = {
		findAll: function(choice) {
			var dfd = $.Deferred();
			
			var listid = choice.get('productCode');
			var mealid = choice.get('mealid');
			var mealProductCode = App.db.added.meals(mealid).select('productCode')[0];
			
			$.ajax(App.config.api.availableChoices.findAll, {
				data: { 
					listid: listid,
					rootPlu: mealProductCode
				}
			}).then(function(response, status, xhr) {
				
				var choices = response.products;
				var displayOptions = {
					noSelection: response.noSelection,
					displayType: response.displayType
				};
				
				var groupedChoices = _.map(choices, function(choice) {
					// set the listid for easier reference later on
					choice.listid = listid;
					return choice;
				});
				
				// insert it into our local db
				// App.db.available.choices.insert(groupedChoices);
				
				var availableChoices = new AvailableChoices(groupedChoices);
				dfd.resolve(availableChoices, displayOptions);
			});
			
			return dfd.promise();
		},
		init: function() {
			App.db.available.choices = TAFFY();
		},
		reset: function() {
			this.init();
		}
	};
	
	App.reqres.setHandlers({
		'availablechoices:entity:findAll': function(choice) {
			return API.findAll(choice);
		}
	});
	
	App.commands.setHandlers({
		'availablechoices:entity:init': function() {
			API.init();
		},
		'availablechoices:entity:reset': function() {
			API.reset();
		}
	});
	
}, WOS, TAFFY);
;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	// Defining the models & collections
	var AvailableCondiment = App.Entities.Model.extend({
		idAttribute: 'productCode'
	});
	var AvailableCondiments = App.Entities.Collection.extend({
		model: AvailableCondiment
	});
	
	// Defining the various AJAX requests
	var API = {
		findAll: function() {
			var dfd = $.Deferred();
			
			$.ajax(App.config.api.condiments.findAll)
			.done(function(response, status, xhr) {
				var condiments = response.products;
				// Insert into our local DB
				App.db.available.condiments.insert(condiments);
				var availableCondiments = new AvailableCondiments(condiments);
				
				dfd.resolve(availableCondiments);
			});
			
			return dfd.promise();
		},
		init: function() {
			App.db.available.condiments = TAFFY();
		},
		reset: function() {
			this.init();
		}
	};
	
	// Exposing the API to the App.reqres for app-wide access
	App.reqres.setHandlers({
		'availablecondiments:entity:findAll': function(productCode) {
			return API.findAll(productCode);
		}
	});
	
	App.commands.setHandlers({
		'availablecondiments:entity:init': function() {
			API.init();
		},
		'availablecondiments:entity:reset': function() {
			API.reset();
		}
	});
	
	
}, WOS, TAFFY);;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	// Defining the models & collections
	var AvailableMeal = App.Entities.Model.extend({
		idAttribute: 'productCode'
	});
	var AvailableMeals = App.Entities.Collection.extend({
		model: AvailableMeal
	});
	
	// Defining the various AJAX requests
	var API = {
		findOne: function(productCode) {
			var dfd = $.Deferred();
			
			this.findAll(productCode).then(function(availableMeals) {
				// Select 1 from availableMeals where productCode matches
				var meal = availableMeals.findWhere({
					productCode: productCode
				});
				dfd.resolve(meal);
			});
			
			return dfd.promise();
		},
		findAll: function(productCode) {
			var dfd = $.Deferred();
			
			$.ajax(App.config.api.availableMeals.findAll, {
				data: { productCode: productCode }
			}).done(function(response, status, xhr) {
				
				// We are saving this to a local DB to cache it
				var meals = response.products;
				
				_.each(meals, function(meal) {
					
					var choices = [];
					var components = [];
					
					_.each(meal.choices, function(item) {
						
						// Foreign Key "mealid" reference meals["productCode"]
						item.mealid = productCode;
						// Trying to sync up all to use the same property names
						item.selectedSolutionCode = item.defaultSolutionCode;
						item.selectedSolutionCartName = item.defaultSolutionCartName;
						item.selectedSolutionPath = item.defaultSolutionPath;
						item.selectedQuantity = 1;
						
						// based on the default quantity, we need to separate them out into different record
						for (var i=0; i<item.defaultQuantity; i++) {
							choices.push( $.extend({}, item) );
						}
						
						delete item.defaultSolutionCode;
						delete item.defaultSolutionCartName;
						delete item.defaultSolutionPath;
						delete item.defaultQuantity;
						
					});
					
					_.each(meal.components, function(item) {
						// Foreign Key "mealid" reference meals["productCode"]
						item.mealid = productCode;
						
						// Trying to sync up all to use the same property names
						item.selectedQuantity = 1;
						
						// Trying to sync up all to use the same property names
						// based on the default quantity, we need to separate them out into different record
						for (var i=0; i<item.defaultQuantity; i++) {
							components.push( $.extend({}, item) );
						}
						
						delete item.defaultQuantity;
						
					});
					
					meal.choices = choices;
					meal.components = components;
				});
				
				App.db.available.meals.insert(meals);
				
				var availableMeals = new AvailableMeals(meals);
				dfd.resolve(availableMeals);
			});
			
			return dfd.promise();
		},
		init: function() {
			// reset all the local DB
			App.db.available.meals = TAFFY();
			App.db.available.defaultChoices = TAFFY();
			App.db.available.defaultComponents = TAFFY();
		},
		reset: function() {
			this.init();
		}
	};
	
	// Exposing the API to the App.reqres for app-wide access
	App.reqres.setHandlers({
		'availablemeals:entity:findOne': function(productCode) {
			return API.findOne(productCode);
		},
		'availablemeals:entity:findAll': function(productCode) {
			return API.findAll(productCode);
		}
	});
	
	App.commands.setHandlers({
		'availablemeals:entity:init': function() {
			API.init();
		},
		'availablemeals:entity:reset': function() {
			API.reset();
		}
	});
	
}, WOS, TAFFY);
;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	var AvailableUpsell = App.Entities.Model.extend({
		idAttribute: 'productCode'
	});
	
	var AvailableUpsells = App.Entities.Collection.extend({
		model: AvailableUpsell
	});
	
	var API = {
		findAll: function(productCode) {
			var dfd = $.Deferred();
			
			$.ajax(App.config.api.availableUpsells.findAll, {
				data: { productCode: productCode }
			}).done(function(response, status, xhr) {
				var upsells = response.products;
				App.db.available.upsells.insert(upsells);
				
				var availableUpsells = new AvailableUpsells(upsells);
				dfd.resolve(availableUpsells);
			});
			
			return dfd.promise();
		},
		init: function() {
			App.db.available.upsells = TAFFY();
		},
		reset: function() {
			this.init();
		}
	};
	
	App.reqres.setHandlers({
		'availableupsells:entity:findAll': function(productCode) {
			return API.findAll(productCode);
		}
	});
	
	App.commands.setHandlers({
		'availableupsells:entity:init': function() {
			API.init();
		},
		'availableupsells:entity:reset': function() {
			API.reset();
		}
	});
	
}, WOS, TAFFY);;Store.module('Entities', function (Entities, App, Backbone, Marionette, $, _, WOS, TAFFY) {
	'use strict';
	
	App.reqres.setHandlers({
		'cart:save': function(cartId, productCode) {
			
			var dfd = $.Deferred();
			
			$.when(
				App.request('addedmeals:entity:findAll'),
				App.request('addedupsells:entity:findAll')
			).done(function(addedMealsCollection, addedUpsellsCollection) {
				
				// 3 items go into the POST data, i.e. status, cartItems, upsellItems
				var data = {};
				
				// STATUS
				data.status = {
					refCartId: cartId,
					refProductCode: productCode
				};
				
				// CART ITEMS
				data.cartItems = addedMealsCollection.toJSON();
				
				_.each(data.cartItems, function(cartItem) {
					var choices = App.db.added.choices().filter({
						mealid: cartItem.___id
					}).get();
					
					var components = App.db.added.components().filter({
						mealid: cartItem.___id
					}).get();
					
					// Gotta delete those items that are not needed on the backend.
					// TODO: instead of removing those we dont need, take only those we need
					delete cartItem.___id;
					delete cartItem.___s;
					delete cartItem.displayPrice;
					delete cartItem.productPrice;
					delete cartItem.cartName;
					delete cartItem.menuName;
					delete cartItem.variationName;
					delete cartItem.images;
					delete cartItem.availability;
					delete cartItem.grillable;
					delete cartItem.badges;
					delete cartItem.addditionInfo;
					
					cartItem.choices = choices;
					cartItem.components = components;
					
					_.each(cartItem.choices, function(choice) {
						delete choice.___id;
						delete choice.___s;
						delete choice.mealid;
						delete choice.selectedSolutionCartName;
					});
					
					_.each(cartItem.components, function(component) {
						delete component.___id;
						delete component.___s;
						delete component.mealid;
						delete component.cartName;
					});
				});
				
				// UPSELL ITEMS
				data.upsellItems = addedUpsellsCollection.toJSON();
				_.each(data.upsellItems, function(upsellItem) {
					delete upsellItem.___id;
					delete upsellItem.___s;
					delete upsellItem.displayPrice;
					delete upsellItem.productPrice;
					delete upsellItem.cartName;
					delete upsellItem.menuName;
					delete upsellItem.variationName;
					delete upsellItem.images;
					delete upsellItem.availability;
					delete upsellItem.grillable;
					delete upsellItem.badges;
					delete upsellItem.addditionInfo;
					delete upsellItem.choices;
					delete upsellItem.components;
				});
				
				if (App.config.debug) {
					console.log('Saving: ');
					console.dir(data);
				}
				
				$.ajax(App.config.api.cart.save, {
					data: JSON.stringify(data),
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					complete: function(xhr, status) {
						dfd.resolve();
					}
				});
			});
		
			return dfd.promise();
		}
	});
	
}, WOS, TAFFY);
