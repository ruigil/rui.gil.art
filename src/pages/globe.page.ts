
export const layout = "layouts/base.ts"
export const title = "Globe"
export const url = "/globe/"
export const menu = { visible: true, order: 3 }


export default (data:Lume.Data) => {
  return /*html*/ `
    <div id="cesiumContainer" class="body-position"></div>
  <!-- Include the CesiumJS JavaScript and CSS files -->

  <script src="https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Cesium.js"></script>

  <script type="module">
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkN2RiYWNhNC00MTE4LTQ4NjctOTcwNy0wNzU2MTI0OWZiZDAiLCJpZCI6MjI3NTk4LCJpYXQiOjE3MjA2MTAyNDd9.-gChfSKs8OhhZsOQXBGn1ZScTWL1EPWcAqYpiNUMdFw';

// Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  timeline: false,
  animation: false,
  fullscreenButton: false,
  homeButton: false,
  sceneModePicker: false, // Replaced globeButton which isn't a Viewer option
  geocoder: false,
  navigationHelpButton: false,
  baseLayerPicker: false,
  
});
viewer.scene.globe.enableLighting = true;    

// Load the KML file
const kmlOptions = {
  camera: viewer.scene.camera,
  canvas: viewer.scene.canvas,
  clampToGround: false // Useful if the KML lines should lie on the terrain
};

// Load the KML data source
const dataSourcePromise = Cesium.KmlDataSource.load('/assets/tgv.kml', kmlOptions);

// Add the data source to the viewer
viewer.dataSources.add(dataSourcePromise).then(function(dataSource) {
  // Customize the style of "Travel Plan BIG"
  const entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (entity.name === 'Travel Plan BIG') {
      entity.polyline.material = Cesium.Color.ORANGE;
      entity.polyline.width = 4;
    }
  }

  // Zoom to the data source after it's loaded
  viewer.flyTo(dataSource);
  

}).catch(function(error) {
  // Handle any errors that occur during loading
  console.error('Error loading KML:', error);
  window.alert('Error loading KML. Detailed error in console. Note: If you are opening index.html directly from the file system, you may need to use a local web server due to CORS restrictions.');
});

  </script>
  `;
}