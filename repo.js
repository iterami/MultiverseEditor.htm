'use strict';

function character_set_axis(type, axis){
    const element = document.getElementById(type + '_' + axis);
    let result = globalThis.prompt(
      'Set ' + type + '_' + axis + ' to:',
      element.value
    );

    if(result === null
      || result.length === 0){
        return;
    }

    result = Number.parseFloat(result);

    webgl_characters[webgl_character_id][type + '_' + axis] = result;
    if(type === 'rotate'){
        webgl_characters[webgl_character_id]['camera_rotate_' + axis] = result;
    }

    core_ui_update({
      'ids': {
        [type + '_' + axis]: result,
      },
    });
}

function delete_selected_option(type, todo){
    const select_element = document.getElementById(type + '_select');
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

function level_export(){
    if(webgl_character_level() < -1){
        return;
    }

    const json = {
      ...webgl_properties,
      'characters': {},
    };
    const groups = ['skybox'];
    for(const id in entity_groups){
        if(['_length', 'opaque', 'skybox', 'transparent'].includes(id)
          || id.startsWith('webgl_')){
            continue;
        }

        if(!json.groups){
            json.groups = [];
        }

        json.groups.push(id);
        groups.push(id);
    }
    for(const id in webgl_particles){
        if(!json.particles){
            json.particles = {};
        }

        json.particles[id] = webgl_particles[id];
    }
    for(const id in webgl_paths){
        if(!json.paths){
            json.paths = {};
        }

        json.paths[id] = webgl_paths[id];
    }
    for(const id in webgl_characters){
        json.characters[id] = {
          ...webgl_characters[id],
          'entities': [],
        };
    }
    for(const id in entity_entities){
        const entity_json = {
          ...entity_entities[id],
        };
        delete entity_json.normals;
        delete entity_json.vao;
        delete entity_json.vertices_length;
        for(const property in entity_json){
            if(entity_json[property] === entity_info.opaque.default[property]){
                delete entity_json[property];
            }
        }

        for(const group in groups){
            if(entity_groups[groups[group]][id] !== true){
                continue;
            }

            if(!entity_json.groups){
                entity_json.groups = [];
            }

            entity_json.groups.push(groups[group]);
        }

        json.characters[entity_json.attach_to].entities.push(entity_json);
    }
    for(const id in webgl_textures){
        if(id === 'default.png'){
            continue;
        }

        if(!json.textures){
            json.textures = {};
        }

        json.textures[id] = webgl_uris[id];
    }

    return JSON.stringify(json);
}

function property_table(id, properties, type){
    const properties_table = document.getElementById(id);

    if(!properties_table.innerHTML.length){
        let properties_html = '';
        for(const property in properties){
            if(core_type(properties[property]) === 'boolean'){
                properties_html += '<tr><td>' + property + '<td><input id="' + id + '_' + property + '" type=checkbox>';

            }else{
                properties_html += '<tr><td><button id="' + id + '_button_' + property + '" type=button>' + property + '</button><td><input id="' + id + '_' + property + '" readonly type=text>';
            }
        }
        properties_table.innerHTML = properties_html;
    }

    const character_select = core_elements.character_select.value;
    const entity_select = core_elements.entity_select.value;
    const path_select = core_elements.path_select.value;

    for(const property in properties){
        const property_type = core_type(properties[property]);

        if(property_type === 'boolean'){
            const checkbox = document.getElementById(id + '_' + property);
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

        }else{
            const property_button = document.getElementById(id + '_button_' + property);
            if(!property_button){
                continue;
            }

            const complex = property_type === 'array' || property_type === 'object';
            if(type === 'character'){
                property_button.onclick = function(){
                    set_property(
                      webgl_characters[character_select],
                      property,
                      character_select,
                      complex
                    );
                }

            }else if(type === 'entity'){
                property_button.onclick = function(){
                    set_property(
                      entity_entities[entity_select],
                      property,
                      entity_select,
                      complex
                    );
                }

            }else if(type === 'path'){
                property_button.onclick = function(){
                    set_property(
                      webgl_paths[path_select],
                      property,
                      path_select,
                      complex
                    );
                }

            }else{
                property_button.onclick = function(){
                    set_property(
                      webgl_properties,
                      property,
                      'webgl_properties',
                      complex
                    );
                }
            }
        }
    }
}

function repo_escape(){
    if(webgl === 0){
        return;
    }

    if(!core_menu_open
      && webgl_character_level() > -2){

        if(core_storage_data.ambient_state !== 0){
            const rgb = core_hex_to_rgb(core_storage_data.ambient_color);
            webgl_properties.ambient_color = [
              rgb.red / 255,
              rgb.green / 255,
              rgb.blue / 255,
            ];
        }
        if(core_storage_data.clearcolor_state !== 0){
            const rgb = core_hex_to_rgb(core_storage_data.clearcolor);
            webgl_color_set({
              'blue': rgb.blue / 255,
              'green': rgb.green / 255,
              'red': rgb.red / 255,
            });
        }
        if(core_storage_data.directional_state !== 0){
            webgl_properties.directional_state = core_storage_data.directional_state === 1;

            if(webgl_properties.directional_state){
                const rgb = core_hex_to_rgb(core_storage_data.directional_color);
                webgl_properties.directional_color = [
                  rgb.red / 255,
                  rgb.green / 255,
                  rgb.blue / 255,
                ];
                webgl_properties.directional_vector = [
                  core_storage_data.directional_vector_x,
                  core_storage_data.directional_vector_y,
                  core_storage_data.directional_vector_z,
                ];
            }
        }
        if(core_storage_data.fog_end >= 0){
            webgl_properties.fog_end = core_storage_data.fog_end;
            webgl_properties.fog_start = core_storage_data.fog_start;
        }
        if(core_storage_data.gravity_state){
            webgl_properties.gravity_acceleration = core_storage_data.gravity_acceleration;
            webgl_properties.gravity_max = core_storage_data.gravity_max;
        }
        webgl_properties.paused = core_storage_data.paused;

        if(core_storage_data.character_state){
            webgl_properties.camera_zoom_max = core_storage_data.character_zoom_max;
            webgl_properties.camera_zoom_min = core_storage_data.character_zoom_min;
            if(core_storage_data.character_automoves !== 2){
                webgl_characters[webgl_character_id].automove = Boolean(core_storage_data.character_automoves);
            }
            webgl_characters[webgl_character_id].camera_lock = core_storage_data.character_lock;
            webgl_characters[webgl_character_id].collide_bottom = core_storage_data.character_collide_bottom;
            webgl_characters[webgl_character_id].collide_top = core_storage_data.character_collide_top;
            webgl_characters[webgl_character_id].collide_xz = core_storage_data.character_collide_xz;
            webgl_characters[webgl_character_id].collides = core_storage_data.character_collides;
            webgl_characters[webgl_character_id].speed = core_storage_data.character_speed;
        }
        if(core_storage_data.perspective_state){
            const perspective = core_storage_data.perspective.split(',');
            for(const i in perspective){
                if(perspective[i] !== 'x'){
                    webgl_matrices.perspective[i] = perspective[i];
                }
            }
            webgl.uniformMatrix4fv(
              webgl_shaders.default.uniforms.perspective,
              false,
              webgl_matrices.perspective
            );
        }

        webgl_uniform_update();

    }else{
        core_elements.tabcontent_properties.style.display = 'none';
        core_elements.repo_ui.style.display = 'block';
    }
}

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(event){
            if(webgl !== 0){
                core_escape(true);
                event.preventDefault();
            }
        },
      },
      'events': {
        'camera_zoom_set': {
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
        'character_control': {
          'onclick': function(){
              const character = core_elements.character_select.value;
              if(character.length === 0){
                  return;
              }
              webgl_character_set(character);
          },
        },
        'character_delete': {
          'onclick': function(){
              delete_selected_option(
                'character',
                function(character){
                    delete webgl_characters[character];
                }
              );
          },
        },
        'character_goto': {
          'onclick': function(){
              const target = core_elements.character_select.value;
              if(target.length === 0){
                  return;
              }
              const character = webgl_characters[webgl_character_id];
              const position = webgl_get_position(webgl_characters[target]);
              character.position_x = position.x;
              character.position_y = position.y;
              character.position_z = position.z;
          },
        },
        'character_select': {
          'onchange': update_selected_character,
        },
        'context_toggle': {
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
        'entity_delete': {
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
        'entity_generate': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              const properties = core_args({
                'args': JSON.parse(document.getElementById('generate_properties').value),
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
        'entity_goto': {
          'onclick': function(){
              const target = core_elements.entity_select.value;
              if(target.length === 0){
                  return;
              }
              const character = webgl_characters[webgl_character_id];
              const position = webgl_get_position(entity_entities[target]);
              character.position_x = position.x;
              character.position_y = position.y;
              character.position_z = position.z;
          },
        },
        'entity_remake': {
          'onclick': function(){
              const entity = core_elements.entity_select.value;
              if(entity.length === 0){
                  return;
              }
              webgl_entity_init(entity);
          },
        },
        'entity_select': {
          'onchange': update_selected_entity,
        },
        'level_load_file': {
          'onclick': function(){
              core_tab_reset_group('editor');
              const element = document.getElementById('level_file');
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
                        document.title = (webgl_properties.title || element.files[0].name) +  ' - ' + core_repo_title;

                    }else{
                        element.value = null;
                    }
                },
                'type': 'readAsText',
              });
          },
        },
        'level_load_textarea': {
          'onclick': function(){
              core_tab_reset_group('editor');
              core_menu_lock = false;
              const text = document.getElementById('level_textarea').value.trim() || '{}';
              const level_json = JSON.parse(text[0] === "'"
                ? text.slice(1, -1)
                : text);
              webgl_level_load({
                'character': -1,
                'json': level_json,
              });
              document.title = level_json.title
                ? level_json.title + ' - ' + core_repo_title
                : core_repo_title;
          },
        },
        'path_delete': {
          'onclick': function(){
              delete_selected_option(
                'path',
                function(path){
                    delete webgl_paths[path];
                }
              );
          },
        },
        'path_select': {
          'onchange': update_selected_path,
        },
        'position_x_set': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              character_set_axis(
                'position',
                'x'
              );
          },
        },
        'position_y_set': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              character_set_axis(
                'position',
                'y'
              );
          },
        },
        'position_z_set': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              character_set_axis(
                'position',
                'z'
              );
          },
        },
        'prefab_generate': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              const properties = core_args({
                'args': JSON.parse(document.getElementById('generate_properties').value),
                'defaults': {
                  'character': webgl_character_id,
                  'prefix': entity_id_count,
                },
              });

              globalThis[document.getElementById('prefabs_select').value]?.(properties);
          },
        },
        'remove_textures': {
          'onclick': function(){
              if(core_menu_lock
               || !globalThis.confirm('Remove all textures?')){
                  return;
              }

              webgl_texture_init('default.png');

              for(const entity in entity_entities){
                  entity_entities[entity].texture = 'default.png';
              }

              webgl_draw();
          },
        },
        'rotate_x_set': {
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
        'rotate_y_set': {
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
        'rotate_z_set': {
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
        'set_draw_mode': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              const draw_mode = document.getElementById('draw_mode').value;

              if(!globalThis.confirm('Set draw mode to "' + draw_mode +  '"?')){
                  return;
              }

              for(const entity in entity_entities){
                  entity_entities[entity].draw_mode = draw_mode;
              }

              webgl_draw();
          },
        },
        'shader_set': {
          'onclick': shader_set,
        },
        'spawn': {
          'onclick': function(){
              if(core_menu_lock){
                  return;
              }

              const character = globalThis.prompt(
                'Return character to spawn?',
                webgl_character_id
              );

              if(character === null){
                  return;
              }

              webgl_character_spawn(character);
          },
        },
        'update_json': {
          'onclick': function(){
              document.getElementById('exported').value = level_export();
          },
        },
      },
      'globals': {
        'context': 0,
      },
      'keybinds': {
        'Backquote': {
          'todo': function(){
              webgl_characters[webgl_character_id].automove = !webgl_characters[webgl_character_id].automove;
          },
        },
        'KeyV': {
          'todo': function(){
              webgl_characters[webgl_character_id].collides = !webgl_characters[webgl_character_id].collides;
          },
        },
      },
      'menu_lock': true,
      'pointerbinds': {
        'contextmenu': {
          'preventDefault': true,
        },
        'pointermove': {
          'todo': function(){
              webgl_controls_pointer();
          },
        },
        'pointerup': {
          'todo': function(){
              webgl_pick_entity();

              let color = '';
              if(core_storage_data.picking_color
                && webgl !== 0){
                  webgl_draw();
                  color = String(webgl_pick_color({
                    'x': core_pointer.x,
                    'y': core_pointer.y,
                  }));
              }
              core_ui_update({
                'ids': {
                  'picking_color_display': color,
                },
              });
          },
        },
        'wheel': {
          'todo': webgl_controls_wheel,
        },
      },
      'storage': {
        'ambient_color': '#ffffff',
        'ambient_state': 0,
        'character_automoves': 2,
        'character_collide_bottom': 2.5,
        'character_collide_top': 2.5,
        'character_collide_xz': 2.5,
        'character_collides': true,
        'character_lock': true,
        'character_moves': true,
        'character_moves_x': true,
        'character_moves_y': true,
        'character_moves_z': true,
        'character_rotates': true,
        'character_rotates_x': true,
        'character_rotates_y': true,
        'character_rotates_z': true,
        'character_speed': 1,
        'character_state': 0,
        'character_zoom': true,
        'character_zoom_max': 50,
        'character_zoom_min': 0,
        'clearcolor': '#000000',
        'clearcolor_state': 0,
        'directional_color': '#ffffff',
        'directional_state': 0,
        'directional_vector_x': 0,
        'directional_vector_y': 1,
        'directional_vector_z': 0,
        'fog_end': -1,
        'fog_start': -1,
        'gravity_acceleration': -.05,
        'gravity_max': -2,
        'gravity_state': false,
        'paused': true,
        'perspective': 'x,x,x,x,x,1,x,x,x,x,-1,-1,x,x,-2,x',
        'perspective_state': 0,
        'picking_color': true,
        'shader_fragment': '',
        'shader_vertex': '',
      },
      'storage_controls': true,
      'storage_menu': '<table><tr><td>Camera/Character<select id=character_state><option value=0>Use Level Properties<option value=1>Override On</select><br>'
          + '<input id=character_lock type=checkbox><label for=character_lock>Camera Lock</label><br>'
          + '<input id=character_moves type=checkbox><label for=character_moves>Movement</label><input id=character_moves_x type=checkbox><label for=character_moves_x>X</label><input id=character_moves_y type=checkbox><label for=character_moves_y>Y</label><input id=character_moves_z type=checkbox><label for=character_moves_z>Z</label> <select id=character_automoves><option value=1>on<option selected value=0>off<option value=2>any</select>Automove<br>'
          + '<input id=character_rotates type=checkbox><label for=character_rotates>Rotation</label><input id=character_rotates_x type=checkbox><label for=character_rotates_x>X</label><input id=character_rotates_y type=checkbox><label for=character_rotates_y>Y</label><input id=character_rotates_z type=checkbox><label for=character_rotates_z>Z</label><br>'
          + '<input id=character_zoom type=checkbox><label for=character_zoom>Zoom</label><input class=mini id=character_zoom_min step=any type=number>-<input class=mini id=character_zoom_max step=any type=number>'
        + '<td><input id=paused type=checkbox><label for=paused>Paused</label><br>'
          + '<input id=gravity_state type=checkbox><label for=gravity_state>Gravity Override</label><br>'
          + '<input class=mini id=gravity_acceleration step=any type=number>Acceleration<input class=mini id=gravity_max step=any type=number>Max<br>'
          + '<input class=mini id=character_speed step=any type=number>Speed<br>'
          + '<input id=character_collides type=checkbox><label for=character_collides>Collides</label><input class=mini id=character_collide_xz step=any type=number>XZ<br>'
          + 'Y<input class=mini id=character_collide_bottom step=any type=number>Bottom<input class=mini id=character_collide_top step=any type=number>Top'
        + '<tr><td>Ambient Light<select id=ambient_state><option value=0>Use Level Properties<option value=1>Override On</select><br>'
          + '<input id=ambient_color type=color><br>'
          + 'Directional Light<select id=directional_state><option value=0>Use Level Properties<option value=1>Override On<option value=2>Override Off</select><br>'
          + '<input id=directional_color type=color><input class=mini id=directional_vector_x step=any type=number>X <input class=mini id=directional_vector_y step=any type=number>Y <input class=mini id=directional_vector_z step=any type=number>Z'
        + '<td><select id=draw_mode><option value=LINES>Lines<option value=LINE_LOOP>Line Loop<option value=LINE_STRIP>Line Strip<option value=POINTS>Points<option value=TRIANGLES>Triangles<option value=TRIANGLE_FAN>Triangle Fan<option value=TRIANGLE_STRIP>Triangle Strip</select><button id=set_draw_mode type=button>Set Draw Mode</button><br>'
          + '<button id=remove_textures type=button>Remove Textures</button><br>'
          + 'Clear Color<select id=clearcolor_state><option value=0>Use Level Properties<option value=1>Override On</select><br>'
          + '<input id=clearcolor type=color><br>'
          + 'Fog<input class=mini id=fog_start step=any type=number>Start<input class=mini id=fog_end step=any type=number>End'
        + '<tr><td>Perspective Matrix<select id=perspective_state><option value=0>Use Level Properties<option value=1>Override On</select><br>'
          + '<input id=perspective>'
        + '<td>Picking Color Display<input id=picking_color type=checkbox></table>',
      'tabs': {
        'add': {
          'content': '<button id=entity_generate type=button>Generate Entity</button><select id=prefabs_select>'
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
            + '</select><button id=prefab_generate type=button>Generate Prefab</button><br>'
            + '<textarea id=generate_properties>{\n}</textarea>',
          'group': 'editor',
          'label': 'Add',
        },
        'characters': {
          'content': '<select id=character_select></select><button id=character_control type=button>Control</button><button id=character_delete type=button>Delete</button><button id=character_goto type=button>Go To</button>'
              + '<table class=center><thead><tr class=header><td>Property<td>Value<tbody id=character_properties></table>',
          'group': 'editor',
          'label': 'Characters',
        },
        'entities': {
          'content': '<select id=entity_select></select><button id=entity_delete type=button>Delete</button><button id=entity_goto type=button>Go To</button><button id=entity_remake type=button>Remake</button>'
              + '<table class=center><thead><tr class=header><td>Property<td>Value<tbody id=entity_properties></table>',
          'group': 'editor',
          'label': 'Entities',
        },
        'export': {
          'content': '<button id=update_json type=button>Update Level JSON</button><br><textarea id=exported></textarea>',
          'group': 'core_menu',
          'label': 'Export Level',
        },
        'load': {
          'content': '<input id=level_file type=file><button id=level_load_file type=button>Load Level from File</button><br>'
            + '<button id=level_load_textarea type=button>Load Level from Textarea</button><br><textarea id=level_textarea></textarea>',
          'default': true,
          'group': 'core_menu',
          'label': 'Load Levels',
        },
        'paths': {
          'content': '<select id=path_select></select><button id=path_delete type=button>Delete</button>'
              + '<table class=center><thead><tr class=header><td>Property<td>Value<tbody id=path_properties></table>',
          'group': 'editor',
          'label': 'Paths',
        },
        'properties': {
          'content': '<table class=center><thead><tr class=header><td>Property<td>Value<tbody id=properties></table>',
          'group': 'editor',
          'label': 'Properties',
        },
        'shaders': {
          'content': '<textarea id=shader_fragment></textarea>Fragment<br>'
            + '<textarea id=shader_vertex></textarea>Vertex<br>'
            + '<button id=shader_set>Set Shaders</button>',
          'group': 'core_menu',
          'label': 'Shaders',
        },
        'stats': {
          'content': '<table class=right><tr><td>Characters<td id=character_count>'
            + '<tr><td>ID count<td id=id_count>'
            + '<tr><td>Paths<td id=path_count>'
            + '<tr class=header><td>Group<td>Count'
            + '<tr><td>opaque<td id=opaque_count>'
            + '<tr><td>particles<td id=particles_count>'
            + '<tr><td>skybox<td id=skybox_count>'
            + '<tr><td>transparent<td id=transparent_count></table>',
          'group': 'editor',
          'label': 'Stats',
        },
      },
      'title': 'MultiverseEditor.htm',
      'ui': '<button id=spawn type=button>Spawn</button><button id=camera_zoom_set type=button>Zoom</button> <span id=camera_zoom_min></span><input class=mini id=camera_zoom readonly type=text><span id=camera_zoom_max></span> <button id=screenshot type=button>Screenshot</button><br>'
        + '<button id=position_x_set type=button>x</button><input class=left id=position_x readonly type=text><button id=rotate_x_set type=button>x°</button><input class="left mini" id=rotate_x readonly type=text><button id=context_toggle type=button>Context</button><br>'
        + '<button id=position_y_set type=button>y</button><input class=left id=position_y readonly type=text><button id=rotate_y_set type=button>y°</button><input class="left mini" id=rotate_y readonly type=text><span id=picking_color_display></span><br>'
        + '<button id=position_z_set type=button>z</button><input class=left id=position_z readonly type=text><button id=rotate_z_set type=button>z°</button><input class="left mini" id=rotate_z readonly type=text><br>'
        + '<span id=editor_tabs></span><div id=editor_tabcontent></div>',
      'ui_elements': [
        'character_select',
        'entity_select',
        'path_select',
        'tabcontent_properties',
      ],
    });
}

function repo_level_load(){
    property_table(
      'properties',
      webgl_properties,
      'webgl'
    );
    const webgl_animated_textures = document.getElementById('webgl_animated_textures');
    if(webgl_animated_textures){
        webgl_animated_textures.classList.remove('hidden');
    }
}

function repo_logic(){
    if(core_storage_data.character_state){
        if(!core_storage_data.character_moves || !core_storage_data.character_moves_x){
            webgl_characters[webgl_character_id].position_x = core_ui_values.position_x || 0;
        }
        if(!core_storage_data.character_moves || !core_storage_data.character_moves_y){
            webgl_characters[webgl_character_id].position_y = core_ui_values.position_y || 0;
        }
        if(!core_storage_data.character_moves || !core_storage_data.character_moves_z){
            webgl_characters[webgl_character_id].position_z = core_ui_values.position_z || 0;
        }
        if(!core_storage_data.character_rotates || !core_storage_data.character_rotates_x){
            webgl_characters[webgl_character_id].camera_rotate_x = core_ui_values.rotate_x || 0;
            webgl_characters[webgl_character_id].rotate_x = core_ui_values.rotate_x || 0;
        }
        if(!core_storage_data.character_rotates || !core_storage_data.character_rotates_y){
            webgl_characters[webgl_character_id].camera_rotate_y = core_ui_values.rotate_y || 0;
            webgl_characters[webgl_character_id].rotate_y = core_ui_values.rotate_y || 0;
        }
        if(!core_storage_data.character_rotates || !core_storage_data.character_rotates_z){
            webgl_characters[webgl_character_id].camera_rotate_z = core_ui_values.rotate_z || 0;
            webgl_characters[webgl_character_id].rotate_z = core_ui_values.rotate_z || 0;
        }
        if(!core_storage_data.character_zoom){
            webgl_characters[webgl_character_id].camera_zoom = core_ui_values.camera_zoom || 0;
        }
    }

    if(webgl_character_count !== core_ui_values.character_count){
        update_select_options(
          'character',
          webgl_characters
        );
    }
    if(entity_id_count !== core_ui_values.id_count){
        update_select_options(
          'entity',
          entity_entities
        );
    }
    if(Object.keys(webgl_paths).length !== core_ui_values.path_count){
        update_select_options(
          'path',
          webgl_paths
        );
    }

    core_ui_update({
      'ids': {
        'camera_zoom': webgl_characters[webgl_character_id].camera_zoom,
        'camera_zoom_max': webgl_properties.camera_zoom_max,
        'camera_zoom_min': webgl_properties.camera_zoom_min,
        'character_count': webgl_character_count,
        'id_count': entity_id_count,
        'opaque_count': entity_groups._length.opaque,
        'particles_count': entity_groups._length.particles || 0,
        'path_count': Object.keys(webgl_paths).length,
        'position_x': webgl_characters[webgl_character_id].position_x,
        'position_y': webgl_characters[webgl_character_id].position_y,
        'position_z': webgl_characters[webgl_character_id].position_z,
        'rotate_x': core_round({
          'number': webgl_characters[webgl_character_id].camera_rotate_x,
        }),
        'rotate_y': core_round({
          'number': webgl_characters[webgl_character_id].camera_rotate_y,
        }),
        'rotate_z': core_round({
          'number': webgl_characters[webgl_character_id].camera_rotate_z,
        }),
        'skybox_count': entity_groups._length.skybox,
        'transparent_count': entity_groups._length.transparent,
      },
    });

    for(const property in webgl_properties){
        core_ui_update({
          'ids': {
            ['properties_' + property]: JSON.stringify(webgl_properties[property]),
          },
          'todo': 'value',
        });
    }
    update_selected_character();
    update_selected_entity();
    update_selected_path();
}

function shader_set(){
    if(webgl === 0){
        return;
    }

    core_storage_save([
      'shader_fragment',
      'shader_vertex',
    ]);

    webgl_shader({
      'id': 'default',
      'attributes': Object.keys(webgl_shaders.default.attributes),
      'uniforms': Object.keys(webgl_shaders.default.uniforms),
      'fragment': core_storage_data.shader_fragment,
      'vertex': core_storage_data.shader_vertex,
    });
    webgl_shader_use('default');

    for(const entity in entity_entities){
        webgl_entity_init(entity_entities[entity]);
    }

    webgl_resize();
    core_escape();
}

function set_property(properties, property, label, complex){
    const value = JSON.stringify(properties[property]);
    const result = globalThis.prompt(
      'Set ' + label + ' ' + property + ' to:',
      value
    );

    if(result === null){
        return;
    }

    properties[property] = core_type_convert({
      'template': properties[property],
      'value': complex
        ? JSON.parse(result)
        : result,
    });

    webgl_uniform_update();
}

function update_select_options(id, source){
    const select = document.getElementById(id + '_select');
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
      id + '_properties',
      source[select.value],
      id
    );
}

function update_selected(type, source){
    const select_element = document.getElementById(type + '_select');
    const selected = select_element.value;
    for(const property in source[selected]){
        core_ui_update({
          'ids': {
            [type + '_properties_' + property]: JSON.stringify(source[selected][property]),
          },
          'todo': 'value',
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
