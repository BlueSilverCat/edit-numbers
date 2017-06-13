"use babel";

import { countCapturingGroup, enclose, isEmptyString, paddingNumber } from "./utilities/utility";

export default class ENConditions {
  constructor(conditions) {
    this.prefix = conditions && conditions.hasOwnProperty("prefix") ? conditions.prefix : ""; //string
    this.prefixCapturingGroup = conditions && conditions.hasOwnProperty("prefixCapturingGroup") ?
      conditions.prefixCapturingGroup : 0; //number;
    this.suffix = conditions && conditions.hasOwnProperty("suffix") ? conditions.suffix : ""; //string
    this.suffixCapturingGroup = conditions && conditions.hasOwnProperty("suffixCapturingGroup") ?
      conditions.suffixCapturingGroup : 0; //number;

    this.ignoreCase = conditions && conditions.hasOwnProperty("ignoreCase") ? conditions.ignoreCase : false; //bool

    this.targetType = conditions && conditions.hasOwnProperty("targetType") ? conditions.target : "decimal"; //string
    this.customTarget = conditions && conditions.hasOwnProperty("customTarget") ? conditions.target : ""; //string
    this.customTargetCapturingGroup = conditions && conditions.hasOwnProperty("customTargetCapturingGroup") ?
      conditions.customTargetCapturingGroup : 0;

    this.start = conditions && conditions.hasOwnProperty("start") ? conditions.start : 0; //number
    this.end = conditions && conditions.hasOwnProperty("end") ? conditions.end : 0; //number
    this.digits = conditions && conditions.hasOwnProperty("digits") ? conditions.digits : 1; //number
    this.paddingChar = conditions && conditions.hasOwnProperty("paddingChar") ? conditions.paddingChar : "0"; //string
    this.increment = conditions && conditions.hasOwnProperty("increment") ? conditions.increment : 1; //number
    this.add = conditions && conditions.hasOwnProperty("add") ? conditions.add : 0; //number
    this.multiply = conditions && conditions.hasOwnProperty("multiply") ? conditions.multiply : 1; //number

    this.radix = conditions && conditions.hasOwnProperty("radix") ? conditions.radix : 10; //number
    this.upperCase = conditions && conditions.hasOwnProperty("upperCase") ? conditions.upperCase : true; //number
    this.editType = conditions && conditions.hasOwnProperty("editType") ? conditions.editType : "overwrite"; //string
    this.align = conditions && conditions.hasOwnProperty("align") ? conditions.align : true; //string right

    this.newLine = conditions && conditions.hasOwnProperty("newLine") ? conditions.newLine : 1; //bool;
    this.currentNumber = 0;

    this.initialize();
  }

  static getDecimalRegexString() {
    this.customTargetCapturingGroup = 0;
    return "-?\\d+";
  }
  static getHexadecimalRegexString() {
    this.customTargetCapturingGroup = 0;
    return "-?[0-9a-fA-F]+";
  }

  initialize() {
    this.currentNumber = 0;
    //if(this.start > this.end && this.increment > 0) {
    //this.increment *= -1;
    //}
  }

  setRegex(string, property) {
    try {
      new RegExp(string);
      this[property] = string;
      this[`${property} CapturingGroup`] = countCapturingGroup(string);
    } catch (err) {
      atom.notifications.addError(`Invalid regular expression.${property}`, {
        "detail": err,
        "dissmiss": false,
      });
      this[property] = "";
      this[`${property} CapturingGroup`] = 0;
    }
  }

  update() {
    this.currentNumber += this.increment;
    if (this.start < this.end && this.increment > 0 &&
      this.currentNumber + this.start > this.end) {
      this.initialize();
    } else if (this.start > this.end && this.increment < 0 &&
      this.currentNumber + this.start < this.end) {
      this.initialize();
    }
  }

  getNumberString(numberString) {
    let num = this.start;
    if (!isEmptyString(numberString) && this.editType === "modify") {
      let targetRadix = this.targetType === "hexadecimal" ? 16 : 10;
      num += parseInt(numberString, targetRadix);
    }
    num = (num * this.multiply) + this.add + this.currentNumber;
    return paddingNumber(num, this.radix, this.digits, this.upperCase, this.paddingChar, this.align);
  }

  getRedigitsdText(string) {
    let indexes = this.getIndexes(string);
    let result = this.getNumberString(string.substr(indexes[0], indexes[1]));
    return string.substr(0, indexes[0]) + result + string.substr(indexes[1]);
  }

  getRegexFlag() {
    let flag = "g";
    if (this.ignoreCase) {
      flag = "gi";
    }
    return flag;
  }

  getRegex(doEnclose) { //単純に連結してしまったら当初の目的を果たせない?
    let target = "";
    if (this.targetType === "decimal") {
      target = ENConditions.getDecimalRegexString();
    } else if (this.targetType === "hexadecimal") {
      target = ENConditions.getHexadecimalRegexString();
    } else if (this.targetType === "custom") {
      target = this.customTarget;
    }

    let prefix = this.prefix;
    let suffix = this.suffix;
    if (doEnclose) {
      prefix = enclose(this.prefix, "(", ")");
      suffix = enclose(this.suffix, "(", ")");
      target = enclose(target, "(", ")");
    }

    let regex = "";
    if (this.editType === "insert") {
      regex = prefix.concat(suffix);
    } else {
      regex = prefix.concat(target).concat(suffix);
    }

    return new RegExp(regex, this.getRegexFlag());
  }

  getIndexes(string) {
    let regex = this.getRegex(true);
    let result = regex.exec(string);
    let index = 1;
    let prefix = "";
    let suffix = "";
    let target = "";
    if (result !== null) {
      prefix = result[index];
      index = index + this.prefixCapturingGroup + 1;
      if (this.editType !== "insert") {
        target = result[index];
        index = index + this.customTargetCapturingGroup + 1;
      }
      suffix = result[index];
    }

    return [prefix.length, prefix.length + target.length, prefix.length + target.length + suffix.length];
  }
}
