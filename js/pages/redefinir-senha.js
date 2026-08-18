import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: false });
  renderFooter(document.getElementById('footer-root'));
}

document.addEventListener('DOMContentLoaded', init);