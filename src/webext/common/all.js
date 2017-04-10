export function compareInt(a, b) {
    // sort asc by integer
    return a - b; // sort asc
}
export function compareIntThenLex(a, b) {
    // sort ascending by integer, and then lexically
	// ['1', '10', '2'] ->
	// ['1', '2', '10']

    let inta = parseInt(a, 10);
    let intb = parseInt(b, 10);
    let isaint = !isNaN(inta);
    let isbint = !isNaN(intb);
    if (isaint && isbint) {
        return inta - intb; // sort asc
    } else if (isaint && !isbint) {
        return -1; // sort a to lower index then b
    } else if (!isaint && isbint) {
        return 1; // sort b to lower index then a
    } else {
        // neither are int's
        return a.localeCompare(b)
    }
}

export function createGQLQuery(obj) {
  let result = Object.keys(obj).map((k) => {
    let query = `${k}`;
    let element = obj[k];
    if (element) {
      if (element.aliasFor) {
        query = `${k}:${element.aliasFor}`;
      }
      if (element.fragment) {
        query = `fragment ${k} on ${element.fragment}`;
      }
      if (element.args) {
        let args = Object.keys(element.args).map((argKey) => {
          let argVar = "", processed = false;
          if (element.processArgs) {
            if (element.processArgs[argKey]) {
              argVar = element.processArgs[argKey](element.args[argKey]);
              processed = true;
            }
          }
          if (!processed) {
            if (typeof element.args[argKey] === "object") {
              argVar = JSON.stringify(element.args[argKey]).replace(/"([^(")"]+)":/g, "$1:");
            } else {
              argVar = `"${element.args[argKey]}"`;
            }
          }
          return `${argKey}:${argVar}`;
        }).join();
        query = `${query}(${args})`;
      }
      if (element.fields) {
        let fields = createGQLQuery(element.fields);
        query = `${query}${fields}`;
      }
    }
    return `${query}`;
  }).join();
  console.error(`createGQLQuery RESULT: {${result}}`);
  return `{${result}}`;
}

export function calcSalt({
        sensitive=false, // case sensitive
        len=8 // length of salt
    }) {
	// salt generator from http://mxr.mozilla.org/mozilla-aurora/source/toolkit/profile/content/createProfileWizard.js?raw=1*/

	let mozKSaltTable = sensitive ? [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
		'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
		'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
	] : [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
		'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
	];

	let kSaltString = '';
	for (let i = 0; i < len; ++i) {
		kSaltString += mozKSaltTable[Math.floor(Math.random() * mozKSaltTable.length)];
	}
	return kSaltString;
	// return kSaltString + '.' + aName;
}

export function deepAccessUsingString(obj, dotpath, defaultval){
    // defaultval is returned when it is not found, by default, defaultval is undefined, set it to "THROW" if you want it to throw

    // super simple version:
    // const deepAccessUsingString = (obj, key) => key.split('.').reduce((nested, key) => nested && key in nested) ? nested[key] : undefined, obj);

    let keys = dotpath.split('.');
    let nested = obj;
    for (let key of keys) {
        if (nested && key in nested) nested = nested[key]; // `key in nested` this is point of concern. as `in` works with Array,Set,Map (and i dont know maybe more type) too. i am assuming that nested is always an object
        else
            if (defaultval === 'THROW') throw new Error('deepAccessUsingString: missing "' + dotpath + '"');
            else return defaultval;
    }

    return nested;
}

export function deepSetUsingString(obj, dotpath, newval) {
    // throws if set fails
    // may want to update to - http://stackoverflow.com/a/13719799/1828637

    var stack = dotpath.split('.');

    let nesteddotpath = [];
    while(stack.length > 1){
        let dot = stack.shift();
        nesteddotpath.push(dot);
        obj = obj[dot];
        if (!isObject(obj)) throw new Error(`Found non object at dot path level of "${nesteddotpath.join('.')}". Instead of object, it is "${obj.toString()}". Was trying to set full dotpath of "${dotpath}".`);
    }

    obj[stack.shift()] = newval;

    // let keys = dotpath.split('.');
    // let nested = obj;
    // let nesteddotpath = [];
    // for (let key of keys) {
    //     if (!isObject(nested)) throw new Error(`Found non object at dot path level of "${nesteddotpath.join('.')}". Instead of object, it is "${nested.toString()}". Was trying to set full dotpath of "${dotpath}".`);

    //     nesteddotpath.push(key);
    //     nested = nested[key];
    // }
    // nested = newval;
}

export function isObject(avar) {
    // cosntructor.name tested for `function Animal(){}; var a = new Animal(); isObject(a);` will return true otherwise as it is [Object object]
    return Object.prototype.toString.call(avar) === '[object Object]' && avar.constructor.name === 'Object';
}

export async function wait(ms) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms));
}

export async function retry(callback, {cnt, sec, interval=1000}={}) {
    if (cnt === undefined && sec === undefined) {
        cnt = 10;
    }
    // either supply cnt or sec
        // set sec or cnt to 0 if you want to try endlessly
    // if neither supplied default is 10 retries
    // interval is ms, defauls to 1000

	// callback should return promise
        // throw new Error('STOP' + message) in order to stop retrying and throw the `message`
        // throw new Error() to just say it failed, it will keep retrying
    // callback gets one arg, which is try number, base 0

    // promise resolved or rejected with new Error(FAILED_KEYWORD)

    // set cnt
    if (cnt === 0 || sec === 0) cnt = Infinity;
    else if (sec) cnt = Math.max(Math.floor((sec * 1000) / interval), 1);

    const STOP_KEYWORD = 'STOP';
    const FAILED_KEYWORD = 'FAIL';

    let retries = 0;
    while (retries < cnt) {
        try {
            return await callback(retries);
        } catch(err) {
             // STOP_RETRIES short for STOP_RETRIES_AND_THROW
            if (err.message.startsWith(STOP_KEYWORD)) throw new Error(err.message.substr(STOP_KEYWORD.length));
            else if (++retries < cnt) {
                console.log(err.message)
                await wait(interval);
            }
            else throw new Error(FAILED_KEYWORD);
        }
    }
}

export function escapeRegex(text) {
    let specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
    let sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	return text.replace(sRE, '\\$1');
	// if (!arguments.callee.sRE) {
	// 	var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
	// 	arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	// }
	// return text.replace(arguments.callee.sRE, '\\$1');
}

// https://github.com/github/fetch/issues/175#issuecomment-284787564
export function timeout(ms, promise) {
    return new Promise(function(resolve, reject) {
        setTimeout(()=>reject(new Error('TIMEOUT')), ms)
        promise.then(resolve, reject)
    })
}

// http://stackoverflow.com/q/196972/1828637
// consider not proper casing small words - http://php.net/manual/en/function.ucwords.php#84920 - ['of','a','the','and','an','or','nor','but','is','if','then', 'else','when', 'at','from','by','on','off','for','in','out', 'over','to','into','with'];
export function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

export function mapTruthy(target, mapper) {
    // target is array
    // mapper gets same args Array.prototype.map gets, currentValue, index, array
    // if element in array is undefined/null/false/0, it is skipped
    return target.reduce((acc, el, ix) => {
        if (el) acc.push(mapper(el, ix, acc))
        return acc;
    }, []);
}