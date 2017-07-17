"use babel";

import {
  disposeEventListeners,
  focusElement,
  getTabStopElements,
  makeHTML,
  toggleDisabledNotSelected,
} from "./utilities/html-utility";
import { escapeSpecialCharacters, isEmptyString } from "./utilities/utility";
import {
  makeButton,
  makeCheckbox,
  makeInputNumber,
  makeInputText,
  makeSelector,
} from "./utilities/atom-utility";
import { CompositeDisposable } from "atom";
import EN from "./edit-numbers";
//import ENConditions from "./edit-numbers-conditions";


export default class EditNumbersView {
  constructor() {
    this.initialize();
    this.makeElements();
    this.makeRootElement();
    this.setTabIndex();
    this.tabStopElements = getTabStopElements(this.rootElement, EN.name);
  }

  initialize() {
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
      EditNumbersView.setInput(EN.conditions, "prefix", "text", null), false, this.eventListeners);
    this.suffixInput = makeInputText("search", [EN.name, "suffix"], "suffix", EN.conditions.suffix,
      EditNumbersView.setInput(EN.conditions, "suffix", "text", null), false, this.eventListeners);
    this.ignoreCaseChecker = makeCheckbox([EN.name, "ignoreCase"], "ignore case", EN.conditions.ignoreCase,
      EditNumbersView.setInput(EN.conditions, "ignoreCase", "checker"), false, this.eventListeners);
    this.closeButton = makeButton([EN.name, "close"], "", false, "normal", "no-color", "no-inline", "icon-x",
      null, null, EditNumbersView.close, false, this.eventListeners);

    this.targetPaddingCharInput = makeInputText("search", [EN.name, "targetPaddingChar"], "padding",
      EN.conditions.targetPaddingChar, this.setTargerPaddingChar(), false, this.eventListeners);
    this.targetSignSelector = makeSelector([EN.name, "targetSign"], ["minus", "plus", "space", "none"],
      EN.conditions.targetSign,
      this.setInputTarget(EN.conditions, "targetSign", this.signStatus), false, this.eventListeners);
    this.targetAlignSelector = makeSelector([EN.name, "targetAlign"], ["right", "left", "right_lead_sign"],
      EN.conditions.targetAlign, this.setInputTarget(EN.conditions, "targetAlign"), false, this.eventListeners);
    this.targetRadixSelector = makeSelector([EN.name, "targetRadix"], ["decimal", "hexadecimal"],
      EN.conditions.targetRadix, this.setInputTarget(EN.conditions, "targetRadix", null), false, this.eventListeners);
    this.targetCaseSelector = makeSelector([EN.name, "targetCase"], ["both", "lower", "upper"],
      EN.conditions.targetCase, this.setInputTarget(EN.conditions, "targetCase"), false, this.eventListeners);
    this.setTargetCaseSelectorReadOnly();
    this.useCustomTargetChecker = makeCheckbox([EN.name, "useCustomTarget"], "custom", EN.conditions.useCustomTarget,
      this.setUseTarget(), false, this.eventListeners);
    this.customTargetInput = makeInputText("search", [EN.name, "customtarget"], "customTarget",
      EditNumbersView.getCustomTarget(),
      EditNumbersView.setInput(EN.conditions, "customTarget", "text", null), false, this.eventListeners);
    this.setCustomTargetInputReadOnly();

    this.digitsInput = makeInputNumber([EN.name, "palace"], "digits", 1, null, EN.conditions.digits,
      EditNumbersView.setInput(EN.conditions, "digits", "number"), false, this.eventListeners);
    this.paddingCharInput = makeInputText("search", [EN.name, "paddingChar"], "padding", EN.conditions.paddingChar,
      EditNumbersView.setInput(EN.conditions, "paddingChar", "text"), false, this.eventListeners);
    this.alignSelector = makeSelector([EN.name, "align"], ["right", "left", "right_lead_sign"], EN.conditions.align,
      EditNumbersView.setInput(EN.conditions, "align", "selector", null), false, this.eventListeners);
    this.signSelector = makeSelector([EN.name, "sign"], ["minus", "plus", "space"], EN.conditions.sign,
      EditNumbersView.setInput(EN.conditions, "sign", "selector", this.signStatus), false, this.eventListeners);
    this.radixSelector = makeSelector([EN.name, "radix"], ["decimal", "hexadecimal"],
      EN.conditions.radix === 16 ? "hexadecimal" : "decimal",
      EditNumbersView.setInput(EN.conditions, "radix", "selector", null), false, this.eventListeners);
    this.upperCaseChecker = makeCheckbox([EN.name, "upperCase"], "upper case", EN.conditions.upperCase,
      EditNumbersView.setInput(EN.conditions, "upperCase", "checker"), false, this.eventListeners);

    this.startInput = makeInputNumber([EN.name, "start"], "start", null, null, EN.conditions.start,
      EditNumbersView.setInput(EN.conditions, "start", "number"), false, this.eventListeners);
    this.endInput = makeInputNumber([EN.name, "end"], "end", null, null, EN.conditions.end,
      EditNumbersView.setInput(EN.conditions, "end", "number"), false, this.eventListeners);
    this.incrementInput = makeInputNumber([EN.name, "increment"], "increment", null, null, EN.conditions.increment,
      EditNumbersView.setInput(EN.conditions, "increment", "number"), false, this.eventListeners);
    this.addInput = makeInputNumber([EN.name, "add"], "add", null, null, EN.conditions.add,
      EditNumbersView.setInput(EN.conditions, "add", "number"), false, this.eventListeners);
    this.multiplyInput = makeInputNumber([EN.name, "multiply"], "multiply", null, null, EN.conditions.multiply,
      EditNumbersView.setInput(EN.conditions, "multiply", "number"), false, this.eventListeners);

    this.markButton = makeButton([EN.name, "mark"], "mark", false, "normal", "no-color", "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "mark"), false, this.eventListeners);

    this.firstButton = makeButton([EN.name, "first"], "", false, "normal", "no-color", "no-inline",
      "icon-jump-left", null, null, EditNumbersView.callFunc(EN, "preCall", "selectFirst"), false, this.eventListeners);
    this.previousButton = makeButton([EN.name, "previous"], "", false, "normal", "no-color", "no-inline",
      "icon-triangle-left", null, null,
      EditNumbersView.callFunc(EN, "preCall", "selectPrevious"), false, this.eventListeners);
    this.middleButton = makeButton([EN.name, "middle"], "", false, "normal", "no-color", "no-inline",
      "icon-primitive-dot", null, null,
      EditNumbersView.callFunc(EN, "preCall", "selectMiddle"), false, this.eventListeners);
    this.nextButton = makeButton([EN.name, "next"], "", false, "normal", "no-color", "no-inline",
      "icon-triangle-right", null, null,
      EditNumbersView.callFunc(EN, "preCall", "selectNext"), false, this.eventListeners);
    this.lastButton = makeButton([EN.name, "last"], "", false, "normal", "no-color", "no-inline",
      "icon-jump-right", null, null,
      EditNumbersView.callFunc(EN, "preCall", "selectLast"), false, this.eventListeners);

    this.editTypeSelector = makeSelector([EN.name, "editType"], ["overwrite", "modify", "insert"],
      EN.conditions.editType,
      EditNumbersView.setInput(EN.conditions, "editType", "selector", null), false, this.eventListeners);

    this.editButton = makeButton([EN.name, "edit"], "edit", false, "normal", "no-color", "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "edit"), false, this.eventListeners);
    this.editAllButton = makeButton([EN.name, "editAll"], "editAll", false, "normal", "no-color", "no-inline",
      null, null, null, EditNumbersView.callFunc(EN, "preCall", "editAll"), false, this.eventListeners);

    this.replaceStringInput = makeInputText("text", [EN.name, "replaceStringArea"], "replaceString", "",
      null, null, null);
    this.replaceStringInput.readOnly = true;

    this.appendNewLineButton = makeButton([EN.name, "appendNewLine"], "newLine", false, "normal", "no-color",
      "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "preCall", "appendNewLine"), false, this.eventListeners);
    this.newLineInput = makeInputNumber([EN.name, "newLine"], "newLine", 1, null, EN.conditions.newLine,
      EditNumbersView.setInput(EN.conditions, "newLine", "number"), false, this.eventListeners);

    this.saveDefaultButton = makeButton([EN.name, "saveDefault"], "saveDefault", false, "normal", "no-color",
      "no-inline", null, null, null,
      EditNumbersView.callFunc(EN, "setConfig", null), false, this.eventListeners);
    this.loadDefaultButton = makeButton([EN.name, "loadDefault"], "loadDefault", false, "normal", "no-color",
      "no-inline", null, null, null,
      this.updateView(), false, this.eventListeners);
  }

  makeRootElement() {
    this.rootElement = makeHTML([EN.name], { "tag": "div", "class": ["root", "native-key-bindings"] },
      [[], { "tag": "table" },
        this.closeButton,
        [[], { "tag": "tr", "class": "displayArea" },
          { "tag": "th", "class": ["displayArea"] }, //"textContent": "replaceString: " },
          [[], { "tag": "td" },
            //{ "tag": "span", "class": ["replaceString", "title"], "textContent": "replaceString: " },
            this.replaceStringInput,
          ],
        ],
        [[], { "tag": "tr", "class": "operationButtons" },
          { "tag": "th", "class": ["operationButtons"] }, //"textContent": "controls: " },
          [[], { "tag": "td" },
            [[], { "tag": "span", "class": ["editType", "block"] },
              { "tag": "span", "class": ["editType", "title"], "textContent": "editType: " },
              this.editTypeSelector,
            ],
            [[], { "tag": "div", "class": "btn-group" },
              this.markButton,
              this.firstButton,
              this.previousButton,
              this.middleButton,
              this.nextButton,
              this.lastButton,
            ],
            [[], { "tag": "div", "class": "btn-group" },
              this.editButton,
              this.editAllButton,
            ],
            [[], { "tag": "span", "class": ["newLine", "block"] },
              { "tag": "span", "class": ["newLine", "title"], "textContent": "newLines: " },
              this.newLineInput,
              this.appendNewLineButton,
            ],
            [[], { "tag": "div", "class": "btn-group" },
              this.saveDefaultButton,
              this.loadDefaultButton,
            ],
          ],
        ],
        [[], { "tag": "tr", "class": "searchConditions" },
          { "tag": "th", "class": ["searchConditions"] }, //"textContent": "searchConditions: " },
          [[], { "tag": "td" },
            [[], { "tag": "span", "class": ["prefix", "block"] },
              { "tag": "span", "class": ["prefix", "title"], "textContent": "prefix: " },
              this.prefixInput,
            ],
            [[], { "tag": "span", "class": ["suffix", "block"] },
              { "tag": "span", "class": ["suffix", "title"], "textContent": "suffix: " },
              this.suffixInput,
            ],
            //{tag: "span", class: ["ignore", "title"], textContent: "ignore: "},
            this.ignoreCaseChecker,
          ],
        ],
        [[], { "tag": "tr", "class": "searchTargetConditions" },
          { "tag": "th", "class": ["searchTargetConditions"] }, //"textContent": "target search conditions: " },
          [[], { "tag": "td" },
            [[], { "tag": "span", "class": ["targetPaddingChar", "block"] },
              { "tag": "span", "class": ["targetPaddingChar", "title"], "textContent": "padding: " },
              this.targetPaddingCharInput,
            ],
            [[], { "tag": "span", "class": ["targetSign", "block"] },
              { "tag": "span", "class": ["targetSign", "title"], "textContent": "sign: " },
              this.targetSignSelector,
            ],
            [[], { "tag": "span", "class": ["targetAlign", "block"] },
              { "tag": "span", "class": ["targetAlign", "title"], "textContent": "align: " },
              this.targetAlignSelector,
            ],
            [[], { "tag": "span", "class": ["targetRadix", "block"] },
              { "tag": "span", "class": ["targetRadix", "title"], "textContent": "radix: " },
              this.targetRadixSelector,
            ],
            [[], { "tag": "span", "class": ["targetCase", "block"] },
              { "tag": "span", "class": ["targetCase", "title"], "textContent": "case: " },
              this.targetCaseSelector,
            ],
            this.useCustomTargetChecker,
            [[], { "tag": "span", "class": ["customTargetInput", "block"] },
              { "tag": "span", "class": ["customTargetInput", "title"], "textContent": "" },
              this.customTargetInput,
            ],
          ],
        ],
        [[], { "tag": "tr", "class": "outputFormats" },
          { "tag": "th", "class": ["outputFormats"] }, //"textContent": "output formats: " },
          [[], { "tag": "td" },
            [[], { "tag": "span", "class": ["digits", "block"] },
              { "tag": "span", "class": ["digits", "title", "outputFormats"], "textContent": "digits: " },
              this.digitsInput,
            ],
            [[], { "tag": "span", "class": ["paddingChar", "block"] },
              { "tag": "span", "class": ["paddingChar", "title", "outputFormats"], "textContent": "padding: " },
              this.paddingCharInput,
            ],
            [[], { "tag": "span", "class": ["sign", "block"] },
              { "tag": "span", "class": ["sign", "title", "outputFormats"], "textContent": "sign: " },
              this.signSelector,
            ],
            [[], { "tag": "span", "class": ["align", "block"] },
              { "tag": "span", "class": ["align", "title", "outputFormats"], "textContent": "align: " },
              this.alignSelector,
            ],
            [[], { "tag": "span", "class": ["radix", "block"] },
              { "tag": "span", "class": ["radix", "title", "outputFormats"], "textContent": "radix: " },
              this.radixSelector,
            ],
            //{"tag": "span", "class": ["upperCase", "title", "outputFormats"], "textContent": "upperCase: "},
            this.upperCaseChecker,
          ],
        ],
        [[], { "tag": "tr", "class": "arithmeticOptions" },
          { "tag": "th", "class": ["arithmeticOptions"] }, //"textContent": "numeric conditions: " },
          [[], { "tag": "td" },
            [[], { "tag": "span", "class": ["start", "block"] },
              { "tag": "span", "class": ["start", "title", "arithmeticOptions"], "textContent": "start: " },
              this.startInput,
            ],
            [[], { "tag": "span", "class": ["end", "block"] },
              { "tag": "span", "class": ["end", "title", "arithmeticOptions"], "textContent": "end: " },
              this.endInput,
            ],
            [[], { "tag": "span", "class": ["increment", "block"] },
              { "tag": "span", "class": ["increment", "title", "arithmeticOptions"], "textContent": "increment: " },
              this.incrementInput,
            ],
            [[], { "tag": "span", "class": ["add", "block"] },
              { "tag": "span", "class": ["add", "title", "arithmeticOptions"], "textContent": "add: " },
              this.addInput,
            ],
            [[], { "tag": "span", "class": ["multiply", "block"] },
              { "tag": "span", "class": ["multiply", "title", "arithmeticOptions"], "textContent": "multiply: " },
              this.multiplyInput,
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

      "targetPaddingChar": this.targetPaddingCharInput,
      "targetSign": this.targetSignSelector,
      "targetAlign": this.targetAlignSelector,
      "targetRadix": this.targetRadixSelector,
      "targetCase": this.targetCaseSelector,
      "useCustomTarget": this.useCustomTargetChecker.firstChild,
      "customTarget": this.customTargetInput,

      "digits": this.digitsInput,
      "paddingChar": this.paddingCharInput,
      "sign": this.signSelector,
      "align": this.alignSelector,
      "radix": this.radixSelector,
      "upperCase": this.upperCaseChecker.firstChild,

      "start": this.startInput,
      "end": this.endInput,
      "increment": this.incrementInput,
      "add": this.addInput,
      "multiply": this.multiplyInput,

      "mark": this.markButton,
      "first": this.firstButton,
      "previous": this.previousButton,
      "middle": this.middleButton,
      "next": this.nextButton,
      "last": this.lastButton,

      "editType": this.editTypeButton,
      "edit": this.editButton,
      "editAll": this.editAllButton,

      "newLine": this.newLineInput,
      "appendNewLine": this.appendNewLineButton,

      "saveDefault": this.saveDefaultButton,
      "loadDefault": this.loadDefaultButton,
    };

    let i = 0;
    this.editTypeSelector.tabIndex = ++i;

    this.markButton.tabIndex = ++i;
    this.firstButton.tabIndex = ++i;
    this.previousButton.tabIndex = ++i;
    this.middleButton.tabIndex = ++i;
    this.nextButton.tabIndex = ++i;
    this.lastButton.tabIndex = ++i;

    this.editButton.tabIndex = ++i;
    this.editAllButton.tabIndex = ++i;

    this.newLineInput.tabIndex = ++i;
    this.appendNewLineButton.tabIndex = ++i;

    this.saveDefaultButton.tabIndex = ++i;
    this.loadDefaultButton.tabIndex = ++i;

    this.prefixInput.tabIndex = ++i;
    this.suffixInput.tabIndex = ++i;
    this.ignoreCaseChecker.firstChild.tabIndex = ++i;

    this.targetPaddingCharInput.tabIndex = ++i;
    this.targetSignSelector.tabIndex = ++i;
    this.targetAlignSelector.tabIndex = ++i;
    this.targetRadixSelector.tabIndex = ++i;
    this.targetCaseSelector.tabIndex = ++i;
    this.useCustomTargetChecker.firstChild.tabIndex = ++i;
    this.customTargetInput.tabIndex = ++i;

    this.digitsInput.tabIndex = ++i;
    this.paddingCharInput.tabIndex = ++i;
    this.signSelector.tabIndex = ++i;
    this.alignSelector.tabIndex = ++i;
    this.radixSelector.tabIndex = ++i;
    this.upperCaseChecker.firstChild.tabIndex = ++i;

    this.startInput.tabIndex = ++i;
    this.endInput.tabIndex = ++i;
    this.incrementInput.tabIndex = ++i;
    this.addInput.tabIndex = ++i;
    this.multiplyInput.tabIndex = ++i;
  }

  initialFocus() {
    this.markButton.focus();
  }

  static close() {
    EN.hidePanel();
  }

  focusNext() {
    focusElement(this.tabStopElements, "next");
  }

  focusPrevious() {
    focusElement(this.tabStopElements, "previous");
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
      EN.unmark();
    };
  }

  static callFunc(obj, funcName, param) {
    return (_evt) => {
      obj[funcName](param);
    };
  }

  setTargerPaddingChar() {
    return (evt) => {
      EN.conditions.targetPaddingChar = escapeSpecialCharacters(evt.target.value);
      this.setCustomTargetInput();
    };
  }

  setInputTarget(obj, property, selector) {
    return (evt) => {
      if (selector) {
        obj[property] = selector[evt.target.value];
      } else {
        obj[property] = evt.target.value;
      }
      if (property === "targetRadix") {
        this.setTargetCaseSelectorReadOnly();
      }
      this.setCustomTargetInput();
    };
  }

  setUseTarget() {
    return (evt) => {
      EN.conditions.useCustomTarget = evt.target.checked;
      this.setCustomTargetInputReadOnly();
      this.setCustomTargetInput();
    };
  }

  setCustomTargetInputReadOnly() {
    this.customTargetInput.readOnly = !EN.conditions.useCustomTarget;
  }

  setTargetCaseSelectorReadOnly() {
    if (EN.conditions.targetRadix === "decimal") {
      toggleDisabledNotSelected(this.targetCaseSelector, true);
    } else {
      toggleDisabledNotSelected(this.targetCaseSelector, false);
    }
  }

  setCustomTargetInput() {
    this.customTargetInput.value = EditNumbersView.getCustomTarget();
    EN.unmark();
  }

  static getCustomTarget() {
    if (EN.conditions.useCustomTarget && !isEmptyString(EN.conditions.customTarget)) {
      return EN.conditions.customTarget;
    }
    return EN.conditions.getTaregetRegexString();
  }

  updateView() {
    return () => {
      EN.unmark();
      EN.getConditions();

      this.prefixInput.value = EN.conditions.prefix;
      this.suffixInput.value = EN.conditions.suffix;
      this.ignoreCaseChecker.firstChild.checked = EN.conditions.ignoreCase;

      this.targetPaddingCharInput.value = EN.conditions.targetPaddingChar;
      this.targetSignSelector.value = EN.conditions.targetSign;
      this.targetAlignSelector.value = EN.conditions.targetAlign;
      this.targetRadixSelector.value = EN.conditions.targetRadix;
      this.setTargetCaseSelectorReadOnly();
      this.targetCaseSelector.value = EN.conditions.targetCase;
      this.useCustomTargetChecker.firstChild.checked = EN.conditions.useCustomTarget;
      this.setCustomTargetInputReadOnly();
      this.customTargetInput.value = EditNumbersView.getCustomTarget();

      this.digitsInput.value = EN.conditions.digits;
      this.paddingCharInput.value = EN.conditions.paddingChar;
      this.alignSelector.value = EN.conditions.align;
      this.signSelector.value = EN.conditions.sign;
      this.radixSelector.value = EN.conditions.radix;
      this.upperCaseChecker.firstChild.checked = EN.conditions.upperCase;

      this.startInput.value = EN.conditions.start;
      this.endInput.value = EN.conditions.end;
      this.incrementInput.value = EN.conditions.increment;
      this.addInput.value = EN.conditions.add;
      this.multiplyInput.value = EN.conditions.multiply;

      this.editTypeSelector.value = EN.conditions.editType;
      this.newLineInput.value = EN.conditions.newLine;
    };
  }
}
