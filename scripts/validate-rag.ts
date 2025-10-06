import { getF1RAGService } from '../lib/rag-service'

async function validateRAGSetup() {
  console.log("🏎️ F1GPT RAG Pipeline Validation\n")

  // Check environment variables
  const requiredEnvVars = [
    'ASTRA_DB_API_ENDPOINT',
    'ASTRA_DB_APPLICATION_TOKEN', 
    'ASTRA_DB_COLLECTION'
  ]

  console.log("1. Environment Variables Check:")
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing: ${missingVars.join(', ')}`)
    console.log("\n📝 To fix this:")
    console.log("1. Create a .env file in the project root")
    console.log("2. Add your Astra DB credentials:")
    console.log("   ASTRA_DB_API_ENDPOINT=https://...")
    console.log("   ASTRA_DB_APPLICATION_TOKEN=AstraCS:...")
    console.log("   ASTRA_DB_COLLECTION=f1_knowledge")
    console.log("   ASTRA_DB_NAMESPACE=default_keyspace")
    console.log("\n3. Run 'npm run seed' to populate the database")
    return false
  } else {
    console.log("✅ All environment variables present")
  }

  try {
    // Test RAG service initialization
    console.log("\n2. RAG Service Initialization:")
    const ragService = getF1RAGService()
    console.log("✅ RAG service created successfully")

    // Test health check
    console.log("\n3. Database Health Check:")
    const isHealthy = await ragService.healthCheck()
    
    if (!isHealthy) {
      console.log("❌ Database health check failed")
      console.log("\n📝 To fix this:")
      console.log("1. Ensure your Astra DB credentials are correct")
      console.log("2. Run 'npm run seed' to populate the database")
      console.log("3. Wait for the seeding process to complete")
      return false
    } else {
      console.log("✅ Database is healthy and accessible")
    }

    // Test a simple query
    console.log("\n4. Sample Query Test:")
    const testQuery = "What is Formula 1?"
    console.log(`Testing query: "${testQuery}"`)
    
    const startTime = Date.now()
    const response = await ragService.query(testQuery)
    const endTime = Date.now()

    console.log(`✅ Query completed in ${endTime - startTime}ms`)
    console.log(`📊 Confidence: ${(response.confidence * 100).toFixed(1)}%`)
    console.log(`📄 Retrieved ${response.retrievedDocs.length} documents`)
    console.log(`🔗 Found ${response.sources.length} sources`)

    if (response.answer && response.answer.length > 50) {
      console.log("✅ Generated meaningful response")
      console.log(`📝 Preview: ${response.answer.substring(0, 100)}...`)
    } else {
      console.log("⚠️  Response seems too short or generic")
    }

    console.log("\n🎉 RAG Pipeline Validation: PASSED")
    console.log("\n🏁 Your F1GPT is ready to race!")
    
    return true

  } catch (error) {
    console.log("\n❌ RAG Pipeline Validation: FAILED")
    console.error("Error:", error)
    
    if (error instanceof Error) {
      if (error.message.includes('Missing required environment variables')) {
        console.log("\n📝 Fix: Set up your .env file with Astra DB credentials")
      } else if (error.message.includes('Failed to retrieve documents')) {
        console.log("\n📝 Fix: Run 'npm run seed' to populate the database")
      } else {
        console.log("\n📝 Fix: Check your database configuration and network connection")
      }
    }
    
    return false
  }
}

// Run validation if called directly
if (require.main === module) {
  validateRAGSetup().catch(console.error)
}

export { validateRAGSetup }
