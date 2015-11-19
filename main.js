$(document).on('ready', function() {
  var map = []
  setState = function(e) {
    map[e.which] =  e.type === 'keydown';
    registerKeyPress(e, this);
  };
  registerKeyPress = function(e, el) {
    if(map[16] && map[17] && map[68]) { //ctrl+shift+D
      e.preventDefault();
      duplicateLine(el);
    }
    if(map[16] && map[17] && map[]) { //ctrl+shift+up
      e.preventDefault();
      shiftLinesUp(el);
    }
  };
  $('textarea').on('keydown', setState);
  $('textarea').on('keyup', setState);
  $('textarea').onkeyup = $('textarea').onkeydown = setState;

  $('textarea').on('select',function() {
    console.log('line');
    console.log(getLine(this));
  });
})

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
