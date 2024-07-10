
export const layout = "layouts/page.ts"
export const title = "Stream"
export const url = "/stream/"
export const menu = { visible: true, order: 1 }


export default (data:Lume.Data) => {
  return /*html*/ `
    <tag-filter></tag-filter>
    <os-stream></os-stream>
  `;
}