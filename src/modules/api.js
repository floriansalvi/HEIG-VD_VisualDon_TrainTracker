const loadJson = (url) => fetch(url).then((response) => response.json())

const loadMainStations = () => loadJson('https://data.sbb.ch/api/v2/catalog/datasets/anzahl-sbb-bahnhofbenutzer/exports/json')

const loadStationShops = () => loadJson('https://data.sbb.ch/api/v2/catalog/datasets/nebenbetriebe/exports/json')

// const loadStationShops = () => loadJson('https://data.sbb.ch/api/v2/catalog/datasets/offnungszeiten-shops/exports/json')


export { loadMainStations, loadStationShops }