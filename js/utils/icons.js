/** Ícones SVG flat monocromáticos (fill currentColor) */

function svg(paths, className = 'hub-icon') {
  return `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">${paths}</svg>`;
}

export const iconPin = () =>
  svg('<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>');

export const iconCalendar = () =>
  svg('<path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 100 2h8a1 1 0 100-2H6z"/>');

export const iconBuilding = () =>
  svg(
    '<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12H4V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9zM8 13h4v2H8v-2z" clip-rule="evenodd"/>'
  );

export const iconFilter = () =>
  svg(
    '<path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd"/>',
    'hub-icon hub-icon--filtros'
  );

export const iconMenu = () =>
  svg(
    '<path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>',
    'hub-icon hub-icon--menu'
  );

export const iconUser = () =>
  svg(
    '<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>'
  );

export const iconUsers = () =>
  svg(
    '<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.742-.963A8.001 8.001 0 0018 15v1h-2zM2 18v-1a6 6 0 0112 0v1H2z"/>'
  );

export const iconLg = (fn) => fn().replace('hub-icon', 'hub-icon hub-icon--lg');
