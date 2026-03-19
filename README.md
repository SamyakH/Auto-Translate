# Force Inline Auto Translate

**Version 2.1** — A lightweight, optimized Chrome extension that automatically translates foreign language web pages using Chrome's built-in Google Translate, removes translation blockers, enables right-click/text selection on restricted sites, and remembers processed domains.

## Features

### 🌐 Intelligent Language Detection
- **Multi-Method Detection**: HTML `lang` attributes, meta tags, and Unicode script analysis
- **Confidence Scoring**: Validates detection with confidence thresholds to avoid false positives
- **Supported Languages**: Chinese, Russian, Japanese, Korean, Arabic, Hebrew, Thai, and more
- **Zero False Positives**: Skips processing if page language matches browser language

### 🚫 Translation Blocker Removal
- **CSP Meta Tags**: Removes Content-Security-Policy restrictions
- **Class-based Blocking**: Strips `notranslate`, `skiptranslate`, and similar blocking classes
- **Attribute-based Blocking**: Removes `translate="no"` and `data-translate` attributes
- **Early Preparation**: HTML element prepared at document_start before Chrome scans the page
- **Full Cleanup**: Comprehensive blocker removal when DOM is fully parsed at document_idle

### 🖱️ Right-Click & Selection Enablement
- **Context Menu Restoration**: Re-enables right-click on blocked sites
- **Text Selection Freedom**: Forces text selection on copy-protected pages
- **CSS Injection**: Injects minimal style overrides for robust enablement
- **Clean Implementation**: Safe event listener without risky global overrides

### 💾 Smart Domain Memory  
- **Persistent Tracking**: Remembers which domains have been translated
- **Faster Processing**: No redundant translation triggering on revisits
- **Local Storage**: All data stored locally using `chrome.storage.local`
- **Zero Privacy Impact**: No external communication or analytics

### ⚡ Performance Optimizations
- **Early Language Check**: Skips processing on same-language pages immediately
- **Minimal Event Dispatching**: Only essential events to trigger translation
- **Efficient SPA Support**: Re-runs on dynamic content with throttling
- **Clean Code**: Removed 165+ lines of dead/redundant code
- **Safe Architecture**: No risky global overrides or recursive event listeners

## Installation

### From Source

1. Clone or download this repository:
\`\`\`bash
git clone https://github.com/SamyakH/Auto-Translate.git
cd Auto-Translate
\`\`\`

2. Open Chrome/Edge browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the extension directory

5. The extension icon should appear in your browser toolbar

## Usage

### Automatic Operation

Once installed:

1. Visit any **foreign language** website
2. The extension detects the language automatically
3. Translation is triggered within ~400ms
4. Right-click and text selection are enabled automatically

**That's it—no configuration needed!**

## File Structure

```
force-inline-auto-translate/
├── manifest.json          # Extension manifest (MV3)
├── early-blocker.js       # Early blocker: Runs at document_start
├── content.js             # Main logic: Detection, blocking removal, translation
├── background.js          # Service worker: Domain memory management
├── icon.png               # Extension icon
└── README.md              # This file
```

## What's New in v2.1

### Code Cleanup
- ✅ Removed 165+ lines of dead/unused code
- ✅ Removed unused `isDomainProcessed` variable
- ✅ Removed unused `checkDomain()` function (30+ lines)
- ✅ Simplified backup retry logic from 3 attempts to 1 smart retry
- ✅ Removed risky `document.createElement` override
- ✅ Removed unused CONFIG values (`MAX_TEXT_SAMPLE`, `TRANSLATION_DELAY`)

### Early Blocker Optimization
- ✅ Fixed early-blocker.js to work safely at document_start
- ✅ Removed premature DOM queries that fail during document parsing
- ✅ Kept only what works at document_start (HTML element preparation)
- ✅ Delegated full cleanup to content.js when DOM is ready

### Background Service Worker
- ✅ Removed unused `checkDomain` message handler
- ✅ Kept only `saveDomain` and `getDomains` (actually used)

### Result
- **Safer**: No global overrides, no risky shortcuts
- **Faster**: Less code execution, fewer redundant retries (~40% smaller)
- **Cleaner**: Only essential functionality remains
- **Maintainable**: Clear separation of concern
2. Technical Architecture

### Why Two-Stage Approach?
1. **early-blocker.js** (document_start): Prepares HTML element BEFORE Chrome analyzes the page
2. **content.js** (document_idle): Full DOM available for comprehensive blocker removal
- **Result**: Chrome sees a translatable page bs

##
### Performance Metrics
- Event dispatching: 4-7 essential events (significant reduction)
- Backup retries: 1 smart retry at 3s (vs. 3 redundant retries)
## Browser Compatibility

- ✅ Google Chrome (v88+)
- ✅ Microsoft Edge (v88+)
- ✅ Brave Browser
- ✅ Other Chromium-based browsers

## Permissions

- **storage**: Domain memory persistence
- **host_permissions (`<all_urls>`)**: Work on any website

## Privacy & Security

- ✅ **No Data Collection**: Zero analytics or tracking
- ✅ **Local Storage Only**: All data stays on your device
- ✅ **No External Servers**: Everything runs in-browser
- ✅ **Open Source**: Code is fully transparentons/`
3. Debugging & Diagnostics

### Run Diagnostics
```javascript
window.ft_diagnose()
```
Shows:
- Detected language and confidence score
- Browser language
- Current HTML lang attribute
- Number of blocking classes/attributes found
- Translation status

### Manual Trigger
```javascript
window.ft_manualTrigger()
```
Forces immediate translation trigger (useful for testing).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Translation bar doesn't appear | Run `window.ft_diagnose()` to check detection and blockers |
| Right-click still blocked | Reload extension at `chrome://extensions/` |
| Domain not remembered | Verify storage permission is granted |
| Sluggish performance | Check for conflicting extension
## Future Enhancements

- [ ] Add popup UI for settings
- [ ] Language preference configuration
- [ ] Domain whitelist/blacklist management
- [ ] Keyboard shortcuts for manual triggering
- [ ] Firefox WebExtensions support

## License

See [LICENSE](./LICENSE) file for details.

## Contributing
s |

## License

MIT License - Feel free to modify and redistribute

## Contributing

Issues and pull requests are welcome! Help make this extension even better.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review browser console logs for debugging

---

**Note**: This extension leverages Chrome's built-in Google Translate feature and does not provide its own translation engine. Ensure Chrome's translation functionality is enabled in browser settings for optimal performance.
