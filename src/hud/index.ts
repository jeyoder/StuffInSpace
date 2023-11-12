/* eslint-disable no-loop-func */
import { R2D, Events } from '../constants';
import windowManager from './window-manager';
import searchBox from './search-box';

const supporteEvents: string[] = [];

let app: any;
let groupClicked = false;

const draggableElements: any[] = [];

function setLoading (loading: boolean) {
  if (loading) {
    document.querySelector('body')?.classList.add('loading');
  } else {
    document.querySelector('body')?.classList.remove('loading');
  }
}

function updateGroupList () {
  const groupDisplay = document.querySelector('#groups-display') as HTMLElement;

  if (!app.groups) {
    throw new Error('groups is not defined');
  }

  const groups = app.groups.asArray().sort((entryA: Record<string, string>, entryB: Record<string, string>) => entryA.name.localeCompare(entryB.name));

  let html = '';
  for (let i = 0; i < groups.length; i++) {
    html += `<li data-group="${groups[i].id}" id="satgroup-${groups[i].id}" class="clickable">${groups[i].name}</li>\n`;
  }

  groupDisplay.innerHTML = html;
}

function setHtml (selector: string, html: string) {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.innerHTML = html;
  }
}

function onSelectedSatChange (event: any) {
  const { satellite } = event;
  if (satellite) {
    document.querySelector('#sat-infobox')?.classList.add('visible');
    setHtml('#sat-info-title', satellite.OBJECT_NAME);
    setHtml('#sat-intl-des', satellite.intlDes);
    setHtml('#sat-type', satellite.OBJECT_TYPE);
    setHtml('#sat-apogee', `${satellite.apogee.toFixed(0)} km`);
    setHtml('#sat-perigee', `${satellite.perigee.toFixed(0)} km`);
    setHtml('#sat-inclination', `${(satellite.inclination * R2D).toFixed(2)}°`);
    setHtml('#sat-period', `${satellite.period.toFixed(2)} min`);
  } else {
    document.querySelector('#sat-infobox')?.classList.remove('visible');
  }
}

function onSatHover (event: any) {
  const {
    satId, satX, satY, satellite
  } = event;

  if (!satId || satId === -1) {
    setHtml('#sat-hoverbox', '(none)');
    let element = document.querySelector('#sat-hoverbox') as HTMLElement;
    if (element) {
      element.style.display = 'none';
    }
    element = document.querySelector('#canvas') as HTMLElement;
    if (element) {
      element.style.cursor = 'default';
    }
  } else {
    const satHoverBox = document.querySelector('#sat-hoverbox') as HTMLElement;
    if (satHoverBox) {
      satHoverBox.innerHTML = satellite.OBJECT_NAME;
      satHoverBox.style.display = 'block';
      satHoverBox.style.position = 'absolute';
      satHoverBox.style.left = `${satX + 20}px`;
      satHoverBox.style.top = `${satY - 10}px`;
    }
    const element = document.querySelector('#canvas') as HTMLElement;
    if (element) {
      element.style.cursor = 'pointer';
    }
  }
}

// eslint-disable-next-line no-shadow
function initGroupsListeners (app: any) {
  document.querySelector('#groups-display')?.addEventListener('mouseout', () => {
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
    listItem.addEventListener('mouseover', (event: any) => {
      app.clicked = false;

      const target = event.currentTarget;
      const groupName = target.dataset.group;

      app.groups.selectGroup(app.groups.getGroupById(groupName));
    });

    listItem.addEventListener('mouseout', () => {
      const selectedGroup = (document.querySelector('#groups-display>li.selected') as HTMLElement);
      if (selectedGroup) {
        app.groups.selectGroup(app.groups.getGroupById(selectedGroup.dataset.group));
      } else {
        app.groups.selectGroup(undefined);
      }
    });

    listItem.addEventListener('click', (event: any) => {
      const target = event.currentTarget;
      groupClicked = true;

      const selectedGroup = document.querySelector('#groups-display>li.selected') as HTMLElement;
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

  document.querySelector('#zoom-in')?.addEventListener('click', (event: any) => {
    event.preventDefault();
    app.viewer.zoomIn();
  });

  document.querySelector('#zoom-out')?.addEventListener('click', (event: any) => {
    event.preventDefault();
    app.viewer.zoomOut();
  });

  window.addEventListener('resize', () => {
    draggableElements.forEach((element) => {
      if (!window.visualViewport) {
        return;
      }

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

function onSatMovementChange (event: any) {
  if (event.satId) {
    setHtml('#sat-altitude', `${event.altitude.toFixed(2)} km`);
    setHtml('#sat-velocity', `${event.velocity.toFixed(2)} km/s`);
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
    const element = elements[i] as HTMLElement;
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

function init (appContext: any) {
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
