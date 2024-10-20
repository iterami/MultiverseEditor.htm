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
        let properties_html = '';
        for(const property in properties){
            const property_type = core_type(properties[property]);

            if(property_type === 'object'){
                properties_html += '<tr><td>' + property + '<td><input id="' + id + '-' + property + '" readonly type=text>';

            }else if(property_type === 'boolean'){
                properties_html += '<tr><td>' + property
                  + '<td><input id="' + id + '-' + property + '" type=checkbox>';

            }else{
                properties_html += '<tr><td>'
                  + '<button id="' + id + '-button-' + property + '" type=button>' + property + '</button>'
                  + '<td id="' + id + '-' + property + '">';
            }
        }
        properties_table.innerHTML = properties_html;
    }

    const character_select = core_elements['character-select'].value;
    const entity_select = core_elements['entity-select'].value;
    const path_select = core_elements['path-select'].value;

    for(const property in properties){
        const property_type = core_type(properties[property]);

        if(property_type === 'boolean'){
            const checkbox = document.getElementById(id + '-' + property);
            if(!checkbox){
                continue;
            }
            checkbox.checked = properties[property];

            if(type === 'character'){
                checkbox.onchange = function(){
                    webgl_characters[character_select][property] = this.checked;
                    webgl_uniform_update();
                }

            }else if(type === 'entity'){
                checkbox.onchange = function(){
                    entity_entities[entity_select][property] = this.checked;
                    webgl_uniform_update();
                }

            }else if(type === 'path'){
                checkbox.onchange = function(){
                    webgl_paths[path_select][property] = this.checked;
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
                    set_property(
                      webgl_characters[character_select],
                      property,
                      character_select
                    );
                    webgl_uniform_update();
                }

            }else if(type === 'entity'){
                property_button.onclick = function(){
                    set_property(
                      entity_entities[entity_select],
                      property,
                      entity_select
                    );
                    webgl_uniform_update();
                }

            }else if(type === 'path'){
                property_button.onclick = function(){
                    set_property(
                      webgl_paths[path_select],
                      property,
                      path_select
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
        if(!webgl_context_valid){
            return;
        }

        if(core_storage_data['ambient-state'] !== 0){
            const rgb = core_hex_to_rgb(core_storage_data['ambient-color']);
            webgl_properties['ambient-blue'] = rgb['blue'] / 255;
            webgl_properties['ambient-green'] = rgb['green'] / 255;
            webgl_properties['ambient-red'] = rgb['red'] / 255;
        }
        if(core_storage_data['clearcolor-state'] !== 0){
            const rgb = core_hex_to_rgb(core_storage_data['clearcolor']);
            webgl_clearcolor_set({
              'blue': rgb['blue'] / 255,
              'green': rgb['green'] / 255,
              'red': rgb['red'] / 255,
            });
        }
        if(core_storage_data['directional-state'] !== 0){
            webgl_properties['directional-state'] = core_storage_data['directional-state'] === 1;

            if(webgl_properties['directional-state']){
                const rgb = core_hex_to_rgb(core_storage_data['directional-color']);
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
        if(core_storage_data['fog-state'] !== 0){
            webgl_properties['fog-state'] = core_storage_data['fog-state'] === 1;

            if(webgl_properties['fog-state']){
                webgl_properties['fog-density'] = core_storage_data['fog-density'];
            }
        }
        if(core_storage_data['gravity-state']){
            webgl_properties['gravity-acceleration'] = core_storage_data['gravity-acceleration'];
            webgl_properties['gravity-max'] = core_storage_data['gravity-max'];
        }
        webgl_properties['paused'] = core_storage_data['paused'];

        if(core_storage_data['character-state']){
            webgl_properties['camera-zoom-max'] = core_storage_data['character-zoom-max'];
            webgl_properties['camera-zoom-min'] = core_storage_data['character-zoom-min'];
            if(core_storage_data['character-automoves'] !== 2){
                webgl_characters[webgl_character_id]['automove'] = Boolean(core_storage_data['character-automoves']);
            }
            webgl_characters[webgl_character_id]['camera-lock'] = core_storage_data['character-lock'];
            webgl_characters[webgl_character_id]['collide-range-xz'] = core_storage_data['character-collide-range-xz'];
            webgl_characters[webgl_character_id]['collide-range-y'] = core_storage_data['character-collide-range-y'];
            webgl_characters[webgl_character_id]['collides'] = core_storage_data['character-collides'];
            webgl_characters[webgl_character_id]['reticle'] = !core_storage_data['character-reticle']
              ? false
              : core_storage_data['character-reticle-color'];
            webgl_characters[webgl_character_id]['speed'] = core_storage_data['character-speed'];
        }

        webgl_uniform_update();

    }else{
        core_elements['tabcontent-properties'].style.display = 'none';
        core_elements['repo-ui'].style.display = 'block';
    }
}

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(){
            if(!core_menu_lock
              && core_storage_data['beforeunload-warning']){
                return 'Exit?';
            }
        },
      },
      'events': {
        'camera-zoom-set': {
          'onclick': function(){
              if(core_menu_lock){
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
              const character = core_elements['character-select'].value;
              if(character.length === 0){
                  return;
              }
              webgl_character_set(character);
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
              const character = core_elements['character-select'].value;
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
        'context-toggle': {
          'onclick': function(){
              if(webgl === 0
                && context === 0){
                  return;
              }

              if(context === 0){
                  context = webgl.getExtension("WEBGL_lose_context");
                  context.loseContext();

              }else{
                  context.restoreContext();
                  context = 0;
              }
          },
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
              if(core_menu_lock){
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
              const entity = core_elements['entity-select'].value;
              if(entity.length === 0){
                  return;
              }
              const character = entity_entities[entity]['attach-to'];
              webgl_characters[webgl_character_id]['translate-x'] = webgl_characters[character]['translate-x'] + entity_entities[entity]['attach-x'];
              webgl_characters[webgl_character_id]['translate-y'] = webgl_characters[character]['translate-y'] + entity_entities[entity]['attach-y'];
              webgl_characters[webgl_character_id]['translate-z'] = webgl_characters[character]['translate-z'] + entity_entities[entity]['attach-z'];
          },
        },
        'entity-remake': {
          'onclick': function(){
              const entity = core_elements['entity-select'].value;
              if(entity.length === 0){
                  return;
              }
              webgl_entity_init(entity);
          },
        },
        'entity-select': {
          'onchange': update_selected_entity,
        },
        'level-load-file': {
          'onclick': function(){
              core_tab_reset_group('editor');
              const element = document.getElementById('level-file');
              if(element.files.length === 0){
                  return;
              }
              core_menu_lock = false;
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
              core_tab_reset_group('editor');
              const level_json = JSON.parse(document.getElementById('level-textarea').value);
              core_menu_lock = false;
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
              if(core_menu_lock
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
              if(core_menu_lock){
                  return;
              }

              const properties = core_args({
                'args': JSON.parse(document.getElementById('generate-properties').value),
                'defaults': {
                  'character': webgl_character_id,
                  'prefix': entity_id_count,
                },
              });

              globalThis[document.getElementById('prefabs-select').value]?.(properties);
          },
        },
        'remove-textures': {
          'onclick': function(){
              if(core_menu_lock
               || !globalThis.confirm('Remove all textures?')){
                  return;
              }

              webgl_texture_init({
                'id': 'default.png',
              });

              for(const entity in entity_entities){
                  entity_entities[entity]['texture-id'] = 'default.png';
              }

              webgl_draw();
          },
        },
        'rotate-x-set': {
          'onclick': function(){
              if(core_menu_lock){
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
              if(core_menu_lock){
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
              if(core_menu_lock){
                  return;
              }

              character_set_axis(
                'rotate',
                'z'
              );
          },
        },
        'screenshot': {
          'onclick': webgl_screenshot,
        },
        'set-draw-mode': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              const draw_mode = document.getElementById('draw-mode').value;

              if(!globalThis.confirm('Set "draw-mode" to "' + draw_mode +  '"?')){
                  return;
              }

              for(const entity in entity_entities){
                  entity_entities[entity]['draw-mode'] = draw_mode;
              }

              webgl_draw();
          },
        },
        'spawn': {
          'onclick': function(){
              if(core_menu_lock
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
              if(core_menu_lock){
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
              if(core_menu_lock){
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
              if(core_menu_lock){
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
      'globals': {
        'context': 0,
      },
      'keybinds': {
        'Backquote': {
          'todo': function(){
              webgl_characters[webgl_character_id]['automove'] = !webgl_characters[webgl_character_id]['automove'];
          },
        },
        'KeyV': {
          'todo': function(){
              webgl_characters[webgl_character_id]['collides'] = !webgl_characters[webgl_character_id]['collides'];
          },
        },
      },
      'menu-lock': true,
      'mousebinds': {
        'contextmenu': {
          'preventDefault': true,
        },
        'mousemove': {
          'todo': function(event){
              webgl_controls_mouse(webgl_character_id);
          },
        },
        'mouseup': {
          'todo': webgl_pick_entity,
        },
        'wheel': {
          'todo': function(event){
              webgl_controls_wheel(
                webgl_character_id,
                event.deltaY
              );
          },
        },
      },
      'storage': {
        'ambient-color': '#ffffff',
        'ambient-state': 0,
        'beforeunload-warning': true,
        'character-automoves': 2,
        'character-collide-range-xz': 2.5,
        'character-collide-range-y': 2.5,
        'character-collides': true,
        'character-lock': true,
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
        'character-zoom': true,
        'character-zoom-max': 50,
        'character-zoom-min': 0,
        'clearcolor': '#000000',
        'clearcolor-state': 0,
        'directional-color': '#ffffff',
        'directional-state': 0,
        'directional-vector-x': 0,
        'directional-vector-y': 1,
        'directional-vector-z': 0,
        'fog-density': .0001,
        'fog-state': 0,
        'gravity-acceleration': -.05,
        'gravity-max': -2,
        'gravity-state': false,
        'paused': true,
      },
      'storage-menu': '<table><tr><td>Camera/Character<select id=character-state><option value=0>Use Level Properties<option value=1>Override On</select><br>'
          + '<input id=character-reticle type=checkbox><label for=character-reticle>Reticle</label> <input id=character-reticle-color type=color>Color<br>'
          + '<input class=mini id=character-speed step=any type=number>Speed<br>'
          + '<input id=character-collides type=checkbox><label for=character-collides>Collides</label> <input class=mini id=character-collide-range-xz step=any type=number>XZ <input class=mini id=character-collide-range-y step=any type=number>Y<br>'
          + '<input id=character-lock type=checkbox><label for=character-lock>Camera Lock</label><br>'
          + '<input id=character-moves type=checkbox><label for=character-moves>Movement</label><input id=character-moves-x type=checkbox><label for=character-moves-x>X</label><input id=character-moves-y type=checkbox><label for=character-moves-y>Y</label><input id=character-moves-z type=checkbox><label for=character-moves-z>Z</label> <select id=character-automoves><option value=1>on<option selected value=0>off<option value=2>any</select>Automove<br>'
          + '<input id=character-rotates type=checkbox><label for=character-rotates>Rotation</label><input id=character-rotates-x type=checkbox><label for=character-rotates-x>X</label><input id=character-rotates-y type=checkbox><label for=character-rotates-y>Y</label><input id=character-rotates-z type=checkbox><label for=character-rotates-z>Z</label><br>'
          + '<input id=character-zoom type=checkbox><label for=character-zoom>Zoom</label><input class=mini id=character-zoom-min step=any type=number>-<input class=mini id=character-zoom-max step=any type=number>'
        + '<td><input id=beforeunload-warning type=checkbox><label for=beforeunload-warning>beforeunload Warning</label><br>'
          + '<input id=paused type=checkbox><label for=paused>Paused</label><br>'
          + '<input id=gravity-state type=checkbox><label for=gravity-state>Gravity Override</label><br>'
          + '<input id=gravity-acceleration step=any type=number>Acceleration<br>'
          + '<input id=gravity-max step=any type=number>Max'
        + '<tr><td>Ambient Lighting<select id=ambient-state><option value=0>Use Level Properties<option value=1>Override On</select><br>'
          + '<input id=ambient-color type=color><br>'
          + 'Directional Lighting<select id=directional-state><option value=0>Use Level Properties<option value=1>Override On<option value=2>Override Off</select><br>'
          + '<input id=directional-color type=color><input class=mini id=directional-vector-x step=any type=number>X <input class=mini id=directional-vector-y step=any type=number>Y <input class=mini id=directional-vector-z step=any type=number>Z'
        + '<td><select id=draw-mode><option value=LINES>Lines<option value=LINE_LOOP>Line Loop<option value=LINE_STRIP>Line Strip<option value=POINTS>Points<option value=TRIANGLES>Triangles<option value=TRIANGLE_FAN>Triangle Fan<option value=TRIANGLE_STRIP>Triangle Strip</select><button id=set-draw-mode type=button>Set Draw Mode</button><br>'
          + '<button id=remove-textures type=button>Remove Textures</button><br>'
          + 'Clear Color<select id=clearcolor-state><option value=0>Use Level Properties<option value=1>Override On</select><br>'
          + '<input id=clearcolor type=color><br>'
          + 'Fog<select id=fog-state><option value=0>Use Level Properties<option value=1>Override On<option value=2>Override Off</select><br>'
          + '<input id=fog-density step=any type=number>Density</table>',
      'tabs': {
        'add': {
          'content': '<button id=entity-generate type=button>Generate Entity</button><select id=prefabs-select>'
              + '<option value=webgl_primitive_cuboid>webgl_primitive_cuboid'
              + '<option value=webgl_primitive_ellipsoid>webgl_primitive_ellipsoid'
              + '<option value=webgl_primitive_frustum>webgl_primitive_frustum'
              + '<option value=webgl_primitive_stars>webgl_primitive_stars'
              + '<option value=webgl_primitive_terrain>webgl_primitive_terrain'
              + '<option disabled value=webgl_tiles>webgl_tiles'
              + '<option value=prefabs_webgl_cuboid_tree>prefabs_webgl_cuboid_tree'
              + '<option value=prefabs_webgl_frustum_tree>prefabs_webgl_frustum_tree'
              + '<option value=prefabs_webgl_humanoid>prefabs_webgl_humanoid'
              + '<option value=prefabs_webgl_lines_path>prefabs_webgl_lines_path'
              + '<option value=prefabs_webgl_lines_shrub>prefabs_webgl_lines_shrub'
              + '<option value=prefabs_webgl_lines_tree>prefabs_webgl_lines_tree'
              + '<option value=prefabs_webgl_tree_2d>prefabs_webgl_tree_2d'
            + '</select><button id=prefab-generate type=button>Generate Prefab</button><br>'
            + '<textarea id=generate-properties>{\n}</textarea>',
          'group': 'editor',
          'label': 'Add',
        },
        'character-properties': {
          'content': '<select id=character-select></select><button id=character-control type=button>Control</button><button id=character-delete type=button>Delete</button><button id=character-goto type=button>Go To</button>'
              + '<table><thead><tr class=header><td>Property<td>Value<tbody id=character-properties></table>',
          'group': 'editor',
          'label': 'Characters',
        },
        'entity-properties': {
          'content': '<select id=entity-select></select><button id=entity-delete type=button>Delete</button><button id=entity-goto type=button>Go To</button><button id=entity-remake type=button>Remake</button>'
              + '<table><thead><tr class=header><td>Property<td>Value<tbody id=entity-properties></table>',
          'group': 'editor',
          'label': 'Entities',
        },
        'export': {
          'content': '<button id=update-json type=button>Update Level JSON</button><br><textarea id=exported></textarea>',
          'group': 'core-menu',
          'label': 'Export Level',
        },
        'load': {
          'content': '<input id=level-file type=file><button id=level-load-file type=button>Load Level from File</button><br>'
            + '<button id=level-load-textarea type=button>Load Level from Textarea</button><br><textarea id=level-textarea>{}</textarea>',
          'default': true,
          'group': 'core-menu',
          'label': 'Load Levels',
        },
        'paths': {
          'content': '<select id=path-select></select><button id=path-delete type=button>Delete</button>'
              + '<table><thead><tr class=header><td>Property<td>Value<tbody id=path-properties></table>',
          'group': 'editor',
          'label': 'Paths',
        },
        'properties': {
          'content': '<table><thead><tr class=header><td>Property<td>Value<tbody id=properties></table>',
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
      'ui': '<button id=origin type=button>Origin</button><button id=spawn type=button>Spawn</button><button id=camera-zoom-set type=button>Zoom</button> <span id=camera-zoom-min></span><input class=mini id=camera-zoom readonly type=text><span id=camera-zoom-max></span> <button id=screenshot type=button>Screenshot</button><br>'
        + '<button id=translate-x-set type=button>x</button><input class=left id=translate-x readonly type=text><button id=rotate-x-set type=button>x°</button><input class="left mini" id=rotate-x readonly type=text><button id=context-toggle type=button>Context</button><br>'
        + '<button id=translate-y-set type=button>y</button><input class=left id=translate-y readonly type=text><button id=rotate-y-set type=button>y°</button><input class="left mini" id=rotate-y readonly type=text><br>'
        + '<button id=translate-z-set type=button>z</button><input class=left id=translate-z readonly type=text><button id=rotate-z-set type=button>z°</button><input class="left mini" id=rotate-z readonly type=text><br>'
        + '<span id=editor-tabs></span><div id=editor-tabcontent></div>',
      'ui-elements': [
        'character-select',
        'entity-select',
        'path-select',
        'tabcontent-properties',
      ],
    });
}

function repo_level_load(){
    property_table(
      'properties',
      webgl_properties,
      'webgl'
    );
    const webgl_animated_textures = document.getElementById('webgl-animated-textures');
    if(webgl_animated_textures){
        webgl_animated_textures.classList.remove('hidden');
    }
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
        if(!core_storage_data['character-zoom']){
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
        'camera-zoom-max': webgl_properties['camera-zoom-max'],
        'camera-zoom-min': webgl_properties['camera-zoom-min'],
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
        const property_type = core_type(webgl_properties[property]);

        if(property_type !== 'boolean'
          && property_type !== 'number'
          && property_type !== 'string'){
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

    const options = [];
    for(const option in source){
        options.push('<option value="' + option + '">' + option);

        if(selected_option === option){
            option_available = true;
        }
    }
    core_sort_strings({
      'array': options,
      'clone': false,
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

function update_selected(type, source){
    const select_element = document.getElementById(type + '-select');
    const selected = select_element.value;
    for(const property in source[selected]){
        const property_type = core_type(source[selected][property]);

        if(property_type !== 'boolean'
          && property_type !== 'number'
          && property_type !== 'string'){
            continue;
        }

        core_ui_update({
          'ids': {
            [type + '-properties-' + property]: source[selected][property],
          },
        });
    }
}

function update_selected_character(){
    update_selected(
      'character',
      webgl_characters
    );
}

function update_selected_entity(){
    update_selected(
      'entity',
      entity_entities
    );
}

function update_selected_path(){
    update_selected(
      'path',
      webgl_paths
    );
}
