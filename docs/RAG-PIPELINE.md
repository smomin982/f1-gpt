# F1GPT RAG Pipeline Documentation

## 🏎️ Overview

F1GPT implements a sophisticated Retrieval-Augmented Generation (RAG) pipeline that combines vector search with intelligent response generation to provide accurate, contextual answers about Formula 1. The system uses the Xenova/all-MiniLM-L6-v2 embedding model for local semantic search without requiring external API keys.

## 🏗️ Architecture

### Core Components

1. **Vector Database**: Astra DB with 384-dimensional embeddings
2. **Embedding Model**: Xenova/all-MiniLM-L6-v2 (local, no API required)
3. **Document Sources**: 11 comprehensive F1 websites
4. **RAG Service**: Intelligent retrieval and response generation
5. **API Integration**: Seamless Next.js API route integration

### Data Flow

```
User Query → Embedding Generation → Vector Search → Document Retrieval → Context Assembly → Response Generation → Formatted Answer
```

## 🔧 Setup & Configuration

### 1. Environment Variables

Create a `.env` file with your Astra DB credentials:

```env
ASTRA_DB_API_ENDPOINT=https://your-database-id-region.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token-here
ASTRA_DB_COLLECTION=f1_knowledge
ASTRA_DB_NAMESPACE=default_keyspace
```

### 2. Database Seeding

Run the seeding script to populate your vector database:

```bash
npm run seed
```

This will:
- Scrape content from 11 F1 websites
- Generate embeddings using the local model
- Store 384-dimensional vectors in Astra DB
- Process thousands of text chunks

### 3. RAG Testing

Test the RAG pipeline independently:

```bash
npm run test-rag
```

## 🚀 Usage

### API Endpoint

The RAG system is integrated into the `/api/chat` endpoint:

```typescript
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Who is the current Formula 1 World Champion?"
    }
  ]
}
```

### Response Format

```
🏎️ **F1 Driver Information:**

[Generated contextual response based on retrieved documents]

📚 **Sources:**
1. formula1.com
2. en.wikipedia.org
3. autosport.com

🔍 *Query confidence: 87.3%*
```

## 🧠 RAG Service Features

### Intelligent Query Processing

- **Query Classification**: Automatically identifies query types (drivers, teams, races, stats, history, rules)
- **Context Ranking**: Prioritizes most relevant documents based on similarity scores
- **Response Synthesis**: Combines information from multiple sources
- **Confidence Scoring**: Provides reliability indicators

### Semantic Search

- **Vector Similarity**: Uses cosine similarity for document retrieval
- **Similarity Threshold**: Filters out irrelevant content (< 0.3 similarity)
- **Result Limiting**: Returns top 5-8 most relevant documents
- **Source Diversity**: Ensures answers draw from multiple websites

### Response Generation

- **Category-Specific Formatting**: Different response styles for different F1 topics
- **Information Synthesis**: Combines and deduplicates content from multiple sources
- **Source Attribution**: Links back to original websites
- **Confidence Indicators**: Shows reliability of the generated answer

## 📊 Performance Characteristics

### Response Times
- **Cold Start**: ~3-5 seconds (model loading)
- **Warm Queries**: ~500-1000ms
- **Embedding Generation**: ~100-200ms per query
- **Vector Search**: ~50-100ms

### Accuracy Metrics
- **Relevance Threshold**: 0.3 minimum similarity
- **High Confidence**: >70% similarity
- **Source Coverage**: 3-5 documents per response
- **Context Length**: Up to 2000 characters

## 🔍 Query Examples

### Driver Information
```
"Who is Lewis Hamilton?"
"Compare Hamilton vs Verstappen career stats"
"What are the current driver standings?"
```

### Team Analysis
```
"Which F1 team has the fastest car this season?"
"Tell me about Ferrari's performance"
"What are the current constructor standings?"
```

### Race Information
```
"When is the next Formula 1 race?"
"Which circuits are new to F1 this season?"
"Tell me about the Monaco Grand Prix"
```

### Technical Details
```
"What is DRS in Formula 1?"
"Explain F1 technical regulations"
"How do F1 engines work?"
```

### Historical Queries
```
"Tell me about F1 history and legends"
"Who was the first F1 World Champion?"
"What are the most famous F1 moments?"
```

## 🛠️ Technical Implementation

### Embedding Model
- **Model**: Xenova/all-MiniLM-L6-v2
- **Dimensions**: 384
- **Local Processing**: No external API required
- **Pooling Strategy**: Mean pooling with normalization

### Vector Database
- **Provider**: DataStax Astra DB
- **Metric**: Dot product similarity
- **Index**: Automatic vector indexing
- **Scalability**: Handles millions of vectors

### Error Handling
- **Model Loading**: Graceful fallback for initialization
- **Database Connectivity**: Health checks and retries
- **Query Processing**: Detailed error messages
- **Development Mode**: Helpful configuration guidance

## 📈 Monitoring & Debugging

### Development Mode Features
- Query confidence scores
- Retrieved document snippets
- Source attribution
- Performance timing
- Error details

### Health Checks
- Database connectivity
- Model initialization
- Collection existence
- Query processing

### Logging
- Query processing stages
- Performance metrics
- Error tracking
- Source attribution

## 🔄 Continuous Improvement

### Data Refresh
- Re-run `npm run seed` to update F1 knowledge
- Add new sources to the scraping list
- Adjust chunk sizes and overlap for better retrieval

### Model Optimization
- Experiment with different embedding models
- Tune similarity thresholds
- Optimize response generation algorithms

### Query Enhancement
- Add more sophisticated query classification
- Implement query expansion techniques
- Add multilingual support

## 🚦 Production Deployment

### Environment Setup
- Configure production Astra DB cluster
- Set appropriate environment variables
- Enable query logging and monitoring

### Performance Optimization
- Implement response caching
- Use CDN for static assets
- Optimize embedding model loading

### Scaling Considerations
- Database sharding for large datasets
- Load balancing for high traffic
- Embedding model caching strategies

## 📚 Related Documentation

- [Astra DB Vector Search](https://docs.datastax.com/en/astra-db-serverless/get-started/vector-search.html)
- [Xenova Transformers](https://huggingface.co/docs/transformers.js/index)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vector Database Best Practices](https://docs.datastax.com/en/astra-db-serverless/vector-search/best-practices.html)

---

**Happy Racing! 🏁** Your F1GPT RAG pipeline is now ready to provide intelligent, contextual answers about Formula 1!
