'use babel';

import fs from 'fs';

//what: 関数を実行するthis; first, second : Array; func :Function;
export function doOnlySecond(what, first, second, func) {
  const kErr = -1;

  for (let v of second) {
    if(first.indexOf(v) === kErr) {
      func.call(what, v);
    }
  }
  return first;
}

//first, second : Array;
export function getOnlySecond(first, second) {
  const kErr = -1;
  let result = [];

  for (let v of second) {
    if(first.indexOf(v) === kErr) {
      result.push(v)
    }
  }
  return result;
}

export function binarySearch(array, target, compare) {
  let left = 0;
  let right = array.length -1;
  let middle = 0;
  let cmp = 0;

  while(left <= right) {
    middle = (left + right) >> 1;
    cmp = compare(target, array[middle]);
    if(cmp === 0) {
      return middle;
    }
    if(cmp < 0) {
      right = middle - 1;
    } else {
      left = middle + 1;
    }
  }
  return -1;
}
/*
switch (typeof i) {
  case 'object':
  case 'undefined':
  case 'number':
  case 'string':
  case 'boolean':
  case 'function':
  default:
*/
/*
let oa = {x: 1, y: 2}
let ob = deepCopyX(oa);
let oc = oa;
let a = [1, 2, oa, 4];
let b = deepCopyX(a);
let c = a;
console.log(oa, ob, oc, a, b, c);
a[0] = 111;
a[2].x = 111;
console.log(oa, ob, oc, a, b, c);
*///

//need more test
export function deepCopy(data) {
  if(typeof data !== 'object') {
    return data;
  }

  let result = null;

  if( Object.prototype.toString.call(data) === '[object Array]') {
    result = [];
  } else {
    result = {};
  }

  for(let i of Object.keys(data)) {
    if(typeof data[i] === 'object') {
      result[i] = deepCopy(data[i]);
    } else {
      result[i] = data[i];
    }
  }
  return result;
}

export function checkInteger(num, minimum, maximam){
  if( Number.isInteger(num) === false || minimum&&(num < minimum) || maximam&&(num > maximam)) {
    return false;
  }
  return true;
}

export function stringToBoolean(bool){
  return bool === "true" ? true : false;
}

function unicodeEscapeSequenceReplacer(match, p1, offset, string){
  return String.fromCodePoint(parseInt(p1, 16));
}

export function unicodeEscapeSequenceToChar(string) {
  const kUnicode = /\\u{?([A-Fa-f0-9]+)}?/g;

  return string.replace(kUnicode, unicodeEscapeSequenceReplacer);
}

export function stringToRegex(string) {
  const kCheckRegex1 = /\/(.*)\/(.*)/;   //use this forconvert string to Regex
  const kCheckRegex2 = /^[gimy]{0,4}$/;  //for check regular expression. whether flags are valid or not
  const kCheckRegex3 = /(.).*?\1/;       //for check regular expression. whether flags are duplicate or not
  let match = kCheckRegex1.exec(string);

  if ( match !== null
    && match[1] !== ''
    && kCheckRegex2.test(match[2])  //flag checking
    && !kCheckRegex3.test(match[2]) //duplicate
  ) {
    return new RegExp(match[1], match[2]);
  }
  return null;
}

//targetStrの中にあるsearchStrをreplaceStrに置き換える
//前にnPrevと、後ろにnNextがない場合に限る
//nPrevとnNextが空文字列の場合は、判定に使われない
export function replace(targetStr, searchStr, replaceStr, nPrev, nNext) {
  let result = targetStr
  for(let i = 0; i < result.length; ++i) {
    if(result.substr(i, searchStr.length) === searchStr
      && checkSubStr(result, i - nPrev.length, nPrev) === false
      && checkSubStr(result, i + searchStr.length, nNext) === false) {
      result = result.slice(0, i) + replaceStr + result.slice(i + searchStr.length);
    }
  }
  return result;
}

//targetStrの部分文字列とsearchStrを比較する
//searchStrが空文字列の場合は比較しないでfalseを返す
function checkSubStr(targetStr, pos, searchStr) {
  if(searchStr === '' || pos < 0 || pos + searchStr.length > targetStr.length ) {
    return false;
  }
  return targetStr.substr(pos, searchStr.length) === searchStr;
}

//負の数の場合か、長さが足りない場合には空文字列を返す
export function getSubStr(str, pos, len) {
  if(pos < 0 || pos + len > str.length) {
    return '';
  }
  return str.substr(pos, len);
}

export function setTargetProperty(target, property) {
  return (val) => {
    target[property] = val;
  };
}

//
export function returnValueIfEmpty(str, value) {
  if(typeof str === 'undefined' || str === null || str === '') {
    return value;
  }
  return str;
}

export function isEmpty(obj) {
  if(typeof obj === 'undefined' || obj === null) {
    return true;
  }
  return false;
}

export function isEmptyString(str) {
  if(typeof str === 'undefined' || str === null || str === '') {
    return true;
  }
  return false;
}

export function checkVal(val, defaultVal) {
  if(typeof val !== 'undefined') {
    return val;
  }
  return defaultVal;
}

//shallowCopyTargetProperty(target, source, property1, ...)
export function shallowCopyTargetProperty(target, source) {
  let properties = Object.keys(target);

  for(let i = 0; i < properties.length; ++i) {
    if(source.hasOwnProperty(properties[i])) {
      target[properties[i]] = source[properties[i]];
    }
  }
}

//オブジェクトの配列から、プロパティのみの配列を返す
export function getPropertyArrayFromObjArray(arrayObj, property) {
  let temp = [];

  for(let i = 0; i < arrayObj.length; ++i) {
    temp.push(arrayObj[i][property]);
  }
  return temp;
}

export function toArrayBuffer(buf) {
  let ab = new ArrayBuffer(buf.length);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

export function toBuffer(ab) {
  let buf = new Buffer(ab.byteLength);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

/*
file
*/

export function isFileExist(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'r', (err, fd) => {
      if(!err) {
        resolve(true);
        return;
      }
      if(err.code === "ENOENT") {
        resolve(false);
        return;
      }
      reject(err);
    });
  });
}

export function mkDir(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'r', (err, fd) => {
      if(!err) {
        resolve(fd);
        return;
      }

      if(err.code === "ENOENT") {
        fs.mkdirSync(path);
        resolve(fd)
        return;
      }
      reject(err);
    });
  });
}

export function getExtension(path) {
  if(/\./.test(path)) {
    return path.split('.').pop();
  }
  return "";
}
/*
function setDefault(obj, property, value) {
  if(!obj.hasOwnProperty(property)) {
    option[property] = value;
  }
}
//*/

export function logLine(var_args) {
  let args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
  for (data of args) {
    console.log(data);
  }
}

// regex.textで良いのではないか? match した結果から文字列の事もある
export function isMatchValidString(execResult) {
  if(execResult && execResult[0] !== '') {
    return true;
  }
  return false;
}

export function logProperty(obj, property) {
  console.log(property, obj[property]);
}

export function logReg(reg) {
  logProperty(reg, 'source');
  logProperty(reg, 'lastIndex');
  logProperty(reg, 'ignoreCase');
  logProperty(reg, 'multiline');
}

export function getMatchRange(regString, flag, string) {
  let reg = new RegExp(regString, flag);
  let result = reg.exec(string);
  if(result !== null) {
    return [result.index, reg.lastIndex];
  }
  return null;
}

export function getReversedNewArray(array) {
  let result = array.slice();
  return result.reverse();
}

// justification : string 'left', 'right', 'left_lead_minus'
export function paddingNumber(num, base, place, upperCase, paddingChar, justification) {

  let str = num.toString(base);
  if(upperCase) {
    str = str.toUpperCase();
  }
  if(place === 0) {
    return str;
  }

  let len = str.length;
  let result = '';
  while((place - len++) > 0) {
    result = result.concat(paddingChar);
  }

  if(justification === 'left') {
    result = str.concat(result);
  } else {
    result = result.concat(str);
  }
  if(justification === 'right_lead_minus') {
    result = result.replace(/.(.*)-(.+)/gi, '-$1'+paddingChar+'$2');
  }

  return result;
}
