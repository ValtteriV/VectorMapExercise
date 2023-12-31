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
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector.js';
import Vector from 'ol/layer/Vector.js';
import {Select, Translate} from 'ol/interaction';
import Overlay from 'ol/Overlay.js';
import Control from 'ol/control/Control';
import { getCookie, checkLogin, clearCookies } from './checkLogin';
import { API } from './API';
import { style, myStyle, selStyl, drawStyle, rules } from './styles';

checkLogin();

const key = import.meta.env.VITE_vector_api_key;

//Don't do this or anything relating to authorization in the project
let auth = getCookie('auth');
let userId = undefined;

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

const buttons = document.getElementById('buttons');
const overlayButtons = new Control({
  element: buttons
});

const logout = document.getElementById('logout');
const overlayLogout = new Control({
  element: logout
});

const logoutButton = document.getElementById('logout-button');
logoutButton.onclick = (e) => {
  console.log('logging out byeee');
  clearCookies();
  window.location.reload();
}

/**
 * Fetches and updates points to the map.
 * Separates user's own points to a separate, interactable layer from points created by other users
 */
const fetchPoints = async () => {
  const res = await API.getPoints();
  console.log(res);

  const myFeatures = [];
  const otherFeatures = [];
  for (const point of res) {
    const feat = new Feature({
      geometry: new Point([point.y, point.x]),
      pointId: point.pointId,
      label: point.label,
      created_by: point.created_by
    });

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
  const data = await API.savePoint(coords);
  console.log(data);
  feat.set('pointId', data.pointId);
};

const updatePoint = async (feat) => {
  console.log(feat.getProperties());
  await API.updatePoint(feat);
};

/**
 * Define dataLayers and their sources, stores interactable features
 */

//Stores features created by other users, can't be interacted with
const otherFeaturesSource = new VectorSource({ wrapX: false });
const otherFeaturesDataLayer = new Vector({source: otherFeaturesSource, style: (feature) => {
  style.getText().setText(feature.get('label'));
  return [style];
}});

//Stores features created by user, can be interacted with
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
    console.log(e);
    await fetchPoints();
  },
  false
);

const getBackgroundMap = () => {
  if (import.meta.env.VITE_use_vector === 'true') {
    return new VectorTileLayer({
      source: new VectorTileSource({
        attributions:
          '&copy; OpenStreetMap contributors, Who’s On First, ' +
          'Natural Earth, and osmdata.openstreetmap.de',
        format: new TopoJSON({
          layerName: 'layer',
          layers: ['water', 'roads', 'buildings', 'boundaries'],
        }),
        maxZoom: 16,
        url:
          'https://tile.nextzen.org/tilezen/vector/v1/all/{z}/{x}/{y}.topojson?api_key=' +
          key,
      }),
      style: rules,
    }); 
  } else {
    return new TileLayer({source:new OSM()});
  }
};

const map = new Map({
  layers: [
    getBackgroundMap(),
    otherFeaturesDataLayer,
    myFeaturesDataLayer
  ],
  overlays: [overlay],
  controls: [overlayButtons, overlayLogout],
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

let selectedPoint;

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
  if (selectedPoint) {
    selectedPoint = null;
    overlay.setPosition(undefined);
    selectInteraction.getFeatures().clear();
  }
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

const drawButton = document.getElementById('draw-button');
drawButton.onclick = () => {
  drawButton.classList.add('active-mode');
  selectButton.classList.remove('active-mode');
  addDrawPointEvent();
};

selectButton.onclick = () => {
  selectButton.classList.add('active-mode');
  drawButton.classList.remove('active-mode');
  addSelectPointEvent();
};
