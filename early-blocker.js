// Early blocker - runs at document_start, BEFORE Chrome scans for translation
(function() {
  'use strict';

  // Skip non-web pages
  if (location.protocol === 'chrome:' || 
      location.protocol === 'chrome-extension:' ||
      location.protocol === 'moz-extension:' ||
      window.self !== window.top) {
    return;
  }

  console.log('🔒 Early Blocker: Removing translation blockers...');

  try {
    // At document_start, the DOM is being parsed
    // We can only remove attributes from the documentElement if it exists
    const html = document.documentElement;
    if (html) {
      html.removeAttribute('translate');
      html.classList.remove('notranslate', 'skiptranslate');
      html.setAttribute('translate', 'yes');
      console.log('✓ HTML element prepared for translation');
    }
  } catch (e) {
    console.warn('Early blocker failed:', e);
  }

  // Note: Full blocker removal (meta tags, nested elements) happens in content.js at document_idle
  // when the DOM is fully parsed and available
})();
