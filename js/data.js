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
    button.blur();
}

function set_property(property){
    let result = globalThis.prompt(
      'Set ' + property + ' to:',
      webgl_properties[property]
    );

    if(result === null
      || result.length === 0){
        return;
    }

    webgl_properties[property] = core_type_convert({
      'template': webgl_properties[property],
      'value': result,
    });
}
