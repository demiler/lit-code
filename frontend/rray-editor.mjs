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
    indent:      { type: String },
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
    this.indent = '  ';

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
            ${(this.code.match(/\r?\n/g) || []).map((_, i) => html`
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

  createRenderRoot() {
    return !this.shadowDom ? super.createRenderRoot() : this;
  }

  setCursor(pos) {
    if (!this.elTextarea) return;
    this.elTextarea.setSelectionRange(pos, pos);
  }

  setSelect(from, to) {
    if (!this.elTextarea) return;
    this.elTextarea.setSelectionRange(from, to);
  }

  getCurrentLineIndent() {
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;

    const indentStart = this.code.lastIndexOf('\n', selStart - 1) + 1;
    const spaces = (()=>{
      let pos = indentStart;
      while (this.code[pos] === ' ' && pos < selEnd) pos++;
      return pos - indentStart;
    })();
    return ' '.repeat(spaces);
  }

  updateTextarea() {
    if (!this.elTextarea) return;
    this.elTextarea.value = this.code;
  }

  insertCode(pos, text, placeCursor = true) {
    this.code =
      this.code.substring(0, pos) + text + this.code.substring(pos)
    this.updateTextarea();
    if (placeCursor) this.setCursor(pos + text.length);
  }

  handleKeys(e) {
    switch (e.code) {
      case 'Tab':       this.handleTabs(e);      break;
      case 'Enter':     this.handleNewLine(e);   break;
      case 'Backspace': this.handleBackspace(e); break;
    }
    if (this.opening.includes(e.key))
      this.handleAutoClose(e);
    else if (this.closing.includes(e.key))
      this.handleAutoSkip(e);
  }

  handleInput({ target }) {
    this.code = target.value;
  }

  handleTabs(e) {
    e.preventDefault();
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;

    if (selStart !== selEnd) { //multiline indent
      const selLineStart = this.code.lastIndexOf('\n', selStart - 1);
      const selLineEnd = this.code.indexOf('\n', selEnd);

      let linesInChunk = 0;
      let codeChunk = this.code.substring(selLineStart, selLineEnd);
      let lenShift = this.indent.length;

      if (e.shiftKey) { //Unindent
        lenShift = -lenShift;
        linesInChunk = (codeChunk.match(new RegExp('\n' + this.indent, 'g')) || []).length;
        codeChunk = codeChunk.replaceAll('\n' + this.indent, '\n');
      }
      else { //Indent
        linesInChunk = (codeChunk.match(/\n/g) || []).length;
        codeChunk = codeChunk.replaceAll('\n', '\n' + this.indent);
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
      this.insertCode(selStart, this.indent, true);
    }
  }

  handleBackspace(e) {
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;
    if (e.ctrlKey || selStart !== selEnd) return;

    e.preventDefault();
    const chunkStart = selStart - this.indent.length;
    const chunkEnd = selStart;
    const chunk = this.code.substring(chunkStart, chunkEnd);

    if (chunk === this.indent) {
      this.code = this.code.substring(0, chunkStart) + this.code.substring(chunkEnd);
      this.updateTextarea();
      this.setCursor(chunkStart);
    }
    else {
      this.code = this.code.substring(0, selStart - 1) + this.code.substring(selStart);
      this.updateTextarea();
      this.setCursor(selStart - 1);
    }
  }

  handleAutoClose(e) {
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;
    if (this.code[selStart] === '\'' || this.code[selStart] === '"') {
      return this.handleAutoSkip(e);
    }
    e.preventDefault();

    if (selStart === selEnd) {
      const opening = e.key;
      const closing = this.closing[this.opening.indexOf(opening)];

      if (opening === '{'
        && (this.code[selStart] === '\n' || this.code.length === selStart)
      ) {
        const lineShift = '\n' + this.getCurrentLineIndent();
        this.insertCode(selStart, opening + lineShift + this.indent + lineShift + closing);
        this.setCursor(selStart + lineShift.length + this.indent.length + 1);
      }
      else {
        this.insertCode(selStart, opening + closing);
        this.setCursor(selStart + 1);
      }
    }
  }

  handleAutoSkip(e) {
    const selStart = this.elTextarea.selectionStart;

    if (this.code[selStart] === e.key) {
      e.preventDefault();
      this.setCursor(selStart + 1);
    }
  }

  handleNewLine(e) {
    e.preventDefault();
    this.insertCode(this.elTextarea.selectionStart, '\n' + this.getCurrentLineIndent());
  }
}

customElements.define('rray-code', RrayCode);
