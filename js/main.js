'use strict';

function repo_escape(){
    if(webgl_character_level() < -1){
        return;
    }

    if(!core_menu_open){
        let properties_html = '';
        for(let property in webgl_properties){
            properties_html += '<tr>'
              + '<td><input id="button-' + property + '" type=button value=' + property + '><td id="property-' + property + '">' + webgl_properties[property];
        }

        core_ui_update({
          'ids': {
            'properties': properties_html,
          },
        });

        for(let property in webgl_properties){
            document.getElementById('button-' + property).onclick = function(){
                set_property(property);
            }
        }

        if(core_storage_data['ambient-state'] !== 0){
            webgl_properties['ambient-blue'] = core_storage_data['ambient-blue'];
            webgl_properties['ambient-green'] = core_storage_data['ambient-green'];
            webgl_properties['ambient-red'] = core_storage_data['ambient-red'];
        }
        if(core_storage_data['directional-state'] !== 0){
            webgl_properties['directional-state'] = core_storage_data['directional-state'] === 1;

            if(webgl_properties['directional-state']){
                webgl_properties['directional-blue'] = core_storage_data['directional-blue'];
                webgl_properties['directional-green'] = core_storage_data['directional-green'];
                webgl_properties['directional-red'] = core_storage_data['directional-red'];
                webgl_properties['directional-vector'] = [
                  core_storage_data['directional-vector-x'],
                  core_storage_data['directional-vector-y'],
                  core_storage_data['directional-vector-z'],
                ];
            }
        }
        if(core_storage_data['fog-state'] !== 0){
            webgl_properties['fog-state'] = core_storage_data['fog-state'] === 1;

            if(webgl_properties['fog-state']){
                webgl_properties['fog-density'] = core_storage_data['fog-density'];
            }
        }
        if(core_storage_data['gravity-state']){
            webgl_properties['gravity-acceleration'] = core_storage_data['gravity-acceleration'];
            webgl_properties['gravity-axis'] = core_storage_data['gravity-axis'];
            webgl_properties['gravity-max'] = core_storage_data['gravity-max'];
        }
        webgl_properties['jump-movement'] = core_storage_data['jump-movement'];
        webgl_properties['multiplier-jump'] = core_storage_data['multiplier-jump'];
        webgl_properties['multiplier-speed'] = core_storage_data['multiplier-speed'];

        webgl_character_id = core_storage_data['character-id'];
        webgl_characters[webgl_character_id]['collide-range-horizontal'] = core_storage_data['character-collide-range-horizontal'];
        webgl_characters[webgl_character_id]['collide-range-vertical'] = core_storage_data['character-collide-range-vertical'];
        webgl_characters[webgl_character_id]['collides'] = core_storage_data['character-collides'];
        webgl_characters[webgl_character_id]['speed'] = core_storage_data['character-speed'];

        webgl_shader_update();
    }
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
        'rotate-x-set': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              character_set_axis(
                'rotate',
                'x'
              );
          },
        },
        'rotate-y-set': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              character_set_axis(
                'rotate',
                'y'
              );
          },
        },
        'rotate-z-set': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              character_set_axis(
                'rotate',
                'z'
              );
          },
        },
        'translate-x-set': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              character_set_axis(
                'translate',
                'x'
              );
          },
        },
        'translate-y-set': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              character_set_axis(
                'translate',
                'y'
              );
          },
        },
        'translate-z-set': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              character_set_axis(
                'translate',
                'z'
              );
          },
        },
        'origin': {
          'onclick': webgl_character_origin,
        },
        'spawn': {
          'onclick': webgl_character_spawn,
        },
        'update-json': {
          'onclick': function(){
              webgl_json_export({
                'character': false,
              });
          },
        },
      },
      'keybinds': {
        32: {},
        67: {},
        86: {
          'todo': function(){
              webgl_characters[webgl_character_id]['collides'] = !webgl_characters[webgl_character_id]['collides'];
          },
        },
      },
      'menu': true,
      'mousebinds': {
        'contextmenu': {
          'preventDefault': true,
        },
        'mousedown': {
          'todo': webgl_camera_handle,
        },
        'mousemove': {
          'preventDefault': true,
          'todo': webgl_camera_handle,
        },
      },
      'storage': {
        'ambient-blue': 1,
        'ambient-green': 1,
        'ambient-red': 1,
        'ambient-state': 0,
        'beforeunload-warning': true,
        'character-collide-range-horizontal': 2.5,
        'character-collide-range-vertical': 2.5,
        'character-collides': true,
        'character-id': '_me',
        'character-moves': true,
        'character-rotates': true,
        'character-speed': 5,
        'directional-blue': 1,
        'directional-green': 1,
        'directional-red': 1,
        'directional-state': 0,
        'directional-vector-x': 0,
        'directional-vector-y': 1,
        'directional-vector-z': 0,
        'fog-density': .0001,
        'fog-state': 0,
        'gravity-acceleration': -.05,
        'gravity-axis': 'dy',
        'gravity-max': -2,
        'gravity-state': false,
        'jump-movement': 0,
        'multiplier-jump': 1,
        'multiplier-speed': 1,
      },
      'storage-menu': '<table><tr><td>Ambient Lighting<br>'
          + '<select id=ambient-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input id=ambient-blue>Blue<br>'
          + '<input id=ambient-green>Green<br>'
          + '<input id=ambient-red>Red'
        + '<td>Multipliers<br>'
          + '<input id=multiplier-jump>Jump<br>'
          + '<input id=jump-movement>Jump Movement<br>'
          + '<input id=multiplier-speed>Speed<br>'
          + '<input id=beforeunload-warning type=checkbox>beforeunload Warning'
        + '<tr><td>Directional Lighting<br>'
          + '<select id=directional-state><option value=0>Use Level Properties</option><option value=1>Override On</option><option value=2>Override Off</option></select><br>'
          + '<input id=directional-blue>Blue<br>'
          + '<input id=directional-green>Green<br>'
          + '<input id=directional-red>Red<br>'
          + '<input id=directional-vector-x>Vector X<br>'
          + '<input id=directional-vector-y>Vector Y<br>'
          + '<input id=directional-vector-z>Vector Z'
        + '<td>Camera/Character<br>'
          + '<input id=character-id>webgl_character_id<br>'
          + '<input id=character-speed>Speed<br>'
          + '<input id=character-collides type=checkbox>Collides, Range<br>'
          + '<input id=character-collide-range-horizontal>Horizontal<br>'
          + '<input id=character-collide-range-vertical>Vertical<br>'
          + '<input id=character-moves type=checkbox>Movement<br>'
          + '<input id=character-rotates type=checkbox>Rotation'
        + '<tr><td>Fog<br>'
          + '<select id=fog-state><option value=0>Use Level Properties</option><option value=1>Override On</option><option value=2>Override Off</option></select><br>'
          + '<input id=fog-density>Density'
        + '<td>'
          + '<input id=gravity-state type=checkbox>Gravity Override<br>'
          + '<input id=gravity-acceleration>Acceleration<br>'
          + '<select id=gravity-axis><option value=dx>x</option><option selected value=dy>y</option><option value=dz>z</option></select>Axis<br>'
          + '<input id=gravity-max>Max</table>',
      'tabs': {
        'export': {
          'content': '<input id=update-json type=button value="Update Level JSON"><br><textarea id=exported></textarea>',
          'group': 'core-menu',
          'label': 'Export Level',
        },
        'load': {
          'content': '<table><tr>'
              + '<td><input id=level-json type=file>'
              + '<td><input id=level-load type=button value="Load Level From File">'
            + '<tr>'
              + '<td><select id=level-select></select>'
              + '<td><input id=prebuilt-load type=button value="Load Prebuilt Level"></table>',
          'default': true,
          'group': 'core-menu',
          'label': 'Load Levels',
        },
        'properties': {
          'content': '<table id=properties></table>',
          'group': 'editor',
          'label': 'Properties',
        },
        'stats': {
          'content': '<table><tr><td>Characters<td id=character-count>'
            + '<tr><td>ID count<td id=id-count>'
            + '<tr class=header><td>Group<td>Count'
            + '<tr><td>foreground<td id=foreground-count>'
            + '<tr><td>particles<td id=particles-count>'
            + '<tr><td>skybox<td id=skybox-count>'
            + '<tr><td>webgl<td id=webgl-count></table>',
          'group': 'editor',
          'label': 'Stats',
        },
      },
      'title': 'MultiverseEditor.htm',
      'ui': '<input id=origin type=button value="Return to Origin"><input id=spawn type=button value="Return to Spawn"><br>'
        + '<input id=translate-x-set type=button value=x><input id=translate-x><input id=rotate-x-set type=button value=x°><input id=rotate-x><br>'
        + '<input id=translate-y-set type=button value=y><input id=translate-y><input id=rotate-y-set type=button value=y°><input id=rotate-y><br>'
        + '<input id=translate-z-set type=button value=z><input id=translate-z><input id=rotate-z-set type=button value=z°><input id=rotate-z><br>'
        + '<span id=editor-tabs></span><div id=editor-tabcontent></div><hr>'
        + '<div id=npc-talk></div><div id=npc-trade></div>',
    });
    webgl_settings_init();

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
    core_ui_update({
      'ids': {
        'character-count': webgl_character_count,
        'foreground-count': core_groups['_length']['foreground'],
        'id-count': core_id_count,
        'particles-count': core_groups['_length']['particles'],
        'rotate-x': webgl_characters[webgl_character_id]['camera-rotate-x'],
        'rotate-y': webgl_characters[webgl_character_id]['camera-rotate-y'],
        'rotate-z': webgl_characters[webgl_character_id]['camera-rotate-z'],
        'skybox-count': core_groups['_length']['skybox'],
        'translate-x': webgl_characters[webgl_character_id]['translate-x'],
        'translate-y': webgl_characters[webgl_character_id]['translate-y'],
        'translate-z': webgl_characters[webgl_character_id]['translate-z'],
        'webgl-count': core_entity_info['webgl']['count'],
      },
    });

    if(!core_storage_data['character-moves']){
        webgl_characters[webgl_character_id]['translate-x'] = core_ui_values['translate-x'];
        webgl_characters[webgl_character_id]['translate-y'] = core_ui_values['translate-y'];
        webgl_characters[webgl_character_id]['translate-z'] = core_ui_values['translate-z'];
    }
    if(!core_storage_data['character-rotates']){
        webgl_characters[webgl_character_id]['camera-rotate-x'] = core_ui_values['rotate-x'];
        webgl_characters[webgl_character_id]['camera-rotate-y'] = core_ui_values['rotate-y'];
        webgl_characters[webgl_character_id]['camera-rotate-z'] = core_ui_values['rotate-z'];
        webgl_characters[webgl_character_id]['rotate-x'] = core_ui_values['rotate-x'];
        webgl_characters[webgl_character_id]['rotate-y'] = core_ui_values['rotate-y'];
        webgl_characters[webgl_character_id]['rotate-z'] = core_ui_values['rotate-z'];
        webgl_entity_radians({
          'character': true,
          'entity': webgl_character_id,
        });
    }
}
