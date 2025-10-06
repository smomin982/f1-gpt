import { getF1RAGService } from '../lib/rag-service'

const testQueries = [
  "Who is the current Formula 1 World Champion?",
  "Which F1 team has the fastest car this season?",
  "Tell me about Lewis Hamilton's career",
  "What are the F1 technical regulations for 2024?",
  "Which circuits are new to F1 this season?",
  "Compare Hamilton vs Verstappen career stats",
  "When is the next Formula 1 race?",
  "What is DRS in Formula 1?",
  "Tell me about Formula 1 history",
  "What are the current constructor standings?"
]

async function testRAGService() {
  console.log("🏎️ Testing F1 RAG Service...\n")

  try {
    const ragService = getF1RAGService()

    // Health check first
    console.log("Performing health check...")
    const isHealthy = await ragService.healthCheck()
    console.log(`Health check: ${isHealthy ? '✅ PASSED' : '❌ FAILED'}\n`)

    if (!isHealthy) {
      console.log("RAG service is not healthy. Please check your database connection and run 'npm run seed' first.")
      return
    }

    // Test a few queries
    for (let i = 0; i < Math.min(3, testQueries.length); i++) {
      const query = testQueries[i]
      console.log(`\n🔍 Testing Query ${i + 1}: "${query}"`)
      console.log("=" + "=".repeat(50))

      try {
        const startTime = Date.now()
        const response = await ragService.query(query)
        const endTime = Date.now()

        console.log(`⏱️  Response time: ${endTime - startTime}ms`)
        console.log(`🎯 Confidence: ${(response.confidence * 100).toFixed(1)}%`)
        console.log(`📄 Retrieved docs: ${response.retrievedDocs.length}`)
        console.log(`🔗 Sources: ${response.sources.length}`)
        console.log("\n📝 **Answer:**")
        console.log(response.answer)
        
        if (response.sources.length > 0) {
          console.log("\n📚 **Sources:**")
          response.sources.forEach((source, index) => {
            console.log(`${index + 1}. ${source}`)
          })
        }

        // Show top retrieved document snippets for debugging
        if (response.retrievedDocs.length > 0) {
          console.log("\n🔍 **Top Retrieved Snippets:**")
          response.retrievedDocs.slice(0, 2).forEach((doc, index) => {
            console.log(`${index + 1}. [${doc.similarity.toFixed(3)}] ${doc.text.substring(0, 150)}...`)
          })
        }

      } catch (error) {
        console.error(`❌ Error testing query "${query}":`, error)
      }

      console.log("\n" + "-".repeat(60))
    }

    console.log("\n✅ RAG Service testing completed!")

  } catch (error) {
    console.error("❌ Failed to test RAG service:", error)
  }
}

// Run the test
if (require.main === module) {
  testRAGService().catch(console.error)
}

export { testRAGService }
