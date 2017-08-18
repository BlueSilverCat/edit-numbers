"use babel";

import {
  //destroyActiveDecoratedMarker,
  appendNewLine,
  getBufferRangeSelectedMarker,
  getChangedConfig,
  getConfigAndSetOnDidChange,
  getDefaultConfig,
  getEditorDecoratedMarker,
  makeDefaultNamePair,
  setDefaultConfig,
} from "./utilities/atom-utility";
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
      "enum": [],
    },

    "defaultEditType": {
      "order": 3,
      "type": "string",
      "description": "editType",
      "default": "overwrite",
      "enum": ["overwrite", "modify", "insert"],
    },
    "defaultPrefix": {
      "order": 4,
      "type": "string",
      "description": "prefix",
      "default": "",
    },
    "defaultSuffix": {
      "order": 5,
      "type": "string",
      "description": "suffix",
      "default": "",
    },
    "defaultIgnoreCase": {
      "order": 6,
      "type": "boolean",
      "description": "ignoreCase",
      "default": false,
    },

    "defaultTargetPaddingChar": {
      "order": 7,
      "type": "string",
      "description": "targetPaddingChar",
      "default": "0",
    },
    "defaultTargetSign": {
      "order": 8,
      "type": "string",
      "description": "targetSign",
      "default": "minus",
      "enum": ["minus", "plus", "space", "none"],
    },
    "defaultTargetAlign": {
      "order": 9,
      "type": "string",
      "description": "targetAlign",
      "default": "right",
      "enum": ["right", "left", "right_lead_sign"],
    },
    "defaultTargetRadix": {
      "order": 10,
      "type": "string",
      "description": "targetRadix",
      "default": "decimal",
      "enum": ["decimal", "hexadecimal"],
    },
    "defaultTargetCase": {
      "order": 11,
      "type": "string",
      "description": "targetCase",
      "default": "both",
      "enum": ["both", "lower", "upper"],
    },
    "defaultUseCustomTarget": {
      "order": 12,
      "type": "boolean",
      "description": "useCustomTarget",
      "default": false,
    },
    "defaultCustomTarget": {
      "order": 13,
      "type": "string",
      "description": "customTarget",
      "default": "",
    },

    "defaultDigits": {
      "order": 14,
      "type": "integer",
      "description": "digits",
      "default": 1,
      "minimum": 1,
    },
    "defaultPaddingChar": {
      "order": 15,
      "type": "string",
      "description": "paddingChar",
      "default": "0",
    },
    "defaultSign": {
      "order": 16,
      "type": "string",
      "description": "sign",
      "default": "minus",
      "enum": ["minus", "plus", "space", "none"],
    },
    "defaultAlign": {
      "order": 17,
      "type": "string",
      "description": "align",
      "default": "right",
      "enum": ["right", "left", "right_lead_sign"],
    },
    "defaultRadix": {
      "order": 18,
      "type": "string",
      "description": "outputRadix",
      "default": "decimal",
      "enum": ["decimal", "hexadecimal"],
    },
    "defaultUpperCase": {
      "order": 19,
      "type": "boolean",
      "description": "upperCase",
      "default": true,
    },

    "defaultStart": {
      "order": 20,
      "type": "number",
      "description": "start",
      "default": 0,
    },
    "defaultEnd": {
      "order": 21,
      "type": "number",
      "description": "end",
      "default": 0,
    },
    "defaultIncrement": {
      "order": 22,
      "type": "number",
      "description": "increment",
      "default": 1,
    },
    "defaultAdd": {
      "order": 23,
      "type": "number",
      "description": "add",
      "default": 0,
    },
    "defaultMultiply": {
      "order": 24,
      "type": "number",
      "description": "multiply",
      "default": 1,
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
    this.defaultNames = makeDefaultNamePair(this.config, this.conditions, this.name);

    this.getConfig();
    this.editNumbersView = new EditNumbersView();
    this.config.autoFocusPosition.enum = Object.keys(this.editNumbersView.autoFocusPositions);

    this.panel = atom.workspace.addBottomPanel({
      "item": this.editNumbersView.getElement(),
      "visible": false,
      "className": this.name,
    });

    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "edit-numbers:toggle": () => { this.toggle(); },
      "edit-numbers:settings": () => { this.settings(); },
      "core:cancel": () => { this.hidePanel(); },
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
  },

  toggle() {
    if (this.panel.isVisible()) {
      this.hidePanel();
    } else {
      this.panel.show();
      if (this.configs.autoFocus) {
        this.editNumbersView.autoFocusPositions[this.configs.autoFocusPosition].focus();
      }
    }
  },

  settings() {
    atom.workspace.open(`atom://config/packages/${this.name}`);
  },

  getConfig() {
    this.configs = {};
    this.configs.autoFocus = getConfigAndSetOnDidChange(
      `${this.name}.autoFocus`, this.subscriptions, getChangedConfig(this.configs, "autoFocus"));
    this.configs.autoFocusPosition = getConfigAndSetOnDidChange(
      `${this.name}.autoFocusPosition`, this.subscriptions, getChangedConfig(this.configs, "autoFocusPosition"));
    this.getConditions();
  },

  getConditions() {
    getDefaultConfig(this.defaultNames, this.name, this.conditions);
  },

  setConfig() {
    setDefaultConfig(this.defaultNames, this.name, this.conditions);
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

    let selectedRange = editor.getSelectedBufferRange();
    if (selectedRange.start.isEqual(selectedRange.end)) {
      selectedRange = [[0, 0], [editor.getLastBufferRow() + 1, 0]];
    }

    let activeMarkers = [];
    editor.scanInBufferRange(
      this.conditions.regex,
      selectedRange,
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

  hidePanel() {
    this.panel.hide();
    this.unmark();
  },

  updateView(editor, range) {
    this.editNumbersView.replaceStringInput.value = "";
    if (!isEmptyObject(range)) {
      this.editNumbersView.replaceStringInput.value =
        this.conditions.getReplacedText(editor.getTextInBufferRange(range));
    }
  },
};
