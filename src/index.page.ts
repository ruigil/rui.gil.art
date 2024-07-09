export const layout = "layouts/page.ts"
export const title = "Travel Log"

export default (data:Lume.Data) => {
  return /*html*/ `
    <div class="search" id="search"></div>

    <os-stream></os-stream>
  `
}