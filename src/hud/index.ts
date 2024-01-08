/* eslint-disable no-loop-func */
import { R2D, Events } from '@/constants';
import SatelliteGroup from '@satellite-viewer/SatelliteGroup';
import { Viewer } from '@satellite-viewer/index';
import HudWindowManager from './HudWindowManager';
import searchBox from './SearchBox';

const supporteEvents: string[] = [];
const windowManager = new HudWindowManager();
const draggableElements: any[] = [];

let groupClicked = false;
let viewer: Viewer;

function showAttribution (visible: true) {
  let attributionElem = document.querySelector('.attribution');
  if (!attributionElem) {
    attributionElem = document.createElement('div');
    attributionElem.className = 'attribution';
    document.querySelector('body')?.appendChild(attributionElem);
  }

  if (attributionElem) {
    if (visible) {
      const satelliteStore = viewer.getSatelliteStore();
      if (satelliteStore && satelliteStore.getAttribution()) {
        const attribution = satelliteStore.getAttribution() || {};
        const updatedDate = satelliteStore.getUpdatedDate();
        attributionElem.innerHTML = `Orbital object data from <a href="${attribution.url}">${attribution.name}</a> <span class="updated">(updated ${updatedDate})</span>`;
      }
      attributionElem.classList.remove('hidden');
    } else {
      attributionElem.classList.add('hidden');
    }
  }
}

function setLoading (loading: boolean) {
  if (loading) {
    document.querySelector('body')?.classList.add('loading');
  } else {
    document.querySelector('body')?.classList.remove('loading');
  }
}

function updateGroupList () {
  const groupDisplay = document.querySelector('#groups-display') as HTMLElement;
  const satelliteGroups = viewer.getSatelliteGroups();
  let groups: SatelliteGroup[] = [];

  if (satelliteGroups) {
    groups = satelliteGroups.asArray().sort((entryA: SatelliteGroup, entryB: SatelliteGroup) => entryA.name.localeCompare(entryB.name));
  }

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

function onSelectedSatChange (satellite: Record<string, any>) {
  if (satellite) {
    document.querySelector('#sat-infobox')?.classList.add('visible');
    setHtml('#sat-info-title', satellite.OBJECT_NAME);
    setHtml('#sat-intl-des', satellite.intlDes);
    setHtml('#sat-type', satellite.OBJECT_TYPE);
    setHtml('#sat-apogee', `${satellite.apogee?.toFixed(0)} km`);
    setHtml('#sat-perigee', `${satellite.perigee?.toFixed(0)} km`);
    setHtml('#sat-inclination', `${(satellite.inclination * R2D).toFixed(2)}°`);
    setHtml('#sat-period', `${satellite.period?.toFixed(2)} min`);
  } else {
    document.querySelector('#sat-infobox')?.classList.remove('visible');
  }
}

function onSatHover (event: any) {
  const {
    satId, satX, satY, satellite
  } = event || {};

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
function initGroupsListeners () {
  document.querySelector('#groups-display')?.addEventListener('mouseout', () => {
    if (!groupClicked) {
      const satelliteGroups = viewer.getSatelliteGroups();
      if (satelliteGroups) {
        if (searchBox.isResultBoxOpen()) {
          satelliteGroups.selectGroup(searchBox.getLastResultGroup());
        } else {
          satelliteGroups.clearSelect();
        }
      }
    }
  });

  const listItems = document.querySelectorAll('#groups-display>li');

  for (let i = 0; i < listItems.length; i++) {
    const listItem = listItems[i];
    listItem.addEventListener('mouseover', (event: any) => {
      const target = event.currentTarget;
      const groupName = target.dataset.group;

      const satelliteGroups = viewer.getSatelliteGroups();
      if (satelliteGroups) {
        satelliteGroups.selectGroup(
          satelliteGroups.getGroupById(groupName)
        );
      }
    });

    listItem.addEventListener('mouseout', () => {
      const satelliteGroups = viewer.getSatelliteGroups();
      if (satelliteGroups) {
        const selectedGroup = (document.querySelector('#groups-display>li.selected') as HTMLElement);
        if (selectedGroup) {
          satelliteGroups.selectGroup(
            satelliteGroups.getGroupById(selectedGroup.dataset.group as string)
          );
        } else {
          satelliteGroups.selectGroup(undefined);
        }
      }
    });

    listItem.addEventListener('click', (event: any) => {
      event.preventDefault();

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

      const satelliteGroups = viewer.getSatelliteGroups();
      const groupName = target.dataset.group;
      let group = undefined;
      if (groupName === selectedGroupName) {
        if (satelliteGroups) {
          satelliteGroups.clearSelect();
        }
        searchBox.clearResults();
        searchBox.hideResults();
      } else {
        event.preventDefault();
        event.stopPropagation();
        if (satelliteGroups) {
          viewer.setSelectedSatellite(-1); // clear selected sat
          if (satelliteGroups) {
            group = satelliteGroups.getGroupById(groupName);
          }

          if (group) {
            target.classList.add('selected');
            searchBox.fillResultBox(group.sats, '');
            windowManager.openWindow('search-window');
            group.reload();
          }
        }
      }

      if (satelliteGroups) {
        satelliteGroups.selectGroup(group);
        viewer.setSelectedSatelliteGroup(group);
      }

    });
  }
}

function initEventListeners () {
  const satelliteGroups = viewer.getSatelliteGroups();

  satelliteGroups?.reloadGroups();

  viewer.addEventListener(Events.selectedSatChange, onSelectedSatChange);
  viewer.addEventListener(Events.satHover, onSatHover);

  document.querySelector('#zoom-in')?.addEventListener('click', (event: any) => {
    event.preventDefault();
    viewer.zoomIn();
  });

  document.querySelector('#zoom-out')?.addEventListener('click', (event: any) => {
    event.preventDefault();
    viewer.zoomOut();
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
  setTimeout(() => initGroupsListeners(), 0);

  const loaderElement = document.querySelector('#load-cover');
  if (loaderElement) {
    loaderElement.classList.add('hidden');
  }

  showAttribution(true);
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

function init (viewerInstance: Viewer, appConfig: Record<string, any> = {}) {
  viewer = viewerInstance;

  windowManager.registerWindow('sat-infobox');
  windowManager.registerWindow('about-window');
  windowManager.registerWindow('help-window');
  windowManager.registerWindow('groups-window');
  windowManager.registerWindow('search-window');

  searchBox.init(viewer, windowManager);

  initMenus();

  viewer.addEventListener(Events.satMovementChange, onSatMovementChange);
  if (!viewer.ready) {
    viewer.addEventListener(Events.satDataLoaded, onSatDataLoaded);
  } else {
    onSatDataLoaded();
  }

  console.log('xoooo', appConfig);
  setHtml('.app-version', appConfig.appInfo.version);
  setHtml('.build-date', appConfig.appInfo.buildDate);
  setHtml('.release-date', appConfig.appInfo.buildDate);
}

export default {
  setLoading,
  init,
  getSupportedEvents,
  getCurrentSearch
};
