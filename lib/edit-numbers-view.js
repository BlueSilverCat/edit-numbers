"use babel";

import {
  disposeEventListeners,
  focusNext,
  focusPrevious,
  getTabStopElements,
  makeHTML,
} from "./utilities/html-utility";
import {
  makeButton,
  makeCheckbox,
  makeInputNumber,
  makeInputText,
  makeSelector,
} from "./utilities/atom-utility";
import { CompositeDisposable } from "atom";
import EN from "./edit-numbers";
import ENConditions from "./edit-numbers-conditions";
import { isEmptyString } from "./utilities/utility";

export default class EditNumbersView {
  constructor() {
    this.initialize();
    this.makeElements();
    this.makeRootElement();
    this.setTabIndex();
    this.tabStopElements = getTabStopElements(this.rootElement, EN.name);
  }

  initialize() {
    this.radixStatus = {};
    this.radixStatus.decimal = 10;
    this.radixStatus.hexadecimal = 16;

    this.alignStatus = {};
    this.alignStatus.right = "right";
    this.alignStatus.left = "left";
    this.alignStatus.right_lead_minus = "right_lead_minus";

    this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];
  }

  //serialize() {}

  destroy() {
    this.rootElement.remove();
    this.subscriptions.dispose();
    disposeEventListeners(this.eventListeners);
  }

  getElement() {
    return this.rootElement;
  }

  makeElements() {
    this.prefixInput = makeInputText("search", [EN.name, "prefix"], "prefix", EN.conditions.prefix,
      EditNumbersView.callSetRegex("prefix"), false, this.eventListeners);
    this.suffixInput = makeInputText("search", [EN.name, "suffix"], "suffix", EN.conditions.suffix,
      EditNumbersView.callSetRegex("suffix"), false, this.eventListeners);

    this.targetTypeSelector = makeSelector([EN.name, "targetType"], ["decimal", "hexadecimal", "custom"],
      EN.conditions.targetType, EditNumbersView.getCustomTarget(), false, this.eventListeners);
    this.customTargetInput = makeInputText("search", [EN.name, "customtarget"], "customTarget",
      EditNumbersView.getCustomTarget(EN.conditions.targetType),
      EditNumbersView.callSetRegex("customTarget"), false, this.eventListeners);
    this.customTargetInput.readOnly = EN.conditions.targetType !== "custom";

    this.startInput = makeInputNumber([EN.name, "start"], "start", null, null, EN.conditions.start,
      EditNumbersView.setInput(EN.conditions, "start", "number"), false, this.eventListeners);
    this.endInput = makeInputNumber([EN.name, "end"], "end", null, null, EN.conditions.end,
      EditNumbersView.setInput(EN.conditions, "end", "number"), false, this.eventListeners);
    this.digitsInput = makeInputNumber([EN.name, "palace"], "digits", 1, null, EN.conditions.digits,
      EditNumbersView.setInput(EN.conditions, "digits", "number"), false, this.eventListeners);

    this.paddingCharInput = makeInputText("search", [EN.name, "paddingChar"], "padding", EN.conditions.paddingChar,
      EditNumbersView.setInput(EN.conditions, "paddingChar", "text"), false, this.eventListeners);

    this.incrementInput = makeInputNumber([EN.name, "increment"], "increment", null, null, EN.conditions.increment,
      EditNumbersView.setInput(EN.conditions, "increment", "number"), false, this.eventListeners);
    this.addInput = makeInputNumber([EN.name, "add"], "add", null, null, EN.conditions.add,
      EditNumbersView.setInput(EN.conditions, "add", "number"), false, this.eventListeners);
    this.multiplyInput = makeInputNumber([EN.name, "multiply"], "multiply", null, null, EN.conditions.multiply,
      EditNumbersView.setInput(EN.conditions, "multiply", "number"), false, this.eventListeners);

    this.radixSelector = makeSelector([EN.name, "radix"], ["decimal", "hexadecimal"],
      EN.conditions.radix === 16 ? "hexadecimal" : "decimal",
      EditNumbersView.setInput(EN.conditions, "radix", "selector", this.radixStatus), false, this.eventListeners);
    this.upperCaseChecker = makeCheckbox([EN.name, "upperCase"], "upper case", EN.conditions.upperCase,
      EditNumbersView.setInput(EN.conditions, "upperCase", "checker"), false, this.eventListeners);
    this.editTypeSelector = makeSelector([EN.name, "editType"], ["overwrite", "modify", "insert"],
      EN.conditions.editType,
      EditNumbersView.setInput(EN.conditions, "editType", "selector", null), false, this.eventListeners);
    this.alignSelector = makeSelector([EN.name, "align"], ["right", "left", "right_lead_minus"], EN.conditions.align,
      EditNumbersView.setInput(EN.conditions, "align", "selector", this.alignStatus), false, this.eventListeners);
    this.ignoreCaseChecker = makeCheckbox([EN.name, "ignoreCase"], "ignore case", EN.conditions.ignoreCase,
      EditNumbersView.setInput(EN.conditions, "ignoreCase", "checker"), false, this.eventListeners);

    this.markButton = makeButton([EN.name, "mark"], "mark", false, "normal", "no-color", "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "mark"), false, this.eventListeners);

    this.firstButton = makeButton([EN.name, "first"], "first", false, "normal", "no-color", "no-inline",
      null, null, null, EditNumbersView.callFunc(EN, "preCall", "selectFirst"), false, this.eventListeners);
    this.middleButton = makeButton([EN.name, "middle"], "middle", false, "normal", "no-color", "no-inline",
      null, null, null, EditNumbersView.callFunc(EN, "preCall", "selectMiddle"), false, this.eventListeners);
    this.lastButton = makeButton([EN.name, "last"], "last", false, "normal", "no-color", "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "selectLast"), false, this.eventListeners);
    this.nextButton = makeButton([EN.name, "next"], "next", false, "normal", "no-color", "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "selectNext"), false, this.eventListeners);
    this.previousButton = makeButton([EN.name, "previous"], "previous", false, "normal", "no-color", "no-inline",
      null, null, null, EditNumbersView.callFunc(EN, "preCall", "selectPrevious"), false, this.eventListeners);

    this.editButton = makeButton([EN.name, "edit"], "edit", false, "normal", "no-color", "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "edit"), false, this.eventListeners);
    this.editAllButton = makeButton([EN.name, "editAll"], "editAll", false, "normal", "no-color", "no-inline",
      null, null, null, EditNumbersView.callFunc(EN, "preCall", "editAll"), false, this.eventListeners);

    this.redigitsStringInput = makeInputText("text", [EN.name, "redigitsStringArea"], "redigitsString", "",
      null, null, null);
    this.redigitsStringInput.readOnly = true;

    this.appendNewLineButton = makeButton([EN.name, "appendNewLine"], "newLine", false, "normal", "no-color",
      "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "appendNewLine"), false, this.eventListeners);
    this.newLineInput = makeInputNumber([EN.name, "newLine"], "newLine", 1, null, EN.conditions.newLine,
      EditNumbersView.setInput(EN.conditions, "newLine", "number"), false, this.eventListeners);
  }

  makeRootElement() {
    this.rootElement = makeHTML([EN.name], { "tag": "div", "class": ["root", "native-key-bindings"] }, [
      [], { "tag": "table" },
      [
        [], { "tag": "tr" },
        [
          [], { "tag": "td" },
          [
            [], { "tag": "span", "class": ["prefix", "block"] },
            { "tag": "span", "class": ["prefix", "title"], "textContent": "prefix: " },
            this.prefixInput,
          ],
          [
            [], { "tag": "span", "class": ["suffix", "block"] },
            { "tag": "span", "class": ["suffix", "title"], "textContent": "suffix: " },
            this.suffixInput,
          ],
          [
            [], { "tag": "span", "class": ["ignoreCase", "block"] },
            //{tag: "span", class: ["ignore", "title"], textContent: "ignore: "},
            this.ignoreCaseChecker,
          ],
          [
            [], { "tag": "span", "class": ["target", "block"] },
            { "tag": "span", "class": ["target", "title"], "textContent": "targetType: " },
            this.targetTypeSelector,
            this.customTargetInput,
          ],
        ],
      ],
      [
        [], { "tag": "tr" },
        [
          [], { "tag": "td" },
          [
            [], { "tag": "span", "class": ["digits", "block"] },
            { "tag": "span", "class": ["digits", "title"], "textContent": "digits: " },
            this.digitsInput,
          ],
          [
            [], { "tag": "span", "class": ["paddingChar", "block"] },
            { "tag": "span", "class": ["paddingChar", "title"], "textContent": "paddingChar: " },
            this.paddingCharInput,
          ],
          [
            [], { "tag": "span", "class": ["align", "block"] },
            { "tag": "span", "class": ["align", "title"], "textContent": "align: " },
            this.alignSelector,
          ],
          [
            [], { "tag": "span", "class": ["radix", "block"] },
            { "tag": "span", "class": ["radix", "title"], "textContent": "outputRadix: " },
            this.radixSelector,
          ],
          [
            [], { "tag": "span", "class": ["upperCase", "block"] },
            //{"tag": "span", "class": ["upperCase", "title"], "textContent": "upperCase: "},
            this.upperCaseChecker,
          ],
        ],
      ],
      [
        [], { "tag": "tr" },
        [
          [], { "tag": "td" },
          [
            [], { "tag": "span", "class": ["start", "block"] },
            { "tag": "span", "class": ["start", "title"], "textContent": "start: " },
            this.startInput,
          ],
          [
            [], { "tag": "span", "class": ["end", "block"] },
            { "tag": "span", "class": ["end", "title"], "textContent": "end: " },
            this.endInput,
          ],
          [
            [], { "tag": "span", "class": ["increment", "block"] },
            { "tag": "span", "class": ["increment", "title"], "textContent": "increment: " },
            this.incrementInput,
          ],
          [
            [], { "tag": "span", "class": ["add", "block"] },
            { "tag": "span", "class": ["add", "title"], "textContent": "add: " },
            this.addInput,
          ],
          [
            [], { "tag": "span", "class": ["multiply", "block"] },
            { "tag": "span", "class": ["multiply", "title"], "textContent": "multiply: " },
            this.multiplyInput,
          ],
        ],
      ],
      [
        [], { "tag": "tr" },
        [
          [], { "tag": "td" },
          [
            [], { "tag": "span", "class": ["redigitsString", "block"] },
            { "tag": "span", "class": ["redigitsString", "title"], "textContent": "redigitsString: " },
            this.redigitsStringInput,
          ],
        ],
      ],
      [
        [], { "tag": "tr" },
        [
          [], { "tag": "td" },
          this.markButton, [
            [], { "tag": "div", "class": "btn-group" },
            this.firstButton,
            this.middleButton,
            this.lastButton,
          ],
          [
            [], { "tag": "div", "class": "btn-group" },
            this.previousButton,
            this.nextButton,
          ],
          [
            [], { "tag": "span", "class": ["editType", "block"] },
            { "tag": "span", "class": ["editType", "title"], "textContent": "editType: " },
            this.editTypeSelector,
          ],
          [
            [], { "tag": "div", "class": "btn-group" },
            this.editButton,
            this.editAllButton,
          ],
          [
            [], { "tag": "span", "class": ["newLine", "block"] },
            { "tag": "span", "class": ["newLine", "title"], "textContent": "newLine: " },
            this.newLineInput,
            this.appendNewLineButton,
          ],
        ],
      ],
    ]);
  }

  setTabIndex() {
    this.kPositions = {
      "prefix": this.prefixInput,
      "suffix": this.suffixInput,
      "ignoreCase": this.ignoreCaseChecker.firstChild,
      "targetType": this.targetTypeSelector,
      "customTarget": this.customTargetInput,
      "digits": this.digitsInput,
      "paddingChar": this.paddingCharInput,
      "align": this.alignSelector,
      "outputRadix": this.radixSelector,
      "upperCase": this.upperCaseChecker,
      "start": this.startInput,
      "end": this.endInput,
      "increment": this.incrementInput,
      "add": this.addInput,
      "multiply": this.multiplyInput,
      "mark": this.markButton,
      "first": this.firstButton,
      "middle": this.middleButton,
      "last": this.lastButton,
      "previous": this.previousButton,
      "next": this.nextButton,
      "editType": this.editTypeButton,
      "edit": this.editButton,
      "editAll": this.editAllButton,
      "newLine": this.newLineInput,
      "appendNewLine": this.appendNewLineButton,
    };

    let i = 0;
    this.prefixInput.tabIndex = ++i;
    this.suffixInput.tabIndex = ++i;
    this.ignoreCaseChecker.firstChild.tabIndex = ++i;
    this.targetTypeSelector.tabIndex = ++i;
    this.customTargetInput.tabIndex = ++i;

    this.digitsInput.tabIndex = ++i;
    this.paddingCharInput.tabIndex = ++i;
    this.alignSelector.tabIndex = ++i;
    this.radixSelector.tabIndex = ++i;
    this.upperCaseChecker.firstChild.tabIndex = ++i;

    this.startInput.tabIndex = ++i;
    this.endInput.tabIndex = ++i;
    this.incrementInput.tabIndex = ++i;
    this.addInput.tabIndex = ++i;
    this.multiplyInput.tabIndex = ++i;

    this.markButton.tabIndex = ++i;

    this.firstButton.tabIndex = ++i;
    this.middleButton.tabIndex = ++i;
    this.lastButton.tabIndex = ++i;

    this.previousButton.tabIndex = ++i;
    this.nextButton.tabIndex = ++i;

    this.editTypeSelector.tabIndex = ++i;
    this.editButton.tabIndex = ++i;
    this.editAllButton.tabIndex = ++i;
    this.newLineInput = ++i;
    this.appendNewLineButton = ++i;
  }

  initialFocus() {
    this.markButton.focus();
  }

  focusNext() {
    focusNext(this.tabStopElements);
  }

  focusPrevious() {
    focusPrevious(this.tabStopElements);
  }

  static setInput(obj, property, type, selector) {
    return (evt) => {
      if (type === "number") {
        let num = parseInt(evt.target.value, 10);
        if (isNaN(num)) {
          num = 0;
        }
        obj[property] = num;
      } else if (type === "checker") {
        obj[property] = evt.target.checked;
      } else if (type === "selector") {
        if (selector) {
          obj[property] = selector[evt.target.value];
        } else {
          obj[property] = evt.target.value;
        }
      } else {
        obj[property] = evt.target.value;
      }
      EN.unmarkActive();
    };
  }

  static callFunc(obj, funcName, param) {
    return (_evt) => {
      obj[funcName](param);
    };
  }

  static callSetRegex(property) {
    return (evt) => {
      EN.conditions.setRegex(evt.target.value, property);
    };
  }

  setTarget() {
    return (evt) => {
      if (evt.target.value === "custom") {
        this.customTargetInput.readOnly = false;
        EN.conditions.targetType = evt.target.value;
        if (isEmptyString(EN.conditions.customTarget)) {
          EN.conditions.setRegex(this.customTargetInput.value, "customTarget");
        } else {
          this.customTargetInput.value = EN.conditions.customTarget;
        }
      } else {
        this.customTargetInput.readOnly = true;
        EN.conditions.targetType = evt.target.value;
        this.customTargetInput.value = EditNumbersView.getCustomTarget(evt.target.value);
      }
    };
  }

  static getCustomTarget(targetType) {
    if (targetType === "custom") {
      return EN.conditions.customTarget;
    } else if (targetType === "hexadecimal") {
      return ENConditions.getHexadecimalRegexString();
    }
    return ENConditions.getDecimalRegexString();
  }
}
