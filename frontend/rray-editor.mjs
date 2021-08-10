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
import style from './rray-editor.css';
import './prism-lite.mjs';
import { codeSample } from './codeSample.mjs';

window.pr = Prism;

class RrayCode extends LitElement {
  static styles = [ style ];
  static properties = {
    code:        { type: String },
    grammar:     { type: Object },
    language:    { type: String },
    shadowdom:   { attribute: true },
    linenumbers: { attribute: true },
  };

  get shadowDom() { return this.hasAttribute('shadowdom'); }

  constructor() {
    super();
    this.opening = [ '(', '{', '[', '<', '\'', '"' ];
    this.closing = [ ')', '}', ']', '>', '\'', '"' ];

    this.code = codeSample.slice(503, 857);

    this.language = 'c';
    this.grammar = Prism.languages[this.language];

    this.history = [];
  }

  update(params) {
    super.update(params);
    if (params.has('language')) {
      this.grammar = Prism.languages[this.language.toLowerCase()];
    }
  }

  _getElement(id) {
    return this.shadowDom
      ? this.querySelector(`.rraycode_${id}`)
      : this.shadowRoot.querySelector(`.rraycode_${id}`);
  }

  firstUpdated() {
    this.elTextarea = this._getElement('textarea');
    this.elEditor = this._getElement('rraycode');
    this.updateTextarea();
  }

  render() {
    return html`
      ${!this.shadowDom ? html`` : html`<style>${style.cssText}</style>`}

      <div class="rraycode rraycode_rraycode">
        ${!this.hasAttribute('linenumbers') ? html`` : html`
          <div class="rraycode_linenumbers">
            <div class="rraycode_line">1</div>
            ${this.code.match(/\r?\n/g).map((_, i) => html`
              <div class="rraycode_line">${i + 2}</div>
            `)}
          </div>
        `}

        <textarea class="rraycode_textarea"
                  spellcheck=false
                  @keydown=${this.handleKeys}
                  @input=${this.handleInput}
        ></textarea>

        <code class="rraycode_highlight"><pre>
          ${Prism.tokenize(this.code, this.grammar).map(function htmlize(el) {
            if (typeof el === 'string') return html`${el}`;

            return html`<span class="token ${el.type} ${el.alias}">${
              Array.isArray(el.content)
                  ? el.content.map(htmlize)
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
    this.elTextarea.setSelectionRange(pos, pos);
  }

  setSelect(from, to) {
    if (!this.elTextarea) return;
    this.elTextarea.setSelectionRange(from, to);
  }

  insertCode(pos, text, placeCursor = true) {
    this.code =
      this.code.substring(0, pos) + text + this.code.substring(pos)
    this.updateTextarea();
    if (placeCursor) this.setCursor(pos + text.length);
  }

  handleKeys(e) {
    switch (e.code) {
      case 'Tab':   this.handleTabs(e);    break;
      case 'Enter': this.handleNewLine(e); break;
    }
    if (this.closing.includes(e.key) || this.closing.includes(e.key))
      this.handleAutoClose(e);
  }

  handleInput({ target }) {
    this.code = target.value;
  }

  createRenderRoot() {
    return !this.shadowDom ? super.createRenderRoot() : this;
  }

  handleTabs(e) {
    e.preventDefault();
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;
    const indent = '  ';

    if (selStart !== selEnd) { //multiline indent
      const selLineStart = this.code.lastIndexOf('\n', selStart - 1);
      const selLineEnd = this.code.indexOf('\n', selEnd);

      let linesInChunk = 0;
      let codeChunk = this.code.substring(selLineStart, selLineEnd);
      let lenShift = indent.length;

      if (e.shiftKey) { //Unindent
        lenShift = -lenShift;
        linesInChunk = (codeChunk.match(new RegExp('\n' + indent, 'g')) || []).length;
        codeChunk = codeChunk.replaceAll('\n' + indent, '\n');
      }
      else { //Indent
        linesInChunk = (codeChunk.match(/\n/g) || []).length;
        codeChunk = codeChunk.replaceAll('\n', '\n' + indent);
      }

      this.code =
        this.code.substring(0, selLineStart) +
        codeChunk +
        this.code.substring(selLineEnd);
      this.updateTextarea();

      const newStart = Math.max(selLineStart + 1, selStart + lenShift);
      const newEnd = selEnd + linesInChunk * lenShift;
      this.setSelect(newStart, newEnd);
    }
    else {
      this.insertCode(selStart, indent, true);
    }
  }

  handleAutoClose({ key }) {

  }

  handleNewLine(e) {
    e.preventDefault();
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;

    const indentStart = this.code.lastIndexOf('\n', selStart - 1) + 1;
    const spaces = (()=>{
      let pos = indentStart;
      while (this.code[pos] === ' ' && pos < selEnd) pos++;
      return pos - indentStart;
    })();

    this.insertCode(selStart, '\n' + ' '.repeat(spaces));
  }
}

customElements.define('rray-code', RrayCode);
