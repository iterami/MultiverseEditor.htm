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

function toggle_fog(){
    if(webgl_character_level() < -1){
        return;
    }

    webgl_properties['fog-state'] = webgl_properties['fog-state']
      ? 0
      : 1;

    webgl_shader_update();
}

function toggle_lighting_directional(){
    if(webgl_character_level() < -1){
        return;
    }

    webgl_properties['directional-state'] = webgl_properties['directional-state']
      ? 0
      : 1;

    webgl_shader_update();
}
