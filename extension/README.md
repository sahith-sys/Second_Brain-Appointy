# Project Synapse - Browser Extension

Your second brain - capture any thought, instantly from anywhere on the web!

## Features

### ✅ Current Features (Phase 4A + 4B + 4C):
- **Save Current Page**: Click the extension icon and save any webpage
- **Save Selected Text**: Highlight text, right-click, and save as a note
- **Quick Note**: Create quick notes directly from the extension popup
- **Save Links**: Right-click on any link to save it
- **Save Images**: Right-click on images to save them
- **📋 Clipboard Monitoring**: When you copy text (Ctrl+C), a beautiful popup appears asking if you want to save it to Synapse
- **📸 Screenshot Capture**: Capture visible portion of any webpage and save it instantly
- **🤖 AI Chat Detection**: Automatically detects ChatGPT and Claude conversations with a floating "Save to Synapse" button
- **📶 Offline Queue with Auto-Sync** ⭐ NEW!: Save items even when offline - they'll automatically sync when you're back online
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+S` (Mac: `Cmd+Shift+S`) - Save selected text
  - `Ctrl+Shift+N` (Mac: `Cmd+Shift+N`) - Open quick note
  - `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`) - Capture screenshot

### 🔜 Coming Soon:
- Reading mode

## Installation

### Prerequisites:
1. Make sure your backend server is running on `http://localhost:5000`
2. Make sure your frontend dashboard is running on `http://localhost:5174`

### Install Extension:

#### For Chrome/Edge/Brave:

1. **Add Icon Files** (Temporary):
   - You'll need to add icon files to the `extension/icons/` folder
   - Required sizes: `icon16.png`, `icon48.png`, `icon128.png`
   - For now, you can use any placeholder images or download free icons

2. **Open Extension Management**:
   - Chrome: Go to `chrome://extensions/`
   - Edge: Go to `edge://extensions/`
   - Brave: Go to `brave://extensions/`

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right

4. **Load Extension**:
   - Click "Load unpacked"
   - Select the `extension` folder from your project

5. **Pin the Extension** (Optional):
   - Click the puzzle icon in your browser toolbar
   - Pin "Project Synapse" for easy access

## Usage

### Save Current Page:
1. Click the Synapse extension icon
2. Click "Save Current Page"
3. Page will be saved with auto-extracted metadata

### Save Selected Text:
**Method 1:** Right-click menu
1. Select any text on a webpage
2. Right-click
3. Choose "Save Selection as Note"

**Method 2:** Keyboard shortcut
1. Select any text
2. Press `Ctrl+Shift+S` (Mac: `Cmd+Shift+S`)

### Quick Note:
**Method 1:** Extension popup
1. Click the extension icon
2. Click "Quick Note"
3. Type your note and optionally add tags
4. Click "Save"

**Method 2:** Keyboard shortcut
1. Press `Ctrl+Shift+N` (Mac: `Cmd+Shift+N`)
2. Extension popup will open

### Clipboard Monitoring (Your Original Idea!):
1. Select and copy any text on any webpage (`Ctrl+C`)
2. A beautiful popup appears in the bottom-right corner
3. Click "Save Note" to save it to Synapse
4. Or click "Dismiss" / Close (×) to ignore it
5. The popup auto-dismisses after 10 seconds

**Smart Features:**
- Only triggers for text longer than 10 characters
- Won't show the same text twice in a row
- Captures the source URL automatically
- Tagged as "clipboard" for easy filtering

### Save Links:
1. Right-click on any link
2. Choose "Save Link"

### Save Images:
1. Right-click on any image
2. Choose "Save Image"

### Screenshot Capture:
**Method 1:** Extension popup
1. Click the extension icon
2. Click "Screenshot"
3. Screenshot will be captured and saved automatically

**Method 2:** Right-click menu
1. Right-click anywhere on the page
2. Choose "Capture Screenshot"

**Method 3:** Keyboard shortcut
1. Press `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. Screenshot will be captured instantly

**Features:**
- Captures the visible portion of the current tab
- Automatically saves with page title and URL
- Tagged as "screenshot" for easy filtering
- High-quality PNG format

### AI Chat Detection (ChatGPT/Claude):
**Automatic Detection:**
1. Visit ChatGPT (chat.openai.com or chatgpt.com) or Claude (claude.ai)
2. A floating "Save to Synapse" button appears automatically in the bottom-right corner
3. Have your conversation with the AI
4. Click the "Save to Synapse" button when ready

**Features:**
- Automatically detects ChatGPT and Claude websites
- Extracts the full conversation (your prompts + AI responses)
- Formats as structured markdown with clear separation
- Tagged as "ai-chat", "chatgpt" or "claude", and "conversation"
- Saves complete conversation history from the current page
- Shows success/error feedback

**Supported Platforms:**
- ChatGPT (chat.openai.com, chatgpt.com)
- Claude (claude.ai)

### Offline Queue with Auto-Sync:
**Automatic Offline Detection:**
1. Extension automatically detects when you're offline
2. When offline, you'll see a notification: "Offline Mode - New items will be saved locally"
3. Continue using all Synapse features normally
4. All items are saved to local storage queue

**Automatic Sync:**
1. When your internet connection is restored, sync happens automatically
2. You'll see: "Syncing... Syncing X queued item(s)"
3. After sync completes: "Sync Complete - X item(s) synced successfully"
4. Failed items remain in queue for retry

**Manual Sync:**
- Right-click anywhere → Select "Sync Offline Queue"
- Useful for forcing a sync or checking queue status

**Features:**
- Works with all save methods (clipboard, screenshots, AI chats, etc.)
- Persistent queue - survives browser restarts
- Auto-retry on failure
- Real-time sync status notifications
- No data loss when offline
- Queue syncs on extension startup if items are pending

### View Your Items:
- Click "Open Dashboard" in the extension popup
- Or visit `http://localhost:5174` directly

## Troubleshooting

### Extension doesn't appear:
- Make sure you've enabled Developer Mode
- Check that you selected the correct `extension` folder
- Look for error messages in the extension management page

### Items not saving:
- Verify backend is running at `http://localhost:5000`
- Check browser console for errors (F12)
- Check backend server logs

### Icon not showing:
- Add placeholder icon images to `extension/icons/`
- Reload the extension after adding icons

### Context menu not appearing:
- Try reloading the extension
- Right-click on the extension and select "Reload"

## Keyboard Shortcuts

You can customize keyboard shortcuts:
1. Go to `chrome://extensions/shortcuts`
2. Find "Project Synapse"
3. Click the edit icon to change shortcuts

## Development

### Files Structure:
```
extension/
├── manifest.json          # Extension configuration
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── scripts/
│   ├── background.js     # Background service worker
│   ├── content.js        # Content script (runs on pages)
│   └── content.css       # Content script styles
└── icons/               # Extension icons
```

### Reload After Changes:
1. Make your code changes
2. Go to extension management page
3. Click the refresh icon on the Project Synapse card

## Support

For issues or feature requests, please check the main project README.

---

Made with ❤️ for better knowledge management
