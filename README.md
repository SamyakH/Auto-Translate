# Force Inline Auto Translate

**Version 2.0** — A lightweight, optimized Chrome extension that automatically translates foreign language web pages using Chrome's built-in Google Translate, removes translation blockers, enables right-click/text selection on restricted sites, and remembers processed domains.

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
- **Minimal DOM Manipulation**: Efficient, non-destructive blocker removal

### 🖱️ Right-Click & Selection Enablement
- **Context Menu Restoration**: Re-enables right-click on blocked sites
- **Text Selection Freedom**: Forces text selection on copy-protected pages
- **CSS Injection**: Injects minimal style overrides for robust enablement
- **No Event Hijacking**: Clean event listener implementation (no recursive overrides)

### 💾 Smart Domain Memory  
- **Persistent Tracking**: Remembers which domains have been translated
- **Faster Processing**: No redundant translation triggering on revisits
- **Local Storage**: All data stored locally using `chrome.storage.local`
- **Zero Privacy Impact**: No external communication or analytics

### ⚡ Performance Optimizations
- **Early Language Check**: Skips processing on same-language pages
- **Clean Event Dispatching**: Minimal, targeted events to trigger translation (4 events vs. 20+)
- **No Fake Elements**: Removed unnecessary DOM pollution from trigger elements
- **Throttled DOM Observer**: Respects system performance during SPA navigation
- **Efficient CSS**: Consolidated style injection with essential rules only

### 🔧 Robust Architecture
- **Multiple Initialization Paths**: Handles document_start, DOMContentLoaded, and slow pages
- **Dynamic Content Support**: Re-runs translation on SPA navigation (throttled)
- **Error Recovery**: Continues operation even if individual steps fail
- **Clean Logging**: Structured console output for debugging

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

\`\`\`
force-inline-auto-translate/
├── manifest.json          # Extension manifest (MV3)
├── content.js             # Main logic: detection, blocking removal, translation
├── background.js          # Service worker: domain memory management
├── icon.png               # Extension icon
└── README.md              # This file
\`\`\`

## Technical Improvements (v2.0)

### Code Refactoring
- ✅ Removed 400+ lines of unused code (foreign texts, fake elements)
- ✅ Eliminated deeply nested setTimeout chains
- ✅ Removed recursive addEventListener override that caused stack overflow
- ✅ Simplified from 6 initialization strategies to 2

### Performance Enhancements
- ✅ Reduced event dispatching from 20+ events to 4 essential events
- ✅ Changed MutationObserver to watch direct children only (not deep subtree)
- ✅ Removed document title manipulation
- ✅ Removed artificial visibility property changes
- ✅ Removed 12 invisible trigger element creation per init

### Quality Improvements
- ✅ Added language confidence scoring
- ✅ Better error handling and recovery
- ✅ Cleaner code organization with JSDoc comments
- ✅ Fixed the "RangeError: Maximum call stack size exceeded" bug
- ✅ Improved console logging with symbols (✓, ✗, ℹ️, etc.)

### Manifest Changes
- ✅ Updated `run_at` from `document_idle` to `document_start` for faster execution
- ✅ Bumped version to 2.0.0 to reflect major improvements

## How It Works

### Detection & Initialization (document_start)
\`\`\`
1. Detect page language with confidence scoring
2. Compare with browser language
3. Skip if no foreign language detected or confidence too low
4. Wait for page to be ready (DOMContentLoaded)
\`\`\`

### Processing
\`\`\`
5. Enable right-click & text selection
6. Remove translation blockers
7. Save domain for future visits
8. Trigger Chrome translation (4 key events)
\`\`\`

### Backup & Dynamic Content
\`\`\`
9. Retry if no translation after 3.5 seconds (slow pages)
10. Re-run on significant DOM changes (SPAs, throttled)
\`\`\`

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
- ✅ **Open Source**: Code is fully transparent

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Translation not triggering | Ensure Chrome's built-in translation is enabled |
| Right-click still blocked | Refresh the page after installing/updating |
| Domain not remembered | Check storage permission in `chrome://extensions/` |
| Errors in console | Inspect console output for specific error messages |

## Development

### Quick Start
No build tools required—this is pure JavaScript:

1. Make changes to `content.js`, `background.js`, or `manifest.json`
2. Go to `chrome://extensions/`
3. Click refresh on the extension card
4. Test on target websites

### Architecture Notes
- **content.js**: ~250 lines of focused, clean code
- **background.js**: ~60 lines of straightforward domain management
- **manifest.json**: Standard MV3 configuration

## Future Enhancements

- [ ] Add popup UI for settings
- [ ] Language preference configuration
- [ ] Domain whitelist/blacklist management
- [ ] Keyboard shortcuts for manual triggering
- [ ] Firefox WebExtensions support

## License

See [LICENSE](./LICENSE) file for details.

## Contributing

Issues and pull requests are welcome! Help make this extension even better.

## License

MIT License - See LICENSE file for details

## Credits

Developed for automatic translation and accessibility enhancement on foreign language websites.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review browser console logs for debugging

---

**Note**: This extension leverages Chrome's built-in Google Translate feature and does not provide its own translation engine. Ensure Chrome's translation functionality is enabled in browser settings for optimal performance.
