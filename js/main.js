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
                'character': -1,
                'json': document.getElementById('json').files[0] || false,
              });
          },
        },
        'load_prebuilt': {
          'onclick': function(){
              ajax_level(document.getElementById('level_select').value);
          },
        },
        'origin': {
          'onclick': webgl_camera_reset,
        },
      },
      'info': '<table><tr><td><input id=json type=file><td><input id=load_file type=button value="Load Level From File">'
        + '<tr><td><select id=level_select></select><td><input id=load_prebuilt type=button value="Load Prebuilt Level"></table>'
        + '<hr><input id=origin type=button value="Return to Origin">',
      'keybinds': {
        32: {},
        67: {},
      },
      'menu': true,
      'mousebinds': {
        'mousemove': {
          'preventDefault': true,
          'todo': webgl_camera_handle,
        },
      },
      'storage': {
        'camera-speed': .4,
        'editing': false,
      },
      'storage-menu': '<table><tr><td><input id=camera-speed><td>Camera Speed<tr><td><input id=editing type=checkbox><td>Editing Mode</table>',
      'title': 'MultiverseEditor.htm',
    });

    // Populate prebuilt level select if multiverselevels defined.
    if('multiverselevels' in window){
        var level_select = '';
        for(var level in multiverselevels){
            level_select += '<option value="' + level + '">' + multiverselevels[level] + '</option>';
        }
        document.getElementById('level_select').innerHTML = level_select;
    }

    // Handle prebuilt level url args.
    var level_arg = window.location.search.substring(1);
    if(level_arg.length > 0){
        ajax_level(level_arg);
    }
}
