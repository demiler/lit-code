/**
  Button/link button with included styles. Extends from BaseElement
  @module controls/rray-button
  @param { string } [href] link
  @param { boolean } [outline] should button have outline or not
  @param { string } [variant] different color style primary/secondary/white
  @param { CSS } [rray-button-main-color=--color-bg]
  @param { CSS } [rray-button-text-color=--color-primary]
  @param { CSS } [rray-button-main-color-active=--color-active]
  @param { CSS } [rray-button-text-color-active=--color-bg]
  */

import { BaseElement, html } from '../abstract/base-element.mjs';
import style from './rray-button.css';

class RrayButton extends BaseElement {
  static styles = [style]

  static properties = {
    href: { type: String },
    outline: { type: Boolean, reflect: true },
    variant: { type: String, reflect: true, value: 'primary' },
  };

  render() {
    return this.href
      ? html`<a href=${this.href}><slot></slot></a>`
      : html`<span tabindex="0"><slot></slot></span>`;
  }
}

customElements.define('rray-button', RrayButton);
