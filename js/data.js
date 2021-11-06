'use strict';

function ajax_level(level){
    if(webgl_levelcache['id'] === level){
        webgl_level_load({
          'character': -1,
          'json': webgl_levelcache['json'],
        });

        return;
    }

    core_ajax({
      'todo': function(responseText){
          webgl_level_load({
            'cache': level,
            'character': -1,
            'json': responseText,
          });
      },
      'url': '../MultiverseLevels.htm/json/' + level + '.json',
    });
}

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

    element.value = result;
}

function property_table(id, properties){
    const properties_table = document.getElementById(id);
    if(properties_table.innerHTML.length){
        return;
    }

    let properties_html = '';
    for(const property in properties){
        const property_type = typeof properties[property];

        if(property_type === 'object'){
            properties_html += '<tr><td>' + property + '<td id="' + id + '-' + property + '">';

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

    for(const property in properties){
        const property_type = typeof properties[property];

        if(property_type === 'boolean'){
            const checkbox = document.getElementById(id + '-' + property);
            checkbox.checked = properties[property];
            checkbox.onchange = function(){
                properties[property] = this.checked;
            }

        }else if(property_type !== 'object'){
            const property_button = document.getElementById(id + '-button-' + property);
            property_button.onclick = function(){
                set_property(
                  properties,
                  property
                );
            }
        }
    }
}

function set_property(properties, property){
    let result = globalThis.prompt(
      'Set ' + property + ' to:',
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
