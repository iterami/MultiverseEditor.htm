'use strict';

function ajax_level(level){
    core_ajax({
      'todo': load_prebuilt_level,
      'url': '../MultiverseLevels.htm/json/' + level + '.json',
    });
}

function load_prebuilt_level(responseText){
    webgl_load_level({
      'character': -1,
      'json': responseText,
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
