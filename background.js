/**
 * Background Service Worker
 * Manages domain processing memory and content communication
 */

'use strict';

let processedDomains = {};

// Load persisted domains on startup
chrome.storage.local.get(['processedDomains'], (data) => {
  if (data.processedDomains) {
    processedDomains = data.processedDomains;
    console.log(`✅ Loaded ${Object.keys(processedDomains).length} processed domains`);
  }
});

/**
 * Get hostname from URL
 */
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    const hostname = getHostname(sender.tab?.url);
    if (!hostname) {
      sendResponse({ error: 'Invalid URL' });
      return true;
    }

    switch (message.action) {
      case 'saveDomain':
        processedDomains[hostname] = {
          added: Date.now(),
          lastProcessed: Date.now()
        };
        chrome.storage.local.set({ processedDomains }, () => {
          if (chrome.runtime.lastError) {
            console.error(`Failed to save ${hostname}:`, chrome.runtime.lastError);
          } else {
            console.log(`✅ Domain saved: ${hostname}`);
          }
        });
        sendResponse({ success: true });
        break;

      case 'getDomains':
        sendResponse({ domains: processedDomains });
        break;

      default:
        sendResponse({ error: 'Unknown action' });
    }
    
    return true;
  } catch (error) {
    console.error('Message handler error:', error);
    try {
      sendResponse({ error: error.message });
    } catch (e) {
      // ignore
    }
    return true;
  }
});