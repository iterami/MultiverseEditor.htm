'use strict';

function logic(){
    webgl_character['speed'] = core_storage_data['camera-speed'];
    webgl_character['collides'] = core_storage_data['character-collides'];
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
        'camera-speed': .4,
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
              let json = {
                'character': false,
                'entities': [],
              };

              Object.assign(
                json,
                webgl_properties
              );
              if(webgl_character_level() > 0){
                  json['character'] = {};
                  Object.assign(
                    json,
                    webgl_character
                  );
              }
              for(let entity in core_entities){
                  json['entities'].push(core_entities[entity]);
              }

              document.getElementById('exported').value = JSON.stringify(json);
          },
        },
      },
    });
}
