/**
 * Replacement for common input[type=checkbox] with included styles.
 * Available in two variants - round and square
 * @module controls/rray-checkbox
 * @param { boolean } [disabled] Enables disabled styles
 * @param { boolean } [indeterminate] Enables indeterminate style (not implemented)
 * @param { boolean } [required] Makes checkbox requred to choose
 * @param { boolean } [checked] Makes checkbox checked or not
 * @param { string } [variant='square'] Either 'round' or 'square' style
 * @param { attribute } [correct] Applies correct style for checkbox
 * @param { attribute } [incorrect] Applies incorrect style for checkbox
 * @param { CSS } [checkbox-size-sq=20px] Size of square checkbox icon
 * @param { CSS } [checkbox-size-rn=25px] Size of round checkbox incon
 * @param { CSS } [color-active=#a6daff] Active color when selected or hovered
 * @param { CSS } [color-correct=#aaefa5] Correct color for correct attr
 * @param { CSS } [color-incorrect=#ff8d8d] Incorrect color for incorrect attr
 * @param { CSS } [color-disabled=#ccc] Disabled color
 */

import { LitElement, html } from 'lit';
import style from './rray-checkbox.css';

class RrayCheckbox extends LitElement {
  static styles = [style];

  static properties = {
    disabled: { type: Boolean, attribute: true },
    indeterminate: { type: Boolean },
    required: { type: Boolean },
    checked: { type: Boolean },
    variant: { type: String },
  };

  _changeHandler({ target: checkbox }) {
    this.checked = checkbox.checked;
    this.indeterminate = checkbox.indeterminate;
    this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  get value() {
    return this.checked;
  }

  set value(checked) {
    this.checked = checked;
  }

  render() {
    return html`<label>
      <input type="checkbox"
        @change="${this._changeHandler}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        .indeterminate="${this.indeterminate}"
        .checked="${this.checked}">
      <span class="bg"></span>
      <slot></slot>
    </label>`;
  }
}

customElements.define('rray-checkbox', RrayCheckbox);
