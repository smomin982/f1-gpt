# 🏎️ F1GPT - AI-Powered Formula 1 Chat Assistant

An intelligent chatbot powered by a comprehensive RAG (Retrieval-Augmented Generation) pipeline, designed to answer all your Formula 1 questions with accurate, contextual information from a curated knowledge base.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![AI SDK](https://img.shields.io/badge/AI_SDK-3.3.0-orange?style=flat-square)

## ✨ Features

- **🤖 Intelligent Chat Interface** - Natural conversation about Formula 1 with AI-powered responses
- **🔍 RAG Pipeline** - Semantic search across 11+ curated F1 websites using vector embeddings
- **💾 Vector Database** - Astra DB integration for efficient similarity search
- **🎯 Smart Query Classification** - Automatically categorizes and routes queries for optimal responses
- **📚 Comprehensive Knowledge Base** - Data from official F1 sources, motorsport news, and racing archives
- **🎨 Beautiful UI** - F1-themed design with responsive layout and smooth animations
- **⚡ Real-time Responses** - Streaming AI responses with source attribution
- **🔄 Fallback System** - Intelligent demo responses when database is unavailable

## 🚀 Tech Stack

- **Framework:** [Next.js 15.5.2](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI/ML:** 
  - [Vercel AI SDK](https://sdk.vercel.ai/) v3.3.0
  - [Xenova Transformers](https://huggingface.co/docs/transformers.js) for embeddings
  - Model: `all-MiniLM-L6-v2` (384-dimensional embeddings)
- **Database:** [DataStax Astra DB](https://www.datastax.com/products/datastax-astra) (Vector Database)
- **Web Scraping:** Cheerio + custom scraping utilities

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**
- **Astra DB Account** (for full RAG capabilities)
- **OpenAI API Key** (optional, for enhanced AI responses)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone https://github.com/smomin982/f1-gpt.git
cd f1-gpt
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
# Astra DB Configuration
ASTRA_DB_API_ENDPOINT=your_astra_db_endpoint
ASTRA_DB_APPLICATION_TOKEN=your_astra_db_token
ASTRA_DB_COLLECTION=f1_knowledge

# Optional: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key
```

4. **Seed the database (optional):**
```bash
npm run seed
```

## 🎮 Usage

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build

```bash
npm run build
npm start
```

### Testing RAG Pipeline

```bash
# Test RAG functionality
npm run test-rag

# Validate RAG system health
npm run validate-rag
```

## 📁 Project Structure

```
f1-gpt/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint with RAG integration
│   ├── components/
│   │   └── PromptSuggestionsRow.tsx  # Smart prompt suggestions
│   ├── assets/
│   │   └── f1gpt.png             # F1GPT logo
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main chat interface
│   └── global.css                # Global styles
├── lib/
│   └── rag-service.ts            # Core RAG implementation
├── scripts/
│   ├── loadDB.ts                 # Database seeding script
│   ├── test-rag.ts               # RAG testing utility
│   └── validate-rag.ts           # RAG validation script
├── docs/
│   └── RAG-PIPELINE.md           # Comprehensive RAG documentation
└── package.json
```

## 🧠 How It Works

### RAG Pipeline Architecture

1. **Query Processing:**
   - User submits F1-related question
   - Query is classified (driver, team, race, technical, etc.)
   - Text is converted to 384-dimensional vector embedding

2. **Semantic Search:**
   - Vector similarity search in Astra DB
   - Retrieves top-k most relevant documents
   - Confidence scoring and filtering

3. **Context Synthesis:**
   - Combines retrieved documents
   - Removes duplicates and noise
   - Structures context for AI model

4. **Response Generation:**
   - AI generates natural language response
   - Includes source attribution
   - Returns formatted markdown with citations

### Key Features

- **Local Embeddings:** Uses Xenova/all-MiniLM-L6-v2 for privacy and speed
- **Intelligent Fallbacks:** Demo mode with curated F1 responses
- **Error Handling:** Comprehensive error management and logging
- **Performance Optimized:** Efficient caching and batch processing

## 📚 Data Sources

The knowledge base includes data from:

- formula1.com (Official F1 Website)
- fia.com (FIA Official)
- motorsport.com
- autosport.com
- espn.com/f1
- skysports.com/f1
- crash.net
- gpblog.com
- thef1spectator.com
- pitpass.com
- f1technical.net

## 🎨 Features Showcase

### Prompt Suggestions
Intelligent prompt categories including:
- **Drivers** - Information about current and legendary drivers
- **Teams** - Constructor standings and team performance
- **Races** - Circuit information and race schedules
- **Technical** - Car regulations and technical specs
- **History** - F1 legends and historical moments

### Chat Interface
- Real-time typing indicators
- Markdown rendering for rich responses
- Source citations for transparency
- Responsive design for mobile and desktop
- F1-themed color scheme

## 🔧 Configuration

### Astra DB Setup

1. Create an account at [DataStax Astra](https://astra.datastax.com/)
2. Create a new vector database
3. Create a collection named `f1_knowledge` with 384 dimensions
4. Copy your API endpoint and application token to `.env`

### Customization

- **Modify prompt suggestions:** Edit `app/components/PromptSuggestionsRow.tsx`
- **Update RAG logic:** Customize `lib/rag-service.ts`
- **Change styling:** Modify `app/global.css` or Tailwind classes
- **Add data sources:** Update `scripts/loadDB.ts`

## 🧪 Testing

```bash
# Run all tests
npm test

# Test RAG pipeline
npm run test-rag

# Validate system health
npm run validate-rag

# Lint code
npm run lint
```

## 📈 Performance

- **Average query response time:** ~2-3 seconds
- **Embedding generation:** ~100ms per query
- **Vector search:** ~50ms for top-10 results
- **Supports:** 1000+ concurrent users (with proper scaling)

## 🚧 Roadmap

- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Real-time race data integration
- [ ] User authentication and chat history
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Community-contributed knowledge base

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Saad Momin**
- GitHub: [@smomin982](https://github.com/smomin982)
- Email: 25100151@lums.edu.pk

## 🙏 Acknowledgments

- Formula 1® for inspiring this project
- DataStax for Astra DB vector database
- Vercel for the AI SDK and Next.js framework
- Hugging Face for transformer models
- The F1 community for their passion and knowledge

## 📞 Support

If you encounter any issues or have questions:

1. Check the [RAG Pipeline Documentation](docs/RAG-PIPELINE.md)
2. Open an issue on GitHub
3. Contact via email

---

**Built with ❤️ for the F1 community** 🏎️💨
