
const listFiles = async (path:string) => {
  const files = await Deno.readDir(path)
  return files
}

const folderContent = (name:string,curl:string) => {
  return /*html*/ `
    <div class="responsive">
      <div class="gallery">
        <a href="${curl.toLowerCase() + name}">
          <img src="/media/gallery/${curl.substring(8) + name}/${name.toLowerCase()}.jpg" alt="${name}">
        </a>
        <div class="desc">${name}</div>
      </div>
    </div>
  `
}

const photoContent = ( name:string, curl:string) => {
  return `<img class="image-thumb" src="/media/gallery${curl.substring(8)}${name}" alt="Photo">`
}

async function* processDirectory(name:string = "", curl:string = "/"):AsyncGenerator {

  const files = new Map<string,boolean>(); 
 
  const currentPath = "./media/gallery" + curl.substring(8)

  for await (const file of await listFiles(currentPath)) {
    files.set(file.name, file.isDirectory)
  }

  // directories to create folders
  let folders = ""
  // files to create photos in 4 columns
  const columns = ["", "", "", ""];
  let idx = 0;
  for (const [key,dir] of files) {
    if (dir) {
      yield* processDirectory(key, curl + key + "/")
      folders += folderContent(key,curl)
    } else { 
      columns[idx++ % 4] += photoContent(key, curl) 
    }
  };

  const photos = /*html*/ `
    <div class="row">
      <div class="column">${columns[0]}</div>
      <div class="column">${columns[1]}</div>
      <div class="column">${columns[2]}</div>
      <div class="column">${columns[3]}</div>
    </div>`

  const back = curl === "/gallery/" ? `` : `<a href=".."><i class="arrow left"></i>Back</a>`
  const modal = /*html*/`
    <div id="myModal" class="modal">
      <div >
        <img class="modal-content" id="img01">
        <div class="modal-content" id="caption"></div>
      </div>
    </div>`

  const clearFix = "<div class='clearfix'></div>"
  
  
  yield {
    layout: "layouts/page.ts",
    title: name,
    url: curl,
    menu: curl === "/gallery/" ? { visible: true, order: 2 } : { visible: false },
    content: `${back}${clearFix}${folders}${clearFix}${photos}${modal}`
  }
}

export default async function* () {
  yield* processDirectory("Gallery", "/gallery/")
}
