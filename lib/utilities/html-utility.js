"use babel";

import { isEmptyString } from "./utility";

//---
function appendSpan(target, str, data, addbr) {
  let span = document.createElement("span");

  span.textContent = str + data.toString();
  target.appendChild(span);
  if (addbr) {
    target.appendChild(document.createElement("br"));
  }
}

function redigitsEle(target, oldEle, newEle) {
  if (oldEle === null) {
    target.appendChild(newEle);
  } else {
    target.redigitsChild(newEle, oldEle);
  }
}

/*
function countSpan(ele, count){
  let elelist = ele.children, tmp = null;

  if(count === null){
    tmp = {maxLength: 0, number: 0};
  } else {
    tmp = count;
  }

  for(let i = 0; i < elelist.length; ++i) {
    if(elelist[i].tagName === "SPAN") {
      tmp.number += 1;
      tmp.maxLength = tmp.maxLength > elelist[i].textContent.length ? tmp.maxLength : elelist[i].textContent.length;
    }
    tmp = countSpan(elelist[i], tmp);
  }
  return tmp;
}

function getElement(tagName, ele, out){
  let children = ele.children, tmp = [];

  if(out) {
    tmp = out;
  }

  for(let i = 0; i < children.length; ++i) {
    if(children[i].tagName === tagName) {
      tmp.push(children[i]);
    }
    tmp = getElement(tagName, children[i], tmp);
  }
  return tmp;
}
*/

function createElementWithClass(tag, cla, content) {
  let ele = document.createElement(tag);

  for (let i = 0; i < cla.length; ++i) {
    if (cla[i] !== null) {
      ele.classList.add(cla[i]);
    }
  }
  if (content) {
    ele.innerHTML = content;
  }
  return ele;
}

function createElementWithIDClass(tag, id, cla, content) {
  let ele = createElementWithClass(tag, cla, content);

  if (isEmptyString(id) === false) {
    ele.id = id;
  }
  return ele;
}

//{tab:"div", id: "id", class:[`btn`, `btn-sm`], textContent"text", innerHTML: "innerHTML", tabIndex: n,
//children: [HTMLElements] }
function makeElementFromObj(obj, addClass) {
  let tag = null;
  let cla = [];
  let element = null;

  if (typeof addClass !== "undefined") {
    cla = addClass;
  }

  if (obj.hasOwnProperty("tag")) {
    tag = obj.tag;
  } else {
    return null;
  }
  if (obj.hasOwnProperty("class")) {
    cla = cla.concat(obj.class);
  }
  element = createElementWithClass(tag, cla);
  if (obj.hasOwnProperty("id")) {
    element.id = obj.id;
  }
  if (obj.hasOwnProperty("textContent")) {
    element.textContent = obj.textContent;
  }
  if (obj.hasOwnProperty("innerHTML")) {
    element.innerHTML = obj.innerHTML;
  }
  if (obj.hasOwnProperty("tabIndex")) {
    element.tabIndex = obj.tabIndex;
  } else {
    element.tabIndex = -1;
  }
  if (obj.hasOwnProperty("children")) {
    for (let ele of obj.children) {
      element.appendChild(ele);
    }
  }
  return element;
}

//HTMLElementか判定
function isNode(node) {
  if (node instanceof HTMLElement) {
    return true;
  }
  if (node.hasOwnProperty("nodeName")) {
    return true;
  }
  if (node.hasOwnProperty("nodeType") && node.nodeType === 1) {
    return true;
  }
  return false;
}

/*
makeHTML( ["cat", "dog"], {tab:"div", class:[`btn`, `btn-sm`], innerHTML: "inner"},
  [[], {tab:"div", class:[`btn`, `btn-sm`], innerHTML: "inner"},
    {tab:"div", class:[`btn`, `btn-sm`], innerHTML: "inner"}
  ]
)
//*/
//第1引数: 共通して付けるクラス
//第2引数: root エレメント block要素。block要素以外も取れるようにする
//その他: rootエレメントの子要素。配列を渡すと [[class], root, child1, ...]となる
function makeHTML(...args) {
  if (args.length < 2) {
    return null;
  }
  let cla = args[0];
  let rootElement = makeElementFromObj(args[1], cla);

  for (let i = 2; i < args.length; i++) {
    if (Object.prototype.toString.call(args[i]) === "[object Array]") {
      let result = makeHTML(cla.concat(args[i][0]), ...args[i].slice(1));
      if (result) {
        rootElement.appendChild(result);
      }
    } else if (isNode(args[i])) {
      rootElement.appendChild(args[i]);
    } else {
      rootElement.appendChild(makeElementFromObj(args[i], cla));
    }
  }
  return rootElement;
}

function setTabIndex(rootElement, start) {
  let index = start;
  rootElement.tabIndex = index++;
  for (let i = 0; i < rootElement.children.length; ++i) {
    index = setTabIndex(rootElement.children[i], index);
  }
  return index;
}

function toggleDisabled(ele, state) {
  for (let i = 0; i < ele.length; i++) {
    if (state) {
      ele[i].disabled = true;
    } else {
      ele[i].disabled = false;
    }
  }
}

function toggleReadOnly(ele, state) {
  for (let i = 0; i < ele.length; i++) {
    if (state) {
      ele[i].readOnly = true;
    } else {
      ele[i].readOnly = false;
    }
  }
}

function toggleDisplayNone(ele, state) {
  for (let i = 0; i < ele.length; i++) {
    if (state) {
      ele[i].style = "display:none";
    } else {
      ele[i].style = "display:";
    }
  }
}

function setEventListenerClickAndEnter(element, func, useCapture) {
  element.addEventListener("click", func, useCapture);
  element.addEventListener("keydown", func, useCapture);
  return [
    [element, "click", func, useCapture],
    [element, "keydown", func, useCapture],
  ];
}

function setEventListener(element, eventType, func, useCapture) {
  element.addEventListener(eventType, func, useCapture);
  return [element, eventType, func, useCapture];
}

function disposeEventListeners(eventListeners) {
  for (let eventListener of eventListeners) {
    if (Object.prototype.toString.call(eventListener) === "[object Array]" &&
      Object.prototype.toString.call(eventListener[0]) === "[object Array]") {
      disposeEventListeners(eventListener);
    } else {
      eventListener[0].removeEventListener(eventListener[1], eventListener[2], eventListener[3]);
    }
  }
}

function getTabStopElements(rootElement, className) {
  let allElements = rootElement.getElementsByClassName(className);
  let tabStopElements = [];

  for (let i = 0; i < allElements.length; ++i) {
    if (allElements[i].tabIndex >= 0) {
      tabStopElements.push(allElements[i]);
    }
  }
  tabStopElements.sort((x, y) => {
    if (x.tabIndex > y.tabIndex) {
      return 1;
    }
    if (x.tabIndex < y.tabIndex) {
      return -1;
    }
    return 0;
  });
  return tabStopElements;
}

function focusNext(tabStopElements) {
  let current = document.activeElement.tabIndex;

  for (let i = 0; i < tabStopElements.length; ++i) {
    if (tabStopElements[i].tabIndex > current &&
      tabStopElements[i].parentElement.style.display !== "none" &&
      tabStopElements[i].disabled !== true) {
      tabStopElements[i].focus();
      return;
    }
  }
  tabStopElements[0].focus();
}

function focusPrevious(tabStopElements) {
  let current = document.activeElement.tabIndex;

  for (let i = tabStopElements.length - 1; i >= 0; --i) {
    if (tabStopElements[i].tabIndex < current &&
      tabStopElements[i].parentElement.style.display !== "none" &&
      tabStopElements[i].disabled !== true) {
      tabStopElements[i].focus();
      return;
    }
  }
  tabStopElements[tabStopElements.length - 1].focus();
}

export {
  appendSpan,
  redigitsEle,
  createElementWithClass,
  createElementWithIDClass,
  makeElementFromObj,
  makeHTML,
  setTabIndex,
  isNode,
  toggleDisabled,
  toggleReadOnly,
  toggleDisplayNone,
  setEventListenerClickAndEnter,
  setEventListener,
  disposeEventListeners,
  getTabStopElements,
  focusNext,
  focusPrevious,
};