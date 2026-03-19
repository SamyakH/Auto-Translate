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
   * Remove translation blockers aggressively
   */
  function removeBlockers() {
    try {
      console.log('🚫 Removing translation blockers...');
      
      // Remove CSP meta tags
      let cspCount = 0;
      document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"]').forEach(el => {
        try { 
          el.remove(); 
          cspCount++;
        } catch (e) { console.warn('Failed to remove CSP meta:', e); }
      });
      if (cspCount > 0) console.log(`✓ Removed ${cspCount} CSP meta tags`);

      // Set HTML to translate
      const html = document.documentElement;
      html.setAttribute('translate', 'yes');
      html.classList.remove('notranslate', 'skiptranslate');
      html.removeAttribute('data-translate');
      html.removeAttribute('data-notranslate');
      console.log('✓ HTML element: translate="yes" + removed blocking classes');
      
      // Remove blocking classes/attributes from elements
      const blockingSelectors = [
        '.notranslate', '.skiptranslate', '.no-translate', '.dont-translate',
        '[translate="no"]', '[data-translate="no"]', '[data-notranslate]'
      ];
      
      let totalModified = 0;
      blockingSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`✓ Found ${elements.length} elements with: ${selector}`);
          totalModified += elements.length;
        }
        
        elements.forEach(el => {
          try {
            el.classList.remove('notranslate', 'skiptranslate', 'no-translate', 'dont-translate');
            el.removeAttribute('translate');
            el.removeAttribute('data-translate');
            el.removeAttribute('data-notranslate');
            el.setAttribute('translate', 'yes');
          } catch (e) { console.warn('Failed to modify element:', e); }
        });
      });
      
      console.log(`✅ Removed blockers from ${totalModified} elements`);
      return true;
    } catch (error) {
      console.error('Failed to remove blockers:', error);
      return false;
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
      
      console.log(`📊 Detected: ${sourceLang}, Browser: ${browserLang}, Confidence: ${confidence.toFixed(2)}`);
      
      if (sourceLang === browserLang) {
        console.log('ℹ️ Page language matches browser language, skipping');
        return false;
      }

      if (confidence < CONFIG.MIN_LANGUAGE_CONFIDENCE) {
        console.log(`ℹ️ Language confidence too low (${confidence.toFixed(2)}), skipping`);
        return false;
      }

      console.log(`✅ Foreign language detected: ${sourceLang} (confidence: ${confidence.toFixed(2)})`);
      
      // CRITICAL: Set language IMMEDIATELY before anything else
      const html = document.documentElement;
      html.lang = sourceLang;
      html.setAttribute('xml:lang', sourceLang);
      if (document.body) {
        document.body.lang = sourceLang;
      }
      console.log(`✓ Language attributes set to: ${sourceLang}`);
      
      // Wait for page to be ready
      await waitForPageReady();

      // Remove blockers BEFORE triggering
      removeBlockers();
      
      // Enable right-click
      enableRightClick();

      // Save domain for future visits
      saveDomain();

      // Trigger translation with slight delay to let blockers settle
      setTimeout(() => {
        console.log('🔥 Now triggering Chrome translation system...');
        triggerChromeTranslationFinal(sourceLang);
      }, 300);
      
      return true;
    } catch (error) {
      console.error('Initialization failed:', error);
      return false;
    }
  }

  /**
   * Final translation trigger (after everything is set up)
   */
  function triggerChromeTranslationFinal(sourceLang) {
    if (translationAttempted) return;
    translationAttempted = true;

    try {
      console.log(`🔄 FINAL Chrome translation trigger (${sourceLang})...`);
      
      // Dispatch many events to wake up Chrome's translator
      const eventConfigs = [
        { name: 'load', target: window },
        { name: 'pageshow', target: window },
        { name: 'focus', target: window },
        { name: 'DOMContentLoaded', target: document },
        { name: 'focusin', target: document },
        { name: 'visibilitychange', target: document },
        { name: 'mousemove', target: document },
        { name: 'mousemove', target: document.body },
        { name: 'mousemove', target: document.documentElement }
      ];
      
      // Dispatch all events
      eventConfigs.forEach(config => {
        try {
          let event;
          if (config.name === 'mousemove') {
            event = new MouseEvent(config.name, { 
              bubbles: true, 
              cancelable: true,
              clientX: Math.random() * window.innerWidth,
              clientY: Math.random() * window.innerHeight,
              buttons: 1
            });
          } else {
            event = new Event(config.name, { bubbles: true, cancelable: true });
          }
          
          config.target.dispatchEvent(event);
        } catch (e) {
          console.warn(`Failed to dispatch ${config.name}:`, e);
        }
      });
      
      console.log(`✅ Dispatched ${eventConfigs.length} events`);
      
      // Final title manipulation (Chrome watches for this)
      try {
        const originalTitle = document.title;
        document.title = `[${sourceLang.toUpperCase()}] ${originalTitle}`;
        setTimeout(() => {
          document.title = originalTitle;
        }, 2000);
      } catch (e) {
        console.warn('Title update failed:', e);
      }
      
    } catch (error) {
      console.error('Final trigger failed:', error);
    }
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { 
      console.log('📄 DOMContentLoaded fired, initializing...');
      void init(); 
    }, { once: true });
  } else {
    console.log('📄 Document already loaded, initializing immediately...');
    void init();
  }

  // Multiple backup initializations for stubborn pages
  setTimeout(() => {
    if (!translationAttempted) {
      console.log('⏱️  Backup 1 (2s): No translation yet, retrying...');
      translationAttempted = false;
      void init();
    }
  }, 2000);

  setTimeout(() => {
    if (!translationAttempted) {
      console.log('⏱️  Backup 2 (4s): Still no translation, aggressive retry...');
      translationAttempted = false;
      void init();
    }
  }, 4000);

  setTimeout(() => {
    if (!translationAttempted) {
      console.log('⏱️  Backup 3 (6s): Final attempt with extra triggers...');
      translationAttempted = false;
      void init();
      
      // Extra aggressive final trigger
      const finalTrigger = () => {
        try {
          const md = new MouseEvent('mousemove', { bubbles: true });
          document.documentElement.dispatchEvent(md);
          window.dispatchEvent(new Event('focus'));
          document.dispatchEvent(new Event('visibilitychange'));
          console.log('✓ Final aggressive trigger dispatched');
        } catch (e) {
          console.warn('Final trigger failed:', e);
        }
      };
      setTimeout(finalTrigger, 1000);
    }
  }, 6000);

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

  // Expose diagnostic helper to window for debugging
  window.ft_diagnose = function() {
    console.log('%c=== Force Inline Translate Diagnostics ===', 'color: blue; font-weight: bold; font-size: 14px');
    
    const detection = detectLanguage();
    const browserLang = getBrowserLanguage();
    const htmlLang = document.documentElement.lang;
    
    console.log(`Page Language Detected: ${detection ? detection.lang : 'NONE'}`);
    console.log(`  Confidence: ${detection ? detection.confidence.toFixed(2) : 'N/A'}`);
    console.log(`Browser Language: ${browserLang}`);
    console.log(`HTML lang attribute: ${htmlLang || 'NOT SET'}`);
    console.log(`Translation Attempted: ${translationAttempted}`);
    
    const cspMeta = document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"]').length;
    console.log(`\nCSP Meta Tags: ${cspMeta}`);
    
    const notranslateTags = document.querySelectorAll('[translate="no"]').length +
                           document.querySelectorAll('.notranslate').length +
                           document.querySelectorAll('.skiptranslate').length;
    console.log(`Blocking Classes/Attrs Found: ${notranslateTags}`);
    
    console.log(`\n✓ To manually trigger, run: window.ft_manualTrigger()`);
  };
  
  // Manual trigger function for testing
  window.ft_manualTrigger = function() {
    console.log('%c🚀 MANUAL TRIGGER STARTED', 'color: red; font-weight: bold');
    translationAttempted = false;
    void init();
    console.log('%c✅ Initialization triggered', 'color: green');
  };

  console.log('✅ Extension loaded - Run window.ft_diagnose() in console for diagnostics');
})();
