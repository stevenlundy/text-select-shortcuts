var indentSize = 2;

$(document).on('ready', function() {
  var map = []
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
    var D = map[68];
    if ((ctrl || cmd) && shift && D) {
      e.preventDefault();
      duplicate(el);
    } else if ((ctrl || cmd) && shift && up) {
      e.preventDefault();
      shiftLinesUp(el);
    } else if ((ctrl || cmd) && shift && down) {
      e.preventDefault();
      shiftLinesDown(el);
    } else if (((ctrl || cmd) && closeBracket) || tab) {
      e.preventDefault();
      indentSelection(el);
    } else if (((ctrl || cmd) && openBracket) || (shift && tab)) {
      e.preventDefault();
      outdentSelection(el);
    } else if ((ctrl || cmd) && shift && enter) {
      e.preventDefault();
      insertLineAbove(el);
    } else if ((ctrl || cmd) && enter) {
      e.preventDefault();
      insertLineBelow(el);
    }
  };
  $('textarea').on('keydown', setState);
  $('textarea').on('keyup', setState);
  $('textarea').onkeyup = $('textarea').onkeydown = setState;

  $('textarea').on('select',function() {
    console.log('line');
    console.log(getLine(this));
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

var insertLineAbove = function(el) {
  var startLine = getLineNumberAtIndex(el, el.selectionStart);
  var lines = el.value.split(String.fromCharCode(10));
  var indentSize = countIndent(lines[startLine - 1]);
  lines.splice(startLine, 0, repeatChar(' ', indentSize));
  var start = indentSize;
  for(var i = 0; i < startLine; i++) {
    start += lines[i].length + 1;
  }

  el.value = lines.join(String.fromCharCode(10));
  el.selectionStart = start;
  el.selectionEnd = start;
  return el.value;
};

var insertLineBelow = function(el) {
  var endLine = getLineNumberAtIndex(el, el.selectionEnd);
  var lines = el.value.split(String.fromCharCode(10));
  var indentSize = countIndent(lines[endLine]);
  lines.splice(endLine + 1, 0, repeatChar(' ', indentSize));
  var start = indentSize;
  for(var i = 0; i <= endLine; i++) {
    start += lines[i].length + 1;
  }

  el.value = lines.join(String.fromCharCode(10));
  el.selectionStart = start;
  el.selectionEnd = start;
  return el.value;
};

var indentSelection = function(el) {
  var startLine = getLineNumberAtIndex(el, el.selectionStart);
  var endLine = getLineNumberAtIndex(el, el.selectionEnd);
  var start = el.selectionStart;
  var end = el.selectionEnd;
  var lines = el.value.split(String.fromCharCode(10));

  start += indentSize;
  for (var i = startLine; i <= endLine; i++) {
    lines[i] = repeatChar(' ', indentSize) + lines[i];
    end += indentSize;
  }

  el.value = lines.join(String.fromCharCode(10));
  el.selectionStart = start;
  el.selectionEnd = end;
  return el.value;
};

var outdentSelection = function(el) {

};

var shiftLinesUp = function(el) {
  var startLine = getLineNumberAtIndex(el, el.selectionStart);
  var endLine = getLineNumberAtIndex(el, el.selectionEnd);
  var start = el.selectionStart;
  var end = el.selectionEnd;

  if(startLine <= 0) {
    return;
  }
  var lines = el.value.split(String.fromCharCode(10));
  var removed = lines.splice(startLine - 1, 1);
  lines.splice(endLine, 0, removed[0]);
  el.value = lines.join(String.fromCharCode(10));
  el.selectionStart = start - (removed[0].length + 1);
  el.selectionEnd = end - (removed[0].length + 1);
  return el.value;
};

var shiftLinesDown = function(el) {
  var startLine = getLineNumberAtIndex(el, el.selectionStart);
  var endLine = getLineNumberAtIndex(el, el.selectionEnd);
  var start = el.selectionStart;
  var end = el.selectionEnd;

  var lines = el.value.split(String.fromCharCode(10));
  if(endLine >= lines.length - 1) {
    return;
  }
  var removed = lines.splice(endLine + 1, 1);
  lines.splice(startLine, 0, removed[0]);
  el.value = lines.join(String.fromCharCode(10));
  el.selectionStart = start + (removed[0].length + 1);
  el.selectionEnd = end + (removed[0].length + 1);
  return el.value;
};

var duplicate = function(el) {
  if(el.selectionStart === el.selectionEnd) {
    duplicateLine(el);
  } else {
    duplicateSelection(el);
  }
};

var duplicateLine = function(el) {
  var lines = el.value.split(String.fromCharCode(10));
  var start = el.selectionStart;
  var lineNumber = getLineNumberAtIndex(el, start);
  lines.splice(lineNumber, 0, lines[lineNumber]);
  el.value = lines.join(String.fromCharCode(10));
  el.selectionStart = start + lines[lineNumber].length + 1;
  el.selectionEnd = start + lines[lineNumber].length + 1;
  return el.value;
};

var duplicateSelection = function(el) {
  var headString = el.value.substring(0, el.selectionStart);
  var tailString = el.value.substring(el.selectionStart, el.value.length);
  var selection = el.value.substring(el.selectionStart, el.selectionEnd);
  var start = el.selectionStart;
  var end = el.selectionEnd;
  el.value = headString + selection + tailString;
  el.selectionStart = start + selection.length;
  el.selectionEnd = end + selection.length;
  return el.value;
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

var getCurrentInput = function() {
  // return $(':focus')[0];
  return $('#text-area')[0];
}
