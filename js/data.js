'use strict';

function ajax_level(level){
    core_ajax({
      'todo': function(responseText){
          webgl_level_load({
            'character': -1,
            'json': responseText,
          });
      },
      'url': '../MultiverseLevels.htm/json/' + level + '.json',
    });
}

function character_set_axis(type, axis){
    let result = window.prompt(
      'Set ' + type + '-' + axis + ' to:',
      ''
    );

    if(result == null
      || result.length === 0){
        return;
    }

    result = Number.parseFloat(result);

    webgl_characters[webgl_character_id][type + '-' + axis] = result;

    if(type === 'rotate'){
        webgl_characters[webgl_character_id]['camera-rotate-' + axis] = result;

        webgl_entity_radians({
          'character': true,
          'entity': webgl_character_id,
        });
    }
}
