function XMLtoJson(xml) {
  return x2js.xml_str2json(xml);
}

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});

var x2js = new X2JS();
