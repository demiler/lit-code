/**
 * Experimental editor on web components
 * @module components/lit-editor
 * @param { attribute } noshadow Removes shadow dom from web component
 * @param { attribute } linenumber Adds linenumber
 * @param { attribute } mycolors Disable included highlight colors for prism
 * @param { string } [code] Code inside of editor
 * @param { string } [language='clike'] Used lanaguage
 * @param { object } [grammar] Prism language object
 */

import { html, LitElement } from 'lit';
import style from './lit-code.css';
import 'prismjs';

const IS_PRISM = (typeof Prism !== "undefined");
console.log(IS_PRISM);

function htmlize(el) {
  if (typeof el === 'string') return html`${el}`;

  return html`<span class="token ${el.type} ${el.alias}">${
    Array.isArray(el.content)
        ? el.content.map(htmlize)
        : html`${el.content}`
    }</span>`;
}

class RrayCode extends LitElement {
  static styles = [ style ];
  static properties = {
    code:        { type: String },
    grammar:     { type: Object },
    language:    { type: String },
    noshadow:   { attribute: true },
    linenumbers: { attribute: true },
  };

  get shadowDom() { return !this.hasAttribute('noshadow'); }

  constructor() {
    super();
    this.opening = [ '(', '{', '[', '\'', '"' ];
    this.closing = [ ')', '}', ']', '\'', '"' ];

    this.code = '';
    this.indent = '  ';

    this.language = 'clike';
    if (IS_PRISM)
      this.grammar = Prism.languages[this.language];
  }

  update(params) {
    super.update(params);
    if (IS_PRISM && params.has('language')) {
      const newGrammar = Prism.languages[this.language.toLowerCase()];
      if (newGrammar === undefined) {
        throw new Error('Unsupported Prism language');
        this.language = params.get('language');
      }
      else this.grammar = newGrammar;
    }
  }

  _getElement(id) {
    return this.shadowDom
      ? this.shadowRoot.querySelector(`.litcode_${id}`)
      : this.querySelector(`.litcode_${id}`);
  }

  firstUpdated() {
    this.elTextarea = this._getElement('textarea');
    this.elContainer = this._getElement('litcode');
    this.updateTextarea();
  }

  render() {
    return html`
      ${this.shadowDom ? html`` : html`<style>${style.cssText}</style>`}

      <div class="litcode litcode_litcode" ?default=${!this.hasAttribute('mycolors')}>
        ${!this.hasAttribute('linenumbers') ? html`` : html`
          <div class="litcode_linenumbers">
            <div class="litcode_line">1</div>
            ${(this.code.match(/\r?\n/g) || []).map((_, i) => html`
              <div class="litcode_line">${i + 2}</div>
            `)}
          </div>
        `}

        <textarea class="litcode_textarea"
                  spellcheck=false
                  @keydown=${this.handleKeys}
                  @input=${this.handleInput}
        ></textarea>

        <code class="litcode_highlight"><pre>${
          IS_PRISM ? Prism.tokenize(this.code, this.grammar).map(htmlize) : html`${this.code}`
        }</pre></code>
      </div>
    `;
  }

  setCode(code) {
    this.code = code;
    this.updateTextarea();
  }

  getCode() {
    return this.code;
  }

  createRenderRoot() {
    return this.shadowDom ? super.createRenderRoot() : this;
  }

  setCursor(pos) {
    this.elTextarea.setSelectionRange(pos, pos);
  }

  setSelect(from, to) {
    this.elTextarea.setSelectionRange(from, to);
  }

  getCurrentLineIndent() {
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;

    const indentStart = this.code.lastIndexOf('\n', selStart - 1) + 1;
    const spaces = (() => {
      let pos = indentStart;
      while (this.code[pos] === ' ' && pos < selEnd) pos++;
      return pos - indentStart;
    })();
    return ' '.repeat(spaces);
  }

  updateTextarea() {
    if (!this.elTextarea) return;
    this.elTextarea.value = this.code;

    this.dispatchEvent(new CustomEvent('update', { detail: this.code }));
  }

  insertCode(pos, text, placeCursor = true) {
    this.code =
      this.code.substring(0, pos) + text + this.code.substring(pos)
    this.updateTextarea();
    if (placeCursor) this.setCursor(pos + text.length);
  }

  replaceCode(posFrom, posTo, text = '', placeCursor = true) {
    this.code =
      this.code.substring(0, posFrom) + text + this.code.substring(posTo);
    this.updateTextarea();
    if (placeCursor) this.setCursor(posFrom + text.length);
  }

  handleKeys(e) {
    switch (e.code) {
      case 'Tab':       this.handleTabs(e);      break;
      case 'Enter':     this.handleNewLine(e);   break;
      case 'Backspace': this.handleBackspace(e); break;
      default:
        if (this.opening.includes(e.key))
          this.handleAutoClose(e);
        else if (this.closing.includes(e.key))
          this.handleAutoSkip(e);
    }
  }

  handleInput({ target }) {
    this.code = target.value;
    this.dispatchEvent(new CustomEvent('update', { detail: this.code }));
  }

  handleTabs(e) {
    e.preventDefault();
    const selStart = this.elTextarea.selectionStart;
    const selEnd = this.elTextarea.selectionEnd;

    if (selStart !== selEnd) { //multiline indent
      const selLineStart = Math.max(0, this.code.lastIndexOf('\n', selStart - 1));
      const selLineEnd = Math.max(this.code.indexOf('\n', selEnd), selEnd);

      let linesInChunk = 0;
      let codeChunk = this.code.substring(selLineStart, selLineEnd);
      let lenShift = this.indent.length;
      if (selLineStart === 0) codeChunk = '\n' + codeChunk;

      if (e.shiftKey) { //Unindent
        lenShift = -lenShift;
        linesInChunk = (codeChunk.match(new RegExp('\n' + this.indent, 'g')) || []).length;
        codeChunk = codeChunk.replaceAll('\n' + this.indent, '\n');
      }
      else { //Indent
        linesInChunk = (codeChunk.match(/\n/g) || []).length;
        codeChunk = codeChunk.replaceAll('\n', '\n' + this.indent);
      }

      if (selLineStart === 0) codeChunk = codeChunk.replace(/^\n/, '');
      this.replaceCode(selLineStart, selLineEnd, codeChunk, false);

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

    //remove brackets pairs
    const prevSymbol = this.code[selStart - 1];
    const curSymbol = this.code[selStart];
    const isInPairs = this.opening.includes(prevSymbol) && this.closing.includes(curSymbol);
    const isPair = this.closing[this.opening.indexOf(prevSymbol)] === curSymbol;

    if (isInPairs && isPair) {
      this.replaceCode(selStart - 1, selStart + 1);
    }
    else { //remove indent
      const chunkStart = selStart - this.indent.length;
      const chunkEnd = selStart;
      const chunk = this.code.substring(chunkStart, chunkEnd);

      if (chunk === this.indent) this.replaceCode(chunkStart, chunkEnd);
      else this.replaceCode(selStart - 1, selStart);
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
    if (this.elTextarea.selectionStart === this.code.length)
      this.elContainer.scrollTop = this.elContainer.scrollHeight;
  }
}

customElements.define('lit-code', RrayCode);
