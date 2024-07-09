class CardPhotoComponent extends HTMLElement {
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
      return ['main-image', 'avatar-image'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      if (this.shadowRoot) {
          if (name === 'main-image') {
              this.shadowRoot.querySelector('.card-image').src = newValue;
          } else if (name === 'avatar-image') {
              this.shadowRoot.querySelector('.avatar').src = newValue;
          }
      }
    }
  
    render() {
        const mainImage = this.getAttribute('main-image') || '/api/placeholder/300/200';
        const avatarImage = this.getAttribute('avatar-image') || "/assets/img/user.svg";
  
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
                        <p class="author">John Doe</p>
                        <p class="time">2 hours ago</p>
                    </div>
                </div>
                <div class="card-body">
                    <img src="${mainImage}" alt="Card image" class="card-image">
                    <p class="card-text">This is a great photo I took in Europe last summer. I hope you like it!</p>
                    <div class="card-footer">
                        <div class="tags-and-comments">
                            <div class="tags">
                                <span class="tag">Web</span>
                                <span class="tag">Component</span>
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
  
    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = /*html*/`
            <card-photo
                main-image="/media/Europe/europe.jpg"
            ></card-photo>
            <card-photo
                main-image="/media/Europe/russia.jpg"
            ></card-photo>
    `;
    }
}

customElements.define('card-photo', CardPhotoComponent);
customElements.define('os-stream', StreamComponent);

