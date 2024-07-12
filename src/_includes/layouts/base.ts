

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

/*

*/
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
        <link href="https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
        <script src="/assets/js/components.js" type="module"></script>
        <script src="/assets/js/main.js" type="module"></script>

      </head>
      <body>
    <div class="wave-container">
        <svg class="wave-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 300 100">
            <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:var(--color-contrast)"/>
                    <stop offset="100%" style="stop-color:var(--color-background)"/>
                </linearGradient>
                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:var(--color-highlight)"/>
                    <stop offset="100%" style="stop-color:var(--color-background)"/>
                </linearGradient>
                <clipPath id="waveClip">
                    <path d="M-10,50 Q75,20 150,50 T300,50 V100 H0 Z">
                        <animate
                            attributeName="d"
                            values="
                                M-10,50 Q75,20 150,50 T300,50 V100 H0 Z;
                                M-10,50 Q75,80 150,50 T300,50 V100 H0 Z;
                                M-10,50 Q75,20 150,50 T300,50 V100 H0 Z
                            "
                            dur="15s"
                            repeatCount="indefinite"
                        />
                    </path>
                </clipPath>
            </defs>

            <rect x="0" y="0" width="300" height="100" fill="url(#blueGradient)" />
            <rect x="0" y="0" width="300" height="100" fill="url(#orangeGradient)" clip-path="url(#waveClip)" />

            <path d="M-10,50 Q75,20 150,50 T310,50" fill="none" stroke="var(--color-highlight)" stroke-width="8">
                <animate
                    attributeName="d"
                    values="
                        M-10,50 Q75,20 150,50 T310,50;
                        M-10,50 Q75,80 150,50 T310,50;
                        M-10,50 Q75,20 150,50 T310,50
                    "
                    dur="15s"
                    repeatCount="indefinite"
                />
            </path>
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