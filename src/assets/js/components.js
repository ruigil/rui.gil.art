import { animate } from '/assets/js/poiesis.js';

function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(parseInt(timestamp));
    const diffInSeconds = Math.floor((now - past) / 1000);

    const units = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'week', seconds: 604800 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
        { name: 'second', seconds: 1 }
    ];

    for (const unit of units) {
        const interval = Math.floor(diffInSeconds / unit.seconds);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit.name} ago` : `${interval} ${unit.name}s ago`;
        }
    }

    return 'just now'; 
}

class PostComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    static get observedAttributes() {
      return ['text-message'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      if (this.shadowRoot) {
      }
    }
  
    render() {
        const mainImage = this.getAttribute('main-image');
        const mainVideo = this.getAttribute('main-video');
        const mainAudio = this.getAttribute('main-audio');
        const mainMaps = this.getAttribute('main-position');
        const textMessage = this.getAttribute('text-message');
        const avatarImage = this.getAttribute('avatar-image') || "/assets/img/user.svg";
        const author = this.getAttribute('author') || "John Doe";
        const time = this.getAttribute('time') || "0";
        const tags = this.getAttribute('tags') || "";
  
        const css = /*css*/`
                .card {
                    border-radius: 5px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    overflow: hidden;
                    margin: 20px auto;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    background-color: var(--color-highlight);
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 10px;
                    background-color: var(--color-text);
                }
                .author-info {
                }
                .author {
                    font-weight: bold;
                    color: var(--color-text);
                    margin: 0;
                }
                .time {
                    font-size: 0.8em;
                    color: #666;
                    margin: 0;
                }
                .card-body {
                    display: flex;
                    flex-direction: column;
                }
                .card-image {
                    width: 100%;
                    margin:0;
                    padding:0;
                }
                .card-text {
                    margin:0px;
                    padding: 10px;
                    background-color: var(--color-highlight);
                }
                .card-footer {
                    margin:0px;
                    padding: 10px;
                    background-color: var(--color-highlight);
                }
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    flex-grow: 1;
                    padding: 0 10px;
                }
                .tag {
                    display: inline-block;
                    background-color: var(--color-background);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.8em;
                    margin-right: 5px;
                    margin-bottom: 5px;
                }
                .maps {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    background-color: var(--color-highlight);
                    gap: 10px;
                }
                .gmap {
                    width: 64px;
                    margin:0;
                    padding:0;
                }
                .position {
                    flex-grow: 1;
                    font-size: 1.2em;
                    flex-direction: row;
                    justify-content: center;
                }
                .pvalue {
                    font-weight: bold;
                    color: var(--color-text);
                }
        `

        const makePosition = (maps) => {
            const [url, position] = maps.split(',');
            const regex = /\?q=([^#\s]*)/;
            const match = position.match(regex);
            const queryPart = match ? match[1] : '';
            const [lat, lon] = queryPart.split('%2C').map(decodeURIComponent);
            const convertToDMS = (coordinate, isLatitude) => {
                const absolute = Math.abs(coordinate);
                const degrees = Math.floor(absolute);
                const minutesNotTruncated = (absolute - degrees) * 60;
                const minutes = Math.floor(minutesNotTruncated);
                const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
        
                const direction = coordinate >= 0 
                    ? (isLatitude ? 'N' : 'E') 
                    : (isLatitude ? 'S' : 'W');

                return `${degrees}°${minutes}'${seconds}" ${direction}`;
            };
        
            const latitude = convertToDMS(parseFloat(lat), true);
            const longitude = convertToDMS(parseFloat(lon), false);

            return /*html*/`
                <div class="maps"><div><a href="${position}"><img class="gmap" src="${url}"/></a></div><div class="position"><div>Latitude: <span class="pvalue">${latitude}</span></div> <div>Longitude: <span class="pvalue">${longitude}</span></div></div></div> 
            `
        }

        const imageType = (mainImage) => {
            if (tags.includes('360'))  {
                return `<photo-360-viewer main-image='${mainImage}'></photo-360-viewer>`;
            }
            return `<img src='${mainImage}' alt="" class="card-image">`;
        }
        const videoType = (mainVideo) => {
            if (tags.includes('360'))  {
                return `<video-360-viewer main-video='${mainVideo}'></photo-360-viewer>`;
            }
            return `<video-player video='${mainVideo}'></video-player>`;
        }
  
        this.shadowRoot.innerHTML = /*html*/`
            <style>${css}</style>
            <div class="card">
                <div class="card-header">
                    <img src="${avatarImage}" alt="Avatar" class="avatar">
                    <div class="author-info">
                        <p class="author">${author}</p>
                        <p class="time">${timeAgo(time)}</p>
                    </div>
                    <div class="tags">
                        ${ tags.split(',').map( e => `<span class="tag">${e}</span>`).join("") }
                    </div>
                </div>
                <div class="card-body">
                    ${ textMessage && textMessage.trim() !== "" ? `<p class="card-text">${textMessage}</p>` : ``}
                    ${ mainImage ? imageType(mainImage) : ``}
                    ${ mainVideo ? videoType(mainVideo) : ``}
                    ${ mainAudio ? `<audio-player main-audio='${mainAudio}'></audio-player>` : ``}
                    ${ mainMaps ? makePosition(mainMaps) : ``}
                </div>
            </div>
        `;
    }
  
    addEventListeners() {
    }
  
}
/* 
    //const image360 = new Image();
    //image360.src = "/assets/img/egypt360.jpg";
    //await image360.decode();

    //const img360bitmap = await createImageBitmap(image360);

var video360 =  __name(async (code, defs) => {
    const video = document.createElement("video");
    video.src = "/assets/video/redsea.mp4";
    video.loop = true;
    video.muted = true;
    await video.play();
    video.pause();
    document.addEventListener("click", () => {
      video.muted = false;
      video.paused ? video.play() : video.pause();
    });
    const spec =  __name((w, h) => {
      return {
        code,
        defs,
        uniforms: () => ({ params: { fov: 90 } }),
        textures: [
          { name: "video360", data: video }
        ]
      };
    }, "spec");
    return spec;
  }, "video360");
  
  document.addEventListener("DOMContentLoaded", async (event) => {
    const canvas = document.querySelector("#canvas");
    document.addEventListener("keypress", function(event2) {
      if (event2.key === "s") {
        let dataUrl = canvas.toDataURL("image/png");
        let link = document.createElement("a");
        link.href = dataUrl;
        link.download = "video360.png";
        link.click();
      }
    });
    const fx = "$fx" in window ? $fx : void 0;
    const code = await (await fetch("./video360.wgsl")).text();
    const defs = await (await fetch("./video360.json")).json();
    const spec = await video360(code, defs, fx);
    false;
    false;
    false;
    const anim = animate(spec, canvas, {});
    anim.start();
  });
  
*/
class Video360Viewer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const mainVideo = this.getAttribute('main-video');

        this.shadowRoot.innerHTML = /*html*/`
            <style>
                .container {
                    padding:0px;
                    margin:0px;
                    background-color: var(--color-highlight);
                    display: flex;
                    flex-direction: column;
                }
                #canvas360 {
                    padding: 0px;
                    width: 100%;
                    height: 360px;
                    margin:0px;
                }
                .hint {
                    font-size: 10px;
                    padding: 5px;
                }
            </style>
            <div class="container">
                <canvas id="canvas360"></canvas>
                <span class="hint">Click the video to play/pause</span>
            </div>
        `;
        this.canvas360 = this.shadowRoot.querySelector('#canvas360');
        const code = await (await fetch("/assets/js/video360.wgsl")).text();
        const defs = await (await fetch("/assets/js/video360.json")).json();

        const video = document.createElement("video");
        video.src = mainVideo;
        video.loop = true;
        video.muted = true;
        await video.play();
        video.pause();
        this.canvas360.addEventListener("click", () => {
            video.muted = false;
            video.paused ? video.play() : video.pause();
          });
                  
        const spec =  (w, h) => {
            return {
              code:code,
              defs:defs,
              uniforms: () => ({ params: { fov: 90 } }),
              textures: [
                { name: "video360", data: video }
              ]
            };
        };
        const anim = animate(spec, this.canvas360, {});
        anim.start();
    }

}

class Photo360Viewer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const mainImage = this.getAttribute('main-image');

        this.shadowRoot.innerHTML = /*html*/`
            <style>
                #canvas360 {
                    padding: 0px;
                    width: 100%;
                    height: 360px;
                }
            </style>
            <canvas id="canvas360"></canvas>
        `;
        this.canvas360 = this.shadowRoot.querySelector('#canvas360');
        const code = await (await fetch("/assets/js/photo360.wgsl")).text();
        const defs = await (await fetch("/assets/js/photo360.json")).json();
        const image360 = new Image();
        image360.src = mainImage;
        await image360.decode();

        const img360bitmap = await createImageBitmap(image360);
        
        const spec =  (w, h) => {
            return {
              code:code,
              defs:defs,
              uniforms: () => ({ params: { fov: 90 } }),
              textures: [
                { name: "photo360", data: img360bitmap }
              ]
            };
        };
        const anim = animate(spec, this.canvas360, {});
        anim.start();
    }

}


class AudioWaveformPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = /*html*/`
            <style>
                #container {
                    padding: 20px;
                    border-bottom-radius: 8px;
                    background-color: var(--color-highlight);
                }
                #waveform {
                    height: 64px;
                    position: relative;
                    overflow: hidden;
                }
                #waveCanvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                #progressCanvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                }
                #controls {
                    display: flex;
                    align-items: center;
                    margin-top: 10px;

                }
                #playPause {
                    background-color: var(--color-background);
                    border: none;
                    padding: 5px 5px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                }
                #timeDisplay {
                    font-size: 14px;
                    color: var(--color-base);
                }
            </style>
            <div id="container">
                <div id="waveform">
                    <canvas id="waveCanvas"></canvas>
                    <canvas id="progressCanvas"></canvas>
                </div>
                <div id="controls">
                    <button id="playPause">▶️</button>
                    <span id="timeDisplay">0:00 / 0:00</span>
                </div>
                <audio src="${this.getAttribute('main-audio')}"></audio>
            </div>
        `;

        this.audio = this.shadowRoot.querySelector('audio');
        this.waveCanvas = this.shadowRoot.querySelector('#waveCanvas');
        this.progressCanvas = this.shadowRoot.querySelector('#progressCanvas');
        this.playPauseButton = this.shadowRoot.querySelector('#playPause');
        this.timeDisplay = this.shadowRoot.querySelector('#timeDisplay');
        this.waveformContainer = this.shadowRoot.querySelector('#waveform');

        this.playPauseButton.addEventListener('click', () => this.togglePlay());
        this.waveformContainer.addEventListener('click', (e) => this.seek(e));
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.loadAudio());

        this.waveCtx = this.waveCanvas.getContext('2d');
        this.progressCtx = this.progressCanvas.getContext('2d');
    }

    async loadAudio() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await fetch(this.audio.src)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));

        this.drawWaveform(audioBuffer);
    }

    drawWaveform(audioBuffer) {
        const width = this.waveformContainer.clientWidth;
        const height = this.waveformContainer.clientHeight;
        this.waveCanvas.width = this.progressCanvas.width = width;
        this.waveCanvas.height = this.progressCanvas.height = height;

        const data = audioBuffer.getChannelData(0);
        const barCount = 140; // Number of bars
        const barWidth = width / barCount;
        const step = Math.ceil(data.length / barCount);
        const amp = height / 2;

        this.waveCtx.fillStyle = '#3498db';

        for (let i = 0; i < barCount; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            const x = i * barWidth;
            const y = (1 + min) * amp;
            const barHeight = Math.max(1, (max - min) * amp);

            this.waveCtx.fillRect(x, y, barWidth - 1, barHeight);
        }
    }
    
    updateProgress() {
        const width = this.progressCanvas.width;
        const height = this.progressCanvas.height;
        const progress = (this.audio.currentTime / this.audio.duration) * width;

        this.progressCtx.clearRect(0, 0, width, height);
        this.progressCtx.fillStyle = '#cc882244';
        this.progressCtx.fillRect(0, 0, progress, height);

        const currentTime = this.formatTime(this.audio.currentTime);
        const duration = this.formatTime(this.audio.duration);
        this.timeDisplay.textContent = `${currentTime} / ${duration}`;
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.playPauseButton.textContent = '⏸️';
        } else {
            this.audio.pause();
            this.playPauseButton.textContent = '▶️';
        }
    }

    seek(e) {
        const rect = this.waveformContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const seekTime = (x / this.waveCanvas.width) * this.audio.duration;
        this.audio.currentTime = seekTime;
    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

class VideoPlayerComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const mainVideo = this.getAttribute('video');
        this.shadowRoot.innerHTML = /*html*/`
        <style>
            #video-container {
                width: 100%;
                position: relative;
            }
            video {
                width: 100%;
                display: block;
            }
            #controls {
                display: flex;
                align-items: center;
                padding: 10px 10px;
                background-color: var(--color-highlight);
            }
            #playPause {
                background-color: var(--color-background);
                border: none;
                padding: 5px 5px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-right: 10px;
            }
            #timeDisplay {
                font-size: 14px;
                color: var(--color-base);
                padding-left: 10px;
            }

            #time-bar {
                flex-grow: 1;
                height: 5px;
                background-color: #ddd;
                cursor: pointer;
            }
            #progress {
                height: 100%;
                background-color: #3498db;
                width: 0%;
            }
        </style>
        <div id="video-container">
            <video>
            <source src="${mainVideo}" type="video/mp4">
            Your browser does not support the video tag.
            </video>
            <div id="controls">
                <button id="playPause">▶️</button>
                <div id="time-bar">
                    <div id="progress"></div>
                </div>
                <span id="timeDisplay">0:00 / 0:00</span>
            </div>
        </div>
        `;
    }

    setupEventListeners() {
        const video = this.shadowRoot.querySelector('video');
        const playPauseButton = this.shadowRoot.querySelector('#playPause');
        const timeBar = this.shadowRoot.querySelector('#time-bar');

        playPauseButton.addEventListener('click', () => this.togglePlayPause());
        video.addEventListener('timeupdate', () => this.updateProgress());
        timeBar.addEventListener('click', (e) => this.seek(e));
    }

    togglePlayPause() {
        const video = this.shadowRoot.querySelector('video');
        const playPauseButton = this.shadowRoot.querySelector('#playPause');
        
        if (video.paused) {
            video.play();
            playPauseButton.textContent = '⏸️';
        } else {
            video.pause();
            playPauseButton.textContent = '▶️';
        }
    }

    updateProgress() {
        const video = this.shadowRoot.querySelector('video');
        const progress = this.shadowRoot.querySelector('#progress');
        const timeDisplay = this.shadowRoot.querySelector('#timeDisplay');
        const value = (video.currentTime / video.duration) * 100;
        progress.style.width = value + '%';
        const currentTime = this.formatTime(video.currentTime);
        const duration = this.formatTime(video.duration);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    }
    
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    seek(event) {
        const video = this.shadowRoot.querySelector('video');
        const timeBar = this.shadowRoot.querySelector('#time-bar');
        const percent = event.offsetX / timeBar.offsetWidth;
        video.currentTime = percent * video.duration;
    }
}
  

class PostsFilterComponent extends HTMLElement {
    constructor() {
        super();
        this.tags = new Set();
        this.selectedTags = [];
        this.expanded = false;
    }

    async loadPostsIds() {
        return await (await fetch("/messages/messages.json")).json();
    }
  
    async loadPosts(ids) {
        const result = [];
        for (const post of ids) {
            const data = await (await fetch(`/messages/message-${post.id}.json`)).json();
            result.push(data);
            data.tags.forEach(tag => this.tags.add(tag));
        }
        return result;
    }

    async connectedCallback() {
        this.postsIds = await this.loadPostsIds();
        this.posts = await this.loadPosts(this.postsIds);
        this.render();
        this.addEventListeners();
    }

    render() {
        const css = /*css*/`
        tag-filter {
            display: block;
            font-family: Arial, sans-serif;
            margin-bottom: 10px;
            width: 100%;
        }
        .tag-filter-title {
            border-radius: 5px;
            background-color: var(--color-highlight);
            padding: 10px;
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            justify-items: center;
            gap: 4px;
        }
        .tag-filter-content {
            background-color: var(--color-highlight);
            padding: 10px;
            display: none;
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
        }
        .tag-filter-content.expanded {
            display: block;
        }

        .tag {
            display: inline-block;
            background-color: var(--color-background);
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8em;
            margin-right: 5px;
            margin-bottom: 5px;
            cursor: pointer;
        }

        .tag.selected {
            background-color: var(--color-contrast);
            color: var(--color-background);
        }
        .tag.invisible {
            display: none;
        }
        .a-enter-vr { display: none; }
        #video { width: 720px; height: 340px; }
        `
        const tagFilter = /*html*/`
        <style>${css}</style>
        <div class="tag-filter-title">
            <svg class="icon chevron-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <svg class="icon chevron-up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <h2 style="margin:0px;">Tag Filter</h2>    
        </div>
        <div class="tag-filter-content ${this.expanded ? 'expanded' : ''}">
            ${Array.from(this.tags) .map(tag => `<span class="tag ${ this.selectedTags.includes(tag)? 'selected' : ''}" data-tag="${tag}">${tag}</span>`).join('')}
        </div>`

        const video360 = /*html*/`<video-360 src="/media/signal/attachments/yaBmmR16gITlcquYQgD6.mp4"></video-360>`;

        const videoaframe = /*html*/`
        <a-scene>
            <a-assets>
                <video id="video" src="/media/signal/attachments/yaBmmR16gITlcquYQgD6.mp4" crossorigin="anonymous"></video>
            </a-assets>
            <a-videosphere id="videosphere" src="#video" rotation="0 180 0"></a-videosphere>
            <a-camera id="camera" fov="60" look-controls="reverseMouseDrag: true"></a-camera>
        </a-scene>
        <button id="enterVR">Play</button>
        `;

        const innerHTML = this.posts.map(post => {
                return /*html*/`
                <os-post
                    author="${post.author}"
                    time="${post.time}"
                    tags="${post.tags.map(tag => tag).join(',')}"
                    ${post.avatar ? `avatar-image="${post.avatar}"` : ''}
                    ${post.image ? `main-image="${post.image}"` : ''}
                    ${post.video ? `main-video="${post.video}"` : ''}	
                    ${post.audio ? `main-audio="${post.audio}"` : ''}	
                    ${post.maps ? `main-position="${post.maps[0]},${post.maps[1]}"` : ''}
                    ${post.message ? `text-message="${post.message}"` : ''}	
                ></os-post>
            `;
        }).join('');

        this.innerHTML = tagFilter + innerHTML;
        
        
    }

    addEventListeners() {
        const title = this.querySelector('.tag-filter-title');
        const content = this.querySelector('.tag-filter-content');
        const tags = this.querySelectorAll('.tag');


        title.addEventListener('click', () => {
            this.expanded = !this.expanded;
            content.classList.toggle('expanded');
            this.updateIcon();
        });

        tags.forEach(tag => {
            tag.addEventListener('click', async () => {
                const tagName = tag.getAttribute('data-tag');
                if (this.selectedTags.includes(tagName)) {
                    this.selectedTags = this.selectedTags.filter(t => t !== tagName);
                    tag.classList.remove('selected');
                } else {
                    this.selectedTags.push(tagName);
                    tag.classList.add('selected');
                }
                this.tags.clear();
                const pids = [];
                console.log(this.selectedTags);
                this.postsIds.forEach(post => {
                    if (this.selectedTags.every(tag => post.tags.includes(tag))) {
                        post.tags.forEach(tag => this.tags.add(tag));
                        pids.push(post);
                    }
                });
                this.posts = await this.loadPosts(pids);
                this.render();
                this.dispatchEvent(new CustomEvent('tagsChanged', { detail: this.selectedTags }));
                this.addEventListeners();
            });
        });
    }
    
    updateIcon() {
        const chevronDown = this.querySelector('.chevron-down');
        const chevronUp = this.querySelector('.chevron-up');
        if (this.expanded) {
            chevronDown.style.display = 'none';
            chevronUp.style.display = 'inline-block';
        } else {
            chevronDown.style.display = 'inline-block';
            chevronUp.style.display = 'none';
        }
    }

}

// Example usage
/*
const tagFilter = document.querySelector('tag-filter');
tagFilter.addEventListener('tagsChanged', (event) => {
    console.log('Selected tags:', event.detail);
});
*/

customElements.define('video-360-viewer', Video360Viewer);
customElements.define('photo-360-viewer', Photo360Viewer);
customElements.define('os-post', PostComponent);
customElements.define('os-posts', PostsFilterComponent);
customElements.define('video-player', VideoPlayerComponent);
customElements.define('audio-player', AudioWaveformPlayer);


