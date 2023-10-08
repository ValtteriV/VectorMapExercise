import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import TopoJSON from 'ol/format/TopoJSON.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import {fromLonLat, transformExtent} from 'ol/proj.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import {Style, Circle, Stroke, Fill, Text} from 'ol/style';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector.js';
import Vector from 'ol/layer/Vector.js';
import {Select, Translate} from 'ol/interaction';
import Overlay from 'ol/Overlay.js';
import { getCookie } from './checkLogin';

const key = import.meta.env.VITE_api_key;
const apiEndpont = `http://${import.meta.env.VITE_api_host}${import.meta.env.VITE_api_port ? ':' + import.meta.env.VITE_api_port : ''}/api`;

//Don't do this or anything relating to authorization in the project
let auth = getCookie('auth');
let userId = getCookie('userId');

const refreshDetails = () => {
  auth = getCookie('auth');
  userId = sessionStorage.getItem('userId');
};

const refreshLabel = (feature) => {
  feature.getStyle().getText().setText(feature.get('label'));
}

/**
 * Popup element
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const labelInput = document.getElementById('label-input');
labelInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    selectedPoint && selectedPoint.set('label', labelInput.value);
    refreshLabel(selectedPoint);
    selectInteraction.dispatchEvent({ type: 'click', deselected: selectedPoint, selected: [] });
    updatePoint(selectedPoint);
  }
});

const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});


/**
 * Style definitions
 */
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

const style = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#ddd', width: 3}),
    fill: new Fill({color: '#3399CC'}),
  }),
  text: new Text({offsetY: 20, scale: 2})
});

const myStyle = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#d0d', width: 3}),
    fill: new Fill({color: '#000'}),
  }),
  text: new Text({offsetY: 20, scale: 2})
});

const drawStyle = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#fff', width: 2}),
    fill: new Fill({color: '#339911'}),
  })
});

const selStyl = new Style({
  image: new Circle({
    radius: 8,
    stroke: new Stroke({color: '#333', width: 3}),
    fill: new Fill({color: '#66BBCC'}),
  }),
  text: new Text({offsetY: 20, scale: 2})
});


/**
 * TestFeatures, TODO: Get features from DB
 */
const feat = new Feature({ geometry: new Point([2771857, 8437906]), label: 'testi' });
const feat1 = new Feature({ geometry: new Point([2771857, 8439106]), label: 'testi1' });
const feat2 = new Feature({ geometry: new Point([2773057, 8437906]), label: 'testi2' });
const fetchPoints = async () => {
  const resp = await fetch(`${apiEndpont}/points/`, { 
    method: "GET",
    headers: {
      Authorization: auth
    }
  });
  const res = await resp.json();
  console.log(res);
  const myFeatures = [];
  const otherFeatures = [];
  for (const point of res) {
    const feat = new Feature({ geometry: new Point([point.y, point.x]), pointId: point.pointId, label: point.label, created_by: point.created_by});
    console.log(`${point.created_by} === ${userId}`);
    if (point.created_by && point.created_by == userId) {
      myFeatures.push(feat);
    } else {
      otherFeatures.push(feat);
    }
  }
  console.log(`myFeatures ${myFeatures.length}`);
  console.log(`otherFeatures ${otherFeatures.length}`);
  myFeaturesSource.addFeatures(myFeatures);
  otherFeaturesSource.addFeatures(otherFeatures);
};

const savePoint = async (feat) => {
  const coords = feat.get('geometry').getCoordinates();
  const resp = await fetch(`${apiEndpont}/points/`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      "Content-type": 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      x: Math.floor(coords[1]),
      y: Math.floor(coords[0]),
      created_by: userId,
    })
  });
  console.log(resp);
  const data = await resp.json();
  console.log(data);
  feat.set('pointId', data.pointId);
};

const updatePoint = async (feat) => {
  console.log(feat.getProperties());
  const pointId = feat.get('pointId');
  const coords = feat.get('geometry').getCoordinates();
  const label = feat.get('label');

  const resp = await fetch(`${apiEndpont}/points/${pointId}/`, {
    method: 'PUT',
    headers: {
      Authorization: auth,
      "Content-type": 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      x: Math.floor(coords[1]),
      y: Math.floor(coords[0]),
      label: label,
    })
  });
};

/**
 * Define dataLayer and its source, stores interactable features
 * TODO: When users implemented, add second layer that won't be included in the selectInteraction for other users' features
 */
const otherFeaturesSource = new VectorSource({ wrapX: false });
otherFeaturesSource.addFeature(feat);
otherFeaturesSource.addFeature(feat1);
otherFeaturesSource.addFeature(feat2);

const otherFeaturesDataLayer = new Vector({source: otherFeaturesSource, style: (feature) => {
  style.getText().setText(feature.get('label'));
  return [style];
}});

const myFeaturesSource = new VectorSource({ wrapX: false });

const myFeaturesDataLayer = new Vector({source: myFeaturesSource, style: (feature) => {
  myStyle.getText().setText(feature.get('label'));
  return [myStyle];
}});


const mapElem = document.getElementById('map');
mapElem.addEventListener(
  'auth-success',
  async (e) => {
    refreshDetails();
    await fetchPoints();
  },
  false
);

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
    //new TileLayer({source:new OSM()}),
    otherFeaturesDataLayer,
    myFeaturesDataLayer
  ],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: fromLonLat([24.90157, 60.16646]),
    maxZoom: 19,
    zoom: 15,
    extent: transformExtent([18, 59, 37, 72], 'EPSG:4326', 'EPSG:3857')
  }),
});


/**
 * Draw Interaction behaviour
 */
const drawInteraction = new Draw({
  source: myFeaturesSource,
  type: 'Point',
  style: drawStyle,
});

drawInteraction.on('drawstart', async (e) => {
  console.log(e.feature.get('geometry').getCoordinates());
  console.log(e.feature.getProperties());
  await savePoint(e.feature);
});

/**
 * Define Select Interaction behaviour
 */
const selectInteraction = new Select({
  condition: (e) => {
    return e.type === 'click';
  },
  style: selStyl,
  layers: [myFeaturesDataLayer]
});

selectInteraction.on('select', (e) => {
  //Clicked away
  if (e.selected.length === 0) {
    selectedPoint = null;
    overlay.setPosition(undefined);
    return;
  }
  selectedPoint = e.selected[0];
  refreshLabel(selectedPoint);
  console.log(`SELECT: `);
  console.log(selectedPoint.getProperties());
  
  const featureCoords = selectedPoint.get('geometry').getCoordinates();
  console.log(featureCoords);
  
  overlay.setPosition(featureCoords);
  labelInput.value = selectedPoint.get('label') || '';
  labelInput.focus();
});

let selectedPoint;


/**
 * Defined Translate Interaction behaviour
 */

const translateInteraction = new Translate({
  features: selectInteraction.getFeatures(),
  layers: [myFeaturesDataLayer]
});
translateInteraction.on('translateend', (e) => {
  console.log(e);
  overlay.setPosition(selectedPoint.get('geometry').getCoordinates());
  updatePoint(selectedPoint);
});

map.addInteraction(translateInteraction);

/**
 * Define onClick functions for buttons to change map interaction mode
 */
const addDrawPointEvent = () => {
  if (selectedInteraction !== null) {
    map.removeInteraction(selectedInteraction);
  }
  selectedInteraction = drawInteraction;
  map.addInteraction(selectedInteraction);
};

const addSelectPointEvent = () => {
  if (selectedInteraction !== null) {
    map.removeInteraction(selectedInteraction);
  }
  selectedInteraction = selectInteraction;
  map.addInteraction(selectedInteraction);
};

/**
 * Set Draw Interaction as default when opening the map
 */
let selectedInteraction = drawInteraction;
map.addInteraction(drawInteraction);

const selectButton = document.getElementById('select-button');
selectButton.onclick = addSelectPointEvent;

const drawButton = document.getElementById('draw-button');
drawButton.onclick = addDrawPointEvent;

if (auth !== '') {
  fetchPoints();
}
