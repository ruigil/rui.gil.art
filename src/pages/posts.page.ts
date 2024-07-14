
export const layout = "layouts/page.ts"
export const title = "Posts"
export const url = "/posts/"
export const menu = { visible: true, order: 1 }
export const tagFilter = true


export default () => {
  return `<os-posts></os-posts>`;
}