(function(){
  var indentSize = 2;

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

  var selectWord = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
    var currentSelection = el.value.substring(selectionStart, selectionEnd);
    var alphaNumOnly = /^\w*$/;
    if (alphaNumOnly.test(currentSelection)) {
      while(selectionEnd < el.value.length && alphaNumOnly.test(el.value[selectionEnd])) {
        selectionEnd++;
      }
      while(selectionStart > 0 && alphaNumOnly.test(el.value[selectionStart - 1])) {
        selectionStart--;
      }
      return {
        value: el.value,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd
      };
    } else {
      return {
        value: el.value,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd
      };
    }
  };

  var deleteLine = function(el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
    lines.splice(lineStart, lineEnd - lineStart + 1);
    if (lineStart === lines.length) {
      lines.push('');
    }
    selectionStart = 0;
    for (var i = 0; i < lineStart; i++) {
      selectionStart += lines[i].length + 1;
    }
    return {
      value: lines.join(String.fromCharCode(10)),
      selectionStart: selectionStart,
      selectionEnd: selectionStart
    };
  }

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

  var insertIntoString = function(string, insert, index) {
    var start = string.substring(0, index);
    var end = string.substring(index, string.length);
    return start + insert + end;
  };

  var wrapSelection = function(prefix, suffix, el, lines, selectionStart, selectionEnd, lineStart, lineEnd) {
    var value = el.value;
    value = insertIntoString(value, suffix, selectionEnd);
    value = insertIntoString(value, prefix, selectionStart);
    return {
      value: value,
      selectionStart: selectionStart + 1,
      selectionEnd: selectionEnd + 1
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

  (function() {
    var map = [];
    var resetMap = function() {
      map = [];
    };
    var resetRange = function(min, max) {
      for(var i = min; i <= max; i++) {
        if(map[i]) {
          map[i] = false;
        }
      }
    };
    var resetNumbers = function() {
      resetRange(48, 57);
    };
    var resetLetters = function() {
      resetRange(65, 90);
    };
    var resetArrows = function() {
      resetRange(37, 40);
    };
    var resetBrackets = function() {
      if(map[219]) {
        map[219] = false;
      }
      if(map[221]) {
        map[221] = false;
      }
    };
    setState = function(e) {
      if(map[91]|| map[93] || map[224]) {
        resetNumbers();
        resetLetters();
        resetArrows();
        resetBrackets();
      }
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
      var openBrace = map[16] && map[219];
      var closeBrace = map[16] && map[221];
      var openParen = map[16] && map[57];
      var closeParen = map[16] && map[48];
      var singleQuote = map[222];
      var doubleQuote = map[16] && map[222];
      var tab = map[9];
      var enter = map[13];
      var C = map[67];
      var D = map[68];
      var K = map[75];
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
      } else if ((ctrl || cmd) && D) {
        e.preventDefault();
        manipulateInput(el, selectWord);
      } else if ((ctrl || cmd) && shift && K) {
        e.preventDefault();
        manipulateInput(el, deleteLine);
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
      } else if(openParen) {
        e.preventDefault();
        manipulateInput(el, wrapSelection.bind(null, '(', ')'));
      } else if(openBrace) {
        e.preventDefault();
        manipulateInput(el, wrapSelection.bind(null, '{', '}'));
      } else if(openBracket) {
        e.preventDefault();
        manipulateInput(el, wrapSelection.bind(null, '[', ']'));
      } else if(doubleQuote) {
        e.preventDefault();
        manipulateInput(el, wrapSelection.bind(null, '"', '"'));
      } else if(singleQuote) {
        e.preventDefault();
        manipulateInput(el, wrapSelection.bind(null, '\'', '\''));
      }
    };

    var addListeners = function(el) {
      el.onkeyup = el.onkeydown = setState;
      el.onfocus = resetMap;
    }

    var textareas = document.querySelectorAll('textarea');
    Array.prototype.forEach.call(textareas, addListeners);

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
          if(mutation.addedNodes[i].type == "textarea") {
            addListeners(mutation.addedNodes[i]);
          }
        }
      });
    });
    observer.observe(document, { attributes: true, childList: true, characterData: true, subtree: true });
  })();

})();
