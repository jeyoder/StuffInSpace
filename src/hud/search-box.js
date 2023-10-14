import SatGroup from '../viewer/sat-group';
import logger from '../utils/logger';

const SEARCH_LIMIT = 200;

let app;
let hovering = false;
let hoverSatId = -1;

let resultsOpen = false;
let lastResultGroup;

function isResultBoxOpen () {
  return resultsOpen;
}

function getLastResultGroup () {
  return lastResultGroup;
}

function getCurrentSearch () {
  if (resultsOpen) {
    return document.querySelector('#search').value;
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

  app.viewer.setHover(hoverSatId);
}

function setResultsVisible (visible) {
  const searchResultsElem = document.querySelector('#search-results');
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
  app.groups.clearSelect();
}

function fillResultBox (results, searchStr) {
  const satData = app.satData;
  const resultBox = document.querySelector('#search-results');

  let html = '';
  for (let i = 0; i < results.length; i++) {
    const sat = satData[results[i].satId];
    if (!sat) {
      logger.warn('satellite not found', results[i].satId);
      continue;
    }

    html += `<div class="search-result" data-sat-id="${sat.id}">`;
    if (results[i].isIntlDes) {
      html += sat.OBJECT_NAME;
    } else {
      html += sat.OBJECT_NAME.substring(0, results[i].strIndex);
      html += '<span class="search-hilight">';
      html += sat.OBJECT_NAME.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
      html += '</span>';
      html += sat.OBJECT_NAME.substring(results[i].strIndex + searchStr.length);
    }
    html += '<div class="search-result-intldes">';
    if (results[i].isIntlDes) {
      html += sat.intlDes.substring(0, results[i].strIndex);
      html += '<span class="search-hilight">';
      html += sat.intlDes.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
      html += '</span>';
      html += sat.intlDes.substring(results[i].strIndex + searchStr.length);
    } else {
      html += sat.intlDes;
    }
    html += '</div></div>';
  }

  resultBox.innerHTML = html;
  resultBox.style.display = 'block';
  resultsOpen = true;
}

function clearResults () {
  const searchResultsElem = document.querySelector('#search-results');
  searchResultsElem.innerHTML = '';
}

function doSearch (str) {
  const satData = app.satData;

  app.viewer.setSelectedSatellite(-1);

  if (str.length === 0) {
    hideResults();
    return;
  }

  str = str.toUpperCase();

  const results = [];
  for (let i = 0; i < satData.length; i++) {
    if (satData[i].OBJECT_NAME.indexOf(str) !== -1) {
      results.push({
        isIntlDes: false,
        strIndex: satData[i].OBJECT_NAME.indexOf(str),
        satId: i
      });
    }

    if (satData[i].intlDes.indexOf(str) !== -1) {
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

  const dispGroup = new SatGroup('search-results', 'Search Results', 'idList', idList);
  dispGroup.reload();
  lastResultGroup = dispGroup;

  app.groups.selectGroup(dispGroup);

  fillResultBox(results, str);
  app.updateUrl();
}

function registerListeners () {
  const searchResultsElem = document.querySelector('#search-results');

  searchResultsElem.addEventListener('click', (event) => {
    const target = event.target;
    const satId = target.dataset.satId;
    clearHover();

    app.viewer.setSelectedSatellite(satId);
  });

  document.querySelector('#search').addEventListener('input', () => {
    const searchStr = document.querySelector('#search').value;
    doSearch(searchStr);
  });

  document.querySelector('#all-objects-link').addEventListener('click', () => {
    const selectedSatelltie = app.viewer.getSelectedSatellite();
    if (selectedSatelltie && selectedSatelltie !== -1) {
      const intldes = app.viewer.getSatellite(selectedSatelltie).intlDes;
      const searchStr = intldes.slice(0, 8);
      doSearch(searchStr);
      document.querySelector('#search').value = searchStr;
      if (app.windowManager) {
        app.windowManager.openWindow('search-window');
      }
    }
  });
}

function init (appContext) {
  app = appContext;
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
