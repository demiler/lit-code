import { navigate } from './router';
import { html } from 'lit';
import './components/rray-notifications.mjs'
import './components/rray-modal.mjs'
import './forms/rray-form-login.mjs'

let modal;
let notifications;

export function notify(type, text, time = undefined) {
  if (!notifications) {
    notifications = document.createElement('rray-notifications');
    document.body.appendChild(notifications);
  }
  notifications.showNotification({ type, text, time });
}

export async function showModal(content) {
  try {
    if (!modal) {
      modal = document.createElement('rray-modal');
      document.body.appendChild(modal);
    }
    modal.show(content);
  } catch (err) {
    console.error(err);
  }
}

export function hideModal() {
  if (modal) modal.hide();
}

export async function showLoginModal() {
  await showModal(html`<rray-form-login></rray-form-login>`);
}

export async function logout() {
  try {
    navigate('/');
    throw new Error('Logout not implemented!')
  } catch (err) {
    console.error(err);
    notify('error', 'couldn\'t logout');
  }
}
