'use strict';

function repo_escape(){
    if(webgl_character_level() < -1){
        return;
    }

    if(!core_menu_open){
        if(core_storage_data['ambient-state'] !== 0){
            const rgb = core_hex_to_rgb({
              'hex': core_storage_data['ambient-color'],
            });
            webgl_properties['ambient-blue'] = rgb['blue'] / 255;
            webgl_properties['ambient-green'] = rgb['green'] / 255;
            webgl_properties['ambient-red'] = rgb['red'] / 255;
        }
        if(core_storage_data['clearcolor-state'] !== 0){
            const rgb = core_hex_to_rgb({
              'hex': core_storage_data['clearcolor'],
            });
            webgl_clearcolor_set({
              'blue': rgb['blue'] / 255,
              'green': rgb['green'] / 255,
              'red': rgb['red'] / 255,
            });
        }
        if(core_storage_data['directional-state'] !== 0){
            webgl_properties['directional-state'] = core_storage_data['directional-state'] === 1;

            if(webgl_properties['directional-state']){
                const rgb = core_hex_to_rgb({
                  'hex': core_storage_data['directional-color'],
                });
                webgl_properties['directional-blue'] = rgb['blue'] / 255;
                webgl_properties['directional-green'] = rgb['green'] / 255;
                webgl_properties['directional-red'] = rgb['red'] / 255;
                webgl_properties['directional-vector'] = [
                  core_storage_data['directional-vector-x'],
                  core_storage_data['directional-vector-y'],
                  core_storage_data['directional-vector-z'],
                ];
            }
        }
        webgl_properties['draw-mode'] = core_storage_data['draw-mode'];
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
        if(core_storage_data['multiplier-state']){
            webgl_properties['jump-movement'] = core_storage_data['jump-movement'];
            webgl_properties['multiplier-jump'] = core_storage_data['multiplier-jump'];
            webgl_properties['multiplier-speed'] = core_storage_data['multiplier-speed'];
        }
        webgl_properties['paused'] = core_storage_data['paused'];
        webgl_properties['textures'] = core_storage_data['textures'];

        if(core_storage_data['character-state']){
            if(core_storage_data['character-automoves'] !== 2){
                webgl_characters[webgl_character_id]['automove'] = Boolean(core_storage_data['character-automoves']);
            }
            webgl_characters[webgl_character_id]['collide-range-horizontal'] = core_storage_data['character-collide-range-horizontal'];
            webgl_characters[webgl_character_id]['collide-range-vertical'] = core_storage_data['character-collide-range-vertical'];
            webgl_characters[webgl_character_id]['collides'] = core_storage_data['character-collides'];
            webgl_characters[webgl_character_id]['reticle'] = !core_storage_data['character-reticle']
              ? false
              : core_storage_data['character-reticle-color'];
            webgl_characters[webgl_character_id]['speed'] = core_storage_data['character-speed'];
        }

        webgl_uniform_update();

    }else{
        document.getElementById('tabcontent-properties').style.display = 'none';
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
        'characters-control': {
          'onclick': function(){
              webgl_character_set({
                'id': document.getElementById('characters-select').value,
              });
          },
        },
        'entity-generate': {
          'onclick': function(){
              const properties = core_args({
                'args': JSON.parse(document.getElementById('generate-properties').value),
                'defaults': {
                  'vertices': [],
                },
              });

              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              webgl_entity_create({
                'entities': [
                  properties,
                ],
              });
          },
        },
        'level-load': {
          'onclick': function(){
              core_tab_reset_group({
                'id': 'editor',
              });
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
        'prefab-generate': {
          'onclick': function(){
              const properties = core_args({
                'args': JSON.parse(document.getElementById('generate-properties').value),
                'defaults': {
                  'character': webgl_character_id,
                  'prefix': entity_id_count,
                },
              });

              if(!webgl_characters[properties['character']]){
                  return;
              }

              core_call({
                'args': properties,
                'todo': document.getElementById('prefabs-select').value,
              });
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
              document.getElementById('exported').value = webgl_json_export({
                'character': false,
              });
          },
        },
      },
      'keybinds': {
        86: {
          'todo': function(){
              webgl_characters[webgl_character_id]['collides'] = !webgl_characters[webgl_character_id]['collides'];
          },
        },
        192: {
          'todo': function(){
              webgl_characters[webgl_character_id]['automove'] = !webgl_characters[webgl_character_id]['automove'];
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
        'mouseup': {
          'todo': function(){
              if(webgl_character_level() < -1){
                  return;
              }
              webgl_pick_entity({
                'x': core_mouse['down-x'],
                'y': core_mouse['down-y'],
              });
          },
        },
      },
      'storage': {
        'ambient-color': '#ffffff',
        'ambient-state': 0,
        'beforeunload-warning': true,
        'character-automoves': 2,
        'character-collide-range-horizontal': 2.5,
        'character-collide-range-vertical': 2.5,
        'character-collides': true,
        'character-moves-x': true,
        'character-moves-y': true,
        'character-moves-z': true,
        'character-reticle': true,
        'character-reticle-color': '#ffffff',
        'character-rotates-x': true,
        'character-rotates-y': true,
        'character-rotates-z': true,
        'character-speed': 1,
        'character-state': 0,
        'clearcolor': '#000000',
        'clearcolor-state': 0,
        'directional-color': '#ffffff',
        'directional-state': 0,
        'directional-vector-x': 0,
        'directional-vector-y': 1,
        'directional-vector-z': 0,
        'draw-mode': '',
        'fog-density': .0001,
        'fog-state': 0,
        'gravity-acceleration': -.05,
        'gravity-axis': 'dy',
        'gravity-max': -2,
        'gravity-state': false,
        'jump-movement': 0,
        'multiplier-jump': 1,
        'multiplier-speed': 1,
        'multiplier-state': 0,
        'paused': true,
        'textures': true,
      },
      'storage-menu': '<table><tr><td>Camera/Character<br><select id=character-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input id=character-reticle type=checkbox><label for=character-reticle>Reticle</label> <input id=character-reticle-color type=color>Color<br>'
          + '<input class=mini id=character-speed step=any type=number>Speed<br>'
          + '<input id=character-collides type=checkbox><label for=character-collides>Collides</label>, Range<br>'
          + '<input class=mini id=character-collide-range-horizontal step=any type=number>Horizontal<br>'
          + '<input class=mini id=character-collide-range-vertical step=any type=number>Vertical<br>'
          + '<select id=character-automoves><option value=1>on</option><option selected value=0>off</option><option value=2>any</option></select>Automove<br>'
          + 'Movement<input id=character-moves-x type=checkbox><label for=character-moves-x>X</label><input id=character-moves-y type=checkbox><label for=character-moves-y>Y</label><input id=character-moves-z type=checkbox><label for=character-moves-z>Z</label><br>'
          + 'Rotation<input id=character-rotates-x type=checkbox><label for=character-rotates-x>X</label><input id=character-rotates-y type=checkbox><label for=character-rotates-y>Y</label><input id=character-rotates-z type=checkbox><label for=character-rotates-z>Z</label>'
        + '<td>Multipliers<br>'
          + '<select id=multiplier-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input class=mini id=multiplier-jump step=any type=number>Jump<br>'
          + '<input class=mini id=jump-movement step=any type=number>Jump Movement<br>'
          + '<input class=mini id=multiplier-speed step=any type=number>Speed<br>'
          + '<input id=gravity-state type=checkbox><label for=gravity-state>Gravity Override</label><br>'
          + '<input class=mini id=gravity-acceleration step=any type=number>Acceleration<br>'
          + '<select id=gravity-axis><option value=dx>x</option><option selected value=dy>y</option><option value=dz>z</option></select>Axis<br>'
          + '<input class=mini id=gravity-max step=any type=number>Max<br>'
          + '<input id=paused type=checkbox><label for=paused>Paused</label>'
        + '<tr><td><input id=ambient-color type=color>Ambient Lighting<br>'
          + '<select id=ambient-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input id=directional-color type=color>Directional Lighting<br>'
          + '<select id=directional-state><option value=0>Use Level Properties</option><option value=1>Override On</option><option value=2>Override Off</option></select><br>'
          + '<input class=mini id=directional-vector-x step=any type=number>X<br>'
          + '<input class=mini id=directional-vector-y step=any type=number>Y<br>'
          + '<input class=mini id=directional-vector-z step=any type=number>Z'
        + '<td><select id=draw-mode><option value="">Use Entity Properties</option><option value=LINES>Lines</option><option value=LINE_LOOP>Line Loop</option><option value=LINE_STRIP>Line Strip</option><option value=POINTS>Points</option><option value=TRIANGLES>Triangles</option><option value=TRIANGLE_FAN>Triangle Fan</option><option value=TRIANGLE_STRIP>Triangle Strip</option></select>Draw Mode<br>'
          + '<input id=textures type=checkbox><label for=textures>Textures</label><br>'
          + '<input id=clearcolor type=color>Clear Color<br>'
          + '<select id=clearcolor-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input class=mini id=fog-density step=any type=number>Fog<br>'
          + '<select id=fog-state><option value=0>Use Level Properties</option><option value=1>Override On</option><option value=2>Override Off</option></select><br>'
          + '<input id=beforeunload-warning type=checkbox><label for=beforeunload-warning>beforeunload Warning</label></table>',
      'tabs': {
        'add': {
          'content': '<input id=entity-generate type=button value="Generate Entity"><select id=prefabs-select>'
              + '<option value=webgl_primitive_cuboid>webgl_primitive_cuboid</option>'
              + '<option value=webgl_primitive_ellipsoid>webgl_primitive_ellipsoid</option>'
              + '<option value=webgl_primitive_frustum>webgl_primitive_frustum</option>'
              + '<option value=prefabs_webgl_cuboid_tree>prefabs_webgl_cuboid_tree</option>'
              + '<option value=prefabs_webgl_humanoid>prefabs_webgl_humanoid</option>'
              + '<option value=prefabs_webgl_lines_shrub>prefabs_webgl_lines_shrub</option>'
              + '<option value=prefabs_webgl_lines_tree>prefabs_webgl_lines_tree</option>'
              + '<option disabled value=prefabs_webgl_tiles>prefabs_webgl_tiles</option>'
              + '<option  value=prefabs_webgl_tree_2d>prefabs_webgl_tree_2d</option>'
            + '</select><input id=prefab-generate type=button value="Generate Prefab"><br>'
            + '<textarea id=generate-properties>{\n}</textarea>',
          'group': 'editor',
          'label': 'Add',
        },
        'character-properties': {
          'content': '<select id=characters-select></select><input id=characters-control type=button value=Control>'
              + '<table id=character-properties></table>',
          'group': 'editor',
          'label': 'Characters',
        },
        'entity-properties': {
          'content': '<select id=entity-select></select>'
              + '<table id=entity-properties></table>',
          'group': 'editor',
          'label': 'Entities',
        },
        'export': {
          'content': '<input id=update-json type=button value="Update Level JSON"><br><textarea id=exported></textarea>',
          'group': 'core-menu',
          'label': 'Export Level',
        },
        'load': {
          'content': '<table><tr>'
              + '<td><input id=level-json type=file>'
              + '<td><input id=level-load type=button value="Load Level from File">'
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
            + '<tr><td>Paths<td id=path-count>'
            + '<tr><td>webgl Entities<td id=webgl-entity-count>'
            + '<tr class=header><td>Group<td>Count'
            + '<tr><td>foreground<td id=foreground-count>'
            + '<tr><td>particles<td id=particles-count>'
            + '<tr><td>skybox<td id=skybox-count>'
            + '<tr><td>webgl<td id=webgl-group-count></table>',
          'group': 'editor',
          'label': 'Stats',
        },
      },
      'title': 'MultiverseEditor.htm',
      'ui': '<input id=origin type=button value=Origin><input id=spawn type=button value=Spawn><br>'
        + '<input id=translate-x-set type=button value=x><input class=left id=translate-x readonly><input id=rotate-x-set type=button value=x°><input class="left mini" id=rotate-x readonly><br>'
        + '<input id=translate-y-set type=button value=y><input class=left id=translate-y readonly><input id=rotate-y-set type=button value=y°><input class="left mini" id=rotate-y readonly><br>'
        + '<input id=translate-z-set type=button value=z><input class=left id=translate-z readonly><input id=rotate-z-set type=button value=z°><input class="left mini" id=rotate-z readonly><br>'
        + '<span id=editor-tabs></span><div id=editor-tabcontent></div>',
    });
    webgl_storage_init();

    if('multiverselevels' in globalThis){
        let level_select = '';
        for(const level in multiverselevels){
            level_select += '<option value="' + level + '">' + multiverselevels[level] + '</option>';
        }
        document.getElementById('level-select').innerHTML = level_select;
    }

    const level_arg = globalThis.location.search.substring(1);
    if(level_arg.length){
        ajax_level(level_arg);
    }
}

function repo_level_load(){
    property_table(
      'properties',
      webgl_properties,
      'webgl'
    );

    let character_options = '';
    for(const character in webgl_characters){
        character_options += '<option value="' + character + '">' + character + '</option>';
    }
    const characters_select = document.getElementById('characters-select');
    characters_select.innerHTML = character_options;
    property_table(
      'character-properties',
      webgl_characters[characters_select.value],
      'character'
    );

    let entity_options = '';
    for(const entity in entity_entities){
        entity_options += '<option value="' + entity + '">' + entity + '</option>';
    }
    const entity_select = document.getElementById('entity-select');
    entity_select.innerHTML = entity_options;
    property_table(
      'entity-properties',
      entity_entities[entity_select.value],
      'entity'
    );
}

function repo_logic(){
    if(!core_storage_data['character-moves-x']){
        webgl_characters[webgl_character_id]['translate-x'] = core_ui_values['translate-x'];
    }
    if(!core_storage_data['character-moves-y']){
        webgl_characters[webgl_character_id]['translate-y'] = core_ui_values['translate-y'];
    }
    if(!core_storage_data['character-moves-z']){
        webgl_characters[webgl_character_id]['translate-z'] = core_ui_values['translate-z'];
    }
    if(!core_storage_data['character-rotates-x']){
        webgl_characters[webgl_character_id]['camera-rotate-x'] = core_ui_values['rotate-x'];
        webgl_characters[webgl_character_id]['rotate-x'] = core_ui_values['rotate-x'];
    }
    if(!core_storage_data['character-rotates-y']){
        webgl_characters[webgl_character_id]['camera-rotate-y'] = core_ui_values['rotate-y'];
        webgl_characters[webgl_character_id]['rotate-y'] = core_ui_values['rotate-y'];
    }
    if(!core_storage_data['character-rotates-z']){
        webgl_characters[webgl_character_id]['camera-rotate-z'] = core_ui_values['rotate-z'];
        webgl_characters[webgl_character_id]['rotate-z'] = core_ui_values['rotate-z'];
    }

    core_ui_update({
      'ids': {
        'character-count': webgl_character_count,
        'foreground-count': entity_groups['_length']['foreground'],
        'id-count': entity_id_count,
        'particles-count': entity_groups['_length']['particles'],
        'path-count': Object.keys(webgl_paths).length,
        'rotate-x': webgl_characters[webgl_character_id]['camera-rotate-x'],
        'rotate-y': webgl_characters[webgl_character_id]['camera-rotate-y'],
        'rotate-z': webgl_characters[webgl_character_id]['camera-rotate-z'],
        'skybox-count': entity_groups['_length']['skybox'],
        'translate-x': webgl_characters[webgl_character_id]['translate-x'],
        'translate-y': webgl_characters[webgl_character_id]['translate-y'],
        'translate-z': webgl_characters[webgl_character_id]['translate-z'],
        'webgl-entity-count': entity_info['webgl']['count'],
        'webgl-group-count': entity_groups['_length']['webgl'],
      },
    });

    for(const property in webgl_properties){
        core_ui_update({
          'ids': {
            ['properties-' + property]: webgl_properties[property],
          },
        });
    }
    const selected_character = document.getElementById('characters-select').value;
    for(const property in webgl_characters[selected_character]){
        core_ui_update({
          'ids': {
            ['character-properties-' + property]: webgl_characters[selected_character][property],
          },
        });
    }
    const selected_entity = document.getElementById('entity-select').value;
    for(const property in entity_entities[selected_entity]){
        core_ui_update({
          'ids': {
            ['entity-properties-' + property]: entity_entities[selected_entity][property],
          },
        });
    }
}
