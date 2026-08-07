'use strict';

function character_set_axis(type, axis){
    const element = document.getElementById(type + '_' + axis);
    let result = globalThis.prompt(
      'Set "' + type + '_' + axis + '" to:',
      element.value
    );

    if(result === null
      || result.length === 0){
        return;
    }

    result = Number.parseFloat(result);

    webgl_characters[webgl_player_id][type + '_' + axis] = result;
    if(type === 'rotate'){
        webgl_characters[webgl_player_id]['camera_rotate_' + axis] = result;
    }

    core_ui_update({
      'ids': {
        [type + '_' + axis]: result,
      },
    });
}

function debug_drawloop(){
    webgl_draw();
    core_interval_animationFrame('webgl_drawloop');

    const now = globalThis.performance.now();
    fps_draw = Math.trunc(1000 / (now - fps_draw_time));
    fps_draw_time = now;
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

function framebuffer_status(){
    if(webgl === 0){
        return;
    }

    const status = webgl.checkFramebufferStatus(webgl.FRAMEBUFFER);

    const statuses = {
      'COMPLETE': webgl.FRAMEBUFFER_COMPLETE,
      'FRAMEBUFFER_UNSUPPORTED': webgl.FRAMEBUFFER_UNSUPPORTED,
      'INCOMPLETE_ATTACHMENT': webgl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
      'INCOMPLETE_DIMENSIONS': webgl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
      'INCOMPLETE_MISSING_ATTACHMENT': webgl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
      'INCOMPLETE_MULTISAMPLE': webgl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE,
    };
    for(const id in statuses){
        if(statuses[id] === status){
            console.log(status, 'FRAMEBUFFER_' + id);
            return;
        }
    }

    console.log(status, 'Unknown?');
}

function level_export(){
    if(webgl === 0){
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

    document.getElementById('exported').value = JSON.stringify(json);
}

function property_table(id, properties, type){
    if(!properties){
        return;
    }

    const properties_table = document.getElementById(id);
    if(!properties_table.innerHTML.length){
        const keys = core_sort_strings({
          'array': Object.keys(properties),
        });

        let properties_html = '';
        for(const i in keys){
            const key = keys[i];
            const property = properties[key];
            const id_key = id + '_' + key;

            if(core_type(property) === 'boolean'){
                properties_html += '<tr><td><label for=' + id_key + '>' + key + '</label><td><input id="' + id_key + '" type=checkbox>';

            }else{
                properties_html += '<tr><td><button id="' + id + '_button_' + key + '" type=button>' + key + '</button><td><input id="' + id_key + '" readonly type=text>';
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
    audio_state_all(!core_menu_open);

    if(core_menu_open
      || webgl === 0
      || webgl_character_level() <= -2){
        return;
    }

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
            webgl_characters[webgl_player_id].automove = Boolean(core_storage_data.character_automoves);
        }
        webgl_characters[webgl_player_id].camera_lock = core_storage_data.character_lock;
        webgl_characters[webgl_player_id].collide_bottom = core_storage_data.character_collide_bottom;
        webgl_characters[webgl_player_id].collide_top = core_storage_data.character_collide_top;
        webgl_characters[webgl_player_id].collide_xz = core_storage_data.character_collide_xz;
        webgl_characters[webgl_player_id].collides = core_storage_data.character_collides;
        webgl_characters[webgl_player_id].speed = core_storage_data.character_speed;
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
}

function repo_init(){
    core_repo_init({
      'beforeunload': function(event){
          if(webgl !== 0){
              core_escape(true);
              event.preventDefault();
          }
      },
      'events': {
        'camera_zoom_set': {
          'onclick': function(){
              character_set_axis(
                'camera',
                'zoom'
              );
          },
        },
        'character_control': {
          'onclick': function(){
              const character = core_elements.character_select.value;
              if(character.length === 0
               || !globalThis.confirm('Control character "' + character + '"?')){
                  return;
              }
              webgl_player_set(character);
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
              if(target.length === 0
               || !globalThis.confirm('Go to character "' + target + '"?')){
                  return;
              }

              const character = webgl_characters[webgl_player_id];
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

              if(!globalThis.confirm('Toggle context?')){
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
        'entity_add': {
          'onclick': function(){
              if(!globalThis.confirm('Add entity from textarea?')){
                  return;
              }

              const properties = core_object_defaults({
                'defaults': {
                  'vertices': [],
                },
                'object': JSON.parse(document.getElementById('add_properties').value),
              });
              webgl_entity_create({
                'entities': [properties],
              });
          },
        },
        'entity_goto': {
          'onclick': function(){
              const target = core_elements.entity_select.value;
              if(target.length === 0
               || !globalThis.confirm('Go to entity "' + target + '"?')){
                  return;
              }

              const character = webgl_characters[webgl_player_id];
              const position = webgl_get_position(entity_entities[target]);
              character.position_x = position.x;
              character.position_y = position.y;
              character.position_z = position.z;
          },
        },
        'entity_remake': {
          'onclick': function(){
              const entity = core_elements.entity_select.value;
              if(entity.length === 0
                || !globalThis.confirm('Remake entity "' + entity + '"?')){
                  return;
              }

              webgl_entity_init(entity);
          },
        },
        'entity_select': {
          'onchange': update_selected_entity,
        },
        'export_level': {
          'onclick': level_export,
        },
        'framebuffer_status': {
          'onclick': framebuffer_status,
        },
        'level_load_file': {
          'onclick': function(){
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
              character_set_axis(
                'position',
                'x'
              );
          },
        },
        'position_y_set': {
          'onclick': function(){
              character_set_axis(
                'position',
                'y'
              );
          },
        },
        'position_z_set': {
          'onclick': function(){
              character_set_axis(
                'position',
                'z'
              );
          },
        },
        'prefab_add': {
          'onclick': function(){
              const value = document.getElementById('add_type').value;
              const type = globalThis[value];
              if(!type
                || !globalThis.confirm('Add "' + value + '" prefab from textarea?')){
                  return;
              }
              type(core_object_defaults({
                'defaults': {
                  'character': webgl_player_id,
                  'prefix': entity_id_count,
                },
                'object': JSON.parse(document.getElementById('add_properties').value),
              }));
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
              character_set_axis(
                'rotate',
                'x'
              );
          },
        },
        'rotate_y_set': {
          'onclick': function(){
              character_set_axis(
                'rotate',
                'y'
              );
          },
        },
        'rotate_z_set': {
          'onclick': function(){
              character_set_axis(
                'rotate',
                'z'
              );
          },
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
              const id = globalThis.prompt(
                'Return character to spawn?',
                webgl_player_id
              );
              if(id !== null){
                  webgl_character_spawn(id);
              }
          },
        },
      },
      'globals': {
        'context': 0,
        'fps_draw': 0,
        'fps_draw_time': 0,
        'fps_logic': 0,
      },
      'keybinds': {
        'Backquote': {
          'down': webgl_character_automove,
        },
        'KeyV': {
          'down': function(){
              webgl_characters[webgl_player_id].collides = !webgl_characters[webgl_player_id].collides;
          },
        },
      },
      'menu_lock': true,
      'pointerbinds': {
        'contextmenu': function(){},
        'pointermove': function(){
            webgl_controls_pointer();
        },
        'pointerup': webgl_pick,
        'wheel': webgl_controls_wheel,
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
          + '<label><input id=character_lock type=checkbox> Camera Lock</label><br>'
          + '<label><input id=character_moves type=checkbox> Movement</label> <label><input id=character_moves_x type=checkbox>X</label> <label><input id=character_moves_y type=checkbox>Y</label> <label><input id=character_moves_z type=checkbox>Z</label> <select id=character_automoves><option value=1>on<option selected value=0>off<option value=2>any</select>Automove<br>'
          + '<label><input id=character_rotates type=checkbox> Rotation</label> <label><input id=character_rotates_x type=checkbox>X</label> <label><input id=character_rotates_y type=checkbox>Y</label> <label><input id=character_rotates_z type=checkbox>Z</label><br>'
          + '<label><input id=character_zoom type=checkbox> Zoom</label><input class=mini id=character_zoom_min step=any type=number>-<input class=mini id=character_zoom_max step=any type=number>'
        + '<td><label><input id=paused type=checkbox> Paused</label><br>'
          + '<label><input id=gravity_state type=checkbox> Gravity Override</label><br>'
          + '<input class=mini id=gravity_acceleration step=any type=number>Acceleration<input class=mini id=gravity_max step=any type=number>Max<br>'
          + '<input class=mini id=character_speed step=any type=number>Speed<br>'
          + '<label><input id=character_collides type=checkbox> Collides</label> <input class=mini id=character_collide_xz step=any type=number>XZ<br>'
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
        + '<td><label><input id=picking_color type=checkbox> Picking Color Display</label><br>'
          + '<button id=framebuffer_status>Check Framebuffer Status</button></table>'
        + '<button id=shader_set>Set Shaders</button><br><textarea id=shader_fragment></textarea>Fragment<br><textarea id=shader_vertex></textarea>Vertex<br>',
      'tabs': {
        'add': {
          'content': '<button id=entity_add type=button>Add Entity</button><input id=add_type type=text value=webgl_primitive_cuboid><button id=prefab_add type=button>Add Prefab/Primitive</button><br><textarea id=add_properties>{\n}</textarea>',
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
        'load': {
          'content': '<input accept=".json,application/json" id=level_file type=file><button id=level_load_file type=button>Load Level from File</button><br>'
            + '<button id=level_load_textarea type=button>Load Level from Textarea</button><br><textarea id=level_textarea></textarea><br>'
            + '<button id=export_level type=button>Export Level JSON</button><br><textarea id=exported readonly></textarea>',
          'default': true,
          'group': 'core_menu',
          'label': 'Load/Export Levels',
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
        'timers': {
          'content': '<table class=center><thead><tr class=header><td>Timer<td>Frames<td>Max<td>Repeat<td>Random<tbody id=timers></table>',
          'group': 'editor',
          'label': 'Timers',
        },
      },
      'title': 'MultiverseEditor.htm',
      'ui': '<button id=spawn type=button>Spawn</button><button id=camera_zoom_set type=button>Zoom</button> <span id=camera_zoom_min></span><input class=mini id=camera_zoom readonly type=text><span id=camera_zoom_max></span> <button id=context_toggle type=button>Context</button><br>'
        + '<button id=position_x_set type=button>x</button><input class=left id=position_x readonly type=text><button id=rotate_x_set type=button>x°</button><input class="left mini" id=rotate_x readonly type=text><br>'
        + '<button id=position_y_set type=button>y</button><input class=left id=position_y readonly type=text><button id=rotate_y_set type=button>y°</button><input class="left mini" id=rotate_y readonly type=text> Draw FPS: <span id=fps_draw></span><br>'
        + '<button id=position_z_set type=button>z</button><input class=left id=position_z readonly type=text><button id=rotate_z_set type=button>z°</button><input class="left mini" id=rotate_z readonly type=text>Logic FPS: <span id=fps_logic></span>'
        + '<div id=tabs_editor></div><div id=tabcontents_editor></div>',
      'ui_elements': [
        'character_select',
        'entity_select',
        'path_select',
        'tabcontent_properties',
      ],
    });
    globalThis.webgl_drawloop = debug_drawloop;
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
            webgl_characters[webgl_player_id].position_x = core_ui_values.position_x || 0;
        }
        if(!core_storage_data.character_moves || !core_storage_data.character_moves_y){
            webgl_characters[webgl_player_id].position_y = core_ui_values.position_y || 0;
        }
        if(!core_storage_data.character_moves || !core_storage_data.character_moves_z){
            webgl_characters[webgl_player_id].position_z = core_ui_values.position_z || 0;
        }
        if(!core_storage_data.character_rotates || !core_storage_data.character_rotates_x){
            webgl_characters[webgl_player_id].camera_rotate_x = core_ui_values.rotate_x || 0;
            webgl_characters[webgl_player_id].rotate_x = core_ui_values.rotate_x || 0;
        }
        if(!core_storage_data.character_rotates || !core_storage_data.character_rotates_y){
            webgl_characters[webgl_player_id].camera_rotate_y = core_ui_values.rotate_y || 0;
            webgl_characters[webgl_player_id].rotate_y = core_ui_values.rotate_y || 0;
        }
        if(!core_storage_data.character_rotates || !core_storage_data.character_rotates_z){
            webgl_characters[webgl_player_id].camera_rotate_z = core_ui_values.rotate_z || 0;
            webgl_characters[webgl_player_id].rotate_z = core_ui_values.rotate_z || 0;
        }
        if(!core_storage_data.character_zoom){
            webgl_characters[webgl_player_id].camera_zoom = core_ui_values.camera_zoom || 0;
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

    let timers_table = '';
    const timers = Object.keys(webgl_timers);
    if(timers.length){
        core_sort_strings({
          'array': timers,
          'clone': false,
        });
        for(const id of timers){
            const timer = webgl_timers[id];
            timers_table += '<tr><td><input readonly type=text value=' + id
              + '><td>' + timer.frames
              + '<td>' + timer.frames_max
              + '<td>' + timer.repeat
              + '<td>' + timer.frames_random;
        }
    }
    core_ui_update({
      'ids': {
        'timers': timers_table,
      },
      'todo': 'innerHTML',
    });

    update_properties(webgl_properties, '');
    update_selected_character();
    update_selected_entity();
    update_selected_path();

    const now = globalThis.performance.now();
    const logic_fps = Math.trunc(1000 / (now - fps_logic));
    fps_logic = now;

    core_ui_update({
      'ids': {
        'camera_zoom': webgl_characters[webgl_player_id].camera_zoom,
        'camera_zoom_max': webgl_properties.camera_zoom_max,
        'camera_zoom_min': webgl_properties.camera_zoom_min,
        'character_count': webgl_character_count,
        'fps_draw': fps_draw,
        'fps_logic': logic_fps,
        'id_count': entity_id_count,
        'opaque_count': entity_groups._length.opaque,
        'particles_count': entity_groups._length.particles || 0,
        'path_count': Object.keys(webgl_paths).length,
        'position_x': webgl_characters[webgl_player_id].position_x,
        'position_y': webgl_characters[webgl_player_id].position_y,
        'position_z': webgl_characters[webgl_player_id].position_z,
        'rotate_x': core_round({
          'number': webgl_characters[webgl_player_id].camera_rotate_x,
        }),
        'rotate_y': core_round({
          'number': webgl_characters[webgl_player_id].camera_rotate_y,
        }),
        'rotate_z': core_round({
          'number': webgl_characters[webgl_player_id].camera_rotate_z,
        }),
        'skybox_count': entity_groups._length.skybox,
        'transparent_count': entity_groups._length.transparent,
      },
    });
}

function set_property(properties, property, label, complex){
    const value = complex
      ? JSON.stringify(properties[property])
      : properties[property];
    const result = globalThis.prompt(
      'Set "' + property + '" of "' + label + '" to:',
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

function shader_set(){
    if(webgl === 0){
        return;
    }

    core_storage_save({
      'keys': [
        'shader_fragment',
        'shader_vertex',
      ],
      'rebind': false,
    });

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
    core_escape(false);
}

function update_properties(source, type){
    for(const property in source){
        core_ui_update({
          'ids': {
            [type + 'properties_' + property]: JSON.stringify(source[property]),
          },
          'todo': 'value',
        });
    }
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
    update_properties(source[select_element.value] , type + '_');
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
