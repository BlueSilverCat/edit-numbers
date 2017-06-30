"use babel";

import { createElementWithClass, isNode, setEventListener, setEventListenerClickAndEnter } from "./html-utility";
import { isEmpty } from "./utility";

function makeMiniEditor(text) {
  let editor = atom.workspace.buildTextEditor();

  editor.mini = true;
  editor.tabLength = 2;
  editor.softTabs = true;
  editor.softWrapped = false;
  //editor.buffer = new TextBuffer();
  editor.setText(text);
  return editor;
}

function makeMiniEditorWithView(text, cla) {
  let editor = makeMiniEditor(text);

  editor.view = atom.views.getView(editor);
  for (let i = 0; i < cla.length; ++i) {
    editor.view.classList.add(cla[i]);
  }
  return editor;
}

//for atom
function getActivatePackage(packageName) {
  let pack = atom.packages.getActivePackage(packageName);

  if (!pack) {
    pack = atom.packages.enablePackage(packageName);
  }
  return pack;
}

function checkEventClickOrEnter(evt) {
  if (evt.type === "click") {
    return true;
  }
  if (evt.type === "keydown") {
    let keyStroke = atom.keymaps.keystrokeForKeyboardEvent(evt);

    if (keyStroke === "enter") {
      return true;
    }
  }
  return false;
}

//ボタンを押された時の処理を返す
function attachToggle(ele, callback) {
  return (evt) => {
    if (checkEventClickOrEnter(evt) === false) {
      return;
    }

    const btn = "btn";
    const sel = "selected";

    if (ele.classList.contains(btn)) {
      if (ele.classList.contains(sel)) {
        ele.classList.remove(sel);
        callback(false);
        return;
      }
      ele.classList.add(sel);
      callback(true);
      //return;
    }
  };
}

function makeToggleBtn(ele, callback) {
  let func = attachToggle(ele, callback);

  return setEventListenerClickAndEnter(ele, func, false);
}

//現在の状態をボタンの見た目に反映させる
function toggleBtn(ele, state) {
  const btn = "btn";
  const sel = "selected";

  if (ele.classList.contains(btn)) {
    if (state) {
      ele.classList.add(sel);
    } else {
      ele.classList.remove(sel);
    }
  }
}

function getConfig(configName, func, subscriptions) {
  subscriptions.add(atom.config.onDidChange(configName, func));
  return atom.config.get(configName);
}

function getConfigAndSetOnDidChange(configName, subscriptions, callback) {
  subscriptions.add(atom.config.onDidChange(configName, callback));
  return atom.config.get(configName);
}

//config などが変更された時に呼び出だされる関数を返す
function setChangedConfig(target, property) {
  return (evt) => {
    target[property] = evt.newValue;
  };
}

function editorDidChange(editor, target, property) {
  return (_evt) => {
    target[property] = editor.getText();
  };
}

//
function makeMiniEditorAndSetEditorDidChange(className, text, obj, propertyName, subscriptions) {
  let miniEditor = makeMiniEditorWithView(text, className);
  subscriptions.add(
    miniEditor.onDidStopChanging(editorDidChange(miniEditor, obj, propertyName))
  );
  return miniEditor;
}


//native-key-bindings classのエレメントの子にしないとdeleteなど効かない
//type
//text :
//search : 消去ボタンが出る
//textarea : 広さを変えられる
function makeInputText(type, classes, placeholder, defaultValue, func, useCapture, listners) {
  let workClasses = [];
  if (classes !== null) {
    workClasses = workClasses.concat(classes);
  }

  let ele = null;
  if (type === "text") {
    workClasses.push("input-text");
    ele = createElementWithClass("input", workClasses);
  } else if (type === "search") {
    workClasses.push("input-search");
    ele = createElementWithClass("input", workClasses);
  } else if (type === "textarea") {
    workClasses.push("input-textarea");
    ele = createElementWithClass("textparea", workClasses);
  } else {
    return null;
  }
  ele.type = type;
  if (placeholder !== null) {
    ele.placeholder = placeholder;
  }
  if (defaultValue !== null) {
    ele.defaultValue = defaultValue;
  }

  if (!isEmpty(func)) {
    listners.push(setEventListener(ele, "input", func, useCapture));
  }
  return ele;
}

//Look stylequide
//title: string
//checked : bool
function makeCheckbox(classes, content, checked, func, useCapture, listners) {
  let ele = createElementWithClass("label", ["input-label"].concat(classes)); //, content);

  let child = createElementWithClass("input", ["input-checkbox"].concat(classes));
  child.type = "checkbox";
  child.checked = false;
  if (checked === true) {
    child.checked = checked;
  }
  ele.appendChild(child);
  if (isNode(content)) {
    ele.appendChild(content);
  } else {
    ele.appendChild(document.createTextNode(content));
  }

  //listners.push(setEventListenerClickAndEnter(child, func, useCapture));
  if (!isEmpty(func)) {
    listners.push(setEventListener(ele, "click", func, useCapture)); //spaceを押すとclickイベントが起こる
  }
  return ele;
}

//
function makeInputNumber(classes, placeholder, min, max, defaultValue, func, useCapture, listners) {
  let ele = createElementWithClass("input", ["input-number"].concat(classes));

  ele.type = "number";
  if (min !== null) {
    ele.min = min;
  }
  if (max !== null) {
    ele.max = max;
  }
  if (placeholder !== null) {
    ele.placeholder = placeholder;
  }
  if (defaultValue !== null) {
    ele.defaultValue = defaultValue;
  }
  if (!isEmpty(func)) {
    listners.push(setEventListener(ele, "input", func, useCapture));
  }
  return ele;
}

//
function makeSelector(classes, options, defaultValue, func, useCapture, listners) {
  let ele = createElementWithClass("select", ["input-select"].concat(classes));

  for (let option of options) {
    let child = createElementWithClass("option", [], option);
    if (defaultValue === option) {
      child.selected = true;
    }
    ele.appendChild(child);
  }
  if (!isEmpty(func)) {
    listners.push(setEventListener(ele, "click", func, useCapture));
  }

  return ele;
}

//inlineType : string
//"no-inline" or null
//"inline"
//"inline-tight"
//size : string
//"normal", or null
//"extra-small"
//"small"
//"large"
//color : string
//"no-color", or null
//"primary"
//"info"
//"success"
//"warning"
//"error"
//selected : bool
//icon : string
//toggle: bool
function makeButton(classes, content, selected, size, color, inlineType, icon, inner, toggle,
  func, useCapture, listners) {
  let workClasses = ["btn"];

  switch (size) {
    case "extra-small":
      workClasses.push("btn-xs");
      break;
    case "small":
      workClasses.push("btn-sm");
      break;
    case "large":
      workClasses.push("btn-lg");
      break;
    default:
  }

  switch (color) {
    case "primary":
      workClasses.push("btn-primary");
      break;
    case "info":
      workClasses.push("btn-info");
      break;
    case "success":
      workClasses.push("btn-success");
      break;
    case "warning":
      workClasses.push("btn-warning");
      break;
    case "error":
      workClasses.push("btn-error");
      break;
    default:
  }

  switch (inlineType) {
    case "inline":
      workClasses.push("inline-block");
      break;
    case "inline-tight":
      workClasses.push("inline-block");
      break;
    default:
  }

  if (selected === true) {
    workClasses.push("selected");
  }
  if (icon !== null && icon !== "no-icon") {
    workClasses = workClasses.concat(["icon", icon]);
  }

  let ele = createElementWithClass("button", workClasses.concat(classes));
  if (content !== null) {
    ele.textContent = content;
  }
  if (inner !== null) {
    ele.textContent = inner;
  }
  if (toggle === true) {
    //FIXME
  }
  //listners.push(setEventListenerClickAndEnter(ele, func, useCapture));
  if (!isEmpty(func)) {
    listners.push(setEventListener(ele, "click", func, useCapture)); //spaceを押すとclickイベントが起こる
  }
  return ele;
}

function getEditorDecoratedMarker(markers, editor) { //sort?
  let target = null;
  if (isEmpty(editor)) {
    target = atom.workspace.getActiveTextEditor();
    if (target === "") {
      return [];
    }
  }

  let result = [];
  let activeMarkers = editor.getMarkers();
  for (let marker of markers) {
    for (let activeMarker of activeMarkers) {
      if (activeMarker === marker) {
        result.push(marker);
      }
    }
  }

  return result;
}

function destroyActiveDecoratedMarker(markers) {
  let editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return [];
  }

  let remain = [];
  let activeMarkers = editor.getMarkers();
  for (let marker of markers) {
    for (let activeMarker of activeMarkers) {
      if (marker === activeMarker) {
        marker.destroy();
        break;
      }
    }
    if (!marker.isDestroyed()) {
      remain.push(marker);
    }
  }

  return remain;
}

function logRange(range) {
  console.log(
    "start_row: ", range.start.row,
    "start_column: ", range.start.column,
    "--- end_row: ", range.end.row,
    "end_column: ", range.end.column
  );
}

function getSelectedMarkerBufferRange(range, marker, markers) {
  let markerRange = null;
  if (marker) {
    markerRange = marker.getBufferRange();
    if (markerRange.isEqual(range)) {
      return marker;
    }
  }

  for (let work of markers) {
    markerRange = work.getBufferRange();
    if (markerRange.isEqual(range)) {
      return work;
    }
  }
  return null;
}

function getChangedConfig(obj, property) {
  return (evt) => {
    obj[property] = evt.newValue;
  };
}

function appendNewLine(editor, num) {
  let oldCursorPos = editor.getCursorBufferPosition();

  for (let i = 0; i < num; ++i) {
    editor.moveToBottom();
    editor.selectToBufferPosition(editor.getCursorBufferPosition());
    editor.insertNewline();
  }
  editor.setCursorBufferPosition(oldCursorPos, { "autoscroll": true });
}

function insertString(editor, string) {
  editor.selectToBufferPosition(editor.getCursorBufferPosition());
  editor.insertText(string, {
    "select": false,
    "autoIndent": false,
    "autoIndentNewline": false,
    "autoDecreaseIndent": false,
    "normalizeLineEndings": false,
    "undo": null,
  });
}

export {
  makeMiniEditor,
  makeMiniEditorWithView,
  getActivatePackage,
  makeToggleBtn,
  toggleBtn,
  attachToggle,
  getConfig,
  checkEventClickOrEnter,
  getConfigAndSetOnDidChange,
  setChangedConfig,
  editorDidChange,
  makeMiniEditorAndSetEditorDidChange,
  makeInputText,
  makeCheckbox,
  makeInputNumber,
  makeSelector,
  makeButton,
  getEditorDecoratedMarker,
  destroyActiveDecoratedMarker,
  logRange,
  getSelectedMarkerBufferRange,
  getChangedConfig,
  appendNewLine,
  insertString,
};
