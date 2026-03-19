(function () {
  'use strict';

  // Skip chrome:// pages, extension pages, and iframes
  if (location.protocol === 'chrome:' || 
      location.protocol === 'chrome-extension:' ||
      location.protocol === 'moz-extension:' ||
      window.self !== window.top) {
    return;
  }

  // Configuration
  const CONFIG = {
    MAX_TEXT_SAMPLE: 1000,
    PAGE_LOAD_TIMEOUT: 4000,
    TRANSLATION_DELAY: 400,
    SPA_REINIT_INTERVAL: 5000,
    MIN_LANGUAGE_CONFIDENCE: 0.5
  };

  // Language detection patterns with confidence
  const LANGUAGE_PATTERNS = {
    zh: { regex: /[\u4e00-\u9fff]/, confidence: 1.0 },
    ru: { regex: /[\u0400-\u04ff]/, confidence: 0.9 },
    ja: { regex: /[\u3040-\u309f\u30a0-\u30ff]/, confidence: 0.9 },
    ko: { regex: /[\uac00-\ud7af]/, confidence: 0.9 },
    ar: { regex: /[\u0600-\u06ff]/, confidence: 0.8 },
    he: { regex: /[\u0590-\u05ff]/, confidence: 0.8 },
    th: { regex: /[\u0e00-\u0e7f]/, confidence: 0.8 }
  };

  // State tracking
  let translationAttempted = false;
  let isDomainProcessed = false;

  console.log('🌍 Auto Translate Extension: Enhanced Version - Optimized');

  /**
   * Detect page language with confidence scoring
   * @returns {object|null} { lang: string, confidence: number } or null
   */
  function detectLanguage() {
    try {
      // Method 1: HTML lang attribute (highest priority)
      const htmlLang = document.documentElement.lang;
      if (htmlLang && htmlLang.trim()) {
        const lang = htmlLang.toLowerCase().split('-')[0];
        console.log(`✓ Language detected via HTML lang: ${lang}`);
        return { lang, confidence: 0.95 };
      }
      
      // Method 2: Meta tag
      const metaLang = document.querySelector('meta[http-equiv="content-language"]');
      if (metaLang?.content) {
        const lang = metaLang.content.toLowerCase().split('-')[0];
        console.log(`✓ Language detected via meta tag: ${lang}`);
        return { lang, confidence: 0.9 };
      }
      
      // Method 3: Text-based script detection
      const textSample = document.body?.textContent?.substring(0, CONFIG.MAX_TEXT_SAMPLE) || '';
      if (!textSample) return null;

      for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
        if (pattern.regex.test(textSample)) {
          const matchCount = (textSample.match(pattern.regex) || []).length;
          const confidence = Math.min(pattern.confidence, Math.min(1, matchCount / 50));
          
          if (confidence >= CONFIG.MIN_LANGUAGE_CONFIDENCE) {
            console.log(`✓ Language detected via text analysis: ${lang} (confidence: ${confidence.toFixed(2)})`);
            return { lang, confidence };
          }
        }
      }
      
      console.log('✗ No foreign language detected');
      return null;
    } catch (error) {
      console.error('Language detection failed:', error);
      return null;
    }
  }

  /**
   * Get browser language
   * @returns {string}
   */
  function getBrowserLanguage() {
    try {
      return (navigator.language || navigator.userLanguage || 'en').toLowerCase().split('-')[0];  
    } catch {
      return 'en';
    }
  }

  /**
   * Enable right-click and text selection
   */
  function enableRightClick() {
    try {
      console.log('🖱️ Enabling right-click & selection...');
      
      // Clear all contextmenu handlers
      document.oncontextmenu = null;
      document.body.oncontextmenu = null;
      window.oncontextmenu = null;
      
      // Clear text selection restrictions
      document.onselectstart = null;
      document.ondragstart = null;
      document.onmousedown = null;
      document.body.onselectstart = null;
      
      // Add permissive contextmenu listener
      const handler = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        return true;
      };
      
      document.addEventListener('contextmenu', handler, true);
      document.body.addEventListener('contextmenu', handler, true);
      
      // Inject CSS overrides
      const style = document.createElement('style');
      style.id = 'ft-enable-rightclick';
      style.textContent = `
        * { user-select: text !important; -webkit-user-select: text !important; pointer-events: auto !important; }
        body { -webkit-touch-callout: default !important; }
      `;
      document.head?.appendChild(style);
      
      console.log('✅ Right-click & selection enabled');
      return true;
    } catch (error) {
      console.error('Failed to enable right-click:', error);
      return false;
    }
  }

  /**
   * Remove translation blockers
   */
  function removeBlockers() {
    try {
      console.log('🚫 Removing translation blockers...');
      
      // Remove CSP meta tags
      document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"]').forEach(el => {
        try { el.remove(); } catch (e) { console.warn('Failed to remove CSP meta:', e); }
      });

      // Set HTML to translate
      const html = document.documentElement;
      html.setAttribute('translate', 'yes');
      html.classList.remove('notranslate', 'skiptranslate');
      html.removeAttribute('data-translate');
      html.removeAttribute('data-notranslate');
      
      // Remove blocking classes/attributes from elements
      const blockingSelectors = [
        '.notranslate', '.skiptranslate', '.no-translate', '.dont-translate',
        '[translate="no"]', '[data-translate="no"]', '[data-notranslate]'
      ];
      
      blockingSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          try {
            el.classList.remove('notranslate', 'skiptranslate', 'no-translate', 'dont-translate');
            el.removeAttribute('translate');
            el.removeAttribute('data-translate');
            el.removeAttribute('data-notranslate');
            el.setAttribute('translate', 'yes');
          } catch (e) { console.warn('Failed to modify element:', e); }
        });
      });
      
      console.log('✅ Blockers removed');
      return true;
    } catch (error) {
      console.error('Failed to remove blockers:', error);
      return false;
    }
  }

  /**
   * Trigger Chrome's built-in translation
   */
  function triggerChromeTranslation(sourceLang) {
    if (translationAttempted) return;
    translationAttempted = true;

    try {
      console.log(`🔄 Triggering Chrome translation (${sourceLang})...`);
      
      const html = document.documentElement;
      
      // Clear and reset language attributes
      html.removeAttribute('lang');
      html.removeAttribute('xml:lang');
      
      setTimeout(() => {
        // Set source language
        html.lang = sourceLang;
        html.setAttribute('xml:lang', sourceLang);
        
        console.log(`Set language to: ${sourceLang}`);
        
        // Dispatch browser-relevant events
        setTimeout(() => {
          const events = ['load', 'focus', 'visibilitychange', 'mousemove'];
          events.forEach(name => {
            try {
              const event = name === 'mousemove' 
                ? new MouseEvent('mousemove', { bubbles: true, cancelable: true })
                : new Event(name, { bubbles: true, cancelable: true });
              
              window.dispatchEvent(event);
              console.log(`✓ Dispatched ${name}`);
            } catch (e) {
              console.warn(`Failed to dispatch ${name}:`, e);
            }
          });
        }, 200);
      }, 100);
      
      console.log('✅ Translation trigger completed');
    } catch (error) {
      console.error('Translation trigger failed:', error);
    }
  }

  /**
   * Wait for page to be ready for translation
   */
  function waitForPageReady() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const handler = () => {
        document.removeEventListener('DOMContentLoaded', handler);
        resolve();
      };
      
      document.addEventListener('DOMContentLoaded', handler, { once: true });
      
      setTimeout(() => {
        document.removeEventListener('DOMContentLoaded', handler);
        resolve();
      }, CONFIG.PAGE_LOAD_TIMEOUT);
    });
  }

  /**
   * Check if domain was already processed
   */
  function checkDomain() {
    return new Promise((resolve) => {
      if (!chrome?.runtime?.sendMessage) {
        resolve(false);
        return;
      }

      chrome.runtime.sendMessage({ action: 'checkDomain' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('checkDomain failed:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(response?.shouldProcess || false);
        }
      });
    });
  }

  /**
   * Save domain to processed list
   */
  function saveDomain() {
    if (!chrome?.runtime?.sendMessage) return;

    chrome.runtime.sendMessage({ action: 'saveDomain' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('saveDomain failed:', chrome.runtime.lastError);
      } else if (response?.success) {
        console.log('✅ Domain saved');
        isDomainProcessed = true;
      }
    });
  }

  /**
   * Main initialization
   */
  async function init() {
    try {
      console.log('🚀 Initializing translation...');
      
      // Detect language
      const detectionResult = detectLanguage();
      if (!detectionResult) {
        console.log('ℹ️ No foreign language detected, skipping');
        return false;
      }

      const { lang: sourceLang, confidence } = detectionResult;
      const browserLang = getBrowserLanguage();
      
      if (sourceLang === browserLang) {
        console.log('ℹ️ Page language matches browser language, skipping');
        return false;
      }

      if (confidence < CONFIG.MIN_LANGUAGE_CONFIDENCE) {
        console.log(`ℹ️ Language confidence too low (${confidence.toFixed(2)}), skipping`);
        return false;
      }

      console.log(`✅ Foreign language detected: ${sourceLang} (confidence: ${confidence.toFixed(2)})`);
      
      // Wait for page
      await waitForPageReady();

      // Enable right-click
      enableRightClick();

      // Remove blockers
      removeBlockers();

      // Save domain for future visits
      saveDomain();

      // Trigger translation
      setTimeout(() => triggerChromeTranslation(sourceLang), CONFIG.TRANSLATION_DELAY);
      
      return true;
    } catch (error) {
      console.error('Initialization failed:', error);
      return false;
    }
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void init(); }, { once: true });
  } else {
    void init();
  }

  // Backup initialization for slow pages
  setTimeout(() => {
    if (!translationAttempted) {
      console.log('⏱️ Backup: No translation yet, retrying...');
      translationAttempted = false;
      void init();
    }
  }, 3500);

  // SPA/dynamic content detection
  try {
    let lastInit = 0;
    const observer = new MutationObserver(() => {
      const now = Date.now();
      if (now - lastInit < CONFIG.SPA_REINIT_INTERVAL) return;
      
      lastInit = now;
      console.log('🔁 DOM changed, re-checking translation...');
      translationAttempted = false;
      void init();
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: false // Only observe direct children, not deep tree
    });
  } catch (e) {
    console.warn('SPA observer failed:', e);
  }

  console.log('✅ Extension loaded');
})();
