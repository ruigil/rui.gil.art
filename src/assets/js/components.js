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

class CardPhotoTextComponent extends HTMLElement {
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
        const textMessage = this.getAttribute('text-message');
        const avatarImage = this.getAttribute('avatar-image') || "/assets/img/user.svg";
        const author = this.getAttribute('author') || "John Doe";
        const time = this.getAttribute('time') || "0";
        const tags = this.getAttribute('tags') || "";
  
        const css = /*css*/`
                :host {
                    display: block;
                    font-family: Arial, sans-serif;
                }
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
        `
  
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
                    ${ textMessage ? `<p class="card-text">${textMessage}</p>` : ``}
                    ${ mainImage ? `<img src='${mainImage}' alt="Card image" class="card-image">` : ``}
                </div>
            </div>
        `;
    }
  
    addEventListeners() {
    }
  
}

class PostsComponent extends HTMLElement {
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

        const innerHTML = this.posts.map(post => {
            return /*html*/`
                <card-photo
                    author="${post.author}"
                    time="${post.time}"
                    tags="${post.tags.map(tag => tag).join(',')}"
                    ${post.avatar ? `avatar-image="${post.avatar}"` : ''}
                    ${post.image ? `main-image="${post.image}"` : ''}
                    ${post.message ? `text-message="${post.message}"` : ''}	
                ></card-photo>
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
                this.addEventListeners();
                this.dispatchEvent(new CustomEvent('tagsChanged', { detail: this.selectedTags }));
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


customElements.define('card-photo', CardPhotoTextComponent);
customElements.define('os-posts', PostsComponent);

