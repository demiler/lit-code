import { html, LitElement } from 'lit';
import './lit-code.mjs';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import style from './web-site.css';
import * as codeSample from './codeSample.mjs';
import logo from './imgs/logo.svg';
import ghLogo from  './imgs/github_corner.svg';
import sun from './imgs/sun.svg';
import moon from './imgs/moon.svg';

const languages = ['clike', 'css', 'html', 'js' ];

class WebSite extends LitElement {
  static styles = [ style ];
  static properties = {
    curLang: { type: String },
    showDropdown: { type: Boolean },
    theme: { type: String },
  };

  constructor() {
    super();
    this.curLang = 'js';
    this.showDropdown = false;
    this.samples = {};
    Object.assign(this.samples, codeSample);

    this.theme =
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : 'white';
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('theme', this.theme);
  }

  firstUpdated() {
    this.shadowRoot.getElementById('editor').setCode(this.samples[this.curLang]);
  }

  render() {
    return html`
      <a id="corner" href="https://github.com/demiler/lit-code">
        ${unsafeHTML(ghLogo)}
      </a>
      <div id="theme" @click=${this.toggleTheme}>
        ${unsafeHTML(this.theme === 'dark' ? moon : sun)}
      </div>

      <div id="header">
        <div id="logo">${unsafeHTML(logo)}</div>
        <div>
          <div id="title">lit-code</div>
          <div id="desc">Simple and small web-component code editor</div>
        </div>
      </div>

      <div id="editor-wrap">
        <div id="language" @click=${this.changeLanguage}>
          ${this.curLang}
        </div>

        <lit-code
          id="editor"
          @update=${this.updateSamples}
          .language=${this.curLang}
          linenumbers
        ></lit-code>
      </div>

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

  toggleTheme() {
    this.theme = (this.theme === 'dark') ? 'white' : 'dark';
    this.setAttribute('theme', this.theme);
  }

  updateSamples({ detail: code }) {
    this.samples[this.curLang] = code;
  }

  changeLanguage(e) {
    let index = languages.indexOf(this.curLang);
    if (e.shiftKey)
      index = (index > 0) ? index - 1 : languages.length - 1;
    else
      index = (index + 1 < languages.length) ? index + 1 : 0;
    this.curLang = languages[index];
    this.shadowRoot.getElementById('editor').setCode(this.samples[this.curLang]);
  }
};

customElements.define('web-site', WebSite);
