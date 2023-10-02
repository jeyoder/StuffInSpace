/* eslint-disable no-loop-func */
import { R2D } from '../constants';

let app;
let groupClicked = false;
const draggableElements = [];
// let openMenu;

function makeDraggable (selectors) {
  let elemTop = 0;
  let elemLeft = 0;
  let initialX = 0;
  let initialY = 0;

  const element = document.querySelector(selectors);
  draggableElements.push(element);

  function onMouseMove (event) {
    const top = `${elemTop - (initialY - event.clientY)}px`;
    const left = `${elemLeft - (initialX - event.clientX)}px`;
    element.style.top = top;
    element.style.left = left;
  }

  element.addEventListener('mousedown', (event) => {
    event.preventDefault();
    elemLeft = element.offsetLeft;
    elemTop = element.offsetTop; // - 250);
    initialX = event.clientX;
    initialY = event.clientY;

    element.style.right = 'unset';
    element.style.bottom = 'unset';
    element.style.left = `${elemLeft}px`;
    element.style.top = `${elemTop}px`;

    element.classList.add('dragging');
    element.addEventListener('mousemove', onMouseMove);
  });

  element.addEventListener('mouseup', (event) => {
    event.preventDefault();
    element.removeEventListener('mousemove', onMouseMove);
    element.classList.remove('dragging');
  });
}

function updateGroupList () {
  const groupDisplay = document.querySelector('#menu-groups #groups-display');

  if (!app.groups) {
    throw new Error('groups is not defined');
  }

  const groups = app.groups.asArray().sort((entryA, entryB) => entryA.name.localeCompare(entryB.name));

  let html = '<li data-group="<clear>" class="clear-option">Clear</li>';
  for (let i = 0; i < groups.length; i++) {
    html += `<li data-group="${groups[i].id}" id="satgroup-${groups[i].id}">${groups[i].name}</li>\n`;
  }

  groupDisplay.innerHTML = html;
}

function onSelectedSatChange (sat) {
  if (sat) {
    document.querySelector('#sat-infobox').classList.add('visible');
    document.querySelector('#sat-info-title').innerHTML = sat.OBJECT_NAME;
    document.querySelector('#sat-intl-des').innerHTML = sat.intlDes;
    document.querySelector('#sat-type').innerHTML = sat.OBJECT_TYPE;
    document.querySelector('#sat-apogee').innerHTML = `${sat.apogee.toFixed(0)} km`;
    document.querySelector('#sat-perigee').innerHTML = `${sat.perigee.toFixed(0)} km`;
    document.querySelector('#sat-inclination').innerHTML = `${(sat.inclination * R2D).toFixed(2)}°`;
    document.querySelector('#sat-period').innerHTML = `${sat.period.toFixed(2)} min`;
  } else {
    document.querySelector('#sat-infobox').classList.remove('visible');
  }
}

// eslint-disable-next-line no-shadow
function initGroupsListeners (app) {
  document.querySelector('#groups-display').addEventListener('mouseout', () => {
    if (!groupClicked) {
      if (app.searchBox.isResultBoxOpen()) {
        app.groups.selectGroup(app.searchBox.getLastResultGroup());
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

      if (groupName === '<clear>') {
        app.groups.clearSelect();
      } else {
        app.groups.selectGroup(app.groups.getGroup(groupName));
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
      if (groupName === '<clear>' || groupName === selectedGroupName) {
        app.groups.clearSelect();
        document.querySelector('#menu-groups .menu-title').innerHTML = 'Groups';

        const clearElement = document.querySelector('#groups-display>li[data-group=\'<clear>\']');
        clearElement.style.display = 'none';

        app.searchBox.clearResults();
        app.searchBox.hideResults();
      } else {
        app.selectSat(-1); // clear selected sat
        app.groups.selectGroup(app.groups.getGroup(groupName));
        app.searchBox.fillResultBox(app.groups.getGroup(groupName).sats, '');

        target.classList.add('selected');
        // document.querySelector('#menu-groups .clear-option').style.display = 'block';
        document.querySelector('#menu-groups .menu-title').innerHTML = `Groups (${target.textContent})`;
      }

      document.querySelector('#groups-display').style.display = 'none';
    });
  }
}

function setLoading (loading) {
  if (loading) {
    document.querySelector('body').classList.add('loading');
  } else {
    document.querySelector('body').classList.remove('loading');
  }
}

function init (appContext) {
  app = appContext;

  updateGroupList();

  app.addEventListener('selectedsatchange', onSelectedSatChange);
  app.addEventListener('satdataloaded', () => {
    app.groups.reloadGroups();

    const menuItems = document.querySelectorAll('.menu');
    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i];

      menuItem.addEventListener('mouseover', (event) => {
        const target = event.currentTarget;
        const targetParent = target.parentElement;
        const subMenu = target.querySelector('.submenu');
        if (subMenu) {
          targetParent.classList.add('open');
          subMenu.style.display = 'block';
        }
      });

      menuItem.addEventListener('mouseout', (event) => {
        const target = event.currentTarget;
        const targetParent = target.parentElement;

        const subMenu = target.querySelector('.submenu');
        if (subMenu) {
          targetParent.classList.remove('open');
          subMenu.style.display = 'none';
        }
      });

      menuItem.addEventListener('click', (event) => {
        const target = event.currentTarget;
        const subMenu = target.querySelector('.submenu');
        const open = target.classList.value.indexOf('open') > -1;

        document.querySelectorAll('.menu').forEach((element) => {
          element.classList.remove('open');
        });

        if (subMenu) {
          if (subMenu && open) {
            target.classList.remove('open');
            subMenu.style.display = 'none';
          } else {
            target.classList.add('open');
            subMenu.style.display = 'block';
          }
        } else if (target.id === 'search-holder') {
          app.searchBox.toggleResultsVisible();
        }
      });
    }
  });

  // document.querySelector('#center-loc').addEventListener('click', (event) => {
  //   event.preventDefault();
  //   if (navigator.geolocation) {
  //     const options = {
  //       enableHighAccuracy: true,
  //       timeout: 2000,
  //       maximumAge: 0
  //     };

  //     console.log('zzzz');
  //     navigator.geolocation.getCurrentPosition((pos) => {
  //       console.log('nnnn');
  //       console.log('xxxx', pos);
  //       app.rotateTo(pos.coords.latitude, pos.coords.longitude);
  //     }, (error) => console.log(error), options);
  //   }
  // });

  document.querySelector('#zoom-in').addEventListener('click', (event) => {
    event.preventDefault();
    app.viewer.zoomIn();
  });

  document.querySelector('#zoom-out').addEventListener('click', (event) => {
    event.preventDefault();
    app.viewer.zoomOut();
  });

  makeDraggable('#sat-infobox');
  initGroupsListeners(appContext);
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

export default {
  setLoading,
  init
};
