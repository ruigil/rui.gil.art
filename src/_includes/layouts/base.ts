

const menubar = (data: Lume.Data) => {

  let menu = "";

  for (const entry of data.search.pages("menu.visible=true", "menu.order")) {

    menu += `
    <li>
      <a href="${entry.url}"${entry.url == data.search.url ? ' aria-current="page"' : ''}>
        ${entry.menu.title || entry.title}
      </a>
    </li>
    `;
  }
  return menu;
}


export default function (data: Lume.Data) {
  return /*html*/ `
    <!doctype html>

    <html lang="${data.lang}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title || data.metas?.title} - ${data.metas?.site}</title>

        <meta name="supported-color-schemes" content="light dark">
        <meta name="theme-color" content="hsl(220, 20%, 100%)" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="hsl(220, 20%, 10%)" media="(prefers-color-scheme: dark)">
        
        <link rel="stylesheet" href="/styles.css">
        <link rel="alternate" href="/feed.xml" type="application/atom+xml" title="${data.metas?.site}">
        <link rel="alternate" href="/feed.json" type="application/json" title="${data.metas?.site}">
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/wave.png">
        <link rel="canonical" href="${data.url}">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.28.0/feather.min.js"></script>
        <script src="/assets/js/components.js" type="module"></script>
        <script src="/assets/js/main.js" type="module"></script>
        <!-- Include the CesiumJS JavaScript and CSS files -->
        <script src="https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Cesium.js"></script>
        <link href="https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
  
      </head>
      <body>
        <div class="waves">
          <svg width="100%" height="200px" fill="none" viewBox="0 0 2048 200">
            <g>
              <path
                class="wave-color"
                d="
                  M 0 77 
                  C 273,183
                    822,-40
                    2048,77 

                  V -700 
                  H 0 
                  V 77 
                  Z">
                <animate  
                  repeatCount="indefinite" 
                  attributeName="d" 
                  dur="15s" 
                  values="
                  M0 57 
                  c 473,283
                    822,-40
                    2048,57 

                  V -700 
                  H 0 
                  V 57 
                  Z; 

                  M0 90 
                  c 473,-40
                    1222,283
                    2048,90 

                  V -700 
                  H 0 
                  V 90 
                  Z; 

                  M0 77 
                  c 973,260
                    1722,-53
                    2048,77 

                  V -700
                  H 0 
                  V 77 
                  Z; 

                  M0 57 
                  c 473,283
                    822,-40
                    2048,57 

                  V -700 
                  H 0 
                  V 57 
                  Z
                  ">
                </animate> 
              </path>
            </g>
          </svg>
        </div>
        <nav class="navbar">
          <div class="navbar-home">
              <img src="${data.metas?.image}" height="32" width="32"/>
              <span class="navbar-home-title">${data.metas?.site}</span>
          </div>

          <ul class="navbar-links">
            ${menubar(data)}
            <li>
              <script>
                let theme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? "dark"
                  : "light");
                document.documentElement.dataset.theme = theme;
                function changeTheme() {
                  theme = theme === "dark" ? "light" : "dark";
                  localStorage.setItem("theme", theme);
                  document.documentElement.dataset.theme = theme;
                }
              </script>
              <button class="button" onclick="changeTheme()">
                <span class="icon">◐</span>
              </button>
            </li>
          </ul>
        </nav>

        ${data.content}

      </body>
    </html>
`;
}