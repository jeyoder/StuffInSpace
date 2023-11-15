import logger from '@/utils/logger';
import { Viewer } from '@satellite-viewer/index';
import SatelliteGroup from '@satellite-viewer/SatelliteGroup';
import HudWindowManager from './HudWindowManager';

const SEARCH_LIMIT = 200;

let viewer: Viewer;
let windowManager: HudWindowManager;
let hovering = false;
let hoverSatId = -1;

let resultsOpen = false;
let lastResultGroup: SatelliteGroup;

function isResultBoxOpen () {
  return resultsOpen;
}

function getLastResultGroup () {
  return lastResultGroup;
}

function getCurrentSearch () {
  if (resultsOpen) {
    return (document.querySelector('#search') as HTMLInputElement).value;
  }
  return null;
}

function isHovering () {
  return hovering;
}

function getHoverSat () {
  return hoverSatId;
}

function clearHover () {
  hovering = false;
  hoverSatId = -1;

  viewer.setHoverSatellite(hoverSatId);
}

function setResultsVisible (visible: boolean) {
  const searchResultsElem = document.querySelector('#search-results') as HTMLElement;
  if (!searchResultsElem) {
    return;
  }

  if (visible) {
    searchResultsElem.style.display = 'block';
  } else {
    searchResultsElem.style.display = 'none';
  }
  resultsOpen = visible;
}

function toggleResultsVisible () {
  setResultsVisible(!isResultBoxOpen());
}

function showResults () {
  setResultsVisible(true);
}

function hideResults () {
  setResultsVisible(false);
  const satelliteGroups = viewer.getSatelliteGroups();
  if (satelliteGroups) {
    satelliteGroups.clearSelect();
  }
}

function fillResultBox (results: any, searchStr: string) {
  const resultBox = document.querySelector('#search-results') as HTMLElement;
  const satelliteStore = viewer.getSatelliteStore();
  if (!satelliteStore) {
    return;
  }

  let html = '';

  for (let i = 0; i < results.length; i++) {
    if (results[i].satId === undefined) {
      continue;
    }

    const satellite = satelliteStore.getSatellite(results[i].satId);
    if (!satellite) {
      logger.warn('satellite not found', results[i].satId);
      continue;
    }

    html += `<div class="search-result" data-sat-id="${satellite.id}">`;
    if (results[i].isIntlDes) {
      html += satellite.OBJECT_NAME;
    } else {
      html += satellite.OBJECT_NAME.substring(0, results[i].strIndex);
      html += '<span class="search-hilight">';
      html += satellite.OBJECT_NAME.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
      html += '</span>';
      html += satellite.OBJECT_NAME.substring(results[i].strIndex + searchStr.length);
    }
    html += '<div class="search-result-intldes">';
    if (results[i].isIntlDes) {
      html += satellite.intlDes.substring(0, results[i].strIndex);
      html += '<span class="search-hilight">';
      html += satellite.intlDes.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
      html += '</span>';
      html += satellite.intlDes.substring(results[i].strIndex + searchStr.length);
    } else {
      html += satellite.intlDes;
    }
    html += '</div></div>';
  }

  resultBox.innerHTML = html;
  resultBox.style.display = 'block';
  resultsOpen = true;
}

function clearResults () {
  const searchResultsElem = document.querySelector('#search-results');
  if (searchResultsElem) {
    searchResultsElem.innerHTML = '';
  }
}

function doSearch (str: string) {
  const satelliteStore = viewer.getSatelliteStore();
  if (!satelliteStore) {
    return;
  }

  const satData = satelliteStore.getSatData();

  viewer.setSelectedSatellite(-1);

  if (str.length === 0) {
    hideResults();
    return;
  }

  str = str.toUpperCase();

  const results = [];
  for (let i = 0; i < satData.length; i++) {
    if (satData[i]?.OBJECT_NAME.indexOf(str) !== -1) {
      results.push({
        isIntlDes: false,
        strIndex: satData[i].OBJECT_NAME.indexOf(str),
        satId: i
      });
    }

    if (satData[i].intlDes && satData[i].intlDes.indexOf(str) !== -1) {
      console.log(satData[i]);
      results.push({
        isIntlDes: true,
        strIndex: satData[i].intlDes.indexOf(str),
        satId: i
      });
    }
  }

  if (results.length > SEARCH_LIMIT) {
    results.length = SEARCH_LIMIT;
  }

  // make a group to hilight results
  const idList = [];
  for (let i = 0; i < results.length; i++) {
    idList.push(results[i].satId);
  }

  const dispGroup = new SatelliteGroup(
    'search-results', 'Search Results', 'idList', idList,
    satelliteStore
  );
  dispGroup.reload();
  lastResultGroup = dispGroup;

  const satelliteGroups = viewer.getSatelliteGroups();
  if (satelliteGroups) {
    satelliteGroups.selectGroup(dispGroup);
  }

  fillResultBox(results, str);
  // app.updateUrl();
}

function registerListeners () {
  const searchResultsElem = document.querySelector('#search-results');
  if (!searchResultsElem) {
    return;
  }
  searchResultsElem.addEventListener('click', (event: any) => {
    const target = event.target;
    const satId = target.dataset.satId;
    clearHover();

    viewer.setSelectedSatellite(satId);
  });

  document.querySelector('#search')?.addEventListener('input', () => {
    const searchStr = (document.querySelector('#search') as HTMLInputElement)?.value;
    doSearch(searchStr);
  });

  document.querySelector('#all-objects-link')?.addEventListener('click', () => {
    const selectedSatellite = viewer.getSelectedSatellite();
    if (selectedSatellite) {
      const intldes = selectedSatellite.intlDes;
      const searchStr = intldes.slice(0, 8);
      doSearch(searchStr);
      (document.querySelector('#search') as HTMLInputElement).value = searchStr;
      if (windowManager) {
        windowManager.openWindow('search-window');
      }
    }
  });
}

function init (viewerInstance: Viewer, windowManagerInstance: HudWindowManager) {
  viewer = viewerInstance;
  windowManager = windowManagerInstance;
  registerListeners();
}

export default {
  init,
  clearResults,
  getHoverSat,
  isHovering,
  showResults,
  hideResults,
  doSearch,
  getCurrentSearch,
  getLastResultGroup,
  fillResultBox,
  isResultBoxOpen,
  setResultsVisible,
  toggleResultsVisible
};
