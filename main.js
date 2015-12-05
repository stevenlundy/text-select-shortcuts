var indentSize = 2;

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function() {
  var map = [];
  setState = function(e) {
    map[e.which] =  e.type === 'keydown';
    registerKeyPress(e, this);
  };
  registerKeyPress = function(e, el) {
    var cmd = map[91]|| map[93] || map[224];
    var ctrl = map[17];
    var shift = map[16];
    var up = map[38];
    var down = map[40];
    var openBracket = map[219];
    var closeBracket = map[221];
    var tab = map[9];
    var enter = map[13];
    var C = map[67];
    var D = map[68];
    var L = map[76];
    var Y = map[89];
    var Z = map[90];

    el.stateHistory = el.stateHistory || [];
    el.stateIndex = el.stateIndex || 0;

    if (((ctrl || cmd) && shift && Z) || ((ctrl || cmd) && Y)) {
      e.preventDefault();
      if (el.stateHistory.length > el.stateIndex) {
        setElementState(el, el.stateHistory[el.stateIndex]);
        el.stateIndex++;
      }
      return;
    }

    if ((ctrl || cmd) && Z) {
      e.preventDefault();
      if (el.stateIndex > 1) {
        saveElementState(el, false);
        el.stateIndex--;
        setElementState(el, el.stateHistory[el.stateIndex - 1]);
      }
      return;
    }

    saveElementState(el, true);

    if ((ctrl || cmd) && shift && D) {
      e.preventDefault();
      duplicate(el);
    } else if ((ctrl || cmd) && L) {
      e.preventDefault();
      selectLine(el);
    } else if ((ctrl || cmd) && shift && up) {
      e.preventDefault();
      manipulateInput(el, shiftLinesUp);
    } else if ((ctrl || cmd) && shift && down) {
      e.preventDefault();
      manipulateInput(el, shiftLinesDown);
    } else if (((ctrl || cmd) && openBracket) || (shift && tab)) {
      e.preventDefault();
      manipulateInput(el, outdentSelection);
    } else if (((ctrl || cmd) && closeBracket) || tab) {
      e.preventDefault();
      manipulateInput(el, indentSelection);
    } else if ((ctrl || cmd) && shift && enter) {
      e.preventDefault();
      manipulateInput(el, insertLineAbove);
    } else if ((ctrl || cmd) && enter) {
      e.preventDefault();
      manipulateInput(el, insertLineBelow);
    }
  };
  var textareas = document.querySelectorAll('textarea');
  Array.prototype.forEach.call(textareas, function(el, i){
    el.onkeyup = el.onkeydown = setState;
  });

});

var repeatChar = function(char, repetitions) {
  var string = '';
  for (var i = 0; i < repetitions; i++) {
    string += char;
  }
  return string;
};

var countIndent = function(line) {
  line = line || '';
  var indent = 0;
  while (line[indent] === ' ') {
    indent++;
  }
  return indent;
}

var manipulateInput = function(el, fn) {
  var lineStart = getLineNumberAtIndex(el, el.selectionStart);
  var lineEnd = getLineNumberAtIndex(el, el.selectionEnd);
  var lines = el.value.split(String.fromCharCode(10));
  var result = fn(el, lines, el.selectionStart, el.selectionEnd, lineStart, lineEnd);
  el.value = result.value;
  el.selectionStart = result.selectionStart;
  el.selectionEnd = result.selectionEnd;
  return el;
};

var setElementState = function(el, state) {
  el.value = state.value;
  el.selectionStart = state.selectionStart;
  el.selectionEnd = state.selectionEnd;
  return el;
};

var saveElementState = function(el, clearFuture) {
  if(el.stateHistory.length === 0 || el.value !== el.stateHistory[el.stateIndex - 1].value) {
    if (clearFuture) {
      el.stateHistory = el.stateHistory.slice(0, el.stateIndex);
    }
    el.stateHistory.push({
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd
    });
    if (clearFuture) {
      el.stateIndex++;
    }
  }
};

var insertLineAbove = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  var indentSize = countIndent(lines[lineStart - 1]);
  lines.splice(lineStart, 0, repeatChar(' ', indentSize));
  var start = indentSize;
  for(var i = 0; i < lineStart; i++) {
    start += lines[i].length + 1;
  }
  return {
    value: lines.join(String.fromCharCode(10)),
    selectionStart: start,
    selectionEnd: start
  };
};

var insertLineBelow = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  var indentSize = countIndent(lines[lineEnd]);
  lines.splice(lineEnd + 1, 0, repeatChar(' ', indentSize));
  var start = indentSize;
  for(var i = 0; i <= lineEnd; i++) {
    start += lines[i].length + 1;
  }
  return {
    value: lines.join(String.fromCharCode(10)),
    selectionStart: start,
    selectionEnd: start
  };
};

var indentSelection = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  selectionStart += indentSize;
  for (var i = lineStart; i <= lineEnd; i++) {
    lines[i] = repeatChar(' ', indentSize) + lines[i];
    selectionEnd += indentSize;
  }
  return {
    value: lines.join(String.fromCharCode(10)),
    selectionStart: selectionStart,
    selectionEnd: selectionEnd
  };
};

var outdentSelection = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  for (var i = lineStart; i <= lineEnd; i++) {
    var currentIndent = countIndent(lines[i]);
    var outdentSize = Math.min(currentIndent, indentSize);
    lines[i] = lines[i].substring(outdentSize, lines[i].length);
    selectionEnd -= outdentSize;
    if(i === lineStart) {
      selectionStart -= outdentSize;
    }
  }
  return {
    value: lines.join(String.fromCharCode(10)),
    selectionStart: selectionStart,
    selectionEnd: selectionEnd
  };
};

var shiftLinesUp = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  if(lineStart <= 0) {
    return el;
  }
  var removed = lines.splice(lineStart - 1, 1);
  lines.splice(lineEnd, 0, removed[0]);
  return {
    value: lines.join(String.fromCharCode(10)),
    selectionStart: selectionStart - (removed[0].length + 1),
    selectionEnd: selectionEnd - (removed[0].length + 1)
  };
};

var shiftLinesDown = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  if(lineEnd >= lines.length - 1) {
    return el;
  }
  var removed = lines.splice(lineEnd + 1, 1);
  lines.splice(lineStart, 0, removed[0]);
  return {
    value: lines.join(String.fromCharCode(10)),
    selectionStart: selectionStart + (removed[0].length + 1),
    selectionEnd: selectionEnd + (removed[0].length + 1)
  };
};

var selectionOnOneLine = function(el) {
  for (var i = el.selectionStart; i < el.selectionEnd; i++) {
    if (el.value[i] === String.fromCharCode(10)) {
      return false;
    }
  }
  return true;
};

var selectLine = function(el) {
  if(selectionOnOneLine(el)) {
    manipulateInput(el, expandSelectionToLine);
  } else {
    manipulateInput(el, addNextLineToSelection);
  }
};

var expandSelectionToLine = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  var selectionStart = 0;
  for (var i = 0; i < lineStart; i++) {
    selectionStart += lines[i].length + 1;
  }
  return {
    value: el.value,
    selectionStart: selectionStart,
    selectionEnd: selectionStart + lines[lineStart].length + 1
  };
};

var addNextLineToSelection = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  var selectionEnd = selectionStart;
  for (var i = lineStart; i <= lineEnd; i++) {
    selectionEnd += lines[i].length + 1;
  }
  return {
    value: el.value,
    selectionStart: selectionStart,
    selectionEnd: selectionEnd
  };
};

var duplicate = function(el) {
  if(el.selectionStart === el.selectionEnd) {
    manipulateInput(el, duplicateLine);
  } else {
    manipulateInput(el, duplicateSelection);
  }
};

var duplicateLine = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  var lineNumber = getLineNumberAtIndex(el, selectionStart);
  lines.splice(lineNumber, 0, lines[lineNumber]);
  return {
    value: lines.join(String.fromCharCode(10)),
    selectionStart: selectionStart + lines[lineNumber].length + 1,
    selectionEnd: selectionStart + lines[lineNumber].length + 1
  };
};

var duplicateSelection = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
  var headString = el.value.substring(0, el.selectionStart);
  var tailString = el.value.substring(el.selectionStart, el.value.length);
  var selection = el.value.substring(el.selectionStart, el.selectionEnd);
  return {
    value: headString + selection + tailString,
    selectionStart: selectionStart + selection.length,
    selectionEnd: selectionEnd + selection.length
  };
};

var getLine = function(el) {
  var lines = el.value.split(String.fromCharCode(10));
  var lineNumber = getLineNumberAtIndex(el, el.selectionStart);
  return line[lineNumber];
};

var getLineNumberAtIndex = function(el, index) {
  var lines = el.value.split(String.fromCharCode(10));
  var charNumber = 0;
  for(var i = 0; i < lines.length; i++) {
    charNumber += lines[i].length + 1;
    if (charNumber > index) {
      return i;
    }
  }
};
