/**
 Displays social buttons
 @module TODO/controls/rray-social
 @param { string } network Name of the social network
 @param { string } href Link to source
 @param { string } variant
 @param { CSS } [TODO]
 */

import { LitElement, html } from 'lit';
import style from './rray-social.css';

class RraySocial extends LitElement {
  static styles = [style];

  static properties = {
    network: { type: String },
    href: { type: String },
    variant: { type: String },
  };

  makeTitle(network) {
    switch (network) {
      case 'github': return 'GitHub';
      case 'vk': return 'VK';
      case 'linkedin': return 'LinkedIn';
      case 'auth-platform': return 'Platform-based method (e.g. fingerprint)';
      case 'auth-device': return 'Security token';
      default: return network[0].toUpperCase() + network.slice(1);
    }
  }

  firstUpdated() {
    super.firstUpdated();
    if (!this.title) this.title = this.makeTitle(this.network);
  }

  render() {
    const title = this.title || this.makeTitle(this.network);
    const img = html`<img src="/images/icons/social/${this.network}.svg" alt=${title}>`;
    return this.href
      ? html`<a href=${this.href} target="_blank" rel="noopener">${img}</a>`
      : html`<span>${img}</span>`;
  }
}

customElements.define('rray-social', RraySocial);
