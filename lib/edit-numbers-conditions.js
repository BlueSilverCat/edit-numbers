'use babel';

import { isEmptyString, paddingNumber, getMatchRange } from './utility';

export default class ENConditions {
  constructor(conditions) {
    this.prefix = conditions && conditions.hasOwnProperty('prefix') ? conditions.prefix : ''; //string
    this.suffix = conditions && conditions.hasOwnProperty('suffix') ? conditions.suffix : ''; //string

    this.targetType = conditions && conditions.hasOwnProperty('targetType') ? conditions.target : 'decimal'; //string
    this.customTarget = conditions && conditions.hasOwnProperty('customTarget') ? conditions.target : ''; //string

    this.start = conditions && conditions.hasOwnProperty('start') ? conditions.start : 0; //number
    this.end = conditions && conditions.hasOwnProperty('end') ? conditions.end : 0; //number
    this.place = conditions && conditions.hasOwnProperty('place') ? conditions.place : 0; //number
    this.paddingChar = conditions && conditions.hasOwnProperty('paddingChar') ? conditions.paddingChar : '0'; //string
    this.increment = conditions && conditions.hasOwnProperty('increment') ? conditions.increment : 1; //number
    this.add = conditions && conditions.hasOwnProperty('add') ? conditions.add : 0; //number
    this.multiply = conditions && conditions.hasOwnProperty('multiply') ? conditions.multiply : 1; //number

    this.base = conditions && conditions.hasOwnProperty('base') ? conditions.base : 10; //number
    this.upperCase = conditions && conditions.hasOwnProperty('upperCase') ? conditions.upperCase : true; //number
    this.editType = conditions && conditions.hasOwnProperty('editType') ? conditions.editType : 'overwrite'; //string
    this.justification = conditions && conditions.hasOwnProperty('justification') ? conditions.justification : true; //string right

    this.fromFirst = conditions && conditions.hasOwnProperty('fromFirst') ? conditions.fromFirst : false; //bool
    this.ignoreCase = conditions && conditions.hasOwnProperty('ignoreCase') ? conditions.ignoreCase : false; //bool

    this.newLine = conditions && conditions.hasOwnProperty('newLine') ? conditions.newLine : 1; //bool;
    this.currentNumber = 0;

    this.initialize();
  }

  static getDecimalRegexString() {
    return '-?\\d+';
  }
  static getHexadecimalRegexString() {
    return '-?[0-9a-fA-F]+';
  }

  initialize() {
    this.currentNumber = 0;
    //if(this.start > this.end && this.increment > 0) {
    //  this.increment *= -1;
    //}
  }

  update() {
    this.currentNumber += this.increment;
    //if(this.start === this.end) {
    //  return;
    //}
    if(this.start < this.end && this.increment > 0 &&
      this.currentNumber + this.start > this.end) {
      this.initialize();
    } else if(this.start > this.end && this.increment < 0 &&
      this.currentNumber + this.start < this.end) {
      this.initialize();
    }
  }

  /*
  getNumber(numberString) {
    if(isNotEmpty(numberString)) {
      return this.getString(parseInt(numberString, this.base) * this.multiply + this.add + this.currentNumber);
    } else {
      return this.getString(this.add + this.currentNumber);
    }
  }
  */

  getNumberString(numberString) {
    let num = this.start;
    //if(this.editType !== 'modify') {
    //  num = this.start;
    //} else
    if(!isEmptyString(numberString) && this.editType === 'modify'){
      num += parseInt(numberString, 10); //内部では全て10進数で計算している
    }
    num = num * this.multiply + this.add + this.currentNumber;
    return paddingNumber(num, this.base, this.place, this.upperCase, this.paddingChar, this.justification);
  }

  getReplacedText(string) {
    let indexes = this.getIndexes(string);
    let result = '';
    if(indexes[1][0] !== 0) {
      result = this.getNumberString(string.substr(indexes[0][1], indexes[1][0]));
    } else {
      result = this.getNumberString(string.substr(indexes[0][1]));
    }
    result = string.substr(indexes[0][0], indexes[0][1]).concat(result).concat(string.substr(indexes[1][0], indexes[1][1]));
    return result;
  }

  getRegex() { //単純に連結してしまったら当初の目的を果たせない?
    let target = '';
    if(this.targetType === 'decimal') {
      target = ENConditions.getDecimalRegexString();
    } else if(this.targetType === 'hexadecimal') {
      target = ENConditions.getHexadecimalRegexString();
    } else if(this.targetType === 'custom') {
      target = this.customTarget;
    }

    let regex = this.prefix.concat(this.suffix);
    if(this.editType !== 'insert') {
      regex = this.prefix.concat(target).concat(this.suffix);
    }

    let flag = 'g';
    if(this.ignoreCase) {
      flag = 'gi';
    }

    return new RegExp(regex, flag);
  }

  getIndexes(string) {
    let flag = 'g'
    if(this.ignoreCase) {
      flag = 'gi';
    }

    let indexes = [[0, 0], [0, 0]]
    let result = null;
    if(this.prefix !== '') {
      result = getMatchRange(this.prefix, flag, string);
      if(result !== null) {
        indexes[0] = result;
      }
    }

    if(this.suffix !== '') {
      result = getMatchRange(this.suffix, flag, string.substr(indexes[0][1]));
      if(result !== null) {
        indexes[1][0] = indexes[0][1] + result[0];
        indexes[1][1] = indexes[0][1] + result[1];
      }
    }
    return indexes;
  }
}
