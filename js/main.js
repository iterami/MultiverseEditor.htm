'use strict';

function repo_escape(){
    if(webgl_character_level() < -1){
        return;
    }

    webgl_characters[webgl_character_id]['collides'] = core_storage_data['character-collides'];
    webgl_characters[webgl_character_id]['speed'] = core_storage_data['character-speed'];

    core_ui_update({
      'ids': {
        'rotate-x': webgl_characters[webgl_character_id]['camera-rotate-x'],
        'rotate-y': webgl_characters[webgl_character_id]['camera-rotate-y'],
        'rotate-z': webgl_characters[webgl_character_id]['camera-rotate-z'],
        'translate-x': webgl_characters[webgl_character_id]['translate-x'],
        'translate-y': webgl_characters[webgl_character_id]['translate-y'],
        'translate-z': webgl_characters[webgl_character_id]['translate-z'],
      },
    });
}

function repo_init(){
    // Create level loading tab.
    core_tab_create({
      'content': '<table><tr><td><input id=level-json type=file><td><input id=level-load type=button value="Load Level From File">'
        + '<tr><td><select id=level-select></select><td><input id=prebuilt-load type=button value="Load Prebuilt Level"></table>',
      'group': 'core-menu',
      'id': 'load',
      'label': 'Load Levels',
    });

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
        'level-load': {
          'onclick': function(){
              webgl_level_load({
                'character': -1,
                'json': document.getElementById('level-json').files[0] || false,
              });
          },
        },
        'prebuilt-load': {
          'onclick': function(){
              ajax_level(document.getElementById('level-select').value);
          },
        },
        'rotate-x': {
          'onclick': function(){
              webgl_characters[webgl_character_id]['camera-rotate-x'] = 0;
              webgl_characters[webgl_character_id]['camera-rotate-radians-x'] = 0;
              webgl_characters[webgl_character_id]['rotate-x'] = 0;
              webgl_characters[webgl_character_id]['rotate-radians-x'] = 0;
          },
        },
        'rotate-y': {
          'onclick': function(){
              webgl_characters[webgl_character_id]['camera-rotate-y'] = 0;
              webgl_characters[webgl_character_id]['camera-rotate-radians-y'] = 0;
              webgl_characters[webgl_character_id]['rotate-y'] = 0;
              webgl_characters[webgl_character_id]['rotate-radians-y'] = 0;
          },
        },
        'rotate-z': {
          'onclick': function(){
              webgl_characters[webgl_character_id]['camera-rotate-z'] = 0;
              webgl_characters[webgl_character_id]['camera-rotate-radians-z'] = 0;
              webgl_characters[webgl_character_id]['rotate-z'] = 0;
              webgl_characters[webgl_character_id]['rotate-radians-z'] = 0;
          },
        },
        'translate-x': {
          'onclick': function(){
              webgl_characters[webgl_character_id]['translate-x'] = 0;
          },
        },
        'translate-y': {
          'onclick': function(){
              webgl_characters[webgl_character_id]['translate-y'] = 0;
          },
        },
        'translate-z': {
          'onclick': function(){
              webgl_characters[webgl_character_id]['translate-z'] = 0;
          },
        },
        'origin': {
          'onclick': webgl_character_origin,
        },
        'spawn': {
          'onclick': webgl_character_spawn,
        },
        'toggle-fog': {
          'onclick': toggle_fog,
        },
        'toggle-lighting-directional': {
          'onclick': toggle_lighting_directional,
        },
        'update-json': {
          'onclick': function(){
              webgl_json_export({
                'character': false,
              });
          },
        },
      },
      'info': '<input id=origin type=button value="Return to Origin"><input id=spawn type=button value="Return to Spawn"><br>'
        + '<input id=translate-x type=button value="x">=<input id=ui-translate-x><input id=rotate-x type=button value="x°">=<input id=ui-rotate-x><br>'
        + '<input id=translate-y type=button value="y">=<input id=ui-translate-y><input id=rotate-y type=button value="y°">=<input id=ui-rotate-y><br>'
        + '<input id=translate-z type=button value="z">=<input id=ui-translate-z><input id=rotate-z type=button value="z°">=<input id=ui-rotate-z><br>'
        + '<input id=toggle-lighting-directional type=button value="Toggle Directional Lighting"><input id=toggle-fog type=button value="Toggle Fog">',
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
        'character-collides': true,
        'character-speed': 1,
        'editing': false,
      },
      'storage-menu': '<table><tr><td><input id=beforeunload-warning type=checkbox><td>beforeunload Warning<tr><td><input id=character-collides type=checkbox><td>Character Collides<tr><td><input id=character-speed><td>Character Speed<tr><td><input id=editing type=checkbox><td>Editing Mode</table>',
      'tabs': {
        'export': {
          'content': '<input id=update-json type=button value="Update Level JSON"><br><textarea id=exported></textarea>',
          'group': 'core-menu',
          'label': 'Export Level',
        },
        'load': {
          'content': '<table><tr><td><input id=level-json type=file><td><input id=level-load type=button value="Load Level From File">'
            + '<tr><td><select id=level-select></select><td><input id=prebuilt-load type=button value="Load Prebuilt Level"></table>',
          'default': true,
          'group': 'core-menu',
          'label': 'Load Levels',
        },
      },
      'title': 'MultiverseEditor.htm',
    });

    // Populate prebuilt level select if multiverselevels defined.
    if('multiverselevels' in window){
        let level_select = '';
        for(let level in multiverselevels){
            level_select += '<option value="' + level + '">' + multiverselevels[level] + '</option>';
        }
        document.getElementById('level-select').innerHTML = level_select;
    }

    // Handle prebuilt level url args.
    let level_arg = window.location.search.substring(1);
    if(level_arg.length > 0){
        ajax_level(level_arg);
    }
}

function repo_logic(){
}
