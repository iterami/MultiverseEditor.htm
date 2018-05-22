'use strict';

function load_data(){
    platform_player_reset({
      'all': true,
    });

    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.35, 0.1, 1,
          0.1, 0.35, 0.1, 1,
          0.1, 0.35, 0.1, 1,
          0.1, 0.35, 0.1, 1,
        ],
        'translate-x': -25,
        'translate-y': -10,
        'vertices': [
          10, 0, -50,
          -10, 0, -50,
          -10, 0, 50,
          10, 0, 50,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
        ],
        'translate-y': -5,
        'translate-z': -25,
        'vertices': [
          5, 0, -5,
          -5, 0, -5,
          -5, 0, 5,
          5, 0, 5,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
        ],
        'translate-y': -15,
        'translate-z': -10,
        'vertices': [
          5, 0, -5,
          -5, 0, -5,
          -5, 0, 5,
          5, 0, 5,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
        ],
        'translate-y': -3,
        'vertices': [
          5, 0, -5,
          -5, 0, -5,
          -5, 0, 5,
          5, 0, 5,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
          0.1, 0.4, 0.1, 1,
        ],
        'translate-x': 45,
        'translate-y': -3,
        'vertices': [
          25, 0, -10,
          -25, 0, -10,
          -25, 0, 10,
          25, 0, 10,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'color': [
          0.25, 0.41, 0.88, 1,
          0.25, 0.41, 0.88, 1,
          0.25, 0.41, 0.88, 1,
          0.25, 0.41, 0.88, 1,
        ],
        'translate-y': -100,
        'vertices': [
          25, 0, -50,
          -25, 0, -50,
          -25, 0, 50,
          25, 0, 50,
        ],
      },
    });

    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
        ],
        'rotate-z': 270,
        'translate-x': -15,
        'translate-y': -55,
        'vertices': [
          45, 0, -50,
          -45, 0, -50,
          -45, 0, 50,
          45, 0, 50,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
        ],
        'rotate-z': 90,
        'translate-x': 20,
        'translate-y': -52,
        'vertices': [
          49, 0, -50,
          -49, 0, -50,
          -49, 0, 50,
          49, 0, 50,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
        ],
        'rotate-z': 90,
        'translate-x': 20,
        'translate-y': 7,
        'translate-z': -30,
        'vertices': [
          10, 0, -20,
          -10, 0, -20,
          -10, 0, 20,
          10, 0, 20,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
          0.1, 0.2, 0.1, 1,
        ],
        'rotate-z': 90,
        'translate-x': 20,
        'translate-y': 7,
        'translate-z': 30,
        'vertices': [
          10, 0, -20,
          -10, 0, -20,
          -10, 0, 20,
          10, 0, 20,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
        ],
        'rotate-x': 90,
        'translate-x': 45,
        'translate-y': 7,
        'translate-z': -10,
        'vertices': [
          25, 0, -10,
          -25, 0, -10,
          -25, 0, 10,
          25, 0, 10,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
        ],
        'rotate-x': 270,
        'translate-x': 45,
        'translate-y': 7,
        'translate-z': 10,
        'vertices': [
          25, 0, -10,
          -25, 0, -10,
          -25, 0, 10,
          25, 0, 10,
        ],
      },
    });
    core_entity_create({
      'properties': {
        'collision': true,
        'color': [
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
          0.1, 0.3, 0.1, 1,
        ],
        'rotate-z': 90,
        'translate-x': 70,
        'translate-y': 7,
        'vertices': [
          10, 0, -10,
          -10, 0, -10,
          -10, 0, 10,
          10, 0, 10,
        ],
      },
    });

    data_webgl_cube_3d({
      'collision': true,
      'exclude': [
        1,
        2,
        5,
      ],
      'side': 2,
      'x': 68,
      'y': -1,
      'z': -8,
    });

    data_webgl_tree_3d({
      'collision': true,
      'x': -20,
      'y': -10,
      'z': -14,
    });
}
