# 🧠 Project Synapse - Your AI-Powered Second Brain

![Project Synapse](https://img.shields.io/badge/Project-Synapse-blueviolet?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

> A modern, AI-powered knowledge management system with intelligent search, semantic understanding, OCR capabilities, and YouTube summarization.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [MCP Server Setup](#mcp-server-setup)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Project Synapse** is an advanced second brain application that helps you capture, organize, and retrieve information using cutting-edge AI technologies. It combines traditional knowledge management with modern AI capabilities to provide intelligent search, semantic understanding, and automated content processing.

### Why Project Synapse?

- **🤖 AI-Powered Intelligence**: Natural language search understands context and intent
- **🔍 Semantic Search**: Finds content by meaning, not just keywords
- **📸 OCR Integration**: Extracts text from images automatically using Tesseract.js
- **🎬 YouTube Summaries**: Generates AI summaries of YouTube videos
- **🔗 MCP Integration**: Works seamlessly with Claude Desktop
- **🎨 Beautiful UI**: Modern, professional interface with gradient designs

---

## ✨ Features

### 1. **Intelligent Natural Language Search**
- Ask questions in plain English (e.g., "videos about AI from last month")
- Claude AI parses queries to understand:
  - Content types (videos, articles, notes)
  - Time ranges (last week, last month, 2024)
  - Keywords and topics
  - Metadata filters

### 2. **Semantic Search with Embeddings**
- Uses Google Gemini embeddings (768 dimensions)
- Finds content by **meaning** rather than exact keyword matches
- Cosine similarity matching for relevant results
- Includes OCR text in embeddings for comprehensive search

### 3. **OCR Text Extraction**
- Automatic text extraction from uploaded images
- Powered by Tesseract.js
- Extracts text from:
  - Screenshots
  - Documents
  - Scanned images
  - PDFs
- Makes images fully searchable

### 4. **YouTube Video Summarization**
- Fetches video transcripts automatically
- Generates AI-powered summaries using Claude
- Extracts key metadata:
  - Video title and description
  - Duration and view count
  - Thumbnail images
  - Video ID

### 5. **MCP (Model Context Protocol) Server**
- Integrates with Claude Desktop
- Exposes 4 powerful tools:
  - `search_items`: Natural language search
  - `create_item`: Save items from Claude
  - `get_item_details`: Retrieve full item info
  - `list_recent_items`: View recent saves
- 2 resources:
  - Recent Items feed
  - Knowledge base statistics

### 6. **Multi-Type Content Support**
- 📝 Notes
- 📰 Articles
- 🎬 Videos
- 🖼️ Images
- 🛒 Products
- ✅ Todos
- 📦 Other

---

## 🛠 Tech Stack

### Frontend
- **React** 18.x - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Modern ES6+** JavaScript

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Claude AI** - Natural language processing and summaries
- **Google Gemini** - Embeddings for semantic search
- **Tesseract.js** - OCR text extraction
- **LiteLLM** - AI model proxy
- **Multer** - File upload handling
- **Cheerio** - Web scraping
- **Open Graph Scraper** - Metadata extraction

### AI & ML
- **Claude 3.5 Sonnet** - Query parsing and summarization
- **Gemini Embeddings (gemini-embedding-001)** - Semantic search
- **Tesseract OCR** - Image text extraction

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or MongoDB Atlas) - [Get Started](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### API Keys Required

1. **LiteLLM API Key** - For Claude AI and Gemini embeddings
2. **MongoDB Connection String** - Database access

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/second_brain.git
cd second_brain
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔐 Environment Variables

### Backend Environment Setup

Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/second_brain

# LiteLLM API Configuration
ANTHROPY_API_KEY=your_litellm_api_key
ANTHROPIC_BASE_URL=https://your-litellm-proxy-url.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Frontend Environment Setup

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Run MCP Server (Optional - for Claude Desktop)

```bash
cd backend
npm run mcp
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### **Items**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/items` | Create a new item |
| `GET` | `/items` | Get all items (with filters) |
| `GET` | `/items/:id` | Get item by ID |
| `PUT` | `/items/:id` | Update an item |
| `DELETE` | `/items/:id` | Delete an item |
| `POST` | `/items/upload` | Upload an image (with OCR) |
| `GET` | `/items/search` | Intelligent natural language search |
| `GET` | `/items/semantic-search` | Semantic search with embeddings |

#### **Example: Create Item**

```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "content": "This is a test note",
    "type": "note",
    "tags": ["test", "example"]
  }'
```

#### **Example: Intelligent Search**

```bash
curl -X GET "http://localhost:5000/api/items/search?query=videos%20about%20AI%20from%20last%20month"
```

#### **Example: Semantic Search**

```bash
curl -X GET "http://localhost:5000/api/items/semantic-search?query=machine%20learning%20concepts&limit=10"
```

#### **Example: Upload Image with OCR**

```bash
curl -X POST http://localhost:5000/api/items/upload \
  -F "image=@/path/to/your/image.png"
```

---

## 🔌 MCP Server Setup

### What is MCP?

The Model Context Protocol (MCP) allows Claude Desktop to directly access your Second Brain knowledge base.

### Setup Instructions

#### 1. Locate Claude Desktop Config

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

#### 2. Add Configuration

```json
{
  "mcpServers": {
    "second-brain": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\projects\\second_brain\\backend\\src\\mcp-server.js"
      ],
      "env": {
        "MONGO_URI": "your_mongodb_connection_string",
        "ANTHROPY_API_KEY": "your_api_key",
        "ANTHROPIC_BASE_URL": "your_litellm_url"
      }
    }
  }
}
```

#### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop. Look for the 🔌 icon in the bottom-right corner.

#### 4. Test It Out

Try these commands in Claude Desktop:
- "What videos have I saved about AI?"
- "Show me my recent notes"
- "Save this as a note: [your content]"

---

## 📁 Project Structure

```
second_brain/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── multer.js              # File upload configuration
│   │   ├── controllers/
│   │   │   └── itemController.js      # Item CRUD and search logic
│   │   ├── models/
│   │   │   └── Item.js                # MongoDB schema
│   │   ├── routes/
│   │   │   └── items.js               # API routes
│   │   ├── services/
│   │   │   ├── embeddingService.js    # Gemini embeddings
│   │   │   ├── ocrService.js          # Tesseract OCR
│   │   │   └── queryParserService.js  # Claude AI query parsing
│   │   ├── utils/
│   │   │   ├── metadataExtractor.js   # URL metadata & YouTube
│   │   │   └── parser.js              # Type detection
│   │   ├── index.js                   # Express server
│   │   └── mcp-server.js              # MCP server for Claude Desktop
│   ├── uploads/                       # Uploaded images
│   ├── .env                          # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx         # App header
│   │   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   │   └── Footer.jsx         # App footer
│   │   │   ├── cards/
│   │   │   │   ├── ArticleCard.jsx    # Article display
│   │   │   │   ├── ImageCard.jsx      # Image display (with OCR)
│   │   │   │   ├── NoteCard.jsx       # Note display
│   │   │   │   ├── ProductCard.jsx    # Product display
│   │   │   │   ├── TodoCard.jsx       # Todo display
│   │   │   │   └── VideoCard.jsx      # Video display
│   │   │   ├── ItemCard.jsx           # Card router
│   │   │   ├── ItemForm.jsx           # Create/Edit form
│   │   │   └── ItemList.jsx           # Items grid
│   │   ├── services/
│   │   │   └── api.js                 # API client
│   │   ├── App.jsx                    # Main app component
│   │   └── main.jsx                   # Entry point
│   ├── .env                          # Frontend env vars
│   └── package.json
│
├── MCP_SETUP.md                      # MCP detailed setup guide
└── README.md                         # This file
```

---

## 📖 Usage Guide

### Creating Items

1. Navigate to the application
2. Fill out the "Add New Item" form:
   - **Title**: Item name
   - **Content**: Description or notes
   - **Type**: Select from dropdown (Note, Article, Video, etc.)
   - **URL** (optional): Link to resource
   - **Tags** (optional): Comma-separated tags
   - **Image** (optional): Upload screenshot or image
3. Click "Add Item"

**OCR Extraction**: If you upload an image, text will be automatically extracted and displayed in the item card.

### Searching Items

#### Basic Search
- Enter keywords in the search bar
- Filter by type using the sidebar
- Click "Search"

#### Intelligent Search
- Use natural language queries:
  - "videos about machine learning from 2024"
  - "articles about React from last month"
  - "todos I saved this week"
- The AI will parse your query and filter results

#### Semantic Search
1. Check the "Semantic Search" toggle
2. Enter your query (e.g., "neural networks and deep learning")
3. Results are ranked by semantic similarity, not just keywords

### YouTube Videos

When adding a YouTube URL:
1. Paste the YouTube URL in the URL field
2. The system automatically:
   - Fetches video metadata
   - Downloads transcript
   - Generates AI summary
   - Extracts thumbnail
3. Summary appears in the video card

### Image OCR

When uploading an image:
1. Select image file in the form
2. OCR runs automatically
3. Extracted text appears in the image card
4. Text is searchable via semantic and intelligent search

---

## 🖼️ Screenshots

### Dashboard
Beautiful gradient header with navigation, sidebar with collections, and search interface.

### Item Cards
Specialized cards for each content type with:
- Articles: Metadata, author, site name
- Videos: Thumbnails, duration, AI summary
- Images: OCR extracted text display
- Products: Price, image, description
- Notes: Clean, simple layout

### Search Interface
- Intelligent search bar with icon
- Semantic search toggle
- AI-Powered badge
- Type filters in sidebar

---

## 🎯 Key Features Explained

### 1. Intelligent Query Parsing

**How it works:**
- User enters natural language query
- Claude AI extracts:
  - Keywords
  - Content types
  - Time ranges
  - Metadata requirements
- Builds MongoDB query
- Returns filtered results

**Example:**
```
Query: "videos about Python from last month"
Parsed: {
  keywords: ["Python"],
  type: "video",
  dateRange: { from: "2024-10-08", to: "2024-11-08" }
}
```

### 2. Semantic Search Architecture

**Flow:**
1. User enters query
2. Generate embedding for query (768D vector)
3. Retrieve all items with embeddings
4. Calculate cosine similarity
5. Sort by similarity score
6. Return top N results

**Embedding Composition:**
```javascript
title + content + tags + summary + ocrText → Gemini API → 768D vector
```

### 3. OCR Pipeline

**Process:**
1. Image uploaded via Multer
2. Saved to `/uploads` directory
3. Tesseract.js processes image
4. Extracts text with confidence scores
5. Text saved to `item.ocrText` field
6. Included in embeddings for searchability

### 4. YouTube Summarization

**Workflow:**
1. Detect YouTube URL
2. Extract video ID
3. Fetch transcript using `youtube-transcript` package
4. Send transcript to Claude AI
5. Generate concise summary
6. Store in `item.metadata.summary`

---

## 🔧 Configuration Options

### MongoDB Indexes

The application creates the following indexes:

```javascript
// Text search index
{ title: "text", content: "text", tags: "text" }

// For faster queries
{ type: 1, createdAt: -1 }
{ userId: 1 }
```

### Upload Limits

- **Max file size**: 10MB
- **Supported formats**: PNG, JPG, JPEG, GIF, WebP, PDF
- **Upload directory**: `backend/uploads/`

### Search Limits

- **Intelligent search**: 50 results
- **Semantic search**: 10 results (configurable)
- **OCR text length**: 8000 characters (Gemini limit)

---

## 🚀 Deployment

### Backend Deployment (Heroku, Railway, etc.)

1. Set environment variables
2. Ensure MongoDB is accessible
3. Deploy with:
   ```bash
   npm run start
   ```

### Frontend Deployment (Vercel, Netlify)

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder
3. Set `VITE_API_URL` to production backend URL

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI for intelligent processing
- **Google** - Gemini embeddings for semantic search
- **Tesseract.js** - OCR capabilities
- **MongoDB** - Flexible document storage
- **React & Tailwind** - Modern UI development

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: your.email@example.com
- Discord: Your Discord Server

---

## 🗺️ Roadmap

### Planned Features
- [ ] Browser extension for quick saving
- [ ] Mobile app (React Native)
- [ ] Collaborative collections
- [ ] Advanced analytics dashboard
- [ ] PDF text extraction
- [ ] Audio transcription
- [ ] Graph view of connections
- [ ] Export to Notion, Obsidian
- [ ] Multi-user support with authentication
- [ ] Real-time sync across devices

---

## ⚡ Performance

- **Embeddings**: Generated asynchronously, doesn't block item creation
- **OCR**: Processes in background, returns immediately
- **Search**: Indexed queries for fast retrieval
- **Images**: Lazy loading for better performance
- **Caching**: LRU cache for frequently accessed items

---

## 🔒 Security

- **API Keys**: Stored in environment variables
- **File Upload**: Validated file types and sizes
- **MongoDB**: Uses Mongoose schema validation
- **CORS**: Configured for trusted origins
- **Input Sanitization**: Prevents injection attacks

---

<div align="center">

**Built with ❤️ by Sahith**

⭐ Star this repo if you find it useful!

[GitHub](https://github.com/yourusername) • [Website](https://yourwebsite.com) • [Twitter](https://twitter.com/yourusername)

</div>
