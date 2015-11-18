$(document).on('ready', function() {
  $('textarea').on('select',function() {
    console.log('line');
    console.log(getLine(this));
  });
})

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
