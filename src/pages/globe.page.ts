
export const layout = "layouts/base.ts"
export const title = "Globe"
export const url = "/globe/"
export const menu = { visible: true, order: 3 }


export default (data:Lume.Data) => {
  return /*html*/ `
    <div id="cesiumContainer" class="body-position"></div>
  <script type="module">
    // Your access token can be found at: https://ion.cesium.com/tokens.
    // This is the default access token from your ion account

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkN2RiYWNhNC00MTE4LTQ4NjctOTcwNy0wNzU2MTI0OWZiZDAiLCJpZCI6MjI3NTk4LCJpYXQiOjE3MjA2MTAyNDd9.-gChfSKs8OhhZsOQXBGn1ZScTWL1EPWcAqYpiNUMdFw';

    // Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
    const viewer = new Cesium.CesiumWidget('cesiumContainer', {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      timeline: false,
      animation: false,
      fullscreenButton: false,
      homeButton: false,
      globeButton: false,
      geocoder: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      
    });
    viewer.scene.globe.enableLighting = true;    

    // Fly the camera to Lisbon at the given longitude, latitude, and height.
    //viewer.camera.flyTo({
      //destination: Cesium.Cartesian3.fromDegrees(-9.142685, 38.736946, 400),
      //orientation: {
        //heading: Cesium.Math.toRadians(0.0),
        //pitch: Cesium.Math.toRadians(-15.0),
      //}
    //});

  </script>
  `;
}