import {Style, Circle, Stroke, Fill, Text} from 'ol/style';


/**
 * Style definitions
 */

export const rules = [
  {
    filter: ['==', ['get', 'layer'], 'water'],
    style: {
      'fill-color': '#9db9e8',
    },
  },
  {
    else: true,
    filter: ['==', ['get', 'layer'], 'roads'],
    style: {
      'stroke-color': [
        'match',
        ['get', 'kind'],
        'major_road',
        '#776',
        'minor_road',
        '#ccb',
        'highway',
        '#f39',
        'none',
      ],
      'stroke-width': ['match', ['get', 'kind'], 'highway', 1.5, 1],
      'z-index': ['number', ['get', 'sort_key'], 0],
    },
  },
  {
    else: true,
    filter: ['==', ['get', 'layer'], 'boundaries'],
    style: {
      'stroke-color': [
        'match',
        ['get', 'kind'],
        'county',
        '#aa7',
        'region',
        '#5a9',
        'country',
        '#f00',
        'none',
      ],
      'stroke-width': ['match', ['get', 'kind'], 'country', 3, 'region', 2, 'county', 1.5],
      'z-index': ['number', ['get', 'sort_key'], 0]
      },
  },
  {
    else: true,
    filter: [
      'all',
      ['==', ['get', 'layer'], 'buildings'],
      ['<', ['resolution'], 10],
    ],
    style: {
      'fill-color': '#6666',
      'stroke-color': '#4446',
      'stroke-width': 1,
      'z-index': ['number', ['get', 'sort_key'], 0],
    },
  },
  {
    else: true,
    filter: ['all', ['==', ['get', 'layer'], 'roads'], ['get', 'railway']],
    style: {
      'stroke-color': '#7de',
      'stroke-width': 1,
      'z-index': ['number', ['get', 'sort_key'], 0],
    },
  },
];

export const style = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#ddd', width: 3}),
    fill: new Fill({color: '#3399CC'}),
  }),
  text: new Text({offsetY: 20, scale: 2})
});

export const myStyle = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#fff', width: 2}),
    fill: new Fill({color: '#339911'}),
  }),
  text: new Text({offsetY: 20, scale: 2})
});

export const drawStyle = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#fff', width: 2}),
    fill: new Fill({color: '#339911'}),
  })
});

export const selStyl = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#333', width: 3}),
    fill: new Fill({color: '#339911'}),
  }),
  text: new Text({offsetY: 20, scale: 2})
});


