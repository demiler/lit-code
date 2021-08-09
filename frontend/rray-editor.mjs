/**
 * Experimental editor on web components
 * @module components/rray-editor
 * @param { attribute } shadowdom Removes shadow dom from web component
 * @param { attribute } linenumber Adds linenumber
 * @param { string } [code] Code inside of editor
 * @param { string } [language='clike'] Used lanaguage
 * @param { object } [grammar] Prism language object
 */

import { html, LitElement } from 'lit';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import style from './rray-editor.css';
import './prism-lite.mjs';
import { codeSample } from './codeSample.mjs';

window.pr = Prism;

class RrayCode extends LitElement {
  static styles = [ style ];
  static properties = {
    code: { type: String },
    grammar: { type: Object },
    language: { type: String },
    linenumbers: { attribute: true },
    shadowdom: { attribute: true },
  };

  get shadowDom() { return this.hasAttribute('shadowdom'); }

  constructor() {
    super();
    this.lastPos = 0;
    this.closing = [ ']', ')', '}', '\'', '"', '`' ];
    this.openPair = { '[': ']', '(': ')', '{': '}', '\'': '\'', '"': '"', '`': '`' };

    this.code = codeSample.slice(0, 5000);

    this.language = 'clike';
    this.grammar = Prism.languages[this.language];
  }

  update(params) {
    super.update(params);
    if (params.has('language')) {
      this.grammar = Prism.languages[this.language.toLowerCase()];
    }
  }

  _countLines(str) {
    return (str.match(/\r?\n/g) || []);
  }

  _stringInsert(str, ins, pos) {
    return str.substring(0, pos) + ins + str.substring(pos);
  }

  _getElement(id) {
    return !this.shadowDom ?
      this.shadowRoot.querySelector(`.rraycode_${id}`)
      : this.querySelector(`.rraycode_${id}`);
  }

  _cssGetProp(property, removePX = false) {
    const value = this.composedStyles.getPropertyValue(property);
    return removePX ? Number(value.replace('px', '')) : value;
  }

  firstUpdated() {
    this.composedStyles = getComputedStyle(this);

    this.elTextarea = this._getElement('textarea');
    this.elEditor = this._getElement('rraycode');

    this.lineHeight = this._cssGetProp('line-height', true);
    this.height = this._cssGetProp('height', true);
    this.updateTextarea();
  }


  renderLines() {
    if (!this.hasAttribute('linenumbers')) return;

    return html`
      <div class="rraycode_linenumbers">
        <div class="rraycode_line">1</div>
        ${this._countLines(this.code).map((_, i) => html`
          <div class="rraycode_line">${i + 2}</div>
        `)}
      </div>
    `;
  }

  render() {
    return html`
      ${!this.shadowDom ? html`` : html`<style>${style.cssText}</style>`}

      <div class="rraycode rraycode_rraycode">
        ${this.renderLines()}
        <textarea class="rraycode_textarea"
                  spellcheck=false
                  @mouseup=${this.handleClick}
                  @keydown=${this.handleKeys}
                  @input=${this.handleInput}
                  @scroll=${this.handleScroll}
        ></textarea>
        <code class="rraycode_highlight"><pre>
          ${Prism.tokenize(this.code, this.grammar).map(function untokenize(el) {
            if (typeof el === 'string') return html`${el}`;

            return html`<span class="token ${el.type} ${el.alias}">${
              Array.isArray(el.content)
                  ? el.content.map(untokenize)
                  : html`${el.content}`
              }</span>`;
          })}
        </pre></code>
      </div>
    `;
  }

  updateTextarea() {
    if (!this.elTextarea) return;
    this.elTextarea.value = this.code;
  }

  setCursor(pos) {
    if (!this.elTextarea) return;
    this.lastPos = pos;
    this.elTextarea.setSelectionRange(pos, pos);
  }

  handleKeys(e) {
    const pos = this.elTextarea.selectionStart;

    switch (e.which) {
      case 9: //tab
        e.preventDefault();
        this.code = this._stringInsert(this.code, '  ', pos);
        this.updateTextarea();
        this.setCursor(pos + 2);
        return;
    }

    const { key } = e;

    if (this.closing.includes(key) && this.code[pos] === key) {
      e.preventDefault();
      this.setCursor(pos + 1);
    }
    else if (this.openPair[key] && this.code[pos - 1] !== '\\') {
      this.code = this._stringInsert(this.code, this.openPair[key], pos);
      this.updateTextarea();
      this.setCursor(pos);
    }

  }

  handleInput({ target }) {
    this.code = target.value;
  }

  handleScroll(e) {

  }

  createRenderRoot() {
    return !this.shadowDom ? super.createRenderRoot() : this;
  }
}

customElements.define('rray-code', RrayCode);
