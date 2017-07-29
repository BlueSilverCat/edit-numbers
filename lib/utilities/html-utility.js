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

function replaceEle(target, oldEle, newEle) {
  if (oldEle === null) {
    target.appendChild(newEle);
  } else {
    target.replaceChild(newEle, oldEle);
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

function createElementWithClass(tag, classes, content = null) {
  let ele = document.createElement(tag);

  if (Array.isArray(classes)) {
    for (let cla of classes) {
      if (!isEmptyString(cla)) {
        ele.classList.add(cla);
      }
    }
  } else if (!isEmptyString(classes)) {
    ele.classList.add(classes);
  }
  if (content) {
    ele.innerHTML = content;
  }
  ele.tabIndex = -1;
  return ele;
}

function createElementWithIDClass(tag, id, cla, content = null) {
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

//function setTabIndex(rootElement, start) {
//  let index = start;
//  rootElement.tabIndex = index++;
//  for (let i = 0; i < rootElement.children.length; ++i) {
//    index = setTabIndex(rootElement.children[i], index);
//  }
//  return index;
//}

function setTabIndex(elements) {
  for (let i = 0; i < elements.length; ++i) {
    if (elements[i].nodeName.toLowerCase() === "label" && elements[i].firstChild.nodeName.toLowerCase() === "input") {
      elements[i].firstChild.tabIndex = i;
    } else {
      elements[i].tabIndex = i;
    }
  }
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
    if (Object.prototype.toString.call(eventListener) !== "[object Array]") {
      continue;
    }
    if (Object.prototype.toString.call(eventListener[0]) === "[object Array]") {
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

function isTabStopElement(ele) {
  if (ele.style.display === "none" || ele.disabled === true) {
    return false;
  }
  return true;
}

//direction : "next"/"previous"
//tabStopElements is sorted
//tabStopElementsのindexと内容が一致している前提ならばもっと単純に出来る
function focusElement(tabStopElements, direction) {
  let start = 0;
  let end = tabStopElements.length - 1;
  let increment = 1;
  if (direction === "previous") {
    start = tabStopElements.length - 1;
    end = 0;
    increment = -1;
  }

  let current = document.activeElement.tabIndex;
  if (current === -1 && direction === "previous") {
    current = tabStopElements[tabStopElements.length - 1].tabIndex + 1;
  }

  for (let i = start; i * increment <= end * increment; i += increment) {
    if (tabStopElements[i].tabIndex * increment > current * increment && isTabStopElement(tabStopElements[i])) {
      tabStopElements[i].focus();
      return;
    }
  }
  for (let i = start; i * increment <= current * increment; i += increment) {
    if (isTabStopElement(tabStopElements[i])) {
      tabStopElements[i].focus();
      return;
    }
  }
}

function toggleDisabledNotSelected(selector, state) {
  for (let child of selector.childNodes) {
    if (child.nodeName.toLowerCase() === "option" && child.selected === false) {
      child.disabled = state;
    }
  }
}

export {
  appendSpan,
  replaceEle,
  createElementWithClass,
  createElementWithIDClass,
  makeElementFromObj,
  makeHTML,
  setTabIndex,
  isNode,
  isTabStopElement,
  toggleDisabled,
  toggleReadOnly,
  toggleDisplayNone,
  setEventListenerClickAndEnter,
  setEventListener,
  disposeEventListeners,
  getTabStopElements,
  focusElement,
  toggleDisabledNotSelected,
};
