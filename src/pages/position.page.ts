
export const layout = "layouts/base.ts"
export const title = "Position"
export const url = "/position/"
export const menu = { visible: true, order: 1 }


export default (data:Lume.Data) => {
  return /*html*/ `
    <div id="windy" class="body-position"></div>
    <script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"></script>
    <script src="https://api.windy.com/assets/map-forecast/libBoot.js"></script>
    <script src="/assets/js/script.js"></script>
  `;
}