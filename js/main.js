'use strict';

function logic(){
}

function repo_init(){
    core_repo_init({
      'events': {
        'load_file': {
          'onclick': function(){
              webgl_load_level({
                'json': document.getElementById('json').files[0] || false,
              });
          },
        },
        'load_prebuilt': {
          'onclick': function(){
              ajax_level(level_select.value);
          },
        },
      },
      'info': '<table><tr><td><input id=json type=file><td><input id=load_file type=button value="Load Level From File">'
        + '<tr><td><select id=level_select><option value=trains>Trains</option></select><td><input id=load_prebuilt type=button value="Load Prebuilt Level"></table>',
      'keybinds': {
        32: {},
        67: {},
      },
      'menu': true,
      'mousebinds': {
        'mousedown': {
          'todo': core_requestpointerlock,
        },
        'mousemove': {
          'todo': webgl_camera_first,
        },
      },
      'title': 'MultiverseEditor.htm',
    });

    var level = window.location.search.substring(1);
    if(level.length > 0){
        ajax_level(level);
    }
}
