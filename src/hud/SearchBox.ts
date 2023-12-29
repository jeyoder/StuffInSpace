import logger from '@/utils/logger';
import { Viewer } from '@satellite-viewer/index';
import SatelliteGroup from '@satellite-viewer/SatelliteGroup';
import HudWindowManager from './HudWindowManager';
import { SearchResults } from '../viewer/interfaces/SearchResults';

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

function fillResultBox (results: SearchResults[], searchStr: string) {
  const resultBox = document.querySelector('#search-results') as HTMLElement;
  const satelliteStore = viewer.getSatelliteStore();
  if (!satelliteStore) {
    return;
  }

  let html = '';

  for (const result of results) {
    if (result.satId === undefined) {
      continue;
    }

    const satellite = satelliteStore.getSatellite(result.satId);
    if (!satellite) {
      logger.warn('satellite not found', result.satId);
      continue;
    }

    html += `<div class="search-result" data-sat-id="${satellite.id}">`;
    if (result.type !== 'name') {
      html += satellite.OBJECT_NAME;
    } else {
      html += `
      ${satellite.OBJECT_NAME.substring(0, result.strIndex)}
      <span class="search-hilight">
        ${satellite.OBJECT_NAME.substring(result.strIndex, result.strIndex + searchStr.length)}
      </span>
      ${satellite.OBJECT_NAME.substring(result.strIndex + searchStr.length)}`;
    }

    html += '<div class="search-result-intldes">';
    if (result.type === 'intlDes') {
      html += `
      ${satellite.intlDes.substring(0, result.strIndex)}
      <span class="search-hilight">
        ${satellite.intlDes.substring(result.strIndex, result.strIndex + searchStr.length)}
      </span>
      ${satellite.intlDes.substring(result.strIndex + searchStr.length)}`;
    } else if (result.type === 'noradId') {
      html += `
      ${satellite.NORAD_CAT_ID.substring(0, result.strIndex)}
      <span class="search-hilight">
        ${satellite.NORAD_CAT_ID.substring(result.strIndex, result.strIndex + searchStr.length)}
      </span>
      ${satellite.NORAD_CAT_ID.substring(result.strIndex + searchStr.length)}`;
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

  const results: SearchResults[] = [];
  for (let i = 0; i < satData.length; i++) {
    if (satData[i]?.NORAD_CAT_ID?.indexOf(str) !== -1) {
      results.push({
        type: 'noradId',
        strIndex: satData[i].NORAD_CAT_ID.indexOf(str),
        satId: i
      });
    }

    if (satData[i]?.OBJECT_NAME.indexOf(str) !== -1) {
      results.push({
        type: 'name',
        strIndex: satData[i].OBJECT_NAME.indexOf(str),
        satId: i
      });
    }

    if (satData[i].intlDes && satData[i].intlDes.indexOf(str) !== -1) {
      results.push({
        type: 'intlDes',
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
  for (const result of results) {
    idList.push(result.satId);
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
    viewer.setSelectedSatelliteGroup(dispGroup);
  }

  fillResultBox(results, str);
  // app.updateUrl();
}

function registerListeners () {
  const searchResultsElem = document.querySelector('#search-results');
  if (!searchResultsElem) {
    return;
  }
  searchResultsElem.addEventListener('click', (event: Event) => {
    let target = event.target as HTMLElement;
    if (target.className !== 'search-result') {
      target = target.closest('.search-result') as HTMLElement;
    }
    if (!target) {
      return;
    }

    const satId = target?.dataset.satId as string;
    clearHover();

    viewer.setSelectedSatellite(parseInt(satId));
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
