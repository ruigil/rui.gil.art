class CardPhotoTextComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
        this.render();
        this.addEventListeners();
        this.loadIcons();
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
        const textMessage = this.getAttribute('text-message') || "";
        const avatarImage = this.getAttribute('avatar-image') || "/assets/img/user.svg";
        const author = this.getAttribute('author') || "John Doe";
        const time = this.getAttribute('time') || "000000";
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
                    flex-grow: 1;
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
                .tags-and-comments {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                }
                .tag {
                    display: inline-block;
                    background-color: var(--color-base-inv);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.8em;
                    margin-right: 5px;
                    margin-bottom: 5px;
                }
                .comment-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                .comment-button svg {
                    width: 24px;
                    height: 24px;
                }
                .comments-section {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    background-color: var(--color-highlight);
                }
                .comments-section.expanded {
                    max-height: 500px;
                }
                .comment {
                    padding: 10px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .comment:last-child {
                    border-bottom: none;
                }
        `
  
        this.shadowRoot.innerHTML = /*html*/`
            <style>${css}</style>
            <div class="card">
                <div class="card-header">
                    <img src="${avatarImage}" alt="Avatar" class="avatar">
                    <div class="author-info">
                        <p class="author">${author}</p>
                        <p class="time">${time}</p>
                    </div>
                </div>
                <div class="card-body">
                    ${ mainImage ? `<img src='${mainImage}' alt="Card image" class="card-image">` : ``}
                    <p class="card-text">${textMessage}</p>
                    <div class="card-footer">
                        <div class="tags-and-comments">
                            <div class="tags">
                            ${ tags.split(',').map( e => `<span class="tag">${e}</span>`).join("") }
                            </div>
                            <button class="comment-button" aria-label="Toggle comments">
                                <i data-feather="message-square"></i>
                            </button>
                        </div>
                    </div>
                <div class="comments-section">
                    <div class="comment">
                        <p><strong>Alice:</strong> Great component! I love the design.</p>
                    </div>
                    <div class="comment">
                        <p><strong>Bob:</strong> How can I customize the colors?</p>
                    </div>
                    <div class="comment">
                        <p><strong>Charlie:</strong> This is exactly what I was looking for. Thanks!</p>
                    </div>
                </div>
                </div>
            </div>
        `;
    }
  
    addEventListeners() {
        const commentButton = this.shadowRoot.querySelector('.comment-button');
        const commentsSection = this.shadowRoot.querySelector('.comments-section');
  
        commentButton.addEventListener('click', () => {
            commentsSection.classList.toggle('expanded');
        });
    }
  
    loadIcons() {
        // This is a workaround to use Feather Icons within the shadow DOM
        const iconElement = this.shadowRoot.querySelector('i[data-feather]');
        const svgContent = feather.icons['message-square'].toSvg();
        iconElement.outerHTML = svgContent;
    }
}

class StreamComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
  
    async loadPosts() {
        const result = [];
        const stream = await (await fetch("/messages/messages.json")).json();
        for (const post of stream) {
            const data = await (await fetch(`/messages/message-${post.id}.json`)).json();
            result.push(data);
        }
        return result;
    }

    async connectedCallback() {
        this.posts = await this.loadPosts();
        this.render();
    }

    render() {
        console.log(this.posts);

        const innerHTML = this.posts.map(post => {
            return /*html*/`
                <card-photo
                    author="${post.author}"
                    time="${post.time}"
                    tags="${post.tags.map(tag => tag).join(',')}"
                    ${post.image ? `main-image="${post.image}"` : ''}
                    ${post.message ? `text-message="${post.message}"` : ''}	
                ></card-photo>
            `;
        }).join('');

        console.log(innerHTML)

        this.shadowRoot.innerHTML = innerHTML;
        
        
    }
}

class TagFilter extends HTMLElement {
    constructor() {
        super();
        this.tags = ['JavaScript', 'HTML', 'CSS', 'React', 'Vue', 'Angular', 'Node.js', 'Python'];
        this.selectedTags = [];
        this.expanded = false;
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="tag-filter-title">
                <svg class="icon chevron-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <svg class="icon chevron-up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <h2 style="margin:0px;">Tag Filter</h2>    
            </div>
            <div class="tag-filter-content">
                ${this.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
            </div>
        `;
        feather.replace();
    }

    addEventListeners() {
        this.iconElement = this.querySelector('.tag-filter-title-icon');
        const title = this.querySelector('.tag-filter-title');
        const content = this.querySelector('.tag-filter-content');
        const tags = this.querySelectorAll('.tag');

        title.addEventListener('click', () => {
            this.expanded = !this.expanded;
            content.classList.toggle('expanded');
            this.updateIcon();
        });

        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                const tagName = tag.getAttribute('data-tag');
                if (this.selectedTags.includes(tagName)) {
                    this.selectedTags = this.selectedTags.filter(t => t !== tagName);
                    tag.classList.remove('selected');
                } else {
                    this.selectedTags.push(tagName);
                    tag.classList.add('selected');
                }
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
const tagFilter = document.querySelector('tag-filter');
tagFilter.addEventListener('tagsChanged', (event) => {
    console.log('Selected tags:', event.detail);
});


customElements.define('tag-filter', TagFilter);
customElements.define('card-photo', CardPhotoTextComponent);
customElements.define('os-stream', StreamComponent);

