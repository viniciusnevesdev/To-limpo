import { DAY, COLORS, CATEGORIES, elapsed, parts, duration, cardTime, stats, milestones, restart, parseBackup, backup } from './model.js';
import { initialize, readState, updateState } from './storage.js';
import { setupUpdates, checkUpdates } from './updates.js';
const $ = selector => document.querySelector(selector);
const content = $('#content'), sheet = $('#sheet'), sheetBody = $('#sheet-body');
const paths = {
  plus: '<path d="M8.98438 15.6797L8.98438 0.765625C8.98438 0.351562 8.64062 0 8.21875 0C7.80469 0 7.46094 0.351562 7.46094 0.765625L7.46094 15.6797C7.46094 16.0938 7.80469 16.4453 8.21875 16.4453C8.64062 16.4453 8.98438 16.0938 8.98438 15.6797ZM0.765625 8.98438L15.6797 8.98438C16.0938 8.98438 16.4453 8.64062 16.4453 8.22656C16.4453 7.80469 16.0938 7.46094 15.6797 7.46094L0.765625 7.46094C0.351562 7.46094 0 7.80469 0 8.22656C0 8.64062 0.351562 8.98438 0.765625 8.98438Z" fill="currentColor" fill-opacity="0.85"/>',
  home: '<path d="M9.04688 19.5781L9.04688 13.5391C9.04688 13.1016 9.33594 12.8203 9.77344 12.8203L13.8047 12.8203C14.2422 12.8203 14.5234 13.1016 14.5234 13.5391L14.5234 19.5781ZM2.98438 18.8516C2.98438 20.1797 3.78125 20.9609 5.125 20.9609L18.4453 20.9609C19.7891 20.9609 20.5859 20.1797 20.5859 18.8516L20.5859 10.4453L12.3984 3.57812C12 3.23438 11.5469 3.25 11.1641 3.57812L2.98438 10.4297ZM0.742188 10.4141C0.976562 10.4141 1.17188 10.2891 1.34375 10.1406L11.4062 1.69531C11.5234 1.59375 11.6562 1.54688 11.7812 1.54688C11.9141 1.54688 12.0469 1.59375 12.1641 1.69531L22.2266 10.1406C22.3984 10.2891 22.5859 10.4141 22.8281 10.4141C23.2891 10.4141 23.5703 10.0781 23.5703 9.73438C23.5703 9.52344 23.4844 9.32031 23.2891 9.15625L12.9141 0.453125C12.5547 0.148438 12.1719 0 11.7812 0C11.3984 0 11.0156 0.148438 10.6562 0.453125L0.28125 9.15625C0.0859375 9.32031 0 9.52344 0 9.73438C0 10.0781 0.273438 10.4141 0.742188 10.4141ZM18.4453 5.52344L20.7422 7.46094L20.7422 3.01562C20.7422 2.625 20.4844 2.375 20.0938 2.375L19.1016 2.375C18.7109 2.375 18.4453 2.625 18.4453 3.01562Z" fill="currentColor" fill-opacity="0.85"/>',
  history: '<path d="M0.641418 8.28906C0.000792585 8.28906-0.178895 8.72656 0.188293 9.23438L2.40704 12.3906C2.70392 12.8203 3.13361 12.8125 3.42267 12.3906L5.64142 9.22656C5.99298 8.72656 5.82111 8.28906 5.18829 8.28906ZM22.2899 10.1797C22.2899 4.5625 17.7352 0 12.118 0C6.50079 0 1.95392 4.55469 1.94611 10.1875C1.95392 10.5938 2.27423 10.9062 2.66486 10.9062C3.06329 10.9062 3.39923 10.5859 3.39923 10.1797C3.39923 5.35938 7.29767 1.46094 12.118 1.46094C16.9383 1.46094 20.8367 5.35938 20.8367 10.1797C20.8367 15 16.9383 18.8984 12.118 18.8984C9.12579 18.8984 6.49298 17.3828 4.94611 15.1016C4.68829 14.75 4.28204 14.6406 3.92267 14.8594C3.57892 15.0625 3.47736 15.5547 3.75861 15.9375C5.59454 18.6016 8.62579 20.3516 12.118 20.3516C17.7352 20.3516 22.2899 15.7969 22.2899 10.1797Z" fill="currentColor" fill-opacity="0.85"/><path d="M12.118 4.375C11.7117 4.375 11.3836 4.69531 11.3836 5.10938L11.3836 10.7891C11.3836 11.0312 11.4539 11.2109 11.6102 11.4219L14.0555 14.6406C14.3758 15.0547 14.8211 15.1094 15.1805 14.8438C15.5008 14.6094 15.5477 14.1719 15.2586 13.7891L12.0945 9.49219L12.8524 11.8281L12.8524 5.10938C12.8524 4.69531 12.5242 4.375 12.118 4.375Z" fill="currentColor" fill-opacity="0.85"/>',
  settings: '<path d="M9.53125 20.9609L11.4219 20.9609C11.9609 20.9609 12.3359 20.6484 12.4609 20.1094L12.9766 17.9297C13.3359 17.8047 13.6953 17.6641 14.0156 17.5156L15.9219 18.6953C16.375 18.9844 16.875 18.9375 17.2422 18.5625L18.5703 17.2422C18.9453 16.8672 19 16.3594 18.6953 15.8984L17.5234 14.0078C17.6719 13.6719 17.8125 13.3281 17.9219 12.9844L20.1172 12.4688C20.6562 12.3438 20.9531 11.9688 20.9531 11.4297L20.9531 9.5625C20.9531 9.03125 20.6562 8.66406 20.1172 8.53125L17.9375 8.00781C17.8125 7.63281 17.6641 7.28906 17.5391 6.98438L18.7109 5.0625C19 4.60156 18.9688 4.125 18.5859 3.74219L17.2422 2.41406C16.8594 2.0625 16.3984 1.98438 15.9453 2.27344L14.0156 3.46875C13.7031 3.3125 13.3516 3.17969 12.9766 3.05469L12.4609 0.851562C12.3359 0.3125 11.9609 0 11.4219 0L9.53125 0C8.99219 0 8.61719 0.3125 8.49219 0.851562L7.97656 3.03906C7.61719 3.16406 7.25781 3.29688 6.92969 3.46094L5.00781 2.27344C4.55469 1.98438 4.07812 2.04688 3.71094 2.41406L2.36719 3.74219C1.98438 4.125 1.95312 4.60156 2.24219 5.0625L3.41406 6.98438C3.28906 7.28906 3.14062 7.63281 3.01562 8.00781L0.835938 8.53125C0.304688 8.66406 0 9.03125 0 9.5625L0 11.4297C0 11.9688 0.304688 12.3438 0.835938 12.4688L3.03125 12.9844C3.14062 13.3281 3.28125 13.6719 3.42969 14.0078L2.25781 15.8984C1.95312 16.3594 2.00781 16.8672 2.38281 17.2422L3.71094 18.5625C4.07812 18.9375 4.57812 18.9844 5.03125 18.6953L6.9375 17.5156C7.26562 17.6641 7.61719 17.8047 7.97656 17.9297L8.49219 20.1094C8.61719 20.6484 8.99219 20.9609 9.53125 20.9609ZM10.4766 14.0625C8.5 14.0625 6.89062 12.4531 6.89062 10.4766C6.89062 8.5 8.5 6.89062 10.4766 6.89062C12.4531 6.89062 14.0625 8.5 14.0625 10.4766C14.0625 12.4531 12.4531 14.0625 10.4766 14.0625Z" fill="currentColor" fill-opacity="0.85"/>',
  close: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
  chevron: '<path d="M11.7812 8.52344C11.7812 8.29688 11.6953 8.10938 11.5312 7.95312L3.5 0.226562C3.35156 0.078125 3.16406 0 2.94531 0C2.50781 0 2.16406 0.328125 2.16406 0.773438C2.16406 0.984375 2.25 1.17969 2.39062 1.32031L9.875 8.52344L2.39062 15.7188C2.25 15.8594 2.16406 16.0469 2.16406 16.2656C2.16406 16.7109 2.50781 17.0469 2.94531 17.0469C3.16406 17.0469 3.35156 16.9609 3.5 16.8203L11.5312 9.09375C11.6953 8.92969 11.7812 8.74219 11.7812 8.52344Z" fill="currentColor" fill-opacity="0.85"/>',
  back: '<path d="M0 8.52344C0 8.74219 0.0859375 8.92969 0.25 9.09375L8.28125 16.8203C8.42969 16.9609 8.61719 17.0469 8.83594 17.0469C9.27344 17.0469 9.61719 16.7109 9.61719 16.2656C9.61719 16.0469 9.53125 15.8594 9.39062 15.7188L1.90625 8.52344L9.39062 1.32031C9.53125 1.17969 9.61719 0.984375 9.61719 0.773438C9.61719 0.328125 9.27344 0 8.83594 0C8.61719 0 8.42969 0.078125 8.28125 0.226562L0.25 7.95312C0.0859375 8.10938 0 8.29688 0 8.52344Z" fill="currentColor" fill-opacity="0.85"/>',
  reset: '<path d="M0.641418 8.28906C0.000792585 8.28906-0.178895 8.72656 0.188293 9.23438L2.40704 12.3906C2.70392 12.8203 3.13361 12.8125 3.42267 12.3906L5.64142 9.22656C5.99298 8.72656 5.82111 8.28906 5.18829 8.28906ZM22.2899 10.1797C22.2899 4.5625 17.7352 0 12.118 0C6.50079 0 1.95392 4.55469 1.94611 10.1875C1.95392 10.5938 2.27423 10.9062 2.66486 10.9062C3.06329 10.9062 3.39923 10.5859 3.39923 10.1797C3.39923 5.35938 7.29767 1.46094 12.118 1.46094C16.9383 1.46094 20.8367 5.35938 20.8367 10.1797C20.8367 15 16.9383 18.8984 12.118 18.8984C9.12579 18.8984 6.49298 17.3828 4.94611 15.1016C4.68829 14.75 4.28204 14.6406 3.92267 14.8594C3.57892 15.0625 3.47736 15.5547 3.75861 15.9375C5.59454 18.6016 8.62579 20.3516 12.118 20.3516C17.7352 20.3516 22.2899 15.7969 22.2899 10.1797Z" fill="currentColor" fill-opacity="0.85"/>',
  up: '<path d="m6 14 6-6 6 6"/>', down: '<path d="m6 10 6 6 6-6"/>',
  check: '<path d="M6.32031 17.4609C6.6875 17.4609 6.96094 17.2969 7.16406 17L16.8359 1.83594C16.9922 1.59375 17.0547 1.40625 17.0547 1.21875C17.0547 0.742188 16.7422 0.429688 16.2656 0.429688C15.9375 0.429688 15.7422 0.546875 15.5469 0.867188L6.28125 15.5078L1.54688 9.49219C1.33594 9.20312 1.13281 9.07812 0.8125 9.07812C0.335938 9.07812 0 9.40625 0 9.875C0 10.0781 0.078125 10.2891 0.25 10.5L5.44531 16.9844C5.70312 17.3125 5.96094 17.4609 6.32031 17.4609Z" fill="currentColor" fill-opacity="0.85"/>',
  export: '<path d="M6.39062 9.30469L4.15625 9.30469C2.38281 9.30469 1.38281 10.2969 1.38281 12.0703L1.38281 19.7891C1.38281 21.5703 2.38281 22.5703 4.15625 22.5703L13.5078 22.5703C15.2891 22.5703 16.2891 21.5703 16.2891 19.7891L16.2891 12.0703C16.2891 10.2969 15.2891 9.30469 13.5078 9.30469L11.2812 9.30469L11.2812 7.91406L13.5078 7.91406C16.1875 7.91406 17.6719 9.40625 17.6719 12.0781L17.6719 19.7891C17.6719 22.4609 16.1875 23.9531 13.5078 23.9531L4.16406 23.9531C1.48438 23.9531 0 22.4609 0 19.7891L0 12.0781C0 9.40625 1.48438 7.91406 4.16406 7.91406L6.39062 7.91406Z" fill="currentColor" fill-opacity="0.85"/><path d="M9.46254 3.49778L9.52344 4.99219L9.52344 15.4766C9.52344 15.8438 9.20312 16.1484 8.83594 16.1484C8.46875 16.1484 8.14844 15.8438 8.14844 15.4766L8.14844 4.99219L8.20934 3.49778L8.83594 2.83594Z" fill="currentColor" fill-opacity="0.85"/><path d="M5.40625 6.14844C5.57031 6.14844 5.75781 6.07812 5.88281 5.9375L7.58594 4.15625L8.83594 2.83594L10.0859 4.15625L11.7812 5.9375C11.9062 6.07812 12.0859 6.14844 12.25 6.14844C12.6094 6.14844 12.8828 5.89062 12.8828 5.53906C12.8828 5.35938 12.8047 5.21875 12.6797 5.08594L9.33594 1.83594C9.16406 1.66406 9.00781 1.60938 8.83594 1.60938C8.66406 1.60938 8.50781 1.66406 8.33594 1.83594L4.99219 5.08594C4.85938 5.21875 4.78906 5.35938 4.78906 5.53906C4.78906 5.89062 5.04688 6.14844 5.40625 6.14844Z" fill="currentColor" fill-opacity="0.85"/>',
  import: '<path d="M17.6719 11.0859L17.6719 18.7969C17.6719 21.4688 16.1875 22.9609 13.5078 22.9609L4.16406 22.9609C1.48438 22.9609 0 21.4688 0 18.7969L0 11.0859C0 8.41406 1.48438 6.92188 4.16406 6.92188L6.39844 6.92188L6.39844 8.3125L4.16406 8.3125C2.39062 8.3125 1.39062 9.3125 1.39062 11.0859L1.39062 18.7969C1.39062 20.5703 2.39062 21.5703 4.16406 21.5703L13.5078 21.5703C15.2891 21.5703 16.2891 20.5703 16.2891 18.7969L16.2891 11.0859C16.2891 9.3125 15.2891 8.3125 13.5078 8.3125L11.2891 8.3125L11.2891 6.92188L13.5078 6.92188C16.1875 6.92188 17.6719 8.41406 17.6719 11.0859Z" fill="currentColor" fill-opacity="0.85"/><path d="M8.84375 1.75781C8.46875 1.75781 8.15625 2.0625 8.15625 2.42969L8.15625 12.9141L8.25781 15.4062C8.27344 15.7266 8.52344 15.9922 8.84375 15.9922C9.15625 15.9922 9.40625 15.7266 9.42188 15.4062L9.52344 12.9141L9.52344 2.42969C9.52344 2.0625 9.21094 1.75781 8.84375 1.75781ZM5.41406 11.7578C5.05469 11.7578 4.78906 12.0156 4.78906 12.3672C4.78906 12.5547 4.86719 12.6875 5 12.8203L8.34375 16.0781C8.51562 16.2422 8.66406 16.3047 8.84375 16.3047C9.01562 16.3047 9.16406 16.2422 9.33594 16.0781L12.6797 12.8203C12.8125 12.6875 12.8828 12.5547 12.8828 12.3672C12.8828 12.0156 12.6094 11.7578 12.2578 11.7578C12.0938 11.7578 11.9141 11.8281 11.7891 11.9688L10.0859 13.75L8.84375 15.0703L7.58594 13.75L5.89062 11.9688C5.76562 11.8281 5.57812 11.7578 5.41406 11.7578Z" fill="currentColor" fill-opacity="0.85"/>',
  archive: '<path d="M4.41406 18.3828L15.5547 18.3828C17.4766 18.3828 18.5078 17.3828 18.5078 15.4688L18.5078 4.67969L17.1172 4.67969L17.1172 15.5234C17.1172 16.5312 16.5547 17.0781 15.5625 17.0781L4.41406 17.0781C3.39844 17.0781 2.85156 16.5312 2.85156 15.5234L2.85156 4.67969L1.46875 4.67969L1.46875 15.4688C1.46875 17.3906 2.5 18.3828 4.41406 18.3828ZM6.61719 9.34375L13.3594 9.34375C13.7656 9.34375 14.0312 9.07031 14.0312 8.65625L14.0312 8.35156C14.0312 7.92969 13.7656 7.67188 13.3594 7.67188L6.61719 7.67188C6.21875 7.67188 5.95312 7.92969 5.95312 8.35156L5.95312 8.65625C5.95312 9.07031 6.21875 9.34375 6.61719 9.34375ZM1.79688 5.3125L18.1797 5.3125C19.3359 5.3125 19.9766 4.57812 19.9766 3.4375L19.9766 1.89844C19.9766 0.75 19.3359 0.0234375 18.1797 0.0234375L1.79688 0.0234375C0.6875 0.0234375 0 0.75 0 1.89844L0 3.4375C0 4.57812 0.640625 5.3125 1.79688 5.3125Z" fill="currentColor" fill-opacity="0.85"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  trash: '<path d="M6.67969 19.1484C7.01562 19.1484 7.23438 18.9297 7.22656 18.625L6.90625 7.60156C6.89844 7.29688 6.67188 7.09375 6.35938 7.09375C6.02344 7.09375 5.80469 7.30469 5.8125 7.61719L6.13281 18.625C6.14062 18.9375 6.35938 19.1484 6.67969 19.1484ZM9.6875 19.1484C10.0156 19.1484 10.25 18.9297 10.25 18.625L10.25 7.61719C10.25 7.30469 10.0156 7.09375 9.6875 7.09375C9.35938 7.09375 9.125 7.30469 9.125 7.61719L9.125 18.625C9.125 18.9297 9.35938 19.1484 9.6875 19.1484ZM12.6875 19.1484C13.0078 19.1484 13.2266 18.9453 13.2344 18.6328L13.5547 7.61719C13.5625 7.30469 13.3438 7.10156 13.0156 7.10156C12.7031 7.10156 12.4766 7.29688 12.4688 7.60938L12.1484 18.625C12.1406 18.9297 12.3516 19.1484 12.6875 19.1484ZM5.33594 4.46875L6.70312 4.46875L6.70312 2.32031C6.70312 1.69531 7.13281 1.28906 7.80469 1.28906L11.5469 1.28906C12.2188 1.28906 12.6484 1.69531 12.6484 2.32031L12.6484 4.46875L14.0156 4.46875L14.0156 2.24219C14.0156 0.851562 13.1172 0 11.625 0L7.72656 0C6.24219 0 5.33594 0.851562 5.33594 2.24219ZM0.648438 5.14844L18.7188 5.14844C19.0781 5.14844 19.3672 4.85156 19.3672 4.5C19.3672 4.14062 19.0781 3.84375 18.7188 3.84375L0.648438 3.84375C0.304688 3.84375 0 4.14844 0 4.5C0 4.85938 0.304688 5.14844 0.648438 5.14844ZM5.10156 22.3125L14.2812 22.3125C15.625 22.3125 16.5703 21.3984 16.6406 20.0547L17.3828 4.96875L15.9844 4.96875L15.2812 19.9141C15.25 20.5469 14.7734 21.0078 14.1484 21.0078L5.21094 21.0078C4.60156 21.0078 4.11719 20.5391 4.08594 19.9141L3.34375 4.97656L1.99219 4.97656L2.73438 20.0625C2.80469 21.4062 3.73438 22.3125 5.10156 22.3125Z" fill="currentColor" fill-opacity="0.85"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 19h2"/>',
  edit: '<path d="m14 4 6 6M4 20l2-7L16 3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L11 18z"/>'
};
const filledIcons = new Set(['home', 'history', 'settings', 'plus', 'reset', 'export', 'import', 'archive', 'trash', 'check', 'chevron', 'back']);
export const icon = name => `<svg class="${filledIcons.has(name) ? 'filled-icon' : ''}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.history}</svg>`;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const date = timestamp => new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(timestamp);
const localInput = timestamp => { const d = new Date(timestamp); return new Date(timestamp - d.getTimezoneOffset() * 60000).toISOString().slice(0,16); };
const days = ms => `${parts(ms).days} ${parts(ms).days === 1 ? 'dia' : 'dias'}`;
let state, page = 'home', selected = null, reordering = false, toastTimer, tickTimer, busy = false;
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('to-limpo-changes') : null;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4000); }
function getCounter(id = selected) { return state.counters.find(c => c.id === id); }
function requiredCounter(data, id) { const c = data.counters.find(c => c.id === id); if (!c) throw new Error('Esse contador foi removido em outra aba.'); return c; }
async function commit(mutator, message) {
  if (busy) return false;
  busy = true;
  try { state = await updateState(mutator); channel?.postMessage('changed'); applyTheme(); render(); if (message) toast(message); return true; }
  catch (error) { toast(error.message); return false; }
  finally { busy = false; }
}
function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && matchMedia('(prefers-color-scheme:dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#000000' : '#f5f5f7';
}
function empty(title, copy, action = '') { return `<section class="panel empty">${icon('history')}<h2>${title}</h2><p>${copy}</p>${action}</section>`; }
function title(text) { $('#page-title').textContent = text; $('#add').hidden = page !== 'home' || !!selected; }
function card(c, index, list) {
  const s = stats(c), compact = cardTime(s.current);
  return `<article class="counter-card" style="--tone:${c.color}">
    <button class="card-open" data-action="open" data-id="${escape(c.id)}" aria-label="Abrir ${escape(c.name)}">
      <div class="card-top"><span class="emoji" aria-hidden="true">${escape(c.emoji || '◷')}</span><span class="card-meta">${c.demo ? '<span class="tag">Exemplo</span>' : ''}${c.category ? escape(c.category) : ''}<span class="chevron">${icon('chevron')}</span></span></div>
      <div class="day-line card-time-line"><strong class="day-number" data-time="card-value" data-counter="${escape(c.id)}">${compact.value}</strong><span class="day-label" data-time="card-label" data-counter="${escape(c.id)}">${compact.label}</span><span class="card-time-remainder" data-time="card-detail" data-counter="${escape(c.id)}">${compact.detail}</span></div>
      <h2 class="counter-name">${escape(c.name)}</h2>
      <div class="card-footer"><span>Desde ${escape(date(c.start))}</span><span class="record-label" data-time="record" data-counter="${escape(c.id)}">Recorde: ${days(s.best)}</span></div>
    </button>
    ${reordering ? `<div class="move-controls"><button data-action="move" data-id="${escape(c.id)}" data-direction="-1" aria-label="Mover ${escape(c.name)} para cima" ${index === 0 ? 'disabled' : ''}>${icon('up')}</button><button data-action="move" data-id="${escape(c.id)}" data-direction="1" aria-label="Mover ${escape(c.name)} para baixo" ${index === list.length - 1 ? 'disabled' : ''}>${icon('down')}</button></div>` : `<button class="card-restart" data-action="restart" data-id="${escape(c.id)}">${icon('reset')}Recomeçar contador</button>`}
  </article>`;
}
function home() {
  title('Meu tempo');
  const counters = state.counters.filter(c => !c.archived);
  return `${state.counters.some(c => c.demo) ? '<div class="demo-note"><span>Contadores de demonstração</span><button data-action="remove-demo">Remover exemplos</button></div>' : ''}
    ${counters.length ? `<div class="section-row"><p>${counters.length} ${counters.length === 1 ? 'contador ativo' : 'contadores ativos'}</p><button class="text-button" data-action="reorder">${reordering ? 'Concluir' : 'Reorganizar'}</button></div>${reordering ? '<p class="muted">Use as setas. Cada mudança é salva automaticamente.</p>' : ''}<div class="counter-list">${counters.map((c, i) => card(c, i, counters)).join('')}</div>` : empty('Seu tempo começa aqui', 'Crie um contador para acompanhar o tempo desde a última vez.', '<button class="primary" data-action="create">Criar contador</button>')}`;
}
function metric(label, value, copy = '') { return `<div class="metric"><strong>${value}</strong><small>${label}${copy ? `<br>${copy}` : ''}</small></div>`; }
function historyRows(c) {
  return `<div class="history-item"><span class="history-dot"></span><div><strong data-time="current-history" data-counter="${escape(c.id)}">Sequência atual: ${days(elapsed(c.start))}</strong><small>Início: ${date(c.start)}${c.archived ? ' · Arquivado' : ''}</small></div></div>` + c.history.slice().reverse().map((h, i) => `<div class="history-item"><span class="history-dot"></span><div><strong>${days(h.end - h.start)}</strong><small>${duration(h.end - h.start)}<br>Início: ${date(h.start)}<br>Ocorrência: ${date(h.end)}<br>Novo início: ${date(h.newStart)}</small></div></div>`).join('');
}
function detail() {
  const c = getCounter();
  if (!c) { selected = null; return home(); }
  title('Seu contador');
  const s = stats(c), p = parts(s.current);
  return `<div class="detail-toolbar"><button class="back-button" data-action="back">${icon('back')}Voltar</button><button class="text-button" data-action="edit" data-id="${escape(c.id)}">Editar</button></div>
    <section class="panel hero" style="--tone:${c.color}"><div class="emoji" aria-hidden="true">${escape(c.emoji || '◷')}</div>
      ${c.archived ? '<p class="muted">Arquivado · a contagem continua</p>' : ''}
      <div class="day-line"><strong class="day-number" data-time="days" data-counter="${escape(c.id)}">${p.days}</strong><span class="day-label" data-time="day-label" data-counter="${escape(c.id)}">${p.days === 1 ? 'dia' : 'dias'}</span></div><h2 class="counter-name">${escape(c.name)}</h2>
      <div class="units">${['days','hours','minutes','seconds'].map((unit,i) => `<div><strong data-time="${unit}" data-counter="${escape(c.id)}">${String(p[unit]).padStart(i ? 2 : 1,'0')}</strong><small>${['dias','horas','minutos','segundos'][i]}</small></div>`).join('')}</div>
      <p class="muted">Desde ${date(c.start)}</p>${c.description ? `<p class="description">${escape(c.description)}</p>` : ''}
      <button class="primary full" data-action="restart" data-id="${escape(c.id)}">Recomeçar contador</button>
    </section>
    <section class="panel"><h2>Suas sequências</h2><div class="metrics">${metric('Melhor sequência', `<span data-time="best" data-counter="${escape(c.id)}">${days(s.best)}</span>`)}${metric('Média das anteriores', s.average === null ? '—' : days(s.average), s.average === null ? 'Ainda sem reinícios' : duration(s.average))}${metric('Reinícios', s.resets)}${metric('Criado em', new Date(c.createdAt).toLocaleDateString('pt-BR'))}</div></section>
    <section class="panel"><h2>Marcos</h2><div class="milestones" data-milestones="${escape(c.id)}">${milestoneHTML(c)}</div><p class="muted">Marcos da sequência atual. Meses e anos seguem o calendário.</p></section>
    <section class="panel" style="--tone:${c.color}"><h2>Histórico</h2><div style="margin-top:16px">${historyRows(c)}</div></section>
    <div class="form-actions"><button class="secondary" data-action="archive" data-id="${escape(c.id)}">${c.archived ? 'Desarquivar' : 'Arquivar'}</button><button class="danger-button" data-action="delete" data-id="${escape(c.id)}">Excluir contador</button></div>`;
}
function milestoneHTML(c) { return milestones(c.start).map(m => `<span class="milestone ${m.reached ? 'reached' : ''}" title="${date(m.at)}">${m.reached ? icon('check') : ''}${m.label}<span class="sr-only" hidden>${m.reached ? 'atingido' : ''}</span></span>`).join(''); }
function history() {
  title('Histórico');
  if (!state.counters.length) return empty('Nenhuma sequência ainda', 'Seus registros e recordes aparecerão aqui.');
  const resetCount = state.counters.reduce((sum,c) => sum + c.history.length, 0);
  const best = Math.max(...state.counters.map(c => stats(c).best));
  const entries = state.counters.flatMap(c => c.history.map(h => ({ c, h }))).sort((a,b) => b.h.end - a.h.end);
  return `<section class="panel"><div class="metrics">${metric('Maior sequência', days(best))}${metric('Reinícios registrados', resetCount)}</div></section>
    <div class="section-row"><h2>Contadores e recordes</h2></div><section class="panel">${state.counters.map(c => `<button class="history-link" data-action="open" data-id="${escape(c.id)}" style="--tone:${c.color}"><div class="history-item"><span class="history-dot"></span><div><strong>${escape(c.emoji)} ${escape(c.name)}</strong><small>Atual: ${days(elapsed(c.start))} · Recorde: ${days(stats(c).best)}<br>${c.history.length} reinícios${c.archived ? ' · Arquivado' : ''}${c.demo ? ' · Exemplo' : ''}</small></div></div></button>`).join('')}</section>
    <div class="section-row"><h2>Sequências anteriores</h2></div><section class="panel">${entries.length ? entries.map(({c,h}) => `<div class="history-item" style="--tone:${c.color}"><span class="history-dot"></span><div><strong>${escape(c.name)} · ${days(h.end-h.start)}</strong><small>${duration(h.end-h.start)}<br>${date(h.start)} → ${date(h.end)}</small></div></div>`).join('') : '<p class="muted">Ao recomeçar um contador, a sequência anterior fica registrada aqui.</p>'}</section>`;
}
function settingsRow(action, title, copy, symbol, danger = false) { return `<button class="setting-row ${danger ? 'danger' : ''}" data-action="${action}">${icon(symbol)}<span><strong>${title}</strong><small>${copy}</small></span><span class="chevron">${icon('chevron')}</span></button>`; }
function settings() {
  title('Ajustes');
  return `<section class="panel"><h2>Aparência</h2><div class="segmented">${[['system','Sistema'],['light','Claro'],['dark','Escuro']].map(([value,label]) => `<button data-action="theme" data-theme="${value}" aria-pressed="${state.settings.theme === value}">${label}</button>`).join('')}</div></section>
    <h2 class="settings-heading">Seus dados</h2><section class="panel settings-list">${settingsRow('export','Exportar backup','Todos os contadores e históricos em JSON','export')}${settingsRow('import','Importar backup','Validar e restaurar um arquivo JSON','import')}${settingsRow('archives','Contadores arquivados',`${state.counters.filter(c => c.archived).length} arquivados · a contagem continua`,'archive')}${state.counters.some(c => c.demo) ? settingsRow('remove-demo','Remover demonstração','Apagar apenas os contadores de exemplo','trash',true) : ''}</section>
    <p class="muted">Os dados ficam no armazenamento deste navegador ou PWA. Exporte um backup antes de limpar os dados do Safari ou trocar de dispositivo. O arquivo contém seus registros pessoais.</p>
    <h2 class="settings-heading">Aplicativo</h2><section class="panel settings-list">${settingsRow('install','Instalar no iPhone','Adicionar à Tela de Início pelo Safari','phone')}${settingsRow('check-update','Buscar atualização','Verificar se há uma nova versão','reset')}</section>
    <section class="panel privacy">${icon('shield')}<div><strong>Seu tempo é só seu</strong><p>Sem cadastro, analytics ou rastreadores. Os registros não são enviados a servidores.</p></div></section><p class="version">Tô limpo? · versão 1.0.3</p>`;
}
function render() {
  content.innerHTML = selected ? detail() : page === 'home' ? home() : page === 'history' ? history() : settings();
  document.querySelectorAll('[data-page]').forEach(button => {
    const current = button.dataset.page === page;
    if (current) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
  scheduleTick();
}
function tick() {
  if (!state || document.hidden) return;
  const now = Date.now();
  content.querySelectorAll('[data-time]').forEach(el => {
    const c = getCounter(el.dataset.counter); if (!c) return;
    const s = stats(c, now), p = parts(s.current), compact = cardTime(s.current), kind = el.dataset.time;
    const value = kind === 'card-value' ? String(compact.value) : kind === 'card-label' ? compact.label : kind === 'card-detail' ? compact.detail : kind === 'duration' ? duration(s.current) : kind === 'record' ? `Recorde: ${days(s.best)}` : kind === 'best' ? days(s.best) : kind === 'current-history' ? `Sequência atual: ${days(s.current)}` : kind === 'day-label' ? p.days === 1 ? 'dia' : 'dias' : String(p[kind]).padStart(kind === 'days' ? 1 : 2,'0');
    if (el.textContent !== value) el.textContent = value;
  });
  content.querySelectorAll('[data-milestones]').forEach(el => {
    const c = getCounter(el.dataset.milestones); if (!c) return;
    const html = milestoneHTML(c); if (html !== el.innerHTML) el.innerHTML = html;
  });
}
function nextBoundary(start, interval, now) {
  const passed = elapsed(start, now);
  return interval - (passed % interval) + 25;
}
function scheduleTick() {
  clearTimeout(tickTimer);
  if (!state || document.hidden) return;
  const now = Date.now();
  let delays = [];
  if (selected) {
    const counter = getCounter();
    if (counter) delays.push(nextBoundary(counter.start, 1000, now));
  } else if (page === 'home') {
    delays = state.counters.filter(c => !c.archived).map(c => nextBoundary(c.start, cardTime(elapsed(c.start, now)).interval, now));
  } else if (page === 'history') {
    delays = state.counters.map(c => nextBoundary(c.start, DAY, now));
  }
  if (delays.length) tickTimer = setTimeout(() => { tick(); scheduleTick(); }, Math.max(50, Math.min(...delays)));
}
function openSheet(heading, html) {
  $('#sheet-title').textContent = heading; sheetBody.innerHTML = html;
  if (!sheet.open) sheet.showModal();
  document.body.classList.add('modal-open'); sheet.scrollTop = 0;
}
function closeSheet() { sheet.close(); document.body.classList.remove('modal-open'); sheetBody.innerHTML = ''; }
function ask(heading, copy, label, callback, danger = false) {
  openSheet(heading, `<p class="confirm-copy">${escape(copy)}</p><p id="confirm-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="secondary" id="cancel-confirm">Cancelar</button><button class="${danger ? 'danger-button' : 'primary'}" id="accept-confirm">${label}</button></div>`);
  $('#cancel-confirm').onclick = closeSheet;
  $('#accept-confirm').onclick = async () => {
    const button = $('#accept-confirm'); button.disabled = true;
    try { if (await callback() !== false) closeSheet(); }
    catch (error) { $('#confirm-error').textContent = error.message; $('#confirm-error').hidden = false; }
    finally { if (button.isConnected) button.disabled = false; }
  };
}
function editor(id) {
  const c = id ? getCounter(id) : null;
  const now = Date.now();
  openSheet(c ? 'Editar contador' : 'Novo contador', `<form id="counter-form">
    <label class="field"><span>Nome do contador</span><input id="name" name="name" maxlength="80" placeholder="sem fazer aquilo" required value="${escape(c?.name || '')}"></label>
    <div class="field-grid"><label class="field"><span>Ícone ou emoji</span><input name="emoji" maxlength="32" placeholder="🌿" value="${escape(c?.emoji || '')}"></label><label class="field"><span>Categoria · opcional</span><select name="category"><option value="">Sem categoria</option>${[...new Set([...CATEGORIES, ...(c?.category ? [c.category] : [])])].map(cat => `<option ${cat === c?.category ? 'selected' : ''}>${escape(cat)}</option>`).join('')}</select></label></div>
    <div class="field"><span>Cor</span><div class="colors">${COLORS.map(color => `<button class="color-choice" type="button" data-color="${color}" style="--tone:${color}" aria-label="Cor ${color}" aria-pressed="${color === (c?.color || COLORS[0])}">${color === (c?.color || COLORS[0]) ? icon('check') : ''}</button>`).join('')}</div><label class="custom-color"><input id="color" name="color" type="color" value="${c?.color || COLORS[0]}">Escolher outra cor</label></div>
    <label class="field"><span>Data e hora de início</span><input id="start" name="start" type="datetime-local" max="${localInput(now)}" required value="${localInput(c?.start || now)}"></label><button class="text-button now-button" id="start-now" type="button">${c ? 'Usar data e hora de agora' : 'Começar agora'}</button>
    ${c?.history.length ? '<p class="muted">A alteração afeta só a sequência atual. O início deve ser posterior ao último reinício.</p>' : ''}
    <label class="field"><span>Descrição · opcional</span><textarea name="description" maxlength="1000" placeholder="Uma nota só sua">${escape(c?.description || '')}</textarea></label>
    <p id="form-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="secondary" type="button" id="cancel-form">Cancelar</button><button class="primary" type="submit">Salvar contador</button></div>
    </form>`);
  let preciseStart = c?.start || now;
  $('#start').oninput = () => { preciseStart = null; };
  $('#start-now').onclick = () => { preciseStart = Date.now(); $('#start').value = localInput(preciseStart); $('#start').max = localInput(preciseStart); };
  function setColor(color) { $('#color').value = color; sheetBody.querySelectorAll('[data-color]').forEach(b => { const chosen = b.dataset.color === color; b.setAttribute('aria-pressed',String(chosen)); b.innerHTML = chosen ? icon('check') : ''; }); }
  sheetBody.querySelectorAll('[data-color]').forEach(b => b.onclick = () => setColor(b.dataset.color));
  $('#color').oninput = e => setColor(e.target.value);
  $('#cancel-form').onclick = closeSheet;
  $('#counter-form').onsubmit = async e => {
    e.preventDefault();
    const form = e.target, fields = new FormData(form), start = preciseStart ?? new Date(fields.get('start')).getTime(), name = fields.get('name').trim();
    try {
      if (!name) throw new Error('Preencha o nome do contador.');
      if (!Number.isSafeInteger(start) || start < 0 || start > Date.now()) throw new Error('Escolha uma data de início válida, até agora.');
      const values = { name, emoji: fields.get('emoji').trim(), category: fields.get('category'), color: fields.get('color'), description: fields.get('description').trim(), start };
      const button = form.querySelector('[type=submit]'); button.disabled = true;
      const ok = await commit(data => {
        if (c) {
          const current = requiredCounter(data,c.id), last = current.history.at(-1);
          if (last && start < last.newStart) throw new Error('O início deve ser igual ou posterior ao último reinício.');
          Object.assign(current,values,{ demo:false });
        } else data.counters.push({ ...values, id:crypto.randomUUID(), createdAt:Date.now(), archived:false, demo:false, history:[] });
      }, c ? 'Contador atualizado' : 'Contador criado');
      if (ok) closeSheet(); else button.disabled = false;
    } catch (error) { $('#form-error').textContent = error.message; $('#form-error').hidden = false; }
  };
}
function restartDialog(id) {
  const c = getCounter(id); if (!c) return;
  openSheet('Recomeçar contador', `<p class="confirm-copy">${escape(c.name)}\nA sequência anterior será preservada no histórico.</p><label class="field"><span>Data e hora da ocorrência</span><input id="restart-date" type="datetime-local" min="${localInput(c.start)}" max="${localInput(Date.now())}" value="${localInput(Date.now())}" required></label><button class="text-button now-button" id="restart-now">Usar agora</button><p class="muted">O novo início será a data e hora da ocorrência.</p><p id="restart-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="secondary" id="cancel-reset">Cancelar</button><button class="primary" id="confirm-reset">Confirmar reinício</button></div>`);
  let at = null;
  $('#restart-date').oninput = () => { at = new Date($('#restart-date').value).getTime(); };
  $('#restart-now').onclick = () => { at = null; $('#restart-date').value = localInput(Date.now()); };
  $('#cancel-reset').onclick = closeSheet;
  $('#confirm-reset').onclick = async () => {
    const when = at ?? Date.now();
    if (!Number.isSafeInteger(when) || when < c.start || when > Date.now()) { $('#restart-error').hidden = false; $('#restart-error').textContent = 'Escolha uma ocorrência entre o início atual e agora.'; return; }
    $('#confirm-reset').disabled = true;
    if (await commit(data => restart(requiredCounter(data,id),when), 'Sequência registrada. Contador recomeçado.')) closeSheet();
    else $('#confirm-reset').disabled = false;
  };
}
async function exportBackup() {
  try {
    // Refresh before exporting, including changes made in another tab.
    state = await readState();
    const file = new Blob([JSON.stringify(backup(state),null,2)],{type:'application/json'});
    const url = URL.createObjectURL(file), a = document.createElement('a');
    a.href = url; a.download = `to-limpo-backup-${new Date().toISOString().slice(0,10)}.json`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url),60000); toast('Backup preparado para salvar');
  } catch (error) { toast(error.message); }
}
async function importFile(file) {
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('O backup deve ter no máximo 5 MB.');
    const restored = parseBackup(JSON.parse(await file.text()));
    ask('Restaurar backup?', `Arquivo validado: ${restored.counters.length} contadores e ${restored.counters.reduce((sum,c) => sum + c.history.length,0)} reinícios.\n\nIsso substituirá todos os dados atuais. Exporte um backup antes se quiser preservá-los.`, 'Restaurar', async () => {
      const ok = await commit(() => restored, 'Backup restaurado');
      if (ok) { selected = null; reordering = false; render(); }
      return ok;
    });
  } catch (error) { toast(error instanceof SyntaxError ? 'O arquivo não contém um JSON válido. Nenhum dado foi substituído.' : error.message); }
  finally { $('#backup-file').value = ''; }
}
function archiveList() {
  const counters = state.counters.filter(c => c.archived);
  openSheet('Contadores arquivados', counters.length ? counters.map(c => `<div class="archive-row"><span>${escape(c.emoji)} ${escape(c.name)}</span><button data-action="open-archive" data-id="${escape(c.id)}">Abrir</button><button data-action="restore" data-id="${escape(c.id)}">Restaurar</button></div>`).join('') : '<p class="muted">Nenhum contador arquivado.</p>');
}
const actions = {
  create: () => editor(), open: id => { selected=id; reordering=false; render(); window.scrollTo(0,0); },
  back: () => { selected=null; render(); window.scrollTo(0,0); }, edit: id => editor(id), restart: restartDialog,
  reorder: () => { reordering=!reordering; render(); },
  move: async (id, button) => {
    await commit(data => {
      const active = data.counters.filter(c => !c.archived), from = active.findIndex(c => c.id === id), to = from + Number(button.dataset.direction);
      if (from < 0 || to < 0 || to >= active.length) return;
      const a = data.counters.findIndex(c => c.id === id), b = data.counters.findIndex(c => c.id === active[to].id);
      [data.counters[a],data.counters[b]] = [data.counters[b],data.counters[a]];
    });
    const moved = [...content.querySelectorAll('[data-action=move]')].find(b => b.dataset.id===id && b.dataset.direction===button.dataset.direction && !b.disabled); moved?.focus();
  },
  archive: async id => { const c=getCounter(id); if (!c) return; const archived=!c.archived; if (await commit(data => { requiredCounter(data,id).archived=archived; }, archived ? 'Contador arquivado' : 'Contador restaurado')) { selected=null; render(); } },
  delete: id => { const c=getCounter(id); if (!c) return; ask('Excluir contador?', `“${c.name}” e todo o histórico serão apagados. Essa ação não pode ser desfeita.`, 'Excluir', async () => { const ok=await commit(data => { data.counters=data.counters.filter(c => c.id!==id); },'Contador excluído'); if(ok) { selected=null; render(); } return ok; },true); },
  'remove-demo': () => ask('Remover demonstração?', 'Somente os contadores ainda marcados como exemplo serão excluídos. Os seus contadores serão preservados.', 'Remover', () => commit(data => { data.counters=data.counters.filter(c => !c.demo); },'Exemplos removidos'),true),
  theme: (id,button) => commit(data => { data.settings.theme=button.dataset.theme; }),
  export: exportBackup, import: () => $('#backup-file').click(), archives: archiveList,
  restore: async id => { if(await commit(data => { requiredCounter(data,id).archived=false; },'Contador restaurado')) archiveList(); },
  'open-archive': id => { closeSheet(); selected=id; render(); window.scrollTo(0,0); },
  install: () => { openSheet('Instalar no iPhone', '<p class="confirm-copy">1. Abra este app no Safari.\n2. Toque no botão Compartilhar.\n3. Escolha “Adicionar à Tela de Início”.\n4. Confirme em “Adicionar”.</p><p class="muted">Depois do primeiro carregamento completo, o app funciona offline. Safari e app instalado podem usar armazenamentos separados; use o backup para transferir seus dados se necessário.</p><button class="primary full" id="install-done">Entendi</button>'); $('#install-done').onclick=closeSheet; },
  'check-update': async () => { try { toast(await checkUpdates()); } catch(error) { toast(error.message); } }
};
async function handleAction(e) {
  const button=e.target.closest('[data-action]'); if (!button || button.disabled || busy || !state) return;
  try { await actions[button.dataset.action]?.(button.dataset.id,button); } catch(error) { toast(error.message); }
}
content.addEventListener('click',handleAction); sheetBody.addEventListener('click',handleAction);
$('#add').innerHTML=icon('plus'); $('#close-sheet').innerHTML=icon('close');
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML=icon(el.dataset.icon));
$('#add').onclick=() => { if(state) editor(); };
$('#close-sheet').onclick=closeSheet;
sheet.addEventListener('close',() => document.body.classList.remove('modal-open'));
sheet.addEventListener('click',e => { if(e.target===sheet) { const rect=sheet.getBoundingClientRect(); if(e.clientX<rect.left || e.clientX>rect.right || e.clientY<rect.top || e.clientY>rect.bottom) closeSheet(); } });
document.querySelectorAll('[data-page]').forEach(button => button.onclick=() => { if(!state) return; page=button.dataset.page; selected=null; reordering=false; render(); window.scrollTo(0,0); });
$('#backup-file').onchange=e => importFile(e.target.files[0]);
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',() => state && applyTheme());
async function refresh() { if(!state || busy) return; try { state=await readState(); applyTheme(); render(); } catch(error) { toast(error.message); } }
channel && (channel.onmessage=refresh);
document.addEventListener('visibilitychange',() => { if(!document.hidden) { refresh(); checkUpdates().catch(() => {}); } });
async function main() {
  try { state=await initialize(); applyTheme(); render(); setupUpdates({ toast, isEditing:() => sheet.open }); }
  catch(error) { content.innerHTML=empty('Não foi possível abrir', escape(error.message),'<button class="primary" id="retry">Tentar novamente</button>'); $('#retry').onclick=() => location.reload(); }
}
main();
