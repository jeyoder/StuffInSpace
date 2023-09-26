import orbitDisplay from './orbit-display';
import SatGroup from './sat-group';
import logger from './logger';

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

  app.setHover(hoverSatId);
}

function hideResults () {
  // const searchResults = document.querySelector('#search-results');
  // searchResults.slideUp();
  app.groups.clearSelect();
  resultsOpen = false;
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

function doSearch (str) {
  const satSet = app.satSet;
  const satData = app.satData;

  satSet.selectSat(-1);

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

  const dispGroup = new SatGroup('idList', idList);
  lastResultGroup = dispGroup;
  app.groups.selectGroup(dispGroup);

  fillResultBox(results, str);
  app.updateUrl();
}

function registerHandlers () {
  const searchResultsElem = document.querySelector('#search-results');

  searchResultsElem.addEventListener('click', (event) => {
    const target = event.target;
    const satId = target.dataset.satId; // document.querySelector(target).data('sat-id');
    clearHover();

    app.selectSat(satId);
    // app.satSet.selectSat(satId);
  });

  searchResultsElem.addEventListener('mouseover', (event) => {
    const target = event.target;
    const satId = target.dataset.satId;

    if (satId && satId !== -1) {
      orbitDisplay.setHoverOrbit(satId);
      app.satSet.setHover(satId);

      hovering = true;
      hoverSatId = satId;
    }
  });

  searchResultsElem.addEventListener('mouseout', (event) => {
    orbitDisplay.clearHoverOrbit();
    app.satSet.setHover(-1);
    hovering = false;

    if (event.target.id === searchResultsElem.id) {
      searchResultsElem.style.display = 'none';
    }
  });

  document.querySelector('#search').addEventListener('input', () => {
    const searchStr = document.querySelector('#search').value;
    doSearch(searchStr);
  });

  document.querySelector('#all-objects-link').addEventListener('click', () => {
    const intldes = app.getSat(app.selectedSat).intlDes;
    const searchStr = intldes.slice(0, 8);
    doSearch(searchStr);
    document.querySelector('#search').value = searchStr;
  });
}

function init (appContext) {
  app = appContext;
  registerHandlers();
}

export default {
  init,
  getHoverSat,
  isHovering,
  hideResults,
  doSearch,
  getCurrentSearch,
  getLastResultGroup,
  fillResultBox,
  isResultBoxOpen
};
