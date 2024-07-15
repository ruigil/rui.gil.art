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
            console.log(queryPart);
            const [lat, lon] = queryPart.split('%2C').map(decodeURIComponent);
            console.log(lat, lon);
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
                    ${ mainImage ? `<img src='${mainImage}' alt="Card image" class="card-image">` : ``}
                    ${ mainVideo ? `<video-player video='${mainVideo}'></video-player>` : ``}
                    ${ mainAudio ? `<audio-player main-audio='${mainAudio}'></audio-player>` : ``}
                    ${ mainMaps ? makePosition(mainMaps) : ``}
                </div>
            </div>
        `;
    }
  
    addEventListeners() {
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
            }
            #play-pause {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                margin-right: 10px;
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
            <button id="play-pause">▶️</button>
            <div id="time-bar">
                <div id="progress"></div>
            </div>
            </div>
        </div>
        `;
    }

    setupEventListeners() {
        const video = this.shadowRoot.querySelector('video');
        const playPauseButton = this.shadowRoot.querySelector('#play-pause');
        const timeBar = this.shadowRoot.querySelector('#time-bar');

        playPauseButton.addEventListener('click', () => this.togglePlayPause());
        video.addEventListener('timeupdate', () => this.updateProgress());
        timeBar.addEventListener('click', (e) => this.seek(e));
    }

    togglePlayPause() {
        const video = this.shadowRoot.querySelector('video');
        const playPauseButton = this.shadowRoot.querySelector('#play-pause');
        
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
        const value = (video.currentTime / video.duration) * 100;
        progress.style.width = value + '%';
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
class Video360 extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; height: 100%; position: relative; }
                canvas { width: 720px; height: 340px; }
                button {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                }
            </style>
            <canvas width="1440px" height="720px"></canvas>
            <button id="playButton">Play</button>
        `;

        this.canvas = this.shadowRoot.querySelector('canvas');
        this.playButton = this.shadowRoot.getElementById('playButton');
        this.video = document.createElement('video');
        this.video.crossOrigin = 'anonymous';
        this.video.style.display = 'none';

        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lon = 0;
        this.lat = 0;
        this.fov = 50;

        this.bindedRender = this.render.bind(this);
        this.bindedHandleMouseDown = this.handleMouseDown.bind(this);
        this.bindedHandleMouseUp = this.handleMouseUp.bind(this);
        this.bindedHandleMouseMove = this.handleMouseMove.bind(this);
        this.bindedHandlePlayClick = this.handlePlayClick.bind(this);
    }

    connectedCallback() {
        this.video.src = this.getAttribute('src');
        this.video.addEventListener('loadedmetadata', this.initWebGL.bind(this));

        this.canvas.addEventListener('mousedown', this.bindedHandleMouseDown);
        this.canvas.addEventListener('mouseup', this.bindedHandleMouseUp);
        this.canvas.addEventListener('mousemove', this.bindedHandleMouseMove);
        this.playButton.addEventListener('click', this.bindedHandlePlayClick);
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    disconnectedCallback() {
        this.canvas.removeEventListener('mousedown', this.bindedHandleMouseDown);
        this.canvas.removeEventListener('mouseup', this.bindedHandleMouseUp);
        this.canvas.removeEventListener('mousemove', this.bindedHandleMouseMove);
        this.playButton.removeEventListener('click', this.bindedHandlePlayClick);
        window.removeEventListener('resize', this.handleResize);
    }

    initWebGL() {
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position, 0, 1);
                v_texCoord = a_position * 0.5 + 0.5;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform sampler2D u_texture;
            uniform float u_fov;
            uniform float u_aspectRatio;
            uniform vec2 u_rotation;
            varying vec2 v_texCoord;

            const float PI = 3.1415926535897932384626433832795;

            void main() {
                float latitude = (v_texCoord.y - 0.5) * u_fov;
                float longitude = (v_texCoord.x - 0.5) * u_fov * u_aspectRatio;
                
                vec3 dir = vec3(
                    cos(latitude) * sin(longitude),
                    sin(latitude),
                    cos(latitude) * cos(longitude)
                );
                
                float latitude_rot = u_rotation.y;
                float longitude_rot = u_rotation.x;
                vec3 dir_rotated = vec3(
                    dir.x * cos(longitude_rot) - dir.z * sin(longitude_rot),
                    dir.y * cos(latitude_rot) + dir.x * sin(latitude_rot) * sin(longitude_rot) + dir.z * sin(latitude_rot) * cos(longitude_rot),
                    -dir.x * sin(longitude_rot) * cos(latitude_rot) + dir.y * sin(latitude_rot) + dir.z * cos(latitude_rot) * cos(longitude_rot)
                );
                
                float u = 0.5 + atan(dir_rotated.x, -dir_rotated.z) / (2.0 * PI);
                float v = 0.5 - asin(dir_rotated.y) / PI;
                
                gl_FragColor = texture2D(u_texture, vec2(u, v));
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.createProgram(vertexShader, fragmentShader);

        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.fovLocation = this.gl.getUniformLocation(this.program, 'u_fov');
        this.aspectRatioLocation = this.gl.getUniformLocation(this.program, 'u_aspectRatio');
        this.rotationLocation = this.gl.getUniformLocation(this.program, 'u_rotation');

        this.handleResize();
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    handleResize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    handlePlayClick() {
        this.video.play()
            .then(() => {
                this.playButton.style.display = 'none';
                this.render();
            })
            .catch(error => {
                console.error('Error attempting to play video: ', error);
            });
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.video);

        this.gl.useProgram(this.program);
        
        const aspectRatio = this.gl.canvas.width / this.gl.canvas.height;
        const fovRad = this.fov * Math.PI / 180;
        
        this.gl.uniform1f(this.fovLocation, fovRad);
        this.gl.uniform1f(this.aspectRatioLocation, aspectRatio);
        this.gl.uniform2f(this.rotationLocation, this.lon * Math.PI / 180, this.lat * Math.PI / 180);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(this.bindedRender);
    }

    handleMouseDown(e) {
        this.isMouseDown = true;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    handleMouseUp() {
        this.isMouseDown = false;
    }

    handleMouseMove(e) {
        if (this.isMouseDown) {
            const dx = e.clientX - this.mouseX;
            const dy = e.clientY - this.mouseY;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.lon += dx * 0.1;
            this.lat += dy * 0.1;
            
            // Wrap around vertically
            if (this.lat > 90) {
                this.lat = 180 - this.lat;
                this.lon += 180;
            } else if (this.lat < -90) {
                this.lat = -180 - this.lat;
                this.lon += 180;
            }
            
            // Wrap around horizontally
            this.lon = ((this.lon % 360) + 360) % 360;
        }
    }
}

customElements.define('video-360', Video360);
customElements.define('os-post', PostComponent);
customElements.define('os-posts', PostsFilterComponent);
customElements.define('video-player', VideoPlayerComponent);
customElements.define('audio-player', AudioWaveformPlayer);


