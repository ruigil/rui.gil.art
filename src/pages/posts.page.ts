
export const layout = "layouts/page.ts"
export const title = "Posts"
export const url = "/posts/"
export const menu = { visible: true, order: 1 }


export default () => {
  return /*html*/ `
    <tag-filter></tag-filter>
    <os-posts></os-posts>
  `;
}