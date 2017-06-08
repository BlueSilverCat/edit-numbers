'use babel';

import EditNumbersView from './edit-numbers-view';
import ENConditions from './edit-numbers-conditions';

import { CompositeDisposable, Point as AtomPoint } from 'atom';
import { isEmpty, getReversedNewArray } from './utility';
import { getEditorDecoratedMarker, destroyActiveDecoratedMarker, getSelectedMarkerBufferRange, getChangedConfig,
  appendNewLine } from './atom-utility'
import { setEventListener, disposeEventListeners } from './html-utility';
//debug
import { logLine, logRange } from './atom-utility'

export default {
  config: {
    autoFocus: {
      order: 1,
      type: 'boolean',
      description: 'autoFocus',
      'default': true
    },
    autoFocusPosition: {
      order: 2,
      type: 'string',
      description: 'autoFocusPosition',
      'default': 'prefix',
      enum: [
        'prefix', 'suffix', 'ignoreCase', 'targetType', 'customTarget', 'place', 'paddingChar', 'justification',
        'outputBase', 'upperCase', 'start', 'end', 'increment', 'add', 'multiply', 'markAll', 'first', 'middle', 'last',
        'previous', 'next', 'editType', 'edit', 'editAll', 'newLine', 'appendNewLine'
      ]
    },

    defaultPrefix: {
      order: 3,
      type: 'string',
      description: 'prefix',
      'default': ''
    },
    defaultSuffix: {
      order: 4,
      type: 'string',
      description: 'suffix',
      'default': ''
    },
    defaultIgnoreCase: {
      order: 5,
      type: 'boolean',
      description: 'ignoreCase',
      'default': false
    },
    defaultTarget: {
      order: 6,
      type: 'string',
      description: 'targetType',
      'default': 'decimal',
      enum: ['decimal', 'hexadecimal', 'custom']
    },
    defaultCustomTarget: {
      order: 7,
      type: 'string',
      description: 'customTarget',
      'default': ''
    },

    defaultPlace: {
      order: 8,
      type: 'integer',
      description: 'place',
      'default': 0,
      minimum: 0
    },
    defaultPaddingChar: {
      order: 9,
      type: 'string',
      description: 'paddingChar',
      'default': ''
    },
    defaultJustification: {
      order: 10,
      type: 'string',
      description: 'justification',
      'default': 'right',
      enum: ['right', 'left', 'right_lead_minus']
    },
    defaultOutputBase: {
      order: 11,
      type: 'integer',
      description: 'outputBase',
      'default': 10,
      enum: [
        { value: 10, description: 'decimal' },
        { value: 16, description: 'hexadecimal' }
      ]
    },
    defaultUpperCase: {
      order: 12,
      type: 'boolean',
      description: 'upperCase',
      'default': true
    },

    defaultStart: {
      order: 13,
      type: 'number',
      description: 'start',
      'default': 0
    },
    defaultEnd: {
      order: 14,
      type: 'number',
      description: 'end',
      'default': 0
    },
    defaultIncrement: {
      order: 15,
      type: 'number',
      description: 'increment',
      'default': 1
    },
    defaultAdd: {
      order: 16,
      type: 'number',
      description: 'add',
      'default': 0
    },
    defaultMuliply: {
      order: 17,
      type: 'number',
      description: 'muliply',
      'default': 1
    },

    defaultEditType: {
      order: 18,
      type: 'string',
      description: 'editType',
      'default': 'overwrite',
      enum: ['overwrite', 'modify', 'insert']
    },
    defaultNewLine: {
      order: 19,
      type: 'integer',
      description: 'newLine',
      'default': 1,
      minimum: 1
    }
  },

  name: 'edit-numbers',
  editNumbersView: null,
  panel: null,
  subscriptions: null,

  activate(state) {
    this.markers = []; //FIXME
    this.subscriptions = new CompositeDisposable();

    this.conditions = new ENConditions();
    this.getConfig(this.conditions);
    this.editNumbersView = new EditNumbersView();
    this.panel = atom.workspace.addBottomPanel({
      item: this.editNumbersView.getElement(),
      visible: false,
      clasName: this.name
    });

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'edit-numbers:toggle': () => this.toggle(),
      'edit-numbers:settings': () => this.settings()
    }));
    this.subscriptions.add(atom.commands.add(this.editNumbersView.rootElement, {
      'edit-numbers:focusNext': (evt) => this.editNumbersView.focusNext(evt),
      'edit-numbers:focusPrevious': (evt) => this.editNumbersView.focusPrevious(evt),
      'edit-numbers:previous': (evt) => this.preCall('selectPrevious'),
      'edit-numbers:next': (evt) => this.preCall('selectNext'),
      'edit-numbers:edit': (evt) => this.preCall('edit'),
      'edit-numbers:editAll': (evt) => this.preCall('editAll'),
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
    if(this.panel.isVisible()) {
      this.hidePanel();
    } else {
      this.panel.show();
      if(this.configs.autoFocus) {
        let position = this.editNumbersView.kPositions[this.configs.autoFocusPosition];
        position.focus();
      }
      this.keyDownSubsription = setEventListener(document, 'keydown', this.keyDownEscape(), true);
    }
  },

  settings() {
    atom.workspace.open('atom://config/packages/' + this.name);
  },

  getConfig(conditions) {
    this.configs = {};
    this.configs.autoFocus = atom.config.get(this.name + '.autoFocus');
    this.subscriptions.add(atom.config.onDidChange(this.name + '.autoFocus', getChangedConfig(this.configs, 'autoFocus')));
    this.configs.autoFocusPosition = atom.config.get(this.name + '.autoFocusPosition');
    this.subscriptions.add(atom.config.onDidChange(this.name + '.autoFocusPosition', getChangedConfig(this.configs, 'autoFocusPosition')));

    conditions.prefix = atom.config.get(this.name + '.defaultPrefix');
    conditions.suffix = atom.config.get(this.name + '.defaultSuffix');
    conditions.ignoreCase = atom.config.get(this.name + '.defaultIgnoreCase');
    conditions.targetType = atom.config.get(this.name + '.defaultTarget');
    conditions.customTarget = atom.config.get(this.name + '.defaultCustomTarget');

    conditions.place = atom.config.get(this.name + '.defaultPlace');
    conditions.paddingChar = atom.config.get(this.name + '.defaultPaddingChar');
    conditions.justification = atom.config.get(this.name + '.defaultJustification');
    conditions.base = atom.config.get(this.name + '.defaultOutputBase');
    conditions.upperCase = atom.config.get(this.name + '.defaultUpperCase');

    conditions.start = atom.config.get(this.name + '.defaultStart');
    conditions.end = atom.config.get(this.name + '.defaultEnd');
    conditions.increment = atom.config.get(this.name + '.defaultIncrement');
    conditions.add = atom.config.get(this.name + '.defaultAdd');
    conditions.multiply = atom.config.get(this.name + '.defaultMuliply');

    conditions.editType = atom.config.get(this.name + '.defaultEditType');

    conditions.newLine = atom.config.get(this.name + '.defaultNewLine');
  },

  preCall(funcName) {
    editor = atom.workspace.getActiveTextEditor();
    if(editor === '') {
      return null;
    }
    if(funcName !== 'markAll' && funcName !== 'appendNewLine') {
      markers = getEditorDecoratedMarker(this.markers, editor);
      if(markers.length === 0) {
        markers = this.markAll(editor);
        if(markers.length === 0 ) {
          return null;
        }
      }
    }

    let result = null;
    switch (funcName) {
      case 'selectFirst':
        result = this.select(editor, markers, 'first');
        break;
      case 'selectMiddle':
        result = this.select(editor, markers, 'middle');
        break;
      case 'selectLast':
        result = this.select(editor, markers, 'last');
        break;
      case 'selectNext':
        result = this.select(editor, markers, 'next');
        break;
      case 'selectPrevious':
        result = this.select(editor, markers, 'previous');
        break;
      case 'edit':
        result = this.edit(editor, null, markers);
        break;
      case 'editAll':
        result = this.editAll(editor, markers);
        break;
      case 'markAll':
        result = this.markAll(editor);
        break;
      case 'appendNewLine':
        appendNewLine(editor, this.conditions.newLine);
        break;
      default:
        return null;
    }

    return result;
  },

  select(editor, markers, position) {
    if(editor === '') {
      return null;
    }
    if(markers.length === 0 ) {
      return null;
    }

    let target = markers[0];
    if(position === 'last') {
      target = markers[markers.length -1];
    } else if(position === 'middle') {
      target = markers[Math.floor(markers.length / 2)];
      //console.log((markers.length -1 / 2), target);
    } else if(position !== 'first') {
      let cursorPos = editor.getCursorBufferPosition();
      let compMarker = null;
      //let compPos = new AtomPoint(Infinity, Infinity);

      let work = [];
      let compFlag = 1;
      if(position === 'next') {
        work = markers
      } else {
        target = markers[markers.length -1];
        work = getReversedNewArray(markers);
        compFlag = -1;
      }
      for(marker of work) {
        markerPos = marker.getHeadBufferPosition();  //marker is sorted?
        //if(markerPos.compare(cursorPos) === 1 && markerPos.compare(compPos) === -1) {
        if(markerPos.compare(cursorPos) === compFlag) {
          compPos = markerPos;
          target = marker;
          break;  //sortされている(前提)なのでbreak
        }
      }
    }

    editor.setCursorBufferPosition(target.getHeadBufferPosition(), {autoscroll: true});
    editor.selectMarker(target);
    this.updateView(editor, target.getBufferRange());
    return target;
  },

  edit(editor, marker, markers) {
    if(editor === '') {
      return null;
    }
    if(markers.length === 0 ) {
      return null;
    }

    let range = editor.getSelectedBufferRange();
    let target = getSelectedMarkerBufferRange(range, marker, markers);
    //console.log('edit', target, marker);
    //logRange(range);
    if(target === null) {
      target = this.select(editor, markers, 'next');
      //console.log('$$$', target);
      if(target === null) {
        return;
      }
      range = target.getBufferRange();
    }
    let text = editor.getTextInBufferRange(target.getBufferRange());
    text = this.conditions.getReplacedText(text);
    editor.setTextInBufferRange(range , text, {normalizeLineEnding: true, undo:''}); //1つずつ置き換えているからかundoも1つずつになる
    this.conditions.update();
    this.select(editor, markers, 'next');
  },

  editAll(editor, markers) {
    if(editor === '') {
      return null;
    }
    if(markers.length === 0 ) {
      return null;
    }

    let range = null;
    let text = null;

    this.conditions.initialize();
    for(marker of markers) {
      editor.selectMarker(marker);
      this.edit(editor, marker, markers);
    }
    this.unmarkActive();
  },

  markAll(editor) {
    if(editor === '') {
      return null;
    }
    this.unmarkActive();
    this.conditions.initialize();

    let activeMarkers = [];
    editor.scan(
      this.conditions.getRegex(),
      {leadingContextLineCount: 0, trailingContextLineCount: 0},
      (obj) => {
        let marker = editor.markBufferRange(obj.range, {invalidate: 'never'});
        this.markers.push(marker);
        activeMarkers.push(marker);
        editor.decorateMarker(marker, {type: 'highlight', class: this.name});
      }
    );
    if(activeMarkers.length > 0) {
      this.updateView(editor, activeMarkers[0].getBufferRange());
    } else {
      this.updateView(editor, null);
    }
    return activeMarkers;
  },

/*
  getMarkIterator(editor) {
    return (obj) => {
      let marker = editor.markBufferRange(obj.range, {invalidate: 'never'});
      this.markers.push(marker);
      editor.decorateMarker(marker, {type: 'highlight', class: this.name});
    }
  },
*/

  unmarkActive() {
    this.conditions.initialize();
    this.markers = destroyActiveDecoratedMarker(this.markers);
  },

  unmarkAll() {
    this.conditions.initialize();
    for(marker of this.markers) {
      marker.destroy();
    }
    this.markers = [];
  },

  keyDownEscape() {
    return (evt) => {
      let keystroke = atom.keymaps.keystrokeForKeyboardEvent(evt);
      if(keystroke === 'escape') {
        this.hidePanel();
      }
    };
  },

  hidePanel() {
    this.panel.hide();
    this.unmarkAll();
    if(this.keyDownSubsription !== null) {
      disposeEventListeners([this.keyDownSubsription]);
      this.keyDownSubsription = null;
    }
  },

  updateView(editor, range) {
    this.editNumbersView.replaceStringInput.value = '';
    if(!isEmpty(range)) {
      this.editNumbersView.replaceStringInput.value =
        this.conditions.getReplacedText(editor.getTextInBufferRange(range));
    }
  }

};
