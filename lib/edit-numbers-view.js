'use babel';

import EN from './edit-numbers';
import ENConditions from './edit-numbers-conditions';
import { isEmptyString } from './utility';
import {
  makeInputText, makeInputNumber, makeSelector, makeCheckbox, makeButton, checkEventClickOrEnter
} from './atom-utility';
import {
  makeHTML, disposeEventListeners, createElementWithClass, getTabStopElements, focusNext, focusPrevious
} from './html-utility';
import { CompositeDisposable } from 'atom';

export default class EditNumbersView {

  constructor(serializedState) {
    this.initialize();
    this.makeElements();
    this.makeRootElement();
    this.setTabIndex();
    this.tabStopElements = getTabStopElements(this.rootElement, EN.name);
  }

  initialize() {
    this.baseStatus = new Object();
    this.baseStatus.decimal = 10;
    this.baseStatus.hexadecimal = 16;

    this.alignStatus = new Object();
    this.alignStatus.right = 'right';
    this.alignStatus.left = 'left';
    this.alignStatus.right_lead_minus = 'right_lead_minus';

    this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];
  }

  serialize() {}

  destroy() {
    this.rootElement.remove();
    this.subscriptions.dispose();
    disposeEventListeners(this.eventListeners);
  }

  getElement() {
    return this.rootElement;
  }

  makeElements() {
    this.prefixInput = makeInputText('search', [EN.name, 'prefix'], 'prefix', EN.conditions.prefix,
      this.callSetRegex('prefix'), false, this.eventListeners);
    this.suffixInput = makeInputText('search', [EN.name, 'suffix'], 'suffix', EN.conditions.suffix,
      this.callSetRegex('suffix'), false, this.eventListeners);

    this.targetTypeSelector = makeSelector([EN.name, 'targetType'], ['decimal', 'hexadecimal', 'custom'],
      EN.conditions.targetType,
      this.setTarget(), false, this.eventListeners);
    this.customTargetInput = makeInputText('search', [EN.name, 'customtarget'], 'customTarget',
      this.getCustomTarget(EN.conditions.targetType),
      this.callSetRegex('customTarget'), false, this.eventListeners);
    this.customTargetInput.readOnly = EN.conditions.targetType === 'custom' ? false : true;

    this.startInput = makeInputNumber([EN.name, 'start'], 'start', null, null, EN.conditions.start,
      this.setInput(EN.conditions, 'start', 'number'), false, this.eventListeners);
    this.endInput = makeInputNumber([EN.name, 'end'], 'end', null, null, EN.conditions.end,
      this.setInput(EN.conditions, 'end', 'number'), false, this.eventListeners);
    this.placeInput = makeInputNumber([EN.name, 'palace'], 'place', 1, null, EN.conditions.place,
      this.setInput(EN.conditions, 'place', 'number'), false, this.eventListeners);

    this.paddingCharInput = makeInputText('search', [EN.name, 'paddingChar'], 'padding', EN.conditions.paddingChar,
      this.setInput(EN.conditions, 'paddingChar', 'text'), false, this.eventListeners);

    this.incrementInput = makeInputNumber([EN.name, 'increment'], 'increment', null, null, EN.conditions.increment,
      this.setInput(EN.conditions, 'increment', 'number'), false, this.eventListeners);
    this.addInput = makeInputNumber([EN.name, 'add'], 'add', null, null, EN.conditions.add,
      this.setInput(EN.conditions, 'add', 'number'), false, this.eventListeners);
    this.multiplyInput = makeInputNumber([EN.name, 'multiply'], 'multiply', null, null, EN.conditions.multiply,
      this.setInput(EN.conditions, 'multiply', 'number'), false, this.eventListeners);

    this.baseSelector = makeSelector([EN.name, 'base'], ['decimal', 'hexadecimal'],
      EN.conditions.base === 16 ? 'hexadecimal' : 'decimal',
      this.setInput(EN.conditions, 'base', 'selector', this.baseStatus), false, this.eventListeners);
    this.upperCaseChecker = makeCheckbox([EN.name, 'upperCase'], 'upper case', EN.conditions.upperCase,
      this.setInput(EN.conditions, 'upperCase', 'checker'), false, this.eventListeners);
    this.editTypeSelector = makeSelector([EN.name, 'editType'], ['overwrite', 'modify', 'insert'], EN.conditions.editType,
      this.setInput(EN.conditions, 'editType', 'selector', null), false, this.eventListeners);
    this.alignSelector = makeSelector([EN.name, 'align'], ['right', 'left', 'right_lead_minus'], EN.conditions.align,
      this.setInput(EN.conditions, 'align', 'selector', this.alignStatus), false, this.eventListeners);
    this.ignoreCaseChecker = makeCheckbox([EN.name, 'ignoreCase'], 'ignore case', EN.conditions.ignoreCase,
      this.setInput(EN.conditions, 'ignoreCase', 'checker'), false, this.eventListeners);

    this.markButton = makeButton([EN.name, 'mark'], 'mark', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'mark'), false, this.eventListeners);

    this.firstButton = makeButton([EN.name, 'first'], 'first', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'selectFirst'), false, this.eventListeners);
    this.middleButton = makeButton([EN.name, 'middle'], 'middle', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'selectMiddle'), false, this.eventListeners);
    this.lastButton = makeButton([EN.name, 'last'], 'last', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'selectLast'), false, this.eventListeners);
    this.nextButton = makeButton([EN.name, 'next'], 'next', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'selectNext'), false, this.eventListeners);
    this.previousButton = makeButton([EN.name, 'previous'], 'previous', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'selectPrevious'), false, this.eventListeners);

    this.editButton = makeButton([EN.name, 'edit'], 'edit', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'edit'), false, this.eventListeners);
    this.editAllButton = makeButton([EN.name, 'editAll'], 'editAll', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'editAll'), false, this.eventListeners);

    this.replaceStringInput = makeInputText('text', [EN.name, 'replaceStringArea'], 'replaceString', '',
      null, null, null);
    this.replaceStringInput.readOnly = true;

    this.appendNewLineButton = makeButton([EN.name, 'appendNewLine'], 'newLine', false, 'normal', 'no-color', 'no-inline', null, null, null,
      this.callFunc(EN, 'preCall', 'appendNewLine'), false, this.eventListeners);
    this.newLineInput = makeInputNumber([EN.name, 'newLine'], 'newLine', 1, null, EN.conditions.newLine,
      this.setInput(EN.conditions, 'newLine', 'number'), false, this.eventListeners);
  }

  makeRootElement() {
    this.rootElement = makeHTML([EN.name], {tag: 'div', class: ['root',  'native-key-bindings']},
      [[], {tag: 'table'},
        [[], {tag: 'tr'},
          [[], {tag: 'td'},
            [[], {tag: 'span', class: ['prefix', 'block']},
              {tag: 'span', class: ['prefix', 'title'], textContent: 'prefix: '},
              this.prefixInput
            ],
            [[], {tag: 'span', class: ['suffix', 'block']},
              {tag: 'span', class: ['suffix', 'title'], textContent: 'suffix: '},
              this.suffixInput
            ],
            [[], {tag: 'span', class: ['ignoreCase', 'block']},
              //{tag: 'span', class: ['ignore', 'title'], textContent: 'ignore: '},
              this.ignoreCaseChecker
            ],
            [[], {tag: 'span', class: ['target', 'block']},
              {tag: 'span', class: ['target', 'title'], textContent: 'targetType: '},
              this.targetTypeSelector,
              this.customTargetInput
            ]
          ]
        ],
        [[], {tag: 'tr'},
          [[], {tag: 'td'},
            [[], {tag: 'span', class: ['place', 'block']},
              {tag: 'span', class: ['place', 'title'], textContent: 'place: '},
              this.placeInput
            ],
            [[], {tag: 'span', class: ['paddingChar', 'block']},
              {tag: 'span', class: ['paddingChar', 'title'], textContent: 'paddingChar: '},
              this.paddingCharInput
            ],
            [[], {tag: 'span', class: ['align', 'block']},
              {tag: 'span', class: ['align', 'title'], textContent: 'align: '},
              this.alignSelector
            ],
            [[], {tag: 'span', class: ['base', 'block']},
              {tag: 'span', class: ['base', 'title'], textContent: 'outputBase: '},
              this.baseSelector,
            ],
            [[], {tag: 'span', class: ['upperCase', 'block']},
              //{tag: 'span', class: ['upperCase', 'title'], textContent: 'upperCase: '},
              this.upperCaseChecker,
            ],
          ]
        ],
        [[], {tag: 'tr'},
          [[], {tag: 'td'},
            [[], {tag: 'span', class: ['start', 'block']},
              {tag: 'span', class: ['start', 'title'], textContent: 'start: '},
              this.startInput
            ],
            [[], {tag: 'span', class: ['end', 'block']},
              {tag: 'span', class: ['end', 'title'], textContent: 'end: '},
              this.endInput
            ],
            [[], {tag: 'span', class: ['increment', 'block']},
              {tag: 'span', class: ['increment', 'title'], textContent: 'increment: '},
              this.incrementInput
            ],
            [[], {tag: 'span', class: ['add', 'block']},
              {tag: 'span', class: ['add', 'title'], textContent: 'add: '},
              this.addInput
            ],
            [[], {tag: 'span', class: ['multiply', 'block']},
              {tag: 'span', class: ['multiply', 'title'], textContent: 'multiply: '},
              this.multiplyInput
            ]
          ]
        ],
        [[], {tag: 'tr'},
          [[], {tag: 'td'},
            [[], {tag: 'span', class: ['replaceString', 'block']},
              {tag: 'span', class: ['replaceString', 'title'], textContent: 'replaceString: '},
              this.replaceStringInput
            ],
          ]
        ],
        [[], {tag: 'tr'},
          [[], {tag: 'td'},
            this.markButton,
            [[], {tag: 'div', class: 'btn-group'},
              this.firstButton,
              this.middleButton,
              this.lastButton,
            ],
            [[], {tag: 'div', class: 'btn-group'},
              this.previousButton,
              this.nextButton,
            ],
            [[], {tag: 'span', class: ['editType', 'block']},
              {tag: 'span', class: ['editType', 'title'], textContent: 'editType: '},
              this.editTypeSelector,
            ],
            [[], {tag: 'div', class: 'btn-group'},
              this.editButton,
              this.editAllButton,
            ],
            [[], {tag: 'span', class: ['newLine', 'block']},
              {tag: 'span', class: ['newLine', 'title'], textContent: 'newLine: '},
              this.newLineInput,
              this.appendNewLineButton
            ]
          ]
        ],
      ]
    );
  }


  setTabIndex() {
    this.kPositions = {
      'prefix': this.prefixInput,
      'suffix': this.suffixInput,
      'ignoreCase': this.ignoreCaseChecker.firstChild,
      'targetType': this.targetTypeSelector,
      'customTarget': this.customTargetInput,
      'place': this.placeInput,
      'paddingChar': this.paddingCharInput,
      'align': this.alignSelector,
      'outputBase': this.baseSelector,
      'upperCase': this.upperCaseChecker,
      'start': this.startInput,
      'end': this.endInput,
      'increment': this.incrementInput,
      'add': this.addInput,
      'multiply': this.multiplyInput,
      'mark': this.markButton,
      'first': this.firstButton,
      'middle': this.middleButton,
      'last': this.lastButton,
      'previous': this.previousButton,
      'next': this.nextButton,
      'editType': this.editTypeButton,
      'edit': this.editButton,
      'editAll': this.editAllButton,
      'newLine': this.newLineInput,
      'appendNewLine': this.appendNewLineButton
    }

    let i = 0;
    this.prefixInput.tabIndex = ++i;
    this.suffixInput.tabIndex = ++i;
    this.ignoreCaseChecker.firstChild.tabIndex = ++i;
    this.targetTypeSelector.tabIndex = ++i;
    this.customTargetInput.tabIndex = ++i;

    this.placeInput.tabIndex = ++i;
    this.paddingCharInput.tabIndex = ++i;
    this.alignSelector.tabIndex = ++i;
    this.baseSelector.tabIndex = ++i;
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

  focusNext(evt) {
    focusNext(this.tabStopElements);
  }

  focusPrevious(evt) {
    focusPrevious(this.tabStopElements);
  }

  setInput(obj, property, type, selector) {
    return (evt) => {
      if(type === 'number') {
        let num = parseInt(evt.target.value, 10);
        if(isNaN(num)) {
          num = 0;
        }
        obj[property] = num;
      } else if(type === 'checker') {
        obj[property] = evt.target.checked;
      } else if(type === 'selector') {
        if(selector) {
          obj[property] = selector[evt.target.value];
        } else {
          obj[property] = evt.target.value;
        }
      } else {
        obj[property] = evt.target.value;
      }
      EN.unmarkActive();
    }
  }

  callFunc(obj, funcName, param) {
    return (evt) => {
      obj[funcName](param);
    }
  }

  callSetRegex(property) {
    return (evt) => {
      EN.conditions.setRegex(evt.target.value, property);
    }
  }

  setTarget() {
    return (evt) => {
      if(evt.target.value === 'custom') {
        this.customTargetInput.readOnly = false;
        EN.conditions.targetType = evt.target.value;
        if(!isEmptyString(EN.conditions.customTarget)) {
          this.customTargetInput.value = EN.conditions.customTarget;
        } else {
          EN.conditions.setRegex(this.customTargetInput.value, 'customTarget');
        }
      } else {
        this.customTargetInput.readOnly = true;
        EN.conditions.targetType = evt.target.value;
        this.customTargetInput.value = this.getCustomTarget(evt.target.value);
      }
    }
  }

  getCustomTarget(targetType) {
    if(targetType === 'custom') {
      return EN.conditions.customTarget;
    } else if(targetType === 'hexadecimal') {
      return ENConditions.getHexadecimalRegexString();
    }
    return ENConditions.getDecimalRegexString();
  }
}
