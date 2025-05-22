const loadJson = (url) => fetch(url).then((response) => response.json())

const loadMainStations = () => loadJson('https://data.sbb.ch/api/v2/catalog/datasets/anzahl-sbb-bahnhofbenutzer/exports/json')

const loadStationShops = () => loadJson('https://data.sbb.ch/api/v2/catalog/datasets/nebenbetriebe/exports/json')

const loadCoordinates = (place) => loadJson(`https://nominatim.openstreetmap.org/search?q=${place} Switzerland&format=json`)

const loadLanguage = (place) => loadJson(`https://api3.geo.admin.ch/rest/services/all/MapServer/find?searchText=${place}&layers=ch.bfs.sprachenkarte-2010&searchField=name&f=json`)

const loadEmployees = () => loadJson('https://data.sbb.ch/api/v2/catalog/datasets/sbb-mitarbeitende-nach-arbeitkanton/exports/json')

export { loadMainStations, loadStationShops, loadCoordinates, loadLanguage }