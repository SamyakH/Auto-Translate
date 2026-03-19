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

  console.log('🔒 Early Blocker: Removing translation blockers at document_start...');

  // Immediately remove translate="no" and blocking classes from HTML
  const html = document.documentElement;
  if (html) {
    html.removeAttribute('translate');
    html.classList.remove('notranslate', 'skiptranslate');
    html.setAttribute('translate', 'yes');
    console.log('✓ HTML element: Removed translate="no", added translate="yes"');
  }

  // Override meta tag creation to block notranslate meta tags
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName === 'meta') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        // Block translation-blocking meta tags
        if ((name === 'name' && value === 'google') || 
            (name === 'content' && value === 'notranslate')) {
          console.log(`🚫 Blocked meta tag creation: ${name}=${value}`);
          return;
        }
        originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };

  // Run removal function immediately and after small delay
  function removeBlockersEarly() {
    try {
      // Remove existing meta noTranslate
      document.querySelectorAll('meta[content="notranslate"]').forEach(el => {
        try { el.remove(); } catch (e) { }
      });

      // Remove notranslate attributes from all elements
      document.querySelectorAll('[translate="no"]').forEach(el => {
        try {
          el.removeAttribute('translate');
          el.setAttribute('translate', 'yes');
        } catch (e) { }
      });

      document.querySelectorAll('.notranslate').forEach(el => {
        try {
          el.classList.remove('notranslate');
        } catch (e) { }
      });

      console.log('✓ Early blockers removed successfully');
    } catch (e) {
      console.warn('Early blocker cleanup failed:', e);
    }
  }

  // Run immediately
  removeBlockersEarly();

  // Run again after 100ms to catch dynamically added blockers
  setTimeout(removeBlockersEarly, 100);

  console.log('✅ Early Blocker loaded');
})();
