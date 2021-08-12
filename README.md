[![npm version](https://badge.fury.io/js/rray-code.svg)](https://badge.fury.io/js/rray-code)
[![Build Status](https://travis-ci.com/Demiler/rray-code.svg?branch=master)](https://travis-ci.com/Demiler/rray-code)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/rray-code)

# rray-code
Simple browser code editor for small code chunks.  
Written with web-components and [lit](https://lit.dev/) library.  
Inspired by [CodeFlask](https://github.com/kazzkiq/CodeFlask).  

[DEMO](https://www.webcomponents.org/element/rray-code/demo/build/index.html)

# Features
+ Web component
+ Keeps your last line indentetion
+ Auto closing brackets, quotes
+ Indents line with the Tab key

# Installation
```
npm i rray-code
```
Requires lit library

# Usage
Import it like this
```js
import 'rray-code'; //as any other package
```
Use it like any other custom element! Bare editor
```html
<rray-code></rray-code>
```

### options
rray-code has several options:
+ `linenumbers` { attribute } - add line numbers
+ `noshadow` { attribute } - disables element's shadow-dom so you can sepcify your own colorscheme
+ `mycolors` { attribute } - disables buildin theme for highlight
+ `code` - set pre existing code
+ `language` - set language (must exists in Prism package)
+ `grammar` - grammar for you language (sets automaticaly with any change of `language`);
 
That's how you can use them:
```html
<rray-code
    language='python'
    code='print("Hello, world!")'
    grammar=${Prism.languages.python}
    noshadow
    mycolors
    linenumbers
><rray-code>
```

# API
To get any code updates use `@update` as event listener. That will proved you with latests changes in code:
```html
<rray-code
    @update=${
        ({ detail: code }) => console.log('Hey, I\'ve got some new code:', code)
    }
></rray-code>
```
Or you can grab code with `.getCode()`

# Styling
`rray-code` by default support `js`, `clike`, `html` and `css` hightlight.
Also `rray-code` keeps it self safe in comfy shadom-dom but you still
specify various colors to it via css variables:
```css
--font-family: monospace;
--font-size:   12pt;
--line-height: 14pt;
--lines-width: 40px;

--editor-bg-color:    white;
--editor-text-color:  black;
--editor-caret-color: var(--editor-text-color);
--editor-sel-color:   #b9ecff;

--lines-bg-color:     #eee;
--lines-text-color:   black;
--scroll-track-color: #aaa;
--scroll-thumb-color: #eee;

/*rray-theme colors for default highlight tokens */
--hl-color-string:      #00ae22;
--hl-color-function:    #004eff;
--hl-color-number:      #dd9031;
--hl-color-operator:    #5a5a5a;
--hl-color-class-name:  #78c3ca;
--hl-color-punctuation: #4a4a4a;
--hl-color-keyword:     #8500ff;
--hl-color-comment:     #aaa;
```

These are default editor and highlight colors but you can spice things up 
by adding your own highlight with your `Prism` pacakge, disabling shadow-dom and
creating new highlight colorscheme:
```js
import 'rray-code';
import './my-ver-of-prism-with-cpp.js';
```
```html
<rray-code language='cpp' noshadow></rray-code>
```
```css
.rraycode {
    --editor-bg-color: black;
    --editor-text-color: white;
}
.rraycode .token.type { color: red; }
.rraycode .token.template { color: yellow; }
```

# Example
```js
import { html, css, LitElement } from 'lit';
import 'rray-code';

class JsCodePlayground extends LitElement {
  static styles = css`
    pre, rray-code {
      max-height: 300px;
      border-radius: 8px;
      border: 2px solid #eee;
    }
  `;

  static properties = {
    output: { type: String }
  };

  render() {
    return html`
      <rray-code linenumbers language='js'></rray-code>
      <button @click=${this.runCode}>Run code</button>
      <pre id="output">${this.output}</pre>
    `;
  }

  runCode() {
    const oldLog = console.log;
    console.log = (...args) => { this.output += args.join(' ') + '\n'; }
    this.output = '';
    const code = this.shadowRoot.querySelector('rray-code').getCode();
    eval(code); //eval is used only for demonstration purposes
    console.log = oldLog;
  }
};

customElements.define('js-code-playground', JsCodePlayground);
```
