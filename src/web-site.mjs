import { html, LitElement } from 'lit';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import style from './web-site.css';
import './rray-code.mjs';
import logo from '../logo.svg';
import ghLogo from  '../github.svg';

const languages = ['atom', 'clike', 'css', 'html', 'js', 'markup', 'mathml', 'rss',
  'ssml', 'svg', 'xml' ];

class WebSite extends LitElement {
  static styles = [ style ];
  static properties = {
    curLang: { type: String },
    showDropdown: { type: Boolean },
  };

  constructor() {
    super();
    this.curLang = 'js';
    this.showDropdown = false;
  }

  render() {
    return html`
      <a id="corner" href="https://github.com/demiler">
        <span id="ghlogo">${unsafeHTML(ghLogo)}</span>
      </a>
      <div id="header">
        <div id="logo">${unsafeHTML(logo)}</div>
        <div id="title">lit-code</div>
      </div>

      <div id="language-select">
        <div id="current" @click=${this.toggleDropdown}>
          <span>Selected language:</span>
          <span>${this.curLang} ▼</span>
        </div>
        <div id="list" @mouseout=${this.hideDropdown} ?hidden=${!this.showDropdown}>
          ${languages.map(lang => html`
            <span class='lang' data-lang=${lang} @click=${this.chooseLang}>${lang}</span>
          `)}
        </div>
      </div>

      <rray-code
        id="editor"
        .language=${this.curLang}
        linenumbers
      ></rray-code>

      <hr>

      <div id="cards">
        <div class='card'>Great for small code preview</div>
        <div class='card'>Flexible highlight with Prism.js</div>
        <div class='card'>Build as modern web component</div>
        <div class='card'>Extremely small if you already usign lit</div>
        <div class='card'>Supports auto brackets and quotes closing</div>
        <div class='card'>Keeps your last line indent</div>
        <div class='card'>Inserts indent on new code block</div>
        <div class='card'>Easy to style</div>
      </div>
    `;
  }

  hideDropdown(e) {
    const parent = e.currentTarget;
    const element = e.toElement || e.relatedTarget;
    const isChild = parent.contains(element);

    if (!isChild) this.showDropdown = false;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  chooseLang(e) {
    this.showDropdown = false;
    this.curLang = e.target.dataset.lang;
  }
};

customElements.define('web-site', WebSite);
