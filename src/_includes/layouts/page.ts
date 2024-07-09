
export const layout= "layouts/base.ts"


export default function(data: Lume.Data) {
  return /*html*/ `
    <main class="page">
      <header class="page-header">
        <h1 class="page-title">${ data.title }</h1>
      </header>

      <section class="postList">
        ${data.content}
      </section>
    </main>
`
}