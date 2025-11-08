// API Configuration
const API_URL = 'http://localhost:5000/api';

// Offline queue configuration
let isOnline = navigator.onLine;
let isSyncing = false;

// Install event - set up context menus
chrome.runtime.onInstalled.addListener(() => {
  console.log('Project Synapse extension installed!');

  // Initialize offline queue
  chrome.storage.local.get(['offlineQueue'], (result) => {
    if (!result.offlineQueue) {
      chrome.storage.local.set({ offlineQueue: [] });
    }
  });

  // Create context menu items
  chrome.contextMenus.create({
    id: 'save-to-synapse',
    title: 'Save to Synapse',
    contexts: ['page', 'selection', 'link', 'image']
  });

  chrome.contextMenus.create({
    id: 'save-selection',
    title: 'Save Selection as Note',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'save-link',
    title: 'Save Link',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'save-image',
    title: 'Save Image',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'capture-screenshot',
    title: 'Capture Screenshot',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'sync-offline-queue',
    title: 'Sync Offline Queue',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'reading-mode',
    title: 'Open in Reading Mode',
    contexts: ['page']
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveItem') {
    saveItem(request.data)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        console.error('Error saving item:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    switch (info.menuItemId) {
      case 'save-selection':
        await saveSelection(info, tab);
        break;
      case 'save-link':
        await saveLink(info, tab);
        break;
      case 'save-image':
        await saveImage(info, tab);
        break;
      case 'save-to-synapse':
        await savePage(tab);
        break;
      case 'capture-screenshot':
        await captureScreenshot(tab);
        break;
      case 'sync-offline-queue':
        await syncOfflineQueue();
        break;
      case 'reading-mode':
        await activateReadingMode(tab);
        break;
    }
  } catch (error) {
    console.error('Error handling context menu click:', error);
    showNotification('Error', 'Failed to save item');
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    switch (command) {
      case 'save-selection':
        await saveCurrentSelection(tab);
        break;
      case 'quick-note':
        // Open popup for quick note
        chrome.action.openPopup();
        break;
      case 'capture-screenshot':
        await captureScreenshot(tab);
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    showNotification('Error', 'Failed to execute command');
  }
});

// Save selected text
async function saveSelection(info, tab) {
  const itemData = {
    title: `Selection from ${tab.title}`,
    content: info.selectionText,
    url: tab.url,
    tags: ['selection'],
    type: 'note',
  };

  await saveItem(itemData);
  showNotification('Saved!', 'Selection saved to Synapse');
}

// Save link
async function saveLink(info, tab) {
  const itemData = {
    title: info.linkText || 'Saved Link',
    url: info.linkUrl,
    content: `Saved from ${tab.title}`,
    tags: ['link'],
  };

  await saveItem(itemData);
  showNotification('Saved!', 'Link saved to Synapse');
}

// Save image
async function saveImage(info, tab) {
  const itemData = {
    title: 'Saved Image',
    imageUrl: info.srcUrl,
    url: tab.url,
    content: `Image from ${tab.title}`,
    type: 'image',
    tags: ['image'],
  };

  await saveItem(itemData);
  showNotification('Saved!', 'Image saved to Synapse');
}

// Save current page
async function savePage(tab) {
  const itemData = {
    title: tab.title,
    url: tab.url,
    content: '',
    tags: [],
  };

  await saveItem(itemData);
  showNotification('Saved!', 'Page saved to Synapse');
}

// Capture screenshot
async function captureScreenshot(tab) {
  try {
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Create FormData and upload
    const formData = new FormData();
    formData.append('image', blob, `screenshot-${Date.now()}.png`);

    // Upload to backend
    const uploadResponse = await fetch(`${API_URL}/items/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload screenshot');
    }

    const { imageUrl } = await uploadResponse.json();

    // Save as item
    const itemData = {
      title: `Screenshot - ${tab.title}`,
      content: `Screenshot captured from ${tab.url}`,
      url: tab.url,
      imageUrl: `http://localhost:5000${imageUrl}`,
      type: 'image',
      tags: ['screenshot'],
    };

    await saveItem(itemData);
    showNotification('Saved!', 'Screenshot saved to Synapse');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    showNotification('Error', 'Failed to capture screenshot');
  }
}

// Save current selection (for keyboard shortcut)
async function saveCurrentSelection(tab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });

    const selectedText = results[0].result;

    if (!selectedText || selectedText.trim() === '') {
      showNotification('Error', 'No text selected on page');
      return;
    }

    const itemData = {
      title: `Selection from ${tab.title.substring(0, 50)}`,
      content: selectedText,
      url: tab.url,
      tags: ['selection'],
      type: 'note',
    };

    await saveItem(itemData);
    showNotification('Saved!', 'Selection saved to Synapse');
  } catch (error) {
    console.error('Error saving selection:', error);
    showNotification('Error', 'Failed to save selection. Make sure text is selected.');
  }
}

// Save item to backend (with offline queue support)
async function saveItem(itemData) {
  // Check if online
  if (!navigator.onLine) {
    return await addToOfflineQueue(itemData);
  }

  try {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      throw new Error('Failed to save item');
    }

    return response.json();
  } catch (error) {
    // If fetch fails (network error), queue the item
    console.log('Network error, adding to offline queue:', error);
    return await addToOfflineQueue(itemData);
  }
}

// Add item to offline queue
async function addToOfflineQueue(itemData) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['offlineQueue'], (result) => {
      const queue = result.offlineQueue || [];
      const queueItem = {
        id: Date.now().toString(),
        data: itemData,
        timestamp: new Date().toISOString()
      };

      queue.push(queueItem);

      chrome.storage.local.set({ offlineQueue: queue }, () => {
        showNotification('Saved Offline', 'Item queued for sync when online');
        resolve({ queued: true, id: queueItem.id });
      });
    });
  });
}

// Sync offline queue
async function syncOfflineQueue() {
  if (isSyncing) return;

  isSyncing = true;

  chrome.storage.local.get(['offlineQueue'], async (result) => {
    const queue = result.offlineQueue || [];

    if (queue.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`Syncing ${queue.length} queued items...`);
    showNotification('Syncing...', `Syncing ${queue.length} queued item(s)`);

    const failedItems = [];
    let successCount = 0;

    for (const queueItem of queue) {
      try {
        const response = await fetch(`${API_URL}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(queueItem.data),
        });

        if (response.ok) {
          successCount++;
        } else {
          failedItems.push(queueItem);
        }
      } catch (error) {
        console.error('Failed to sync item:', error);
        failedItems.push(queueItem);
      }
    }

    // Update queue with failed items only
    chrome.storage.local.set({ offlineQueue: failedItems }, () => {
      if (failedItems.length === 0) {
        showNotification('Sync Complete', `${successCount} item(s) synced successfully`);
      } else {
        showNotification('Partial Sync', `${successCount} synced, ${failedItems.length} failed`);
      }

      isSyncing = false;
    });
  });
}

// Activate reading mode
async function activateReadingMode(tab) {
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'activateReadingMode' });
  } catch (error) {
    console.error('Error activating reading mode:', error);
    showNotification('Error', 'Failed to activate reading mode');
  }
}

// Show notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon48.png',
    title: title,
    message: message,
    priority: 1
  });
}

// ==================== OFFLINE QUEUE LISTENERS ====================

// Listen for online/offline events
self.addEventListener('online', () => {
  console.log('Connection restored, syncing offline queue...');
  isOnline = true;

  // Wait a moment for connection to stabilize, then sync
  setTimeout(() => {
    syncOfflineQueue();
  }, 1000);
});

self.addEventListener('offline', () => {
  console.log('Connection lost, items will be queued');
  isOnline = false;
  showNotification('Offline Mode', 'New items will be saved locally and synced when online');
});

// Check queue on startup
chrome.storage.local.get(['offlineQueue'], (result) => {
  const queue = result.offlineQueue || [];
  if (queue.length > 0 && navigator.onLine) {
    console.log(`Found ${queue.length} queued items, syncing...`);
    setTimeout(() => {
      syncOfflineQueue();
    }, 2000);
  }
});
