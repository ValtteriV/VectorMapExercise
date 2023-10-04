import Map from 'ol/Map.js';
import TopoJSON from 'ol/format/TopoJSON.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import {fromLonLat, transformExtent} from 'ol/proj.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import {Style, Circle, Stroke, Fill} from 'ol/style';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector.js';
import Vector from 'ol/layer/Vector.js';

const key = import.meta.env.VITE_api_key;

const rules = [
  {
    filter: ['==', ['get', 'layer'], 'water'],
    style: {
      'fill-color': '#9db9e8',
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
];


const source = new VectorSource({ wrapX: false });

const style = new Style({
  image: new Circle({
    radius: 10,
    stroke: new Stroke({color: '#fff'}),
    fill: new Fill({color: '#3399CC'})
  }),
});
const feat = new Feature({ geometry: new Point([2771857, 8437906], style)});
console.log(feat);

source.addFeature(feat);

const dataLayer = new Vector({source});

const map = new Map({
  layers: [
    new VectorTileLayer({
      source: new VectorTileSource({
        attributions:
          '&copy; OpenStreetMap contributors, Who’s On First, ' +
          'Natural Earth, and osmdata.openstreetmap.de',
        format: new TopoJSON({
          layerName: 'layer',
          layers: ['water', 'roads', 'buildings'],
        }),
        maxZoom: 16,
        url:
          'https://tile.nextzen.org/tilezen/vector/v1/all/{z}/{x}/{y}.topojson?api_key=' +
          key,
      }),
      style: rules,
    }),
    dataLayer,
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([24.90157, 60.16646]),
    maxZoom: 19,
    zoom: 15,
    extent: transformExtent([18, 59, 37, 72], 'EPSG:4326', 'EPSG:3857')
  }),
});

map.addInteraction(new Draw({
  source,
  type: 'Point',
  style,
}));

