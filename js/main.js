'use strict';

function logic(){
}

function repo_init(){
    core_repo_init({
      'events': {
        'start': {
          'onclick': function(){
              webgl_load_level({
                'json': document.getElementById('json').files[0] || false,
              });
          },
        },
      },
      'info': '<input id=json type=file><input id=start type=button value="Load Level">',
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
}
