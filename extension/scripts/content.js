// Content script for Project Synapse
// This script runs on every webpage and provides additional functionality

// Clipboard monitoring state
let clipboardMonitoringEnabled = true;
let lastCopiedText = '';
let savePopup = null;

// AI Chat detection
let aiChatButton = null;
const AI_CHAT_SITES = {
  'chat.openai.com': 'ChatGPT',
  'chatgpt.com': 'ChatGPT',
  'claude.ai': 'Claude'
};

// Reading mode state
let readingModeOverlay = null;

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    sendResponse({ text: window.getSelection().toString() });
  }

  if (request.action === 'getPageContent') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      content: getPageContent()
    });
  }

  if (request.action === 'toggleClipboardMonitoring') {
    clipboardMonitoringEnabled = request.enabled;
    sendResponse({ enabled: clipboardMonitoringEnabled });
  }

  if (request.action === 'activateReadingMode') {
    activateReadingMode();
    sendResponse({ success: true });
  }

  return true;
});

// Monitor copy events
document.addEventListener('copy', (e) => {
  if (!clipboardMonitoringEnabled) return;

  // Get copied text
  const selection = window.getSelection();
  const copiedText = selection.toString().trim();

  // Only show popup if text is copied and it's different from last time
  if (copiedText && copiedText.length > 10 && copiedText !== lastCopiedText) {
    lastCopiedText = copiedText;

    // Show save popup after a short delay
    setTimeout(() => {
      showClipboardSavePopup(copiedText);
    }, 300);
  }
});

// Show clipboard save popup
function showClipboardSavePopup(copiedText) {
  // Remove existing popup if any
  if (savePopup) {
    savePopup.remove();
  }

  // Create popup element
  savePopup = document.createElement('div');
  savePopup.className = 'synapse-clipboard-popup';
  savePopup.innerHTML = `
    <div class="synapse-popup-content">
      <div class="synapse-popup-header">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
        </svg>
        <span>Save to Synapse?</span>
        <button class="synapse-popup-close" title="Close">&times;</button>
      </div>
      <div class="synapse-popup-text">${escapeHtml(copiedText.substring(0, 100))}${copiedText.length > 100 ? '...' : ''}</div>
      <div class="synapse-popup-actions">
        <button class="synapse-btn synapse-btn-primary" data-action="save">Save Note</button>
        <button class="synapse-btn" data-action="dismiss">Dismiss</button>
      </div>
    </div>
  `;

  // Add to page
  document.body.appendChild(savePopup);

  // Add event listeners
  const closeBtn = savePopup.querySelector('.synapse-popup-close');
  const saveBtn = savePopup.querySelector('[data-action="save"]');
  const dismissBtn = savePopup.querySelector('[data-action="dismiss"]');

  closeBtn.addEventListener('click', () => removePopup());
  dismissBtn.addEventListener('click', () => removePopup());

  saveBtn.addEventListener('click', async () => {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
      await saveClipboardText(copiedText);
      saveBtn.textContent = '✓ Saved!';
      saveBtn.classList.add('synapse-btn-success');

      setTimeout(() => {
        removePopup();
      }, 1500);
    } catch (error) {
      saveBtn.textContent = 'Error!';
      saveBtn.classList.add('synapse-btn-error');
      console.error('Failed to save:', error);

      setTimeout(() => {
        removePopup();
      }, 2000);
    }
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    removePopup();
  }, 10000);
}

// Remove popup
function removePopup() {
  if (savePopup) {
    savePopup.classList.add('synapse-popup-fade-out');
    setTimeout(() => {
      if (savePopup && savePopup.parentNode) {
        savePopup.remove();
        savePopup = null;
      }
    }, 300);
  }
}

// Save clipboard text
async function saveClipboardText(text) {
  const itemData = {
    title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
    content: text,
    url: window.location.href,
    tags: ['clipboard'],
    type: 'note',
  };

  // Send to background script
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'saveItem', data: itemData },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error('Failed to save'));
        }
      }
    );
  });
}

// Extract main content from page
function getPageContent() {
  // Try to find main content
  const article = document.querySelector('article');
  const main = document.querySelector('main');
  const content = document.querySelector('.content, #content, .post, .article');

  if (article) {
    return cleanText(article.innerText);
  } else if (main) {
    return cleanText(main.innerText);
  } else if (content) {
    return cleanText(content.innerText);
  } else {
    // Fallback to body, but limit to first 500 characters
    return cleanText(document.body.innerText.substring(0, 500));
  }
}

// Clean and format text
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Highlight saved text (future feature)
function highlightText(text) {
  // TODO: Implement text highlighting
}

// ==================== AI CHAT DETECTION ====================

// Check if current site is an AI chat platform
function detectAIChatSite() {
  const hostname = window.location.hostname;
  return AI_CHAT_SITES[hostname];
}

// Create floating save button for AI chats
function createAIChatButton(siteName) {
  if (aiChatButton) return; // Button already exists

  aiChatButton = document.createElement('div');
  aiChatButton.className = 'synapse-ai-chat-button';
  aiChatButton.innerHTML = `
    <button class="synapse-save-chat-btn">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
      </svg>
      <span>Save to Synapse</span>
    </button>
    <div class="synapse-chat-tooltip">Save ${siteName} conversation</div>
  `;

  document.body.appendChild(aiChatButton);

  // Add click handler
  const button = aiChatButton.querySelector('.synapse-save-chat-btn');
  button.addEventListener('click', () => saveAIConversation(siteName));
}

// Extract conversation from ChatGPT
function extractChatGPTConversation() {
  const messages = [];

  // ChatGPT conversation structure
  const messageElements = document.querySelectorAll('[data-message-author-role]');

  messageElements.forEach((element) => {
    const role = element.getAttribute('data-message-author-role');
    const content = element.querySelector('.markdown, .whitespace-pre-wrap');

    if (content) {
      messages.push({
        role: role === 'user' ? 'User' : 'ChatGPT',
        content: content.innerText.trim()
      });
    }
  });

  return messages;
}

// Extract conversation from Claude
function extractClaudeConversation() {
  const messages = [];

  // Claude conversation structure (may need adjustment based on actual DOM)
  const messageElements = document.querySelectorAll('[data-test-render-count]');

  messageElements.forEach((element) => {
    const isUser = element.classList.contains('user-message') || element.querySelector('.font-user-message');
    const content = element.querySelector('.font-claude-message, .font-user-message, [class*="message"]');

    if (content) {
      messages.push({
        role: isUser ? 'User' : 'Claude',
        content: content.innerText.trim()
      });
    }
  });

  // Fallback: try alternative selectors
  if (messages.length === 0) {
    const allMessages = document.querySelectorAll('div[class*="font-"]');
    allMessages.forEach((element) => {
      const text = element.innerText.trim();
      if (text.length > 20) { // Filter out short elements
        messages.push({
          role: 'Message',
          content: text
        });
      }
    });
  }

  return messages;
}

// Save AI conversation
async function saveAIConversation(siteName) {
  const button = aiChatButton.querySelector('.synapse-save-chat-btn');
  const originalText = button.innerHTML;

  button.innerHTML = '<span>Saving...</span>';
  button.disabled = true;

  try {
    let messages = [];

    if (siteName === 'ChatGPT') {
      messages = extractChatGPTConversation();
    } else if (siteName === 'Claude') {
      messages = extractClaudeConversation();
    }

    if (messages.length === 0) {
      throw new Error('No conversation found on this page');
    }

    // Format conversation as markdown
    const conversationText = messages.map(msg =>
      `**${msg.role}:**\n${msg.content}\n`
    ).join('\n---\n\n');

    // Get page title for conversation title
    const pageTitle = document.title;

    const itemData = {
      title: `${siteName} - ${pageTitle}`,
      content: conversationText,
      url: window.location.href,
      tags: ['ai-chat', siteName.toLowerCase(), 'conversation'],
      type: 'note',
    };

    // Send to background script
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'saveItem', data: itemData },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error('Failed to save'));
          }
        }
      );
    });

    button.innerHTML = '✓ Saved!';
    button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
      button.disabled = false;
    }, 2000);

  } catch (error) {
    console.error('Failed to save conversation:', error);
    button.innerHTML = '✗ Error';
    button.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
      button.disabled = false;
    }, 2000);
  }
}

// Initialize AI chat detection
function initAIChatDetection() {
  const siteName = detectAIChatSite();

  if (siteName) {
    // Wait for page to load
    setTimeout(() => {
      createAIChatButton(siteName);
    }, 2000);
  }
}

// Run on page load
initAIChatDetection();

// ==================== READING MODE ====================

// Extract readable content from page
function extractReadableContent() {
  // Try to find main article content
  const selectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.content',
    '#content'
  ];

  let contentElement = null;
  for (const selector of selectors) {
    contentElement = document.querySelector(selector);
    if (contentElement) break;
  }

  // Fallback to body if no article found
  if (!contentElement) {
    contentElement = document.body;
  }

  // Extract title
  const title = document.title;

  // Extract text content
  const content = extractTextContent(contentElement);

  return { title, content };
}

// Extract clean text from element
function extractTextContent(element) {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true);

  // Remove scripts, styles, and unwanted elements
  const unwantedSelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    'aside',
    '.advertisement',
    '.ad',
    '.sidebar',
    '.comments',
    '.social-share'
  ];

  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Get paragraphs and headings
  const elements = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
  const textParts = [];

  elements.forEach(el => {
    const text = el.innerText.trim();
    if (text.length > 20) { // Filter out very short elements
      textParts.push(text);
    }
  });

  return textParts.join('\n\n');
}

// Activate reading mode
function activateReadingMode() {
  if (readingModeOverlay) {
    return; // Already in reading mode
  }

  const { title, content } = extractReadableContent();

  if (!content || content.length < 100) {
    alert('Could not extract readable content from this page');
    return;
  }

  createReadingModeOverlay(title, content);
}

// Create reading mode overlay
function createReadingModeOverlay(title, content) {
  readingModeOverlay = document.createElement('div');
  readingModeOverlay.className = 'synapse-reading-mode';
  readingModeOverlay.innerHTML = `
    <div class="synapse-reading-toolbar">
      <button class="synapse-reading-btn" data-action="decrease-font">A-</button>
      <button class="synapse-reading-btn" data-action="increase-font">A+</button>
      <button class="synapse-reading-btn synapse-reading-save" data-action="save">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
        </svg>
        Save to Synapse
      </button>
      <button class="synapse-reading-btn" data-action="print">Print</button>
      <button class="synapse-reading-close" data-action="close">&times;</button>
    </div>
    <div class="synapse-reading-content">
      <h1 class="synapse-reading-title">${escapeHtml(title)}</h1>
      <div class="synapse-reading-text">${escapeHtml(content).replace(/\n\n/g, '</p><p>')}</div>
    </div>
  `;

  document.body.appendChild(readingModeOverlay);

  // Add event listeners
  readingModeOverlay.querySelector('[data-action="close"]').addEventListener('click', closeReadingMode);
  readingModeOverlay.querySelector('[data-action="decrease-font"]').addEventListener('click', () => adjustFontSize(-2));
  readingModeOverlay.querySelector('[data-action="increase-font"]').addEventListener('click', () => adjustFontSize(2));
  readingModeOverlay.querySelector('[data-action="save"]').addEventListener('click', () => saveReadingContent(title, content));
  readingModeOverlay.querySelector('[data-action="print"]').addEventListener('click', printReadingMode);

  // Keyboard shortcut to close (ESC)
  document.addEventListener('keydown', handleReadingModeKeyboard);
}

// Close reading mode
function closeReadingMode() {
  if (readingModeOverlay) {
    readingModeOverlay.classList.add('synapse-reading-fade-out');
    setTimeout(() => {
      if (readingModeOverlay && readingModeOverlay.parentNode) {
        readingModeOverlay.remove();
        readingModeOverlay = null;
      }
    }, 300);

    document.removeEventListener('keydown', handleReadingModeKeyboard);
  }
}

// Handle keyboard in reading mode
function handleReadingModeKeyboard(e) {
  if (e.key === 'Escape') {
    closeReadingMode();
  }
}

// Adjust font size
function adjustFontSize(change) {
  const textElement = readingModeOverlay.querySelector('.synapse-reading-text');
  const currentSize = parseInt(window.getComputedStyle(textElement).fontSize);
  textElement.style.fontSize = (currentSize + change) + 'px';
}

// Save reading mode content
async function saveReadingContent(title, content) {
  const saveBtn = readingModeOverlay.querySelector('[data-action="save"]');
  const originalText = saveBtn.innerHTML;

  saveBtn.innerHTML = '<span>Saving...</span>';
  saveBtn.disabled = true;

  try {
    const itemData = {
      title: `📖 ${title}`,
      content: content,
      url: window.location.href,
      tags: ['reading-mode', 'article'],
      type: 'note',
    };

    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'saveItem', data: itemData },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error('Failed to save'));
          }
        }
      );
    });

    saveBtn.innerHTML = '✓ Saved!';
    saveBtn.style.background = '#10b981';

    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.background = '';
      saveBtn.disabled = false;
    }, 2000);

  } catch (error) {
    console.error('Failed to save:', error);
    saveBtn.innerHTML = '✗ Error';
    saveBtn.style.background = '#ef4444';

    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.background = '';
      saveBtn.disabled = false;
    }, 2000);
  }
}

// Print reading mode
function printReadingMode() {
  window.print();
}

console.log('Project Synapse content script loaded - Clipboard monitoring active');
