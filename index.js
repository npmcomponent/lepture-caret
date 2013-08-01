
var event = require('event');
var emitter = require('emitter');


function Caret(element) {
  this.element = element;

  bindMouse(this);

  var caret = this;
  event.bind(element, 'keyup', function() {
    caret.emit('change');
  });
}
emitter(Caret.prototype);


/**
 * Get the current selection
 */
Caret.prototype.selection = function() {
  var sel = document.getSelection();
  if (!this.element) {
    return sel;
  }
  var el = this.element;
  // only when the selection in element
  if (isChildOf(sel.anchorNode, el) && isChildOf(sel.focusNode, el)) {
    return sel;
  }
  return null;
};


/**
 * Get the current selection range
 */
Caret.prototype.range = function() {
  var sel = this.selection();
  if (!sel) {
    return null;
  }

  if (sel.rangeCount) {
    return sel.getRangeAt(0);
  }
  return null;
};


/**
 * Prepend text before caret
 */
Caret.prototype.prepend = function(text) {
};


/**
 * Append text after caret
 */
Caret.prototype.append = function(text) {
};


/*
 * Replace text of the selection
 */
Caret.prototype.replaceWith = function(text) {
};


/**
 * The nearest parent node
 */
Caret.prototype.parent = function() {
  var range = this.range();
  if (!range) {
    return null;
  }
  var node = range.startContainer;
  if (node.nodeType == document.ELEMENT_NODE) {
    return node;
  }
  return node.parentElement || node.parentNode;
};


/**
 * Find the block level parent node of caret
 */
Caret.prototype.blockParent = function() {
  var parent = this.parent();
  if (!parent) {
    return null;
  }
  return getBlockElement(parent, this.element);
};


/**
 * Save caret position
 */
Caret.prototype.save = function() {
  var range = this.range();
  if (range) {
    this._range = range;
  }
};


/**
 * Restore caret position
 */
Caret.prototype.restore = function() {
  var r = document.createRange();
  var sel = document.getSelection();

  var range = this._range;
  if (range) {
    r.setStart(range.startContainer, range.startOffset);
    r.setEnd(range.endContainer, range.endOffset);
    sel.removeAllRanges();
    sel.addRange(r);
  } else {
    sel.selectAllChildren(this.element);
    sel.collapseToEnd();
  }
};


/**
 * Bind mouse and emit select event
 */
function bindMouse(caret) {
  var body = document.body;

  var timer;
  event.bind(body, 'mouseup', function(e) {
    // caret has changed
    caret.emit('change');

    timer = setTimeout(function() {
      var sel = document.getSelection();
      if (sel && sel.toString().trim()) {
        caret.emit('select', e, sel);
      }
    }, 50);
  });

  event.bind(body, 'mousedown', function() {
    clearTimeout(timer);
  });
}



/**
 * Find the block level parent node
 */
function getBlockElement(el, parent) {
  if (parent && el == parent) {
    return null;
  }

  var style;
  if (window.getComputedStyle) {
    style = window.getComputedStyle(el);
  } else {
    style = el.currentStyle;
  }

  var display = style.display;
  if (display === 'block' || display === 'table') {
    return el;
  }

  return getBlockElement(el.parentElement || el.parentNode);
}


/**
 * Check if the element is the child of the node
 */
function isChildOf(el, parent) {
  if (!el) {
    return false;
  }
  while (el = el.parentNode) {
    if (el == parent) {
      return true;
    }
  }
  return false;
}
