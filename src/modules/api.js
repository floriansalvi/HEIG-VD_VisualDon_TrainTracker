const loadJson = (url) => fetch(url).then((response) => response.json())

const loadMainStations = () => loadJson('https://data.sbb.ch/api/v2/catalog/datasets/anzahl-sbb-bahnhofbenutzer/exports/json')

export { loadMainStations }