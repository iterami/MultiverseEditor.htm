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

function property_table(id, properties, type){
    const properties_table = document.getElementById(id);

    if(!properties_table.innerHTML.length){
        let properties_html = '<tr class=header><td>Property<td>Value';
        for(const property in properties){
            const property_type = typeof properties[property];

            if(property_type === 'object'){
                properties_html += '<tr><td>' + property + '<td><input id="' + id + '-' + property + '" readonly>';

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
            ['path-properties-' + property]: webgl_paths[selected_path][property],
          },
        });
    }
}
