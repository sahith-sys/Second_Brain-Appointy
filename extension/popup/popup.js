// DOM Elements
const savePageBtn = document.getElementById('savePageBtn');
const saveSelectionBtn = document.getElementById('saveSelectionBtn');
const quickNoteBtn = document.getElementById('quickNoteBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const quickNoteForm = document.getElementById('quickNoteForm');
const noteContent = document.getElementById('noteContent');
const noteTags = document.getElementById('noteTags');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const statusMessage = document.getElementById('statusMessage');
const openDashboard = document.getElementById('openDashboard');

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Show status message
function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.classList.remove('hidden');

  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 3000);
}

// Save current page
savePageBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const itemData = {
      title: tab.title,
      url: tab.url,
      content: '',
      tags: [],
    };

    await saveItem(itemData);
    showStatus('Page saved successfully!');
  } catch (error) {
    console.error('Error saving page:', error);
    showStatus('Failed to save page', 'error');
  }
});

// Save selected text
saveSelectionBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to get selection
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
    const selectedText = response?.text || '';

    if (!selectedText || selectedText.trim() === '') {
      showStatus('No text selected on page', 'error');
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
    showStatus('Selection saved successfully!');
  } catch (error) {
    console.error('Error saving selection:', error);

    // Try alternative method using executeScript
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      const selectedText = results[0].result;

      if (!selectedText || selectedText.trim() === '') {
        showStatus('No text selected on page', 'error');
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
      showStatus('Selection saved successfully!');
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      showStatus('Failed to save selection. Please try right-clicking the selected text.', 'error');
    }
  }
});

// Quick note
quickNoteBtn.addEventListener('click', () => {
  quickNoteForm.classList.remove('hidden');
  noteContent.focus();
});

cancelNoteBtn.addEventListener('click', () => {
  quickNoteForm.classList.add('hidden');
  noteContent.value = '';
  noteTags.value = '';
});

saveNoteBtn.addEventListener('click', async () => {
  const content = noteContent.value.trim();

  if (!content) {
    showStatus('Note cannot be empty', 'error');
    return;
  }

  try {
    const tags = noteTags.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    const itemData = {
      title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      content: content,
      tags: tags,
      type: 'note',
    };

    await saveItem(itemData);
    showStatus('Note saved successfully!');

    // Reset form
    quickNoteForm.classList.add('hidden');
    noteContent.value = '';
    noteTags.value = '';
  } catch (error) {
    console.error('Error saving note:', error);
    showStatus('Failed to save note', 'error');
  }
});

// Screenshot
screenshotBtn.addEventListener('click', async () => {
  try {
    showStatus('Capturing screenshot...', 'success');

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });

    // Convert data URL to blob
    const blob = await (await fetch(dataUrl)).blob();

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
    showStatus('Screenshot saved successfully!');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    showStatus('Failed to capture screenshot', 'error');
  }
});

// Open dashboard
openDashboard.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'http://localhost:5174' });
});

// Save item to backend
async function saveItem(itemData) {
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
}
