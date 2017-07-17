"use babel";

import {
  appendNewLine,
  //destroyActiveDecoratedMarker,
  getBufferRangeSelectedMarker,
  getChangedConfig,
  getEditorDecoratedMarker,
} from "./utilities/atom-utility";
import { disposeEventListeners, setEventListener } from "./utilities/html-utility";
import { getReversedNewArray, isEmptyObject, isEmptyString } from "./utilities/utility";
import { CompositeDisposable } from "atom";
import ENConditions from "./edit-numbers-conditions";
import EditNumbersView from "./edit-numbers-view";
//debug
//import { logLine, logRange } from "./atom-utility"

export default {
  "config": {
    "autoFocus": {
      "order": 1,
      "type": "boolean",
      "description": "autoFocus",
      "default": true,
    },
    "autoFocusPosition": {
      "order": 2,
      "type": "string",
      "description": "autoFocusPosition",
      "default": "prefix",
      "enum": [
         "editType", "mark", "first", "previous", "middle", "next", "last", "edit", "editAll", "newLine", "appendNewLine", "saveDefault", "loadDefault",
        "prefix", "suffix", "ignoreCase",
        "targetPaddingChar", "targetSign", "targetAlign", "targetRadix", "targetCase", "useCustomTarget", "customTarget",
        "digits", "paddingChar", "sign", "align", "radix", "upperCase",
        "start", "end", "increment", "add", "multiply",
      ],
    },

    "defaultPrefix": {
      "order": 3,
      "type": "string",
      "description": "prefix",
      "default": "",
    },
    "defaultSuffix": {
      "order": 4,
      "type": "string",
      "description": "suffix",
      "default": "",
    },
    "defaultIgnoreCase": {
      "order": 5,
      "type": "boolean",
      "description": "ignoreCase",
      "default": false,
    },

    "defaultTargetPaddingChar": {
      "order": 6,
      "type": "string",
      "description": "targetPaddingChar",
      "default": "0",
    },
    "defaultTargetSign": {
      "order": 7,
      "type": "string",
      "description": "targetSign",
      "default": "minus",
      "enum": ["minus", "plus", "space", "none"],
    },
    "defaultTargetAlign": {
      "order": 8,
      "type": "string",
      "description": "targetAlign",
      "default": "right",
      "enum": ["right", "left", "right_lead_sign"],
    },
    "defaultTargetRadix": {
      "order": 9,
      "type": "string",
      "description": "targetRadix",
      "default": "decimal",
      "enum": ["decimal", "hexadecimal"],
    },
    "defaultTargetCase": {
      "order": 10,
      "type": "string",
      "description": "targetCase",
      "default": "both",
      "enum": ["both", "lower", "upper"],
    },
    "defaultUseCustomTarget": {
      "order": 11,
      "type": "boolean",
      "description": "useCustomTarget",
      "default": false,
    },
    "defaultCustomTarget": {
      "order": 12,
      "type": "string",
      "description": "customTarget",
      "default": "",
    },

    "defaultDigits": {
      "order": 13,
      "type": "integer",
      "description": "digits",
      "default": 1,
      "minimum": 1,
    },
    "defaultPaddingChar": {
      "order": 14,
      "type": "string",
      "description": "paddingChar",
      "default": "0",
    },
    "defaultSign": {
      "order": 15,
      "type": "string",
      "description": "sign",
      "default": "minus",
      "enum": ["minus", "plus", "space", "none"],
    },
    "defaultAlign": {
      "order": 16,
      "type": "string",
      "description": "align",
      "default": "right",
      "enum": ["right", "left", "right_lead_sign"],
    },
    "defaultOutputRadix": {
      "order": 17,
      "type": "string",
      "description": "outputRadix",
      "default": "decimal",
      "enum": ["decimal", "hexadecimal"],
    },
    "defaultUpperCase": {
      "order": 18,
      "type": "boolean",
      "description": "upperCase",
      "default": true,
    },

    "defaultStart": {
      "order": 19,
      "type": "number",
      "description": "start",
      "default": 0,
    },
    "defaultEnd": {
      "order": 20,
      "type": "number",
      "description": "end",
      "default": 0,
    },
    "defaultIncrement": {
      "order": 21,
      "type": "number",
      "description": "increment",
      "default": 1,
    },
    "defaultAdd": {
      "order": 22,
      "type": "number",
      "description": "add",
      "default": 0,
    },
    "defaultMuliply": {
      "order": 23,
      "type": "number",
      "description": "muliply",
      "default": 1,
    },

    "defaultEditType": {
      "order": 24,
      "type": "string",
      "description": "editType",
      "default": "overwrite",
      "enum": ["overwrite", "modify", "insert"],
    },
    "defaultNewLine": {
      "order": 25,
      "type": "integer",
      "description": "newLine",
      "default": 1,
      "minimum": 1,
    },
  },

  "name": "edit-numbers",
  "editNumbersView": null,
  "panel": null,
  "subscriptions": null,

  activate() {
    this.markers = [];
    this.subscriptions = new CompositeDisposable();

    this.conditions = new ENConditions();
    this.getConfig();
    this.editNumbersView = new EditNumbersView();
    this.panel = atom.workspace.addBottomPanel({
      "item": this.editNumbersView.getElement(),
      "visible": false,
      "clasName": this.name,
    });

    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "edit-numbers:toggle": () => { this.toggle(); },
      "edit-numbers:settings": () => { this.settings(); },
    }));
    this.subscriptions.add(atom.commands.add(this.editNumbersView.rootElement, {
      "edit-numbers:focusNext": () => { this.editNumbersView.focusNext(); },
      "edit-numbers:focusPrevious": () => { this.editNumbersView.focusPrevious(); },
      "edit-numbers:previous": () => { this.preCall("selectPrevious"); },
      "edit-numbers:next": () => { this.preCall("selectNext"); },
      "edit-numbers:mark": () => { this.preCall("mark"); },
      "edit-numbers:edit": () => { this.preCall("edit"); },
      "edit-numbers:editAll": () => { this.preCall("editAll"); },
    }));
  },

  deactivate() {
    this.panel.destroy();
    this.subscriptions.dispose();
    this.editNumbersView.destroy();
    disposeEventListeners([this.keyDownSubsription]);
  },

  /*
  serialize() {
    return {
      editNumbersViewState: this.editNumbersView.serialize()
    };
  },
  //*/

  toggle() {
    if (this.panel.isVisible()) {
      this.hidePanel();
    } else {
      this.panel.show();
      if (this.configs.autoFocus) {
        let position = this.editNumbersView.kPositions[this.configs.autoFocusPosition];
        position.focus();
      }
      this.keyDownSubsription = setEventListener(document, "keydown", this.keyDownEscape(), true);
    }
  },

  settings() {
    atom.workspace.open(`atom://config/packages/${this.name}`);
  },

  getConfig() {
    this.configs = {};
    this.configs.autoFocus = atom.config.get(`${this.name}.autoFocus`);
    this.subscriptions.add(atom.config.onDidChange(`${this.name}.autoFocus`,
      getChangedConfig(this.configs, "autoFocus")));
    this.configs.autoFocusPosition = atom.config.get(`${this.name}.autoFocusPosition`);
    this.subscriptions.add(atom.config.onDidChange(`${this.name}.autoFocusPosition`,
      getChangedConfig(this.configs, "autoFocusPosition")));
    this.getConditions();
  },

  getConditions() {
    this.conditions.prefix = atom.config.get(`${this.name}.defaultPrefix`);
    this.conditions.suffix = atom.config.get(`${this.name}.defaultSuffix`);
    this.conditions.ignoreCase = atom.config.get(`${this.name}.defaultIgnoreCase`);

    this.conditions.targetPaddingChar = atom.config.get(`${this.name}.defaultTargetPaddingChar`);
    this.conditions.targetSign = atom.config.get(`${this.name}.defaultTargetSign`);
    this.conditions.targetAlign = atom.config.get(`${this.name}.defaultTargetAlign`);
    this.conditions.targetRadix = atom.config.get(`${this.name}.defaultTargetRadix`);
    this.conditions.targetCase = atom.config.get(`${this.name}.defaultTargetCase`);
    this.conditions.useCustomTarget = atom.config.get(`${this.name}.defaultUseCustomTarget`);
    this.conditions.customTarget = atom.config.get(`${this.name}.defaultCustomTarget`);

    this.conditions.digits = atom.config.get(`${this.name}.defaultDigits`);
    this.conditions.paddingChar = atom.config.get(`${this.name}.defaultPaddingChar`);
    this.conditions.sign = atom.config.get(`${this.name}.defaultSign`);
    this.conditions.align = atom.config.get(`${this.name}.defaultAlign`);
    this.conditions.radix = atom.config.get(`${this.name}.defaultOutputRadix`);
    this.conditions.upperCase = atom.config.get(`${this.name}.defaultUpperCase`);

    this.conditions.start = atom.config.get(`${this.name}.defaultStart`);
    this.conditions.end = atom.config.get(`${this.name}.defaultEnd`);
    this.conditions.increment = atom.config.get(`${this.name}.defaultIncrement`);
    this.conditions.add = atom.config.get(`${this.name}.defaultAdd`);
    this.conditions.multiply = atom.config.get(`${this.name}.defaultMuliply`);

    this.conditions.editType = atom.config.get(`${this.name}.defaultEditType`);

    this.conditions.newLine = atom.config.get(`${this.name}.defaultNewLine`);
  },

  setConfig() {
    atom.config.set(`${this.name}.defaultPrefix`, this.conditions.prefix);
    atom.config.set(`${this.name}.defaultSuffix`, this.conditions.suffix);
    atom.config.set(`${this.name}.defaultIgnoreCase`, this.conditions.ignoreCase);

    atom.config.set(`${this.name}.defaultTargetPaddingChar`, this.conditions.targetPaddingChar);
    atom.config.set(`${this.name}.defaultTargetSign`, this.conditions.targetSign);
    atom.config.set(`${this.name}.defaultTargetAlign`, this.conditions.targetAlign);
    atom.config.set(`${this.name}.defaultTargetRadix`, this.conditions.targetRadix);
    atom.config.set(`${this.name}.defaultTargetCase`, this.conditions.targetCase);
    atom.config.set(`${this.name}.defaultUseCustomTarget`, this.conditions.useCustomTarget);
    atom.config.set(`${this.name}.defaultCustomTarget`, this.conditions.customTarget);

    atom.config.set(`${this.name}.defaultDigits`, this.conditions.digits);
    atom.config.set(`${this.name}.defaultPaddingChar`, this.conditions.paddingChar);
    atom.config.set(`${this.name}.defaultSign`, this.conditions.sign);
    atom.config.set(`${this.name}.defaultAlign`, this.conditions.align);
    atom.config.set(`${this.name}.defaultOutputRadix`, this.conditions.radix);
    atom.config.set(`${this.name}.defaultUpperCase`, this.conditions.upperCase);

    atom.config.set(`${this.name}.defaultStart`, this.conditions.start);
    atom.config.set(`${this.name}.defaultEnd`, this.conditions.end);
    atom.config.set(`${this.name}.defaultIncrement`, this.conditions.increment);
    atom.config.set(`${this.name}.defaultAdd`, this.conditions.add);
    atom.config.set(`${this.name}.defaultMuliply`, this.conditions.multiply);

    atom.config.set(`${this.name}.defaultEditType`, this.conditions.editType);

    atom.config.set(`${this.name}.defaultNewLine`, this.conditions.newLine);
  },

  preCall(funcName) {
    let editor = atom.workspace.getActiveTextEditor();
    let markers = [];
    let result = null;

    if (isEmptyString(editor)) {
      return null;
    }
    if (funcName !== "mark" && funcName !== "appendNewLine") {
      markers = getEditorDecoratedMarker(this.markers, editor);
      if (markers.length === 0) {
        markers = this.mark(editor);
        if (markers.length === 0) {
          return null;
        }
      }
    }

    switch (funcName) {
      case "selectFirst":
        result = this.select(editor, markers, "first");
        break;
      case "selectMiddle":
        result = this.select(editor, markers, "middle");
        break;
      case "selectLast":
        result = this.select(editor, markers, "last");
        break;
      case "selectNext":
        result = this.select(editor, markers, "next");
        break;
      case "selectPrevious":
        result = this.select(editor, markers, "previous");
        break;
      case "edit":
        result = this.edit(editor, null, markers);
        break;
      case "editAll":
        result = this.editAll(editor, markers);
        break;
      case "mark":
        result = this.mark(editor);
        break;
      case "appendNewLine":
        appendNewLine(editor, this.conditions.newLine);
        break;
      default:
        return null;
    }

    return result;
  },

  select(editor, markers, position) {
    if (isEmptyString(editor)) {
      return null;
    }
    if (markers.length === 0) {
      return null;
    }

    let target = markers[0];
    if (position === "last") {
      target = markers[markers.length - 1];
    } else if (position === "middle") {
      target = markers[Math.floor(markers.length / 2)];
    } else if (position !== "first") {
      let cursorPos = editor.getCursorBufferPosition();
      let markerPos = [0, 0];
      let work = [];
      let compFlag = 1;

      if (position === "next") {
        work = markers;
      } else {
        target = markers[markers.length - 1];
        work = getReversedNewArray(markers);
        compFlag = -1;
      }
      for (let marker of work) {
        markerPos = marker.getHeadBufferPosition(); //marker is sorted?
        if (markerPos.compare(cursorPos) === compFlag) {
          target = marker;
          break; //sortされている(前提)なのでbreak
        }
      }
    }

    editor.setCursorBufferPosition(target.getHeadBufferPosition(), { "autoscroll": true });
    editor.selectMarker(target);
    this.updateView(editor, target.getBufferRange());
    return target;
  },

  edit(editor, marker, markers) {
    if (isEmptyString(editor)) {
      return;
    }
    if (markers.length === 0) {
      return;
    }

    let range = editor.getSelectedBufferRange();
    let target = getBufferRangeSelectedMarker(range, marker, markers);
    if (target === null) {
      target = this.select(editor, markers, "next");
      if (target === null) {
        return;
      }
      range = target.getBufferRange();
    }
    let text = editor.getTextInBufferRange(target.getBufferRange());
    text = this.conditions.getReplacedText(text);
    editor.setTextInBufferRange(range, text, { "normalizeLineEnding": true, "undo": "" }); //1つずつ置き換えているからかundoも1つずつになる
    this.conditions.update();
    this.select(editor, markers, "next");
  },

  editAll(editor, markers) {
    if (isEmptyString(editor)) {
      return;
    }
    if (markers.length === 0) {
      return;
    }
    this.conditions.initialize();
    for (let marker of markers) {
      editor.selectMarker(marker);
      this.edit(editor, marker, markers);
    }
    this.unmark();
  },

  mark(editor) {
    if (isEmptyString(editor)) {
      return [];
    }
    this.unmark();
    this.conditions.initialize();
    this.conditions.createRegex();
    if (isEmptyObject(this.conditions.regex)) {
      return [];
    }
    this.conditions.regex.lastIndex = 0;

    let activeMarkers = [];
    editor.scan(
      this.conditions.regex, { "leadingContextLineCount": 0, "trailingContextLineCount": 0 },
      (obj) => {
        let marker = editor.markBufferRange(obj.range, { "invalidate": "never" });
        this.markers.push(marker);
        activeMarkers.push(marker);
        editor.decorateMarker(marker, { "type": "highlight", "class": this.name });
      }
    );
    if (activeMarkers.length > 0) {
      this.updateView(editor, activeMarkers[0].getBufferRange());
    } else {
      this.updateView(editor, null);
    }
    return activeMarkers;
  },

  //unmarkActive() {
  //  this.conditions.initialize();
  //  this.markers = destroyActiveDecoratedMarker(this.markers);
  //},

  unmark() {
    this.conditions.initialize();
    for (let marker of this.markers) {
      marker.destroy();
    }
    this.markers = [];
  },

  keyDownEscape() {
    return (evt) => {
      let keystroke = atom.keymaps.keystrokeForKeyboardEvent(evt);
      if (keystroke === "escape") {
        this.hidePanel();
      }
    };
  },

  hidePanel() {
    this.panel.hide();
    this.unmark();
    if (this.keyDownSubsription !== null) {
      disposeEventListeners([this.keyDownSubsription]);
      this.keyDownSubsription = null;
    }
  },

  updateView(editor, range) {
    this.editNumbersView.replaceStringInput.value = "";
    if (!isEmptyObject(range)) {
      this.editNumbersView.replaceStringInput.value =
        this.conditions.getReplacedText(editor.getTextInBufferRange(range));
    }
  },
};
