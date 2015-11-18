$(document).on('ready', function() {
  var map = []
  setState = function(e) {
    map[e.which] =  e.type === 'keydown';
    registerKeyPress(e, this);
  };
  registerKeyPress = function(e, el) {
    if(map[16] && map[17] && map[68]) {
      e.preventDefault();
      duplicateLine(el);
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
  var charNumber = 0;
  for(var i = 0; i < lines.length; i++) {
    charNumber += lines[i].length + 1;
    if (charNumber > el.selectionStart) {
      var start = el.selectionStart;
      lines.splice(i, 0, lines[i]);
      el.value = lines.join(String.fromCharCode(10));
      el.selectionStart = start + lines[i].length + 1;
      el.selectionEnd = start + lines[i].length + 1;
      return lines[i];
    }
  }
};

var getLine = function(el) {
  var lines = el.value.split(String.fromCharCode(10));
  var charNumber = 0;
  for(var i = 0; i < lines.length; i++) {
    charNumber += lines[i].length + 1;
    if (charNumber > el.selectionStart) {
      return lines[i];
    }
  }
};

var getCurrentInput = function() {
  // return $(':focus')[0];
  return $('#text-area')[0];
}
