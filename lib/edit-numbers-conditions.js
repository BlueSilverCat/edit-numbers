"use babel";

import { countCapturingGroup, enclose, isEmptyObject, isEmptyString, isEscapedChar, paddingNumber } from "./utilities/utility";

export default class ENConditions {
  constructor(conditions) {
    this.prefix = conditions && conditions.hasOwnProperty("prefix") ? conditions.prefix : ""; //string
    this.prefixCapturingGroup = conditions && conditions.hasOwnProperty("prefixCapturingGroup") ?
      conditions.prefixCapturingGroup : 0; //number;
    this.suffix = conditions && conditions.hasOwnProperty("suffix") ? conditions.suffix : ""; //string
    this.suffixCapturingGroup = conditions && conditions.hasOwnProperty("suffixCapturingGroup") ?
      conditions.suffixCapturingGroup : 0; //number;
    this.ignoreCase = conditions && conditions.hasOwnProperty("ignoreCase") ? conditions.ignoreCase : false; //bool

    this.targetPaddingChar = conditions && conditions.hasOwnProperty("targetPaddingChar") ? conditions.targetPaddingChar : "0"; //string
    this.targetSign = conditions && conditions.hasOwnProperty("targetSign") ? conditions.targetSign : "minus"; //string
    this.targetAlign = conditions && conditions.hasOwnProperty("targetAlign") ? conditions.targetAlign : "right"; //string
    this.targetRadix = conditions && conditions.hasOwnProperty("targetRadix") ? conditions.target : "decimal"; //string
    this.targetCase = conditions && conditions.hasOwnProperty("targetCase") ? conditions.targetCase : "both"; //string "both", "lower", "upper"
    this.useCustomTarget = conditions && conditions.hasOwnProperty("useCustomTarget") ? conditions.useCustomTarget : false; //boolean
    this.customTarget = conditions && conditions.hasOwnProperty("customTarget") ? conditions.customTarget : ""; //string
    this.customTargetCapturingGroup = conditions && conditions.hasOwnProperty("customTargetCapturingGroup") ?
      conditions.customTargetCapturingGroup : 0;

    this.digits = conditions && conditions.hasOwnProperty("digits") ? conditions.digits : 1; //number
    this.paddingChar = conditions && conditions.hasOwnProperty("paddingChar") ? conditions.paddingChar : "0"; //string
    this.sign = conditions && conditions.hasOwnProperty("sign") ? conditions.sign : "minus"; //string "-"
    this.align = conditions && conditions.hasOwnProperty("align") ? conditions.align : "right"; //string right
    this.radix = conditions && conditions.hasOwnProperty("radix") ? conditions.radix : "decimal"; //string
    this.upperCase = conditions && conditions.hasOwnProperty("upperCase") ? conditions.upperCase : true; //number

    this.start = conditions && conditions.hasOwnProperty("start") ? conditions.start : 0; //number
    this.end = conditions && conditions.hasOwnProperty("end") ? conditions.end : 0; //number
    this.increment = conditions && conditions.hasOwnProperty("increment") ? conditions.increment : 1; //number
    this.add = conditions && conditions.hasOwnProperty("add") ? conditions.add : 0; //number
    this.multiply = conditions && conditions.hasOwnProperty("multiply") ? conditions.multiply : 1; //number

    this.editType = conditions && conditions.hasOwnProperty("editType") ? conditions.editType : "overwrite"; //string

    this.newLine = conditions && conditions.hasOwnProperty("newLine") ? conditions.newLine : 1; //bool;

    this.currentNumber = 0;

    this.regex = {};
    this.regexEnclose = {};
    this.targetRegex = {};

    this.initialize();
  }

  initialize() {
    this.currentNumber = 0;
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

  getRegexFlag() {
    let flag = "g";
    if (this.ignoreCase) {
      flag = "gi";
    }
    return flag;
  }

  static getRadix(radix) {
    if (radix === "hexadecimal") {
      return 16;
    }
    return 10;
  }

  getTargetSignRegexString() {
    if (this.targetSign === "minus") {
      return "-?";
    } else if (this.targetSign === "plus") {
      return "[-+]";
    } else if (this.targetSign === "space") {
      return "[- ]";
    }
    return "";
  }

  getTargetRadixRegexString() {
    if (ENConditions.getRadix(this.targetRadix) === 16) {
      switch (this.targetCase) {
        case "lower":
          return "[0-9a-f]+";
        case "upper":
          return "[0-9A-F]+";
        case "both":
          return "[0-9a-fA-F]+";
        default:
          return "[0-9a-fA-F]+";
      }
    }
    return "\\d+";
  }

  //FIXME useCustomTargetの場合もtargetSign,targetAlign,targetRadixの設定を見ている
  getTaregetRegexString(doEnclose) {
    let sign = this.getTargetSignRegexString();
    let number = this.getTargetRadixRegexString();
    let padding = isEmptyString(this.targetPaddingChar) ? "" : `${this.targetPaddingChar}*`;
    if (doEnclose) {
      number = enclose(number, "(", ")");
      sign = enclose(sign, "(", ")");
    }
    if (this.targetAlign === "right") {
      return `${padding}${sign}${number}`;
    } else if (this.targetAlign === "right_lead_sign") {
      return `${sign}${padding}${number}`;
    }
    return `${sign}${number}${padding}`;
  }

  getNumberString(numberString) {
    let num = this.start;
    if (!isEmptyString(numberString) && this.editType === "modify") {
      num += parseInt(numberString.replace(this.targetRegex, "$1$2"), ENConditions.getRadix(this.targetRadix));
      if (isNaN(num)) {
        return numberString;
      }
    }
    num = (num * this.multiply) + this.add + this.currentNumber;
    return paddingNumber(num, ENConditions.getRadix(this.radix), this.digits, this.upperCase, this.paddingChar, this.sign, this.align);
  }

  getReplacedText(string) {
    let indexes = this.getIndexes(string);
    if (indexes === null) {
      return string;
    }
    let result = this.getNumberString(string.substr(indexes[0], indexes[1]));
    return string.substr(0, indexes[0]) + result + string.substr(indexes[1]);
  }

  setCapturingGroup() {
    this.prefixCapturingGroup = countCapturingGroup(this.prefix);
    this.suffixCapturingGroup = countCapturingGroup(this.suffix);
    this.customTargetCapturingGroup = countCapturingGroup(this.customTarget);
  }

  static isEnclosedNonCapturingGroup(string) {
    const kBegin = /^\(\?:/;
    if (kBegin.test(string)) {
      if (string[string.length - 1] === ")" && !isEscapedChar(string, string.length - 1)) {
        return true;
      }
    }
    return false;
  }

  getRegexString(doEnclose) {
    this.setCapturingGroup();

    let target = this.customTarget;
    if (!this.useCustomTarget || isEmptyString(this.customTarget)) {
      target = this.getTaregetRegexString();
    }
    if (!ENConditions.isEnclosedNonCapturingGroup(target)) {
      target = `(?:${target})`;
    }
    let prefix = this.prefix;
    let suffix = this.suffix;
    if (doEnclose) {
      prefix = enclose(this.prefix, "(", ")");
      suffix = enclose(this.suffix, "(", ")");
      target = enclose(target, "(", ")");
    }

    let regexString = "";
    if (this.editType === "insert") {
      regexString = prefix + suffix;
    } else {
      regexString = prefix + target + suffix;
    }
    return regexString;
  }

  createRegex() {
    let regex = this.getRegexString(false);
    let regexEnclose = this.getRegexString(true);
    let targetRegex = this.getTaregetRegexString(true);
    try {
      if (this.regex.source !== regex) {
        this.regex = new RegExp(regex, this.getRegexFlag());
        this.regexEnclose = new RegExp(regexEnclose, this.getRegexFlag());
      }
      if (this.targetRegex.source !== targetRegex) {
        this.targetRegex = new RegExp(targetRegex);
      }
    } catch (err) {
      atom.notifications.addError(`edit-numbers: Invalid regular expression.`, { "detail": err }); //名前を直接埋め込んでいる
      this.regex = {};
      this.regexEnclose = {};
      this.targetRegex = {};
    }
  }

  getIndexes(string) {
    if (isEmptyObject(this.regexEnclose)) {
      return null;
    }

    this.regexEnclose.lastIndex = 0;
    let result = this.regexEnclose.exec(string);
    let index = 1;
    let prefix = "";
    let suffix = "";
    let target = "";
    if (result !== null) {
      prefix = result[index];
      index = index + this.prefixCapturingGroup + 1;
      if (this.editType !== "insert") {
        target = result[index];
        if (this.useCustomTarget) {
          index = index + this.customTargetCapturingGroup + 1;
        } else {
          index = index + 1;
        }
      }
      suffix = result[index];
    }
    return [prefix.length, prefix.length + target.length, prefix.length + target.length + suffix.length];
  }
}
