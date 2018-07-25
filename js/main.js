'use strict';

function logic(){
    webgl_character['speed'] = core_storage_data['camera-speed'];
    webgl_character['collides'] = core_storage_data['character-collides'];

    core_ui_update({
      'ids': {
        'rotate-x': webgl_character['camera-rotate-x'],
        'rotate-y': webgl_character['camera-rotate-y'],
        'rotate-z': webgl_character['camera-rotate-z'],
        'translate-x': webgl_character['translate-x'],
        'translate-y': webgl_character['translate-y'],
        'translate-z': webgl_character['translate-z'],
      },
    });
}

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(){
            if(webgl_character_level() > -2
              && core_storage_data['beforeunload-warning']){
                return 'Exit?';
            }
        },
      },
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
        'rotate-x': {
          'onclick': function(){
              webgl_character['camera-rotate-x'] = 0;
              webgl_character['camera-rotate-radians-x'] = 0;
              webgl_character['rotate-x'] = 0;
              webgl_character['rotate-radians-x'] = 0;
          },
        },
        'rotate-y': {
          'onclick': function(){
              webgl_character['camera-rotate-y'] = 0;
              webgl_character['camera-rotate-radians-y'] = 0;
              webgl_character['rotate-y'] = 0;
              webgl_character['rotate-radians-y'] = 0;
          },
        },
        'rotate-z': {
          'onclick': function(){
              webgl_character['camera-rotate-z'] = 0;
              webgl_character['camera-rotate-radians-z'] = 0;
              webgl_character['rotate-z'] = 0;
              webgl_character['rotate-radians-z'] = 0;
          },
        },
        'translate-x': {
          'onclick': function(){
              webgl_character['translate-x'] = 0;
          },
        },
        'translate-y': {
          'onclick': function(){
              webgl_character['translate-y'] = 0;
          },
        },
        'translate-z': {
          'onclick': function(){
              webgl_character['translate-z'] = 0;
          },
        },
        'origin': {
          'onclick': webgl_camera_origin,
        },
        'spawn': {
          'onclick': webgl_camera_spawn,
        },
      },
      'info': '<table><tr><td><input id=json type=file><td><input id=load_file type=button value="Load Level From File">'
        + '<tr><td><select id=level_select></select><td><input id=load_prebuilt type=button value="Load Prebuilt Level"></table>'
        + '<hr><input id=origin type=button value="Return to Origin"><input id=spawn type=button value="Return to Spawn"><br>'
        + '<input id=translate-x type=button value="x">=<span id=ui-translate-x></span> <input id=translate-y type=button value="y">=<span id=ui-translate-y></span> <input id=translate-z type=button value="z">=<span id=ui-translate-z></span><br>'
        + '<input id=rotate-x type=button value="x°">=<span id=ui-rotate-x></span> <input id=rotate-y type=button value="y°">=<span id=ui-rotate-y></span> <input id=rotate-z type=button value="z°">=<span id=ui-rotate-z></span>',
      'keybinds': {
        32: {},
        67: {},
      },
      'menu': true,
      'mousebinds': {
        'contextmenu': {
          'preventDefault': true,
        },
        'mousemove': {
          'preventDefault': true,
          'todo': webgl_camera_handle,
        },
      },
      'storage': {
        'beforeunload-warning': true,
        'camera-speed': .5,
        'character-collides': true,
        'editing': false,
      },
      'storage-menu': '<table><tr><td><input id=beforeunload-warning type=checkbox><td>beforeunload Warning<tr><td><input id=camera-speed><td>Camera Speed<tr><td><input id=character-collides type=checkbox><td>Character Collides<tr><td><input id=editing type=checkbox><td>Editing Mode</table>',
      'title': 'MultiverseEditor.htm',
    });

    // Populate prebuilt level select if multiverselevels defined.
    if('multiverselevels' in window){
        let level_select = '';
        for(let level in multiverselevels){
            level_select += '<option value="' + level + '">' + multiverselevels[level] + '</option>';
        }
        document.getElementById('level_select').innerHTML = level_select;
    }

    // Handle prebuilt level url args.
    let level_arg = window.location.search.substring(1);
    if(level_arg.length > 0){
        ajax_level(level_arg);
    }

    // Create level export tab.
    core_tab_create({
      'content': '<input id=update_json type=button value="Update Level JSON"><br><textarea id=exported></textarea>',
      'group': 'core-menu',
      'id': 'export',
      'label': 'Export Level',
    });
    core_events_bind({
      'elements': {
        'update_json': {
          'onclick': function(){
              webgl_json_export({
                'character': false,
              });
          },
        },
      },
    });
}
