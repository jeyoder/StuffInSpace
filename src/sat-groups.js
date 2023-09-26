import { defaultColorScheme, groupColorScheme } from './color-scheme';
import searchBox from './search-box';
import SatGroup from './sat-group';

const gpSatellites = [
  '90103A',
  '93068A',
  '96041A',
  '97035A',
  '99055A',
  '00025A',
  '00040A',
  '00071A',
  '01004A',
  '03005A',
  '03010A',
  '03058A',
  '04009A',
  '04023A',
  '04045A',
  '05038A',
  '06042A',
  '06052A',
  '07047A',
  '07062A',
  '08012A',
  '09043A',
  '10022A',
  '11036A',
  '12053A',
  '13023A',
  '14008A',
  '14026A',
  '14045A',
  '14068A',
  '15013A'
];

const groupConfigs = [
  {
    id: 'GPSGroup', name: 'GPS', groupType: 'intlDes', data: gpSatellites
  },
  {
    id: 'IridiumGroup', name: 'Iridium Debris', groupType: 'nameRegex', data: /IRIDIUM(?!.*DEB)/
  },
  {
    id: 'Iridium33DebrisGroup', name: 'Iridium 33 Debris', groupType: 'nameRegex', data: /(COSMOS 2251|IRIDIUM 33) DEB/
  },
  {
    id: 'GlonassGroup', name: 'Glonass', groupType: 'nameRegex', data: /GLONASS/
  },
  {
    id: 'GalileoGroup', name: 'Galileo', groupType: 'nameRegex', data: /GALILEO/
  },
  {
    id: 'FunGroup', name: 'Fun', groupType: 'nameRegex', data: /SYLDA/
  },
  {
    id: 'WestfordNeedlesGroup', name: 'Westford Needles', groupType: 'nameRegex', data: /WESTFORD NEEDLES/
  },
  {
    id: 'SpaceXGroup', name: 'Space X', groupType: 'nameRegex', data: /FALCON [19]/
  },
  {
    id: 'DebrisGroup', name: 'Debris', groupType: 'objectType', data: 'DEBRIS'
  },
  {
    id: 'Starlink', name: 'Starlink', groupType: 'nameRegex', data: /STARLINK/
  },
  {
    id: 'Unknown', name: 'Unknown', groupType: 'objectType', data: 'UNKNOWN'
  }
];

class SatGroups {
  constructor () {
    this.groups = {};
    this.selectedGroup = null;
  }

  asArray () {
    return Object.values(this.groups);
  }

  selectGroup (group) {
    this.selectedGroup = group;
    if (!group) {
      this.clearSelect();
      return;
    }
    group.updateOrbits();
    this.app.satSet.setColorScheme(groupColorScheme);
  }

  forEach (callback) {
    for (let i = 0; i < this.sats.length; i++) {
      callback(this.sats[i].satId);
    }
  }

  clearSelect () {
    this.selectedGroup = null;
    this.app.satSet.setColorScheme(defaultColorScheme);
  }

  initListeners () {
    const scope = this;
    // const start = performance.now();
    this.clicked = false;

    document.querySelector('#groups-display').addEventListener('mouseout', () => {
      if (!scope.clicked) {
        if (searchBox.isResultBoxOpen()) {
          scope.selectGroup(searchBox.getLastResultGroup());
        } else {
          scope.clearSelect();
        }
      }
    });

    const listItems = document.querySelectorAll('#groups-display>li');
    for (let i = 0; i < listItems.length; i++) {
      const listItem = listItems[i];
      listItem.addEventListener('mouseover', (event) => {
        const target = event.currentTarget;
        scope.clicked = false;
        const groupName = target.dataset.group;
        if (groupName === '<clear>') {
          scope.clearSelect();
        } else {
          scope.selectGroup(scope.groups[groupName]);
        }
      });

      listItem.addEventListener('click', (event) => {
        const { app } = scope;
        const target = event.currentTarget;
        scope.clicked = true;
        const groupName = target.dataset.group;
        if (groupName === '<clear>') {
          scope.clearSelect();
          document.querySelector('#menu-groups .menu-title').innerHTML = 'Groups';
          target.style.display = 'none';
        } else {
          app.selectSat(-1); // clear selected sat
          scope.selectGroup(scope.groups[groupName]);

          searchBox.fillResultBox(scope.groups[groupName].sats, '');

          document.querySelector('#menu-groups .clear-option').style.display = 'block';
          document.querySelector('#menu-groups .menu-title').innerHTML = `Groups (${target.textContent})`;
        }

        document.querySelector('#groups-display').style.display = 'none';
      });
    }
  }

  init (appContext) {
    this.app = appContext;
    for (let i = 0; i < groupConfigs.length; i++) {
      this.groups[groupConfigs[i].id] = new SatGroup(
        groupConfigs[i].id,
        groupConfigs[i].name,
        groupConfigs[i].groupType,
        groupConfigs[i].data
      );
    }

    // Give time for update to happen before registering listeners
    setTimeout(this.initListeners.bind(this), 0);
  }
}

export default new SatGroups();
export { SatGroup };
