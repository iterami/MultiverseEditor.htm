'use strict';

function logic(){
    webgl_character['camera-speed'] = core_storage_data['camera-speed'];
}

function repo_init(){
    core_repo_init({
      'events': {
        'load_file': {
          'onclick': function(){
              webgl_load_level({
                'character': false,
                'json': document.getElementById('json').files[0] || false,
              });
          },
        },
        'load_prebuilt': {
          'onclick': function(){
              ajax_level(document.getElementById('level_select').value);
          },
        },
      },
      'info': '<table><tr><td><input id=json type=file><td><input id=load_file type=button value="Load Level From File">'
        + '<tr><td><select id=level_select></select><td><input id=load_prebuilt type=button value="Load Prebuilt Level"></table>',
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
      'storage': {
        'camera-speed': .2,
      },
      'storage-menu': '<table><tr><td><input id=camera-speed><td>Camera Speed</table>',
      'title': 'MultiverseEditor.htm',
    });

    // Populate prebuilt level select.
    var levels = {
      'citymaze': 'City Maze',
      'desertstreetmarket': 'Desert Street Market',
      'trains': 'Trains',
    };
    var level_select = '';
    for(var level in levels){
        level_select += '<option value="' + level + '">' + levels[level] + '</option>';
    }
    document.getElementById('level_select').innerHTML = level_select;

    // Handle prebuilt level url args.
    var level_arg = window.location.search.substring(1);
    if(level_arg.length > 0){
        ajax_level(level_arg);
    }
}
