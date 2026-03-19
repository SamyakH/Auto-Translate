let processedDomains = {};
// Extension is always enabled now

// Load saved processed domains on startup
chrome.storage.local.get(['processedDomains'], (data) => {
  if (data.processedDomains) {
    processedDomains = data.processedDomains;
    console.log('Loaded processed domains:', Object.keys(processedDomains).length);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
   // Extension is always enabled now; no checkEnabled branch

   if (message.action === 'checkDomain' && sender.tab?.url) {
      const hostname = new URL(sender.tab.url).hostname;
      const entry = processedDomains[hostname];
      const shouldProcess = !!entry;

      if (entry) {
        entry.lastProcessed = Date.now();
        chrome.storage.local.set({ processedDomains });
      }

      console.log(`Domain check for ${hostname}: ${shouldProcess ? 'remembered' : 'new'}`);
      sendResponse({ shouldProcess });
      return true;
    }

    if (message.action === 'saveDomain' && sender.tab?.url) {
      const hostname = new URL(sender.tab.url).hostname;
      processedDomains[hostname] = {
        added: Date.now(),
        lastProcessed: Date.now()
      };

      chrome.storage.local.set({ processedDomains }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to save domain:', chrome.runtime.lastError);
        } else {
          console.log(`Domain saved: ${hostname}`);
        }
      });

      sendResponse({ success: true });
      return true;
    }

    if (message.action === 'getDomains') {
      sendResponse({ domains: processedDomains });
      return true;
    }

 } catch (error) {
    console.error('Background script error:', error);
    try {
      sendResponse({ error: error.message });
    } catch (e) {
      // ignore
    }
    return true;
  }

  return false;
});


// No action click handler anymore – extension is always on