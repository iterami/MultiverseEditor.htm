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
