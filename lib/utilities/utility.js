"use babel";

import fs from "fs";

const kNumberRegex = /[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/;
const kNumberRegexG = /[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/g;

//what: 関数を実行するthis; first, second : Array; func :Function;
function doOnlySecond(what, first, second, func) {
  const kErr = -1;

  for (let data of second) {
    if (first.indexOf(data) === kErr) {
      func.call(what, data);
    }
  }
  return first;
}

//first, second : Array;
function getOnlySecond(first, second) {
  const kErr = -1;
  let result = [];

  for (let data of second) {
    if (first.indexOf(data) === kErr) {
      result.push(data);
    }
  }
  return result;
}

function binarySearch(array, target, compare) {
  let left = 0;
  let right = array.length - 1;
  let middle = 0;
  let cmp = 0;

  while (left <= right) {
    middle = Math.floor((left + right) / 2); //( left + right ) >> 1;
    cmp = compare(target, array[middle]);
    if (cmp === 0) {
      return middle;
    }
    if (cmp < 0) {
      right = middle - 1;
    } else {
      left = middle + 1;
    }
  }
  return -1;
}

function deepCopy(obj) {
  if (typeof obj !== "object") {
    return obj;
  }
  return Object.assign({}, obj);
}

function checkInteger(num, minimum, maximam) {
  if (Number.isInteger(num) === false || (minimum && (num < minimum)) || (maximam && (num > maximam))) {
    return false;
  }
  return true;
}

//先頭に+を許すかどうか
function stringToNumber(string) {
  let result = kNumberRegex.exec(string);
  if (string.length !== result[0].length) {
    return NaN;
  }
  return Number(result[0]); //new なしだと数値を返す
}

function stringToBoolean(string) {
  return string === "true";
}

function unicodeEscapeSequenceReplacer(_match, p1, _offset, _string) {
  return String.fromCodePoint(parseInt(p1, 16));
}

function unicodeEscapeSequenceToChar(string) {
  const kUnicode = /\\u{?([A-Fa-f0-9]+)}?/g;

  return string.replace(kUnicode, unicodeEscapeSequenceReplacer);
}

function stringToRegex(string) {
  const kCheckRegex1 = /\/(.*)\/(.*)/; //use this forconvert string to Regex
  const kCheckRegex2 = /^[gimy]{0,4}$/; //for check regular expression. whether flags are valid or not
  const kCheckRegex3 = /(.).*?\1/; //for check regular expression. whether flags are duplicate or not
  let match = kCheckRegex1.exec(string);

  if (match !== null &&
    match[1] !== "" &&
    kCheckRegex2.test(match[2]) && //flag checking
    !kCheckRegex3.test(match[2]) //duplicate
  ) {
    return new RegExp(match[1], match[2]);
  }
  return null;
}

//targetStrの部分文字列とsearchStrを比較する
//searchStrが空文字列の場合は比較しないでfalseを返す
function checkSubStr(targetStr, pos, searchStr) {
  if (searchStr === "" || pos < 0 || pos + searchStr.length > targetStr.length) {
    return false;
  }
  return targetStr.substr(pos, searchStr.length) === searchStr;
}

//targetStrの中にあるsearchStrをreplaceStrに置き換える
//前にnPrevと、後ろにnNextがない場合に限る
//nPrevとnNextが空文字列の場合は、判定に使われない
function replace(targetStr, searchStr, replaceStr, nPrev, nNext) {
  let result = targetStr;
  for (let i = 0; i < result.length; ++i) {
    if (result.substr(i, searchStr.length) === searchStr &&
      checkSubStr(result, i - nPrev.length, nPrev) === false &&
      checkSubStr(result, i + searchStr.length, nNext) === false) {
      result = result.slice(0, i) + replaceStr + result.slice(i + searchStr.length);
    }
  }
  return result;
}

//負の数の場合か、長さが足りない場合には空文字列を返す
function getSubStr(str, pos, len) {
  if (pos < 0 || pos + len > str.length) {
    return "";
  }
  return str.substr(pos, len);
}

function setTargetProperty(target, property) {
  return (val) => {
    target[property] = val;
  };
}

//
function returnValueIfEmpty(str, value) {
  if (typeof str === "undefined" || str === null || str === "") {
    return value;
  }
  return str;
}

//enumerable を含めるかどうかで分けないといけないかも
function isEmptyObject(obj) {
  if (typeof obj === "undefined" || obj === null) {
    return true;
  }
  if (Object.getOwnPropertyNames(obj).length === 0) {
    //if (Object.keys(obj).length === 0 && Object.getOwnPropertyNames(obj).length === 0) {
    return true;
  }
  return false;
}

function isEmptyString(str) {
  if (typeof str === "undefined" || str === null || str === "") {
    return true;
  }
  return false;
}

function pushNotEmpty(array, data) {
  if (!isEmptyString(data)) {
    array.push(data);
  }
}

function checkVal(val, defaultVal) {
  if (typeof val !== "undefined") {
    return val;
  }
  return defaultVal;
}

//targetとsourceで共通のプロパティをコピーする
function shallowCopyTargetProperty(target, source) {
  let properties = Object.keys(target);

  for (let i = 0; i < properties.length; ++i) {
    if (source.hasOwnProperty(properties[i])) {
      target[properties[i]] = source[properties[i]];
    }
  }
}

//オブジェクトの配列から、プロパティのみの配列を返す
function getPropertyArrayFromObjArray(arrayObj, property) {
  let temp = [];

  for (let i = 0; i < arrayObj.length; ++i) {
    temp.push(arrayObj[i][property]);
  }
  return temp;
}

function toArrayBuffer(buf) {
  let ab = new ArrayBuffer(buf.length);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

function toBuffer(ab) {
  let buf = Buffer.alloc(ab.byteLength);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

/*
file
*/

function isFileExist(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, "r", (err, _fd) => {
      if (!err) {
        resolve(true);
        return;
      }
      if (err.code === "ENOENT") {
        resolve(false);
        return;
      }
      reject(err);
    });
  });
}

function mkDir(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, "r", (err, fd) => {
      if (!err) {
        resolve(fd);
        return;
      }

      if (err.code === "ENOENT") {
        fs.mkdirSync(path);
        resolve(fd);
        return;
      }
      reject(err);
    });
  });
}

function getExtension(path) {
  if (/\./.test(path)) {
    return path.split(".").pop();
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

function logLine(...args) {
  for (let data of args) {
    console.log(data);
  }
}

//regex.textで良いのではないか? match した結果から文字列の事もある
function isMatchValidString(execResult) {
  if (execResult && execResult[0] !== "") {
    return true;
  }
  return false;
}

function logProperty(obj, property) {
  console.log(property, obj[property]);
}

function logRegex(reg) {
  logProperty(reg, "source");
  logProperty(reg, "lastIndex");
  logProperty(reg, "ignoreCase");
  logProperty(reg, "multiline");
}

function getMatchRange(regString, flag, string) {
  let reg = null;
  try {
    reg = new RegExp(regString, flag);
  } catch (_err) {
    return null;
  }

  let result = reg.exec(string);
  if (result !== null) {
    return [result.index, reg.lastIndex];
  }
  return null;
}

//string内でregexにマッチした全ての文字列・開始位置・終了位置を返す
function getAllMatchAndRange(regex, string) {
  if (!regex.global) {
    return [];
  }

  let resultArray = [];
  regex.lastIndex = 0;
  let result = regex.exec(string);
  while (result !== null) {
    resultArray.push([result[0], result.index, regex.lastIndex]);
    result = regex.exec(string);
  }
  return resultArray;
}

function getReversedNewArray(array) {
  let result = array.slice();
  return result.reverse();
}

//align : string "left", "right", "left_lead_sign"
//sign : "minus", "plus", "space"
function paddingNumber(num, radix, digits, upperCase, paddingChar, sign, align) {
  let str = num.toString(radix);
  if (upperCase) {
    str = str.toUpperCase();
  }
  if (digits === 0) {
    return str;
  }

  if (sign === "plus" && num >= 0) {
    str = `+${str}`;
  } else if (sign === "space" && num >= 0) {
    str = ` ${str}`;
  }

  let len = str.length;
  let result = "";
  while ((digits - len++) > 0) {
    result += paddingChar;
  }

  if (align === "left") {
    result = str + result;
  } else {
    result += str;
  }

  if (align === "right_lead_sign") {
    result = result.replace(/.(.*)([-+ ])(.+)/i, `$2$1${paddingChar}$3`);
  }

  return result;
}

function enclose(string, openChar = "\"", closeChar = "\"") {
  return openChar + string + closeChar;
}

//index の位置から前にcharがいくつあるか数える
//string = "aabbccddee" , index = 6, char = "c", return = 2
function backCountSequentialChar(string, index, char) {
  let count = 0;
  for (let i = index - 1; i >= 0; --i) {
    if (string[i] !== char) {
      break;
    }
    ++count;
  }
  return count;
}

function countCapturingGroup(string) {
  let count = 0;
  let flag = false;
  for (let i = 0; i < string.length; ++i) {
    if (string[i] === "(" &&
      i + 1 < string.length && string[i + 1] !== "?" &&
      backCountSequentialChar(string, i, "\\") % 2 === 0) {
      flag = true;
    } else if (flag && string[i] === ")" &&
      backCountSequentialChar(string, i, "\\") % 2 === 0) {
      flag = false;
      ++count;
    }
  }
  return count;
}

//direction 1, -1
//need test
function circulationSearch(array, current, direction, func) {
  let start = 0;
  let end = array.length - 1;
  if (direction === -1) {
    start = array.length - 1;
    end = 0;
  }

  for (let i = current; i * direction <= end * direction; i += direction) {
    if (func(array[i])) {
      return i;
    }
  }
  for (let i = start; i * direction < current * direction; i += direction) {
    if (func(array[i])) {
      return i;
    }
  }

  return -1;
}

//16進数や2進数はどうするか?
function separateAlphabetNumber(string) {
  let result = [string];
  let numbers = getAllMatchAndRange(kNumberRegexG, string);
  if (numbers.length !== 0) {
    result = [];
    pushNotEmpty(result, string.substring(0, numbers[0][1]));
    for (let i = 0; i < numbers.length - 1; ++i) {
      result.push(numbers[i][0]); //1230と123を区別するためにこの時点では数値にしない
      pushNotEmpty(result, string.substring(numbers[i][2], numbers[i + 1][1]));
    }
    result.push(numbers[numbers.length - 1][0]);
    pushNotEmpty(result, string.substring(numbers[numbers.length - 1][2]));
  }
  return result;
}

function isEscapedChar(string, index) {
  if (backCountSequentialChar(string, index, "\\") % 2 === 1) {
    return true;
  }
  return false;
}

function getEnclosedString(string, encloseChar, include) {
  let result = [];
  let start = -1;
  for (let i = 0; i < string.length; ++i) {
    if (string[i] === encloseChar) { //&& !isEscapedChar(string, i)) {
      if (start === -1) {
        start = i;
      } else {
        if (include) {
          result.push(string.substring(start, i + 1));
        } else {
          result.push(string.substring(start + 1, i));
        }
        start = -1;
      }
    }
  }
  return result;
}

function escapeSpecialCharacters(string) {
  const kSpecialCharacters = /([\\^$*+?.()|{}[\]])/g;
  return string.replace(kSpecialCharacters, "\\$1");
}

function caseSensitiveCompare(xString, yString, insensitive = false) {
  let x = xString;
  let y = yString;
  if (insensitive) {
    if (typeof xString === "string") {
      x = xString.toLowerCase();
    }
    if (typeof yString === "string") {
      y = yString.toLowerCase();
    }
  }

  if (x < y) {
    return -1;
  }
  if (x > y) {
    return 1;
  }
  if (!insensitive) {
    return 0;
  }
  return caseSensitiveCompare(xString, yString, false);
}

function naturalSortCompare(xString, yString, insensitive = false) {
  let xArray = separateAlphabetNumber(xString);
  let yArray = separateAlphabetNumber(yString);
  let count = xArray.length < yArray.length ? xArray.length : yArray.length;

  for (let i = 0; i < count; ++i) {
    let x = xArray[i];
    let y = yArray[i];

    if (kNumberRegex.test(xArray[i])) {
      x = stringToNumber(xArray[i]);
    }
    if (kNumberRegex.test(yArray[i])) {
      y = stringToNumber(yArray[i]);
    }
    let result = caseSensitiveCompare(x, y, insensitive);
    if (result !== 0) {
      return result;
    }
    //末尾が0の場合の判定. 1.20, 1.2
    if (x === y &&
      typeof x === "number" &&
      typeof y === "number"
    ) {
      result = caseSensitiveCompare(x, y, insensitive);
      if (result !== 0) {
        return result;
      }
    }
  }
  return caseSensitiveCompare(xArray.length, yArray.length, true);
}

// stringToArray Array.from(string)
function stringToNumberArray(string, separator = "", setNaN = null) {
  if (isEmptyString(string)) {
    return [];
  }

  let array = string.split(separator);
  for (let i = 0; i < array.length; ++i) {
    array[i] = parseInt(array[i].trim(), 10);
    if (isNaN(array[i]) && setNaN !== null) {
      array[i] = setNaN;
    }
  }
  return array;
}

function uniqueArray(array) {
  return array.filter((x, i, arr) => {
    return arr.indexOf(x) === i;
  });
}

function filterArray(array, validDatas) {
  return array.filter((x, _i, _arr) => {
    for (let data of validDatas) {
      if (x === data) {
        return true;
      }
    }
    return false;
  });
}

function filterArrayThreshold(array, min = null, max = null) {
  return array.filter((x, _i, _arr) => {
    if (min !== null && x >= min &&
      max !== null && x <= max) {
      return true;
    }
    if (max === null && min && x >= min) {
      return true;
    }
    if (min === null && max && x <= max) {
      return true;
    }
    return false;
  });
}

function splitWithSeparator(string, separator = "") {
  let result = string.split(separator);
  for (let i = 0; i < result.length; i++) {
    result[i] += separator;
  }
  return result;
}

function uniqueFilter(e, i, arr) {
  return arr.indexOf(e) === i;
}

//////
export {
  kNumberRegex,
  kNumberRegexG,
};

export {
  doOnlySecond,
  getOnlySecond,
  binarySearch,
  circulationSearch,
  deepCopy,
  checkInteger,
  stringToBoolean,
  stringToNumber,
  stringToRegex,
  unicodeEscapeSequenceToChar,
  replace,
  checkSubStr,
  getSubStr,
  setTargetProperty,
  returnValueIfEmpty,
  isEmptyObject,
  isEmptyString,
  checkVal,
  shallowCopyTargetProperty,
  getPropertyArrayFromObjArray,
  toArrayBuffer,
  toBuffer,
  isFileExist,
  mkDir,
  getExtension,
  logLine,
  isMatchValidString,
  logProperty,
  logRegex,
  getMatchRange,
  getAllMatchAndRange,
  getReversedNewArray,
  paddingNumber,
  enclose,
  countCapturingGroup,
  pushNotEmpty,
  separateAlphabetNumber,
  isEscapedChar,
  getEnclosedString,
  escapeSpecialCharacters,
  caseSensitiveCompare,
  naturalSortCompare,
  stringToNumberArray,
  uniqueArray,
  filterArray,
  filterArrayThreshold,
  splitWithSeparator,
  uniqueFilter,
};
