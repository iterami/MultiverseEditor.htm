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

function character_set_axis(type, axis, button){
    let element = document.getElementById(type + '-' + axis);
    let result = window.prompt(
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
    button.blur();
}

function set_property(property){
    let element = document.getElementById('property-' + property);
    let result = window.prompt(
      'Set ' + property + ' to:',
      element.innerHTML
    );

    if(result === null
      || result.length === 0){
        return;
    }

    result = core_type_convert({
      'template': webgl_properties[property],
      'value': result,
    });

    webgl_properties[property] = result;
    element.innerHTML = result;
}
