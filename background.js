let processedDomains = {};
let extensionEnabled = true; // default ON

// Load saved state on startup
chrome.storage.local.get(['processedDomains', 'extensionEnabled'], (data) => {
  if (data.processedDomains) {
    processedDomains = data.processedDomains;
    console.log('Loaded processed domains:', Object.keys(processedDomains).length);
  }
  if (typeof data.extensionEnabled === 'boolean') {
    extensionEnabled = data.extensionEnabled;
  }
  console.log('Extension enabled:', extensionEnabled);

  // Set initial badge for all tabs (best effort)
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id) return;
      chrome.action.setBadgeText({
        tabId: tab.id,
        text: extensionEnabled ? 'ON' : 'OFF'
      });
      chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: extensionEnabled ? '#008000' : '#808080'
      });
      chrome.action.setTitle({
        tabId: tab.id,
        title: extensionEnabled
          ? 'Force Inline Auto Translate: ON'
          : 'Force Inline Auto Translate: OFF'
      });
    });
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.action === 'checkEnabled') {
      sendResponse({ enabled: extensionEnabled });
      return true;
    }

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

// Handle extension icon click: toggle ON/OFF
chrome.action.onClicked.addListener((tab) => {
  extensionEnabled = !extensionEnabled;

  chrome.storage.local.set({ extensionEnabled }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to persist enabled state:', chrome.runtime.lastError);
    }
  });

  if (tab.id) {
    chrome.action.setBadgeText({
      tabId: tab.id,
      text: extensionEnabled ? 'ON' : 'OFF'
    });
    chrome.action.setBadgeBackgroundColor({
      tabId: tab.id,
      color: extensionEnabled ? '#008000' : '#808080'
    });
    chrome.action.setTitle({
      tabId: tab.id,
      title: extensionEnabled
        ? 'Force Inline Auto Translate: ON'
        : 'Force Inline Auto Translate: OFF'
    });
  }

  console.log('Extension toggled. Enabled:', extensionEnabled);
});