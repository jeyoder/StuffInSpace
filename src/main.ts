import logger from './utils/logger';
import config from './config';
import hud from './hud';
import { Events } from './constants';
import viewer from './viewer-legacy';
import EventManager from './utils/event-manager';

const validateProgram = false;
const eventManager = new EventManager();

let app: any;

function processPageParams (updateSearch = true) {
  let title = config.appName;

  const searchParams = new URLSearchParams(document.location.search);

  if (searchParams.get('intldes')) {
    const value = searchParams.get('intldes') as string;
    const urlSatId = app.satSet.getIdFromIntlDes(value.toUpperCase());
    if (urlSatId !== null) {
      const satellite = app.satSet.getSat(urlSatId);
      title += ` - ${satellite.OBJECT_NAME} (${value})`;

      if (updateSearch) {
        app.viewer.setSelectSatellite(urlSatId);
      }
    } else {
      title += ` - ${value}`;
    }
  } else if (searchParams.get('search')) {
    const value = searchParams.get('search');
    if (updateSearch) {
      app.searchBox.doSearch(value);
      const element = document.querySelector('#search') as HTMLInputElement;
      if (element) {
        element.value = value || '';
      }
    }
    title += ` - $${value}`;
  }

  document.title = title;
}

class App {
  satData: any;
  groups: any;
  selectedSat: number;
  validateProgram = false;
  addEventListener: (eventName: string, listener: any) => void;

  constructor () {
    this.satData = [];
    this.groups = undefined;
    this.selectedSat = -1;

    this.validateProgram = validateProgram;
    this.addEventListener = eventManager.addEventListener.bind(eventManager);
  }

  browserUnsupported () {
    logger.error('Unsupported browser. Not WebGL support available');
    let element = document.querySelector('#canvas-holder') as HTMLElement;
    if (element) {
      element.style.display = 'none';
    }
    element = document.querySelector('#no-webgl') as HTMLElement;
    if (element) {
      element.style.display = 'block';
    }
  }

  updateUrl () {
    let url = config.baseUrl || '/';
    const paramSlices: any[] = [];

    const query: Record<string, any> = {};

    if (this.selectedSat && this.selectedSat !== -1) {
      query.intldes = app.satSet.getSat(this.selectedSat).intlDes;
    }

    const currentSearch = hud.getCurrentSearch();
    if (currentSearch !== null) {
      query.search = currentSearch;
    }

    const keys = Object.keys(query);
    const params = [];
    if (keys.length > 0) {
      for (let i = 0; i < keys.length; i++) {
        params.push(`${keys[i]}=${query[keys[i]]}`);
      }
      url += `?${params.join('&')}`;
    }

    if (paramSlices.length > 0) {
      url += `?${paramSlices.join('&')}`;
    }

    if (config.pushHistory) {
      window.history.pushState({}, '', url);
    } else {
      window.history.replaceState(null, config.appName, url);
    }

    processPageParams(false);
  }
}

async function main () {
  app = new App();
  app.selectedSat = -1;

  hud.setLoading(true);

  app.config = config;

  app.viewer = viewer;

  hud.init(app);

  app.viewer.addEventListener(Events.satHover, (data: any) => {
    eventManager.fireEvent(Events.satHover, data);
  });

  app.viewer.addEventListener(Events.satDataLoaded, (event: any) => {
    eventManager.fireEvent(Events.satDataLoaded, event);
    hud.setLoading(false);
  });

  app.viewer.addEventListener(Events.selectedSatChange, (event: any) => {
    eventManager.fireEvent(Events.selectedSatChange, event);
    app.updateUrl();
  });

  app.viewer.addEventListener(Events.satMovementChange, (event: any) => {
    eventManager.fireEvent(Events.satMovementChange, event);
  });

  app.viewer.addEventListener(Events.cruncherReady, (event: any) => {
    eventManager.fireEvent(Events.cruncherReady, event);
    processPageParams();
  });

  await viewer.init(app);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await main();
  } catch (error) {
    logger.error(error);
  }
});
