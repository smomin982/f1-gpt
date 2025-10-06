import { DataAPIClient, Db, Collection } from "@datastax/astra-db-ts";
import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";
import "dotenv/config";

interface RetrievedDocument {
  id: string;
  text: string;
  source: string;
  similarity: number;
}

interface RAGResponse {
  answer: string;
  sources: string[];
  confidence: number;
  retrievedDocs: RetrievedDocument[];
}

class F1RAGService {
  private client: DataAPIClient;
  private db: Db;
  private embeddingModel: FeatureExtractionPipeline | null = null;
  private collection: Collection | null = null;

  constructor() {
    const {
      ASTRA_DB_NAMESPACE,
      ASTRA_DB_COLLECTION,
      ASTRA_DB_API_ENDPOINT,
      ASTRA_DB_APPLICATION_TOKEN
    } = process.env;

    if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_API_ENDPOINT || !ASTRA_DB_COLLECTION) {
      throw new Error("Missing required environment variables for Astra DB");
    }

    this.client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
    this.db = this.client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE });
  }

  private async initializeEmbeddingModel() {
    if (!this.embeddingModel) {
      console.log("Loading embedding model...");
      this.embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as FeatureExtractionPipeline;
      console.log("Embedding model loaded successfully");
    }
    return this.embeddingModel;
  }

  private async getCollection() {
    if (!this.collection) {
      this.collection = await this.db.collection(process.env.ASTRA_DB_COLLECTION!);
    }
    return this.collection;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const model = await this.initializeEmbeddingModel();
    if (!model) {
      throw new Error("Failed to initialize embedding model");
    }
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  private async performSemanticSearch(
    queryEmbedding: number[], 
    limit: number = 5
  ): Promise<RetrievedDocument[]> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.find(
        {},
        {
          sort: { $vector: queryEmbedding },
          limit: limit,
          includeSimilarity: true
        }
      );

      const docs: RetrievedDocument[] = [];
      for await (const doc of result) {
        docs.push({
          id: String(doc._id) || `doc_${docs.length}`,
          text: doc.text || '',
          source: doc.source || 'Unknown',
          similarity: doc.$similarity || 0
        });
      }

      return docs;
    } catch (error) {
      console.error("Error performing semantic search:", error);
      throw new Error("Failed to retrieve documents from vector database");
    }
  }

  private async generateContextualResponse(
    query: string, 
    retrievedDocs: RetrievedDocument[]
  ): Promise<{ answer: string; confidence: number }> {
    // Create context from retrieved documents
    const context = retrievedDocs
      .filter(doc => doc.similarity > 0.3) // Filter by similarity threshold
      .map((doc, index) => `[Context ${index + 1}] ${doc.text.trim()}`)
      .join('\n\n');

    if (!context) {
      return {
        answer: "I don't have enough relevant information in my F1 database to answer that question. Could you try rephrasing or asking about a different F1 topic?",
        confidence: 0.1
      };
    }

    // Calculate confidence based on similarity scores and context relevance
    const avgSimilarity = retrievedDocs.reduce((sum, doc) => sum + doc.similarity, 0) / retrievedDocs.length;
    const confidence = Math.min(avgSimilarity * 1.2, 1.0); // Boost confidence slightly

    // Generate response based on context
    const answer = this.generateIntelligentResponse(query, context, retrievedDocs);

    return { answer, confidence };
  }

  private generateIntelligentResponse(
    query: string, 
    context: string, 
    retrievedDocs: RetrievedDocument[]
  ): string {
    // Analyze query type and context to generate appropriate response
    const queryLower = query.toLowerCase();
    
    // Identify query categories
    const isDriverQuery = /driver|pilot|racer|hamilton|verstappen|leclerc|russell|norris|alonso/.test(queryLower);
    const isTeamQuery = /team|constructor|mercedes|ferrari|red bull|mclaren|aston martin|alpine/.test(queryLower);
    const isRaceQuery = /race|circuit|track|monaco|silverstone|spa|monza|championship/.test(queryLower);
    const isStatsQuery = /statistic|record|fastest|pole|win|point|standing/.test(queryLower);
    const isHistoryQuery = /history|past|legend|classic|old|vintage|historical/.test(queryLower);
    const isRulesQuery = /rule|regulation|technical|drs|kers|ers|penalty/.test(queryLower);

    // Extract key information from context
    const contextLines = context.split('\n\n');
    const relevantInfo = contextLines
      .slice(0, 3) // Use top 3 most relevant contexts
      .map(line => line.replace(/^\[Context \d+\]\s*/, '').trim())
      .filter(line => line.length > 50); // Filter out very short snippets

    if (relevantInfo.length === 0) {
      return "I found some F1 information but it doesn't seem directly relevant to your question. Could you please be more specific?";
    }

    // Generate category-specific response
    let response = "";
    
    if (isDriverQuery) {
      response = "🏎️ **F1 Driver Information:**\n\n";
    } else if (isTeamQuery) {
      response = "🏁 **F1 Team Information:**\n\n";
    } else if (isRaceQuery) {
      response = "🏆 **F1 Race Information:**\n\n";
    } else if (isStatsQuery) {
      response = "📊 **F1 Statistics:**\n\n";
    } else if (isHistoryQuery) {
      response = "📚 **F1 History:**\n\n";
    } else if (isRulesQuery) {
      response = "📋 **F1 Rules & Regulations:**\n\n";
    } else {
      response = "🏎️ **F1 Information:**\n\n";
    }

    // Synthesize information from multiple sources
    const synthesizedInfo = this.synthesizeInformation(relevantInfo, queryLower);
    response += synthesizedInfo;

    // Add confidence indicator
    const avgSimilarity = retrievedDocs.reduce((sum, doc) => sum + doc.similarity, 0) / retrievedDocs.length;
    if (avgSimilarity > 0.7) {
      response += "\n\n✅ *High confidence answer based on reliable F1 sources.*";
    } else if (avgSimilarity > 0.5) {
      response += "\n\n⚠️ *Moderate confidence - you may want to verify this information.*";
    }

    return response;
  }

  private synthesizeInformation(contexts: string[], query: string): string {
    // Combine and deduplicate information from multiple contexts
    const sentences = contexts
      .flatMap(context => context.split(/[.!?]+/))
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 20)
      .filter((sentence, index, arr) => 
        // Remove duplicates and very similar sentences
        arr.findIndex(s => this.calculateSimilarity(s, sentence) > 0.8) === index
      )
      .slice(0, 8); // Limit to 8 most relevant sentences

    // Prioritize sentences that match query keywords
    const queryWords = query.split(/\s+/).filter(word => word.length > 3);
    const prioritized = sentences.sort((a, b) => {
      const aScore = queryWords.reduce((score, word) => 
        a.toLowerCase().includes(word) ? score + 1 : score, 0);
      const bScore = queryWords.reduce((score, word) => 
        b.toLowerCase().includes(word) ? score + 1 : score, 0);
      return bScore - aScore;
    });

    return prioritized.slice(0, 5).join('. ') + '.';
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple text similarity calculation
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return intersection.length / union.length;
  }

  public async query(userQuery: string): Promise<RAGResponse> {
    try {
      console.log(`Processing F1 query: "${userQuery}"`);

      // Step 1: Generate embedding for the user query
      const queryEmbedding = await this.generateEmbedding(userQuery);
      console.log("Generated query embedding");

      // Step 2: Perform semantic search
      const retrievedDocs = await this.performSemanticSearch(queryEmbedding, 8);
      console.log(`Retrieved ${retrievedDocs.length} relevant documents`);

      if (retrievedDocs.length === 0) {
        return {
          answer: "I couldn't find any relevant F1 information for your query. Please try asking about F1 drivers, teams, races, or regulations.",
          sources: [],
          confidence: 0,
          retrievedDocs: []
        };
      }

      // Step 3: Generate contextual response
      const { answer, confidence } = await this.generateContextualResponse(userQuery, retrievedDocs);

      // Step 4: Extract unique sources
      const sources = [...new Set(retrievedDocs.map(doc => doc.source))].slice(0, 3);

      console.log(`Generated response with confidence: ${confidence.toFixed(2)}`);

      return {
        answer,
        sources,
        confidence,
        retrievedDocs: retrievedDocs.slice(0, 5) // Return top 5 for debugging
      };

    } catch (error) {
      console.error("Error in RAG query processing:", error);
      throw new Error("Failed to process F1 query. Please try again.");
    }
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      await this.initializeEmbeddingModel();
      const collection = await this.getCollection();
      const testResult = await collection.findOne({});
      return testResult !== null;
    } catch (error) {
      console.error("RAG service health check failed:", error);
      return false;
    }
  }
}

// Singleton instance
let ragServiceInstance: F1RAGService | null = null;

export const getF1RAGService = (): F1RAGService => {
  if (!ragServiceInstance) {
    ragServiceInstance = new F1RAGService();
  }
  return ragServiceInstance;
};

export type { RAGResponse, RetrievedDocument };
