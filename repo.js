'use strict';

function character_set_axis(type, axis){
    const element = document.getElementById(type + '-' + axis);
    let result = globalThis.prompt(
      'Set ' + type + '-' + axis + ' to:',
      element.value
    );

    if(result === null
      || result.length === 0){
        return;
    }

    result = Number.parseFloat(result);

    webgl_characters[webgl_character_id][type + '-' + axis] = result;
    if(type === 'rotate'){
        webgl_characters[webgl_character_id]['camera-rotate-' + axis] = result;
    }

    core_ui_update({
      'ids': {
        [type + '-' + axis]: result,
      },
    });
}

function delete_selected_option(type, todo){
    const select_element = document.getElementById(type + '-select');
    const select_value = select_element.value;
    if(select_value.length === 0
      || !globalThis.confirm('Delete ' + type + ' "' + select_value + '"?')){
        return;
    }
    todo(select_value);
    for(const id in select_element.options){
        const option = select_element.options[id];
        if(select_value === option.value){
            select_element.removeChild(option);
            break;
        }
    }
    globalThis['update_selected_' + type]();
}

function property_table(id, properties, type){
    const properties_table = document.getElementById(id);

    if(!properties_table.innerHTML.length){
        let properties_html = '<tr class=header><td>Property<td>Value';
        for(const property in properties){
            const property_type = typeof properties[property];

            if(property_type === 'object'){
                properties_html += '<tr><td>' + property + '<td><input id="' + id + '-' + property + '" readonly type=text>';

            }else if(property_type === 'boolean'){
                properties_html += '<tr><td>' + property
                  + '<td><input id="' + id + '-' + property + '" type=checkbox>';

            }else{
                properties_html += '<tr><td>'
                  + '<input id="' + id + '-button-' + property + '" type=button value=' + property + '>'
                  + '<td id="' + id + '-' + property + '">';
            }
        }
        properties_table.innerHTML = properties_html;
    }

    for(const property in properties){
        const property_type = typeof properties[property];

        if(property_type === 'boolean'){
            const checkbox = document.getElementById(id + '-' + property);
            if(!checkbox){
                continue;
            }
            checkbox.checked = properties[property];

            if(type === 'character'){
                checkbox.onchange = function(){
                    webgl_characters[document.getElementById('character-select').value][property] = this.checked;
                    webgl_uniform_update();
                }

            }else if(type === 'entity'){
                checkbox.onchange = function(){
                    entity_entities[document.getElementById('entity-select').value][property] = this.checked;
                    webgl_uniform_update();
                }

            }else if(type === 'path'){
                checkbox.onchange = function(){
                    webgl_paths[document.getElementById('path-select').value][property] = this.checked;
                    webgl_uniform_update();
                }

            }else{
                checkbox.onchange = function(){
                    webgl_properties[property] = this.checked;
                    webgl_uniform_update();
                }
            }

        }else if(property_type !== 'object'){
            const property_button = document.getElementById(id + '-button-' + property);
            if(!property_button){
                continue;
            }

            if(type === 'character'){
                property_button.onclick = function(){
                    const selected_character = document.getElementById('character-select').value;
                    set_property(
                      webgl_characters[selected_character],
                      property,
                      selected_character
                    );
                    webgl_uniform_update();
                }

            }else if(type === 'entity'){
                property_button.onclick = function(){
                    const selected_entity = document.getElementById('entity-select').value;
                    set_property(
                      entity_entities[selected_entity],
                      property,
                      selected_entity
                    );
                    webgl_uniform_update();
                }

            }else if(type === 'path'){
                property_button.onclick = function(){
                    const selected_path = document.getElementById('path-select').value;
                    set_property(
                      webgl_paths[selected_path],
                      property,
                      selected_path
                    );
                    webgl_uniform_update();
                }

            }else{
                property_button.onclick = function(){
                    set_property(
                      webgl_properties,
                      property,
                      'webgl_properties'
                    );
                    webgl_uniform_update();
                }
            }
        }
    }
}

function repo_escape(){
    if(!core_menu_open
      && webgl_character_level() > -2){
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
        document.getElementById('repo-ui').style.display = 'block';
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
        'camera-zoom-set': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              character_set_axis(
                'camera',
                'zoom'
              );
          },
        },
        'character-control': {
          'onclick': function(){
              const character = document.getElementById('character-select').value;
              if(character.length === 0){
                  return;
              }
              webgl_character_set({
                'id': character,
              });
          },
        },
        'character-delete': {
          'onclick': function(){
              delete_selected_option(
                'character',
                function(character){
                    delete webgl_characters[character];
                }
              );
          },
        },
        'character-goto': {
          'onclick': function(){
              const character = document.getElementById('character-select').value;
              if(character.length === 0){
                  return;
              }
              webgl_characters[webgl_character_id]['translate-x'] = webgl_characters[character]['translate-x'];
              webgl_characters[webgl_character_id]['translate-y'] = webgl_characters[character]['translate-y'];
              webgl_characters[webgl_character_id]['translate-z'] = webgl_characters[character]['translate-z'];
          },
        },
        'character-select': {
          'onchange': update_selected_character,
        },
        'entity-delete': {
          'onclick': function(){
              delete_selected_option(
                'entity',
                function(entity){
                    entity_remove({
                      'entities': [entity],
                    });
                }
              );
          },
        },
        'entity-generate': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]){
                  return;
              }

              const properties = core_args({
                'args': JSON.parse(document.getElementById('generate-properties').value),
                'defaults': {
                  'vertices': [],
                },
              });
              webgl_entity_create({
                'entities': [
                  properties,
                ],
              });
          },
        },
        'entity-goto': {
          'onclick': function(){
              const entity = document.getElementById('entity-select').value;
              if(entity.length === 0){
                  return;
              }
              const character = entity_entities[entity]['attach-to'];
              webgl_characters[webgl_character_id]['translate-x'] = webgl_characters[character]['translate-x'] + entity_entities[entity]['attach-offset-x'];
              webgl_characters[webgl_character_id]['translate-y'] = webgl_characters[character]['translate-y'] + entity_entities[entity]['attach-offset-y'];
              webgl_characters[webgl_character_id]['translate-z'] = webgl_characters[character]['translate-z'] + entity_entities[entity]['attach-offset-z'];
          },
        },
        'entity-remake': {
          'onclick': function(){
              const entity = document.getElementById('entity-select').value;
              if(entity.length === 0){
                  return;
              }
              webgl_entity_todo(entity);
          },
        },
        'entity-select': {
          'onchange': update_selected_entity,
        },
        'level-load-file': {
          'onclick': function(){
              core_tab_reset_group({
                'id': 'editor',
              });
              const element = document.getElementById('level-file');
              if(element.files.length === 0){
                  return;
              }
              core_file({
                'file': element.files[0],
                'todo': function(event){
                    if(webgl_level_load({
                        'character': -1,
                        'json': JSON.parse(event.target.result),
                      })){
                        document.title = webgl_properties['title']
                          ? webgl_properties['title'] + ' - ' + core_repo_title
                          : core_repo_title;

                    }else{
                        element.value = null;
                    }
                },
                'type': 'readAsText',
              });
          },
        },
        'level-load-textarea': {
          'onclick': function(){
              core_tab_reset_group({
                'id': 'editor',
              });
              const level_json = JSON.parse(document.getElementById('level-textarea').value);
              webgl_level_load({
                'character': -1,
                'json': level_json,
              });
              document.title = level_json['title']
                ? level_json['title'] + ' - ' + core_repo_title
                : core_repo_title;
          },
        },
        'origin': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]
               || !globalThis.confirm('Return to origin? (0,0,0)')){
                  return;
              }

              webgl_character_origin();
          },
        },
        'path-delete': {
          'onclick': function(){
              delete_selected_option(
                'path',
                function(path){
                    delete webgl_paths[path];
                }
              );
          },
        },
        'path-select': {
          'onchange': update_selected_path,
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
        'spawn': {
          'onclick': function(){
              if(!webgl_characters[webgl_character_id]
               || !globalThis.confirm('Return to spawn? ('
                    + webgl_properties['spawn-translate-x'] + ','
                    + webgl_properties['spawn-translate-y'] + ','
                    + webgl_properties['spawn-translate-z'] + ')')){
                  return;
              }

              webgl_character_spawn();
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
        'update-json': {
          'onclick': function(){
              document.getElementById('exported').value = webgl_level_export();
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
        'mousewheel': {
          'todo': webgl_camera_zoom,
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
        'character-moves': true,
        'character-moves-x': true,
        'character-moves-y': true,
        'character-moves-z': true,
        'character-reticle': true,
        'character-reticle-color': '#ffffff',
        'character-rotates': true,
        'character-rotates-x': true,
        'character-rotates-y': true,
        'character-rotates-z': true,
        'character-speed': 1,
        'character-state': 0,
        'character-zooms': true,
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
        'paused': true,
        'textures': true,
      },
      'storage-menu': '<table><tr><td>Camera/Character<select id=character-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input id=character-reticle type=checkbox><label for=character-reticle>Reticle</label> <input id=character-reticle-color type=color>Color<br>'
          + '<input class=mini id=character-speed step=any type=number>Speed<br>'
          + '<input id=character-collides type=checkbox><label for=character-collides>Collides</label>, Range<br>'
          + '<input class=mini id=character-collide-range-horizontal step=any type=number>Horizontal<br>'
          + '<input class=mini id=character-collide-range-vertical step=any type=number>Vertical<br>'
          + '<select id=character-automoves><option value=1>on</option><option selected value=0>off</option><option value=2>any</option></select>Automove<br>'
          + '<input id=character-moves type=checkbox><label for=character-moves>Movement</label><input id=character-moves-x type=checkbox><label for=character-moves-x>X</label><input id=character-moves-y type=checkbox><label for=character-moves-y>Y</label><input id=character-moves-z type=checkbox><label for=character-moves-z>Z</label><br>'
          + '<input id=character-rotates type=checkbox><label for=character-rotates>Rotation</label><input id=character-rotates-x type=checkbox><label for=character-rotates-x>X</label><input id=character-rotates-y type=checkbox><label for=character-rotates-y>Y</label><input id=character-rotates-z type=checkbox><label for=character-rotates-z>Z</label><br>'
          + '<input id=character-zooms type=checkbox><label for=character-zooms>Zoom</label>'
        + '<td><input id=beforeunload-warning type=checkbox><label for=beforeunload-warning>beforeunload Warning</label><br>'
          + '<input id=paused type=checkbox><label for=paused>Paused</label><br>'
          + '<input id=gravity-state type=checkbox><label for=gravity-state>Gravity Override</label><br>'
          + '<input class=mini id=gravity-acceleration step=any type=number>Acceleration<br>'
          + '<select id=gravity-axis><option value=dx>x</option><option selected value=dy>y</option><option value=dz>z</option></select>Axis<br>'
          + '<input class=mini id=gravity-max step=any type=number>Max'
        + '<tr><td>Ambient Lighting<select id=ambient-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input id=ambient-color type=color><br>'
          + 'Directional Lighting<select id=directional-state><option value=0>Use Level Properties</option><option value=1>Override On</option><option value=2>Override Off</option></select><br>'
          + '<input id=directional-color type=color><br>'
          + '<input class=mini id=directional-vector-x step=any type=number>X<br>'
          + '<input class=mini id=directional-vector-y step=any type=number>Y<br>'
          + '<input class=mini id=directional-vector-z step=any type=number>Z'
        + '<td>Draw Mode<select id=draw-mode><option value="">Use Entity Properties</option><option value=LINES>Lines</option><option value=LINE_LOOP>Line Loop</option><option value=LINE_STRIP>Line Strip</option><option value=POINTS>Points</option><option value=TRIANGLES>Triangles</option><option value=TRIANGLE_FAN>Triangle Fan</option><option value=TRIANGLE_STRIP>Triangle Strip</option></select><br>'
          + '<input id=textures type=checkbox><label for=textures>Textures</label><br>'
          + 'Clear Color<select id=clearcolor-state><option value=0>Use Level Properties</option><option value=1>Override On</option></select><br>'
          + '<input id=clearcolor type=color><br>'
          + 'Fog<select id=fog-state><option value=0>Use Level Properties</option><option value=1>Override On</option><option value=2>Override Off</option></select><br>'
          + '<input class=mini id=fog-density step=any type=number>Density</table>',
      'tabs': {
        'add': {
          'content': '<input id=entity-generate type=button value="Generate Entity"><select id=prefabs-select>'
              + '<option value=webgl_primitive_cuboid>webgl_primitive_cuboid</option>'
              + '<option value=webgl_primitive_ellipsoid>webgl_primitive_ellipsoid</option>'
              + '<option value=webgl_primitive_frustum>webgl_primitive_frustum</option>'
              + '<option value=prefabs_webgl_cuboid_tree>prefabs_webgl_cuboid_tree</option>'
              + '<option value=prefabs_webgl_humanoid>prefabs_webgl_humanoid</option>'
              + '<option value=prefabs_webgl_lines_path>prefabs_webgl_lines_path</option>'
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
          'content': '<select id=character-select></select><input id=character-control type=button value=Control><input id=character-delete type=button value=Delete><input id=character-goto type=button value="Go To">'
              + '<table id=character-properties></table>',
          'group': 'editor',
          'label': 'Characters',
        },
        'entity-properties': {
          'content': '<select id=entity-select></select><input id=entity-delete type=button value=Delete><input id=entity-goto type=button value="Go To"><input id=entity-remake type=button value=Remake>'
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
          'content': '<input id=level-file type=file><input id=level-load-file type=button value="Load Level from File"><br>'
            + '<input id=level-load-textarea type=button value="Load Level from Textarea"><br><textarea id=level-textarea>{}</textarea>',
          'default': true,
          'group': 'core-menu',
          'label': 'Load Levels',
        },
        'paths': {
          'content': '<select id=path-select></select><input id=path-delete type=button value=Delete>'
              + '<table id=path-properties></table>',
          'group': 'editor',
          'label': 'Paths',
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
      'ui': '<input id=origin type=button value=Origin><input id=spawn type=button value=Spawn><input id=camera-zoom-set type=button value=Zoom><input class="left mini" id=camera-zoom readonly type=text><br>'
        + '<input id=translate-x-set type=button value=x><input class=left id=translate-x readonly type=text><input id=rotate-x-set type=button value=x°><input class="left mini" id=rotate-x readonly type=text><br>'
        + '<input id=translate-y-set type=button value=y><input class=left id=translate-y readonly type=text><input id=rotate-y-set type=button value=y°><input class="left mini" id=rotate-y readonly type=text><br>'
        + '<input id=translate-z-set type=button value=z><input class=left id=translate-z readonly type=text><input id=rotate-z-set type=button value=z°><input class="left mini" id=rotate-z readonly type=text><br>'
        + '<span id=editor-tabs></span><div id=editor-tabcontent></div>',
    });
    webgl_storage_init();
}

function repo_level_load(){
    property_table(
      'properties',
      webgl_properties,
      'webgl'
    );
}

function repo_logic(){
    if(core_storage_data['character-state']){
        if(!core_storage_data['character-moves'] || !core_storage_data['character-moves-x']){
            webgl_characters[webgl_character_id]['translate-x'] = core_ui_values['translate-x'] || 0;
        }
        if(!core_storage_data['character-moves'] || !core_storage_data['character-moves-y']){
            webgl_characters[webgl_character_id]['translate-y'] = core_ui_values['translate-y'] || 0;
        }
        if(!core_storage_data['character-moves'] || !core_storage_data['character-moves-z']){
            webgl_characters[webgl_character_id]['translate-z'] = core_ui_values['translate-z'] || 0;
        }
        if(!core_storage_data['character-rotates'] || !core_storage_data['character-rotates-x']){
            webgl_characters[webgl_character_id]['camera-rotate-x'] = core_ui_values['rotate-x'] || 0;
            webgl_characters[webgl_character_id]['rotate-x'] = core_ui_values['rotate-x'] || 0;
        }
        if(!core_storage_data['character-rotates'] || !core_storage_data['character-rotates-y']){
            webgl_characters[webgl_character_id]['camera-rotate-y'] = core_ui_values['rotate-y'] || 0;
            webgl_characters[webgl_character_id]['rotate-y'] = core_ui_values['rotate-y'] || 0;
        }
        if(!core_storage_data['character-rotates'] || !core_storage_data['character-rotates-z']){
            webgl_characters[webgl_character_id]['camera-rotate-z'] = core_ui_values['rotate-z'] || 0;
            webgl_characters[webgl_character_id]['rotate-z'] = core_ui_values['rotate-z'] || 0;
        }
        if(!core_storage_data['character-zooms']){
            webgl_characters[webgl_character_id]['camera-zoom'] = core_ui_values['camera-zoom'] || 0;
        }
    }

    if(webgl_character_count !== core_ui_values['character-count']){
        update_select_options(
          'character',
          webgl_characters
        );
    }
    if(entity_id_count !== core_ui_values['id-count']){
        update_select_options(
          'entity',
          entity_entities
        );
    }
    if(Object.keys(webgl_paths).length !== core_ui_values['path-count']){
        update_select_options(
          'path',
          webgl_paths
        );
    }

    core_ui_update({
      'ids': {
        'camera-zoom': webgl_characters[webgl_character_id]['camera-zoom'],
        'character-count': webgl_character_count,
        'foreground-count': entity_groups['_length']['foreground'],
        'id-count': entity_id_count,
        'particles-count': entity_groups['_length']['particles'],
        'path-count': Object.keys(webgl_paths).length,
        'rotate-x': core_round({
          'number': webgl_characters[webgl_character_id]['camera-rotate-x'],
        }),
        'rotate-y': core_round({
          'number': webgl_characters[webgl_character_id]['camera-rotate-y'],
        }),
        'rotate-z': core_round({
          'number': webgl_characters[webgl_character_id]['camera-rotate-z'],
        }),
        'skybox-count': entity_groups['_length']['skybox'],
        'translate-x': webgl_characters[webgl_character_id]['translate-x'],
        'translate-y': webgl_characters[webgl_character_id]['translate-y'],
        'translate-z': webgl_characters[webgl_character_id]['translate-z'],
        'webgl-entity-count': entity_info['webgl']['count'],
        'webgl-group-count': entity_groups['_length']['webgl'],
      },
    });

    for(const property in webgl_properties){
        if(typeof webgl_properties[property] !== 'boolean'
          && typeof webgl_properties[property] !== 'number'
          && typeof webgl_properties[property] !== 'string'){
            continue;
        }

        core_ui_update({
          'ids': {
            ['properties-' + property]: webgl_properties[property],
          },
        });
    }
    update_selected_character();
    update_selected_entity();
    update_selected_path();
}

function set_property(properties, property, label){
    let result = globalThis.prompt(
      'Set ' + label + ' ' + property + ' to:',
      properties[property]
    );

    if(result === null){
        return;
    }

    properties[property] = core_type_convert({
      'template': properties[property],
      'value': result,
    });
}

function update_select_options(id, source){
    const select = document.getElementById(id + '-select');
    let selected_option = select.value;
    let option_available = false;

    let options = [];
    for(const option in source){
        options.push('<option value="' + option + '">' + option + '</option>');

        if(selected_option === option){
            option_available = true;
        }
    }
    options = core_sort_strings({
      'array': options,
    });
    select.innerHTML = options.join('');
    if(option_available){
        select.value = selected_option;
    }

    property_table(
      id + '-properties',
      source[select.value],
      id
    );
}

function update_selected_character(){
    const selected_character = document.getElementById('character-select').value;
    for(const property in webgl_characters[selected_character]){
        const property_value = webgl_characters[selected_character][property];

        if(typeof property_value !== 'boolean'
          && typeof property_value !== 'number'
          && typeof property_value !== 'string'){
            continue;
        }

        core_ui_update({
          'ids': {
            ['character-properties-' + property]: property_value,
          },
        });
    }
}

function update_selected_entity(){
    const selected_entity = document.getElementById('entity-select').value;
    for(const property in entity_entities[selected_entity]){
        const property_value = entity_entities[selected_entity][property];

        if(typeof property_value !== 'boolean'
          && typeof property_value !== 'number'
          && typeof property_value !== 'string'){
            continue;
        }

        core_ui_update({
          'ids': {
            ['entity-properties-' + property]: property_value,
          },
        });
    }
}

function update_selected_path(){
    const selected_path = document.getElementById('path-select').value;
    for(const property in webgl_paths[selected_path]){
        const property_value = webgl_paths[selected_path][property];

        if(typeof property_value !== 'boolean'
          && typeof property_value !== 'number'
          && typeof property_value !== 'string'){
            continue;
        }

        core_ui_update({
          'ids': {
            ['path-properties-' + property]: property_value,
          },
        });
    }
}
