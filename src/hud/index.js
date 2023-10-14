/* eslint-disable no-loop-func */
import { R2D, Events } from '../constants';
import windowManager from './window-manager';
import searchBox from './search-box';

const supporteEvents = [];

let app;
let groupClicked = false;

const draggableElements = [];

function setLoading (loading) {
  if (loading) {
    document.querySelector('body').classList.add('loading');
  } else {
    document.querySelector('body').classList.remove('loading');
  }
}

function updateGroupList () {
  const groupDisplay = document.querySelector('#groups-display');

  if (!app.groups) {
    throw new Error('groups is not defined');
  }

  const groups = app.groups.asArray().sort((entryA, entryB) => entryA.name.localeCompare(entryB.name));

  let html = '';
  for (let i = 0; i < groups.length; i++) {
    html += `<li data-group="${groups[i].id}" id="satgroup-${groups[i].id}" class="clickable">${groups[i].name}</li>\n`;
  }

  groupDisplay.innerHTML = html;
}

function onSelectedSatChange (event) {
  const { satellite } = event;
  if (satellite) {
    document.querySelector('#sat-infobox').classList.add('visible');
    document.querySelector('#sat-info-title').innerHTML = satellite.OBJECT_NAME;
    document.querySelector('#sat-intl-des').innerHTML = satellite.intlDes;
    document.querySelector('#sat-type').innerHTML = satellite.OBJECT_TYPE;
    document.querySelector('#sat-apogee').innerHTML = `${satellite.apogee.toFixed(0)} km`;
    document.querySelector('#sat-perigee').innerHTML = `${satellite.perigee.toFixed(0)} km`;
    document.querySelector('#sat-inclination').innerHTML = `${(satellite.inclination * R2D).toFixed(2)}°`;
    document.querySelector('#sat-period').innerHTML = `${satellite.period.toFixed(2)} min`;
  } else {
    document.querySelector('#sat-infobox').classList.remove('visible');
  }
}

function onSatHover (event) {
  const {
    satId, satX, satY, satellite
  } = event;

  if (!satId || satId === -1) {
    document.querySelector('#sat-hoverbox').innerHTML = '(none)';
    document.querySelector('#sat-hoverbox').style.display = 'none';
    document.querySelector('#canvas').style.cursor = 'default';
  } else {
    const satHoverBox = document.querySelector('#sat-hoverbox');
    satHoverBox.innerHTML = satellite.OBJECT_NAME;
    satHoverBox.style.display = 'block';
    satHoverBox.style.position = 'absolute';
    satHoverBox.style.left = `${satX + 20}px`;
    satHoverBox.style.top = `${satY - 10}px`;
    document.querySelector('#canvas').style = { cursor: 'pointer' };
  }
}

// eslint-disable-next-line no-shadow
function initGroupsListeners (app) {
  document.querySelector('#groups-display').addEventListener('mouseout', () => {
    if (!groupClicked) {
      if (searchBox.isResultBoxOpen()) {
        app.groups.selectGroup(searchBox.getLastResultGroup());
      } else {
        app.groups.clearSelect();
      }
    }
  });

  const listItems = document.querySelectorAll('#groups-display>li');

  for (let i = 0; i < listItems.length; i++) {
    const listItem = listItems[i];
    listItem.addEventListener('mouseover', (event) => {
      app.clicked = false;

      const target = event.currentTarget;
      const groupName = target.dataset.group;

      app.groups.selectGroup(app.groups.getGroupById(groupName));
    });

    listItem.addEventListener('mouseout', () => {
      const selectedGroup = document.querySelector('#groups-display>li.selected');
      if (selectedGroup) {
        app.groups.selectGroup(app.groups.getGroupById(selectedGroup.dataset.group));
      } else {
        app.groups.selectGroup(undefined);
      }
    });

    listItem.addEventListener('click', (event) => {
      const target = event.currentTarget;
      groupClicked = true;

      const selectedGroup = document.querySelector('#groups-display>li.selected');
      let selectedGroupName;
      if (selectedGroup) {
        selectedGroupName = selectedGroup.dataset.group;
      }

      for (let j = 0; j < listItems.length; j++) {
        listItems[j].classList.remove('selected');
      }

      const groupName = target.dataset.group;
      if (groupName === selectedGroupName) {
        app.groups.clearSelect();
        searchBox.clearResults();
        searchBox.hideResults();
      } else {
        event.preventDefault();
        event.stopPropagation();
        const satelliteGroups = app.viewer.getSatGroups();
        app.viewer.setSelectedSatellite(-1); // clear selected sat
        satelliteGroups.selectGroup(satelliteGroups.getGroupById(groupName));
        searchBox.fillResultBox(satelliteGroups.getGroupById(groupName).sats, '');
        windowManager.openWindow('search-window');
        target.classList.add('selected');
      }
    });
  }
}

function initEventListeners () {
  app.groups.reloadGroups();

  app.addEventListener(Events.selectedSatChange, onSelectedSatChange);

  app.addEventListener(Events.satHover, onSatHover);

  document.querySelector('#zoom-in').addEventListener('click', (event) => {
    event.preventDefault();
    app.viewer.zoomIn();
  });

  document.querySelector('#zoom-out').addEventListener('click', (event) => {
    event.preventDefault();
    app.viewer.zoomOut();
  });

  window.addEventListener('resize', () => {
    draggableElements.forEach((element) => {
      if (element.offsetLeft + element.offsetWidth > window.visualViewport.width) {
        element.style.right = 'unset';
        element.style.left = `${window.visualViewport.width - element.offsetWidth}px`;
      }

      if (element.offsetTop + element.offsetHeight > window.visualViewport.height) {
        element.style.bottom = 'unset';
        element.style.offsetTop = `${window.visualViewport.height - element.offsetHeight}px`;
      }
    });
  });

  setLoading(false);
}

function onSatMovementChange (event) {
  if (event.satId) {
    document.querySelector('#sat-altitude').innerHTML = `${event.altitude.toFixed(2)} km`;
    document.querySelector('#sat-velocity').innerHTML = `${event.velocity.toFixed(2)} km/s`;
  }
}

function onSatDataLoaded () {
  initEventListeners();
  updateGroupList();
  setTimeout(() => initGroupsListeners(app), 0);
}

function getSupportedEvents () {
  return supporteEvents;
}

function initMenus () {
  const elements = document.querySelectorAll('.menu-item');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    element.addEventListener('click', () => {
      const action = element.dataset.action;
      if (action && action.startsWith('open:')) {
        const parts = action.split(':');
        windowManager.openWindow(parts[1]);
      }
    });
  }
}

function getCurrentSearch () {
  return searchBox.getCurrentSearch();
}

function init (appContext) {
  app = appContext;
  app.windowManager = windowManager;

  windowManager.registerWindow('sat-infobox');
  windowManager.registerWindow('about-window');
  windowManager.registerWindow('help-window');
  windowManager.registerWindow('groups-window');
  windowManager.registerWindow('search-window');

  searchBox.init(app);

  initMenus();

  app.viewer.addEventListener(Events.satMovementChange, onSatMovementChange);
  app.addEventListener(Events.satDataLoaded, onSatDataLoaded);
}

export default {
  setLoading,
  init,
  getSupportedEvents,
  getCurrentSearch
};
