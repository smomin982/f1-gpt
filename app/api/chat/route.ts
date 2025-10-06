 import { NextRequest } from 'next/server'

// Fallback F1 responses for demo mode
const getF1Response = (query: string): string => {
  const queryLower = query.toLowerCase()
  
  // Driver queries
  if (queryLower.includes('hamilton') || queryLower.includes('lewis')) {
    return `🏎️ **Lewis Hamilton**

Sir Lewis Carl Davidson Hamilton is a British racing driver currently competing in Formula 1 for Mercedes. He's a 7-time World Champion, tied with Michael Schumacher for the most championships in F1 history.

**Career Highlights:**
• 7 World Championships (2008, 2014-2020)
• 103 Grand Prix victories (most in F1 history)
• 104 pole positions 
• Started F1 with McLaren in 2007, joined Mercedes in 2013
• Knighted in 2021 for services to motorsport

**Current Status:** Still competing at the highest level for Mercedes-AMG Petronas F1 Team.

📚 **Sources:** formula1.com, motorsport.com`
  }
  
  if (queryLower.includes('verstappen') || queryLower.includes('max')) {
    return `🏎️ **Max Verstappen**

Max Emilian Verstappen is a Belgian-Dutch racing driver competing for Red Bull Racing. He's the current 3-time World Champion and one of the most dominant drivers in modern F1.

**Career Highlights:**
• 3 World Championships (2021, 2022, 2023)
• Started F1 at just 17 years old with Toro Rosso
• First win at age 18 (youngest F1 winner ever)
• Known for aggressive racing style and exceptional car control
• Son of former F1 driver Jos Verstappen

**Current Status:** Leading driver for Red Bull Racing and reigning World Champion.

📚 **Sources:** formula1.com, redbull.com`
  }
  
  // Team queries
  if (queryLower.includes('mercedes') || queryLower.includes('fastest car') || queryLower.includes('team')) {
    return `🏁 **F1 Teams & Performance**

The current F1 grid features 10 teams competing for the Constructors' Championship:

**Top Teams (Recent Performance):**
• **Red Bull Racing** - Dominant in recent seasons with advanced aerodynamics
• **Mercedes** - 8-time Constructors' Champions (2014-2021)
• **Ferrari** - Most successful team in F1 history with 16 Constructors' titles
• **McLaren** - Resurgent team with strong development
• **Aston Martin** - Ambitious team with significant investment

**Current Season:** Performance varies by track, but Red Bull has shown consistent pace.

📚 **Sources:** formula1.com, autosport.com`
  }
  
  // Race queries
  if (queryLower.includes('race') || queryLower.includes('next') || queryLower.includes('schedule')) {
    return `🏁 **F1 Race Information**

The Formula 1 calendar typically features 23-24 races across the globe from March to December.

**Iconic Circuits:**
• **Monaco** - The crown jewel of F1, street circuit through Monte Carlo
• **Silverstone** - British GP, home of F1, high-speed corners
• **Spa-Francorchamps** - Belgian GP, legendary for its challenging layout
• **Monza** - Italian GP, "Temple of Speed" with passionate tifosi
• **Suzuka** - Japanese GP, technical figure-8 layout

**Race Weekend Format:**
• Friday: Practice sessions (FP1, FP2)
• Saturday: Practice (FP3) + Qualifying
• Sunday: Race (usually 305km or 2 hours maximum)

📚 **Sources:** formula1.com, fia.com`
  }
  
  // Championship/standings queries
  if (queryLower.includes('champion') || queryLower.includes('standing') || queryLower.includes('constructor')) {
    return `🏆 **F1 Championships**

Formula 1 features two main championships running simultaneously:

**Drivers' Championship:**
• Individual points awarded to drivers based on race finishing positions
• Points system: 25-18-15-12-10-8-6-4-2-1 for top 10 finishers
• Fastest lap bonus: +1 point (if finishing in top 10)

**Constructors' Championship:**
• Points awarded to teams based on both drivers' combined results
• Same points system as drivers' championship
• Determines prize money distribution and prestige

**Recent Champions:**
• 2023: Max Verstappen (Driver), Red Bull Racing (Constructor)
• 2022: Max Verstappen (Driver), Red Bull Racing (Constructor)
• 2021: Max Verstappen (Driver), Mercedes (Constructor)

📚 **Sources:** formula1.com, fia.com`
  }
  
  // Technical queries
  if (queryLower.includes('drs') || queryLower.includes('technical') || queryLower.includes('rules')) {
    return `📋 **F1 Technical Information**

Formula 1 is governed by strict technical regulations to ensure safety and competitive balance.

**Key Technical Elements:**
• **DRS (Drag Reduction System)** - Adjustable rear wing for overtaking
• **ERS (Energy Recovery System)** - Hybrid power unit with 160hp boost
• **Power Units** - 1.6L V6 turbo engines with hybrid technology
• **Aerodynamics** - Complex wing and floor designs for downforce
• **Tires** - Pirelli supplies multiple compounds for different strategies

**Safety Features:**
• Halo cockpit protection device
• HANS (Head and Neck Support) device
• Carbon fiber monocoque chassis
• Multiple impact structures

📚 **Sources:** fia.com, formula1.com`
  }
  
  // General F1 queries
  return `🏎️ **Formula 1 Information**

Formula 1 is the pinnacle of motorsport, featuring the world's best drivers competing in the fastest racing cars on Earth.

**What Makes F1 Special:**
• **Technology** - Cutting-edge engineering and aerodynamics
• **Speed** - Cars reaching 370+ km/h on some circuits
• **Global Sport** - Races across 5 continents with millions of fans
• **Competition** - 20 drivers from 10 teams battling for glory
• **Innovation** - Technology that often filters down to road cars

**Current Era:**
• Ground effect aerodynamics (2022+ regulations)
• Hybrid power units producing 1000+ horsepower
• 18-inch wheels with low-profile tires
• Cost cap regulations for competitive balance
• Sprint race format at select events

Feel free to ask about specific drivers, teams, races, or technical aspects!

📚 **Sources:** formula1.com, fia.com`
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || ''

    if (!userMessage.trim()) {
      return new Response('Please provide a question about Formula 1.', { status: 400 })
    }

    console.log(`Received F1 query: "${userMessage}"`)

    // Check if environment variables are configured
    const requiredEnvVars = [
      'ASTRA_DB_API_ENDPOINT',
      'ASTRA_DB_APPLICATION_TOKEN',
      'ASTRA_DB_COLLECTION'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.log(`Missing environment variables: ${missingVars.join(', ')} - Using demo mode`)
      
      // Use fallback F1 responses for demo
      const demoResponse = getF1Response(userMessage)
      const enhancedResponse = `${demoResponse}

🔧 **Demo Mode Active** - To enable full RAG capabilities with comprehensive F1 database:
1. Set up Astra DB credentials in .env file
2. Run \`npm run seed\` to populate with F1 data from 11 websites
3. Restart the server for full AI-powered responses!`

      return new Response(enhancedResponse, {
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    try {
      // Try to use full RAG service if available
      const { getF1RAGService } = await import('../../../lib/rag-service')
      const ragService = getF1RAGService()

      // Perform health check
      const isHealthy = await ragService.healthCheck()
      
      if (!isHealthy) {
        console.log("Database not ready - using demo mode")
        const demoResponse = getF1Response(userMessage)
        return new Response(`${demoResponse}

🔧 **Database Not Ready** - Run \`npm run seed\` to populate with F1 data!`, {
          headers: { 'Content-Type': 'text/plain' },
        })
      }

      // Use full RAG pipeline
      const ragResponse = await ragService.query(userMessage)
      let formattedResponse = ragResponse.answer

      if (ragResponse.sources.length > 0) {
        formattedResponse += '\n\n📚 **Sources:**'
        ragResponse.sources.forEach((source, index) => {
          const shortSource = source.replace(/^https?:\/\//, '').split('/')[0]
          formattedResponse += `\n${index + 1}. ${shortSource}`
        })
      }

      if (process.env.NODE_ENV === 'development') {
        formattedResponse += `\n\n🔍 *RAG Mode - Confidence: ${(ragResponse.confidence * 100).toFixed(1)}%*`
      }

      return new Response(formattedResponse, {
        headers: { 'Content-Type': 'text/plain' },
      })

    } catch (ragError) {
      console.error('RAG service error, falling back to demo mode:', ragError)
      const demoResponse = getF1Response(userMessage)
      return new Response(`${demoResponse}

⚠️ **Fallback Mode** - RAG service temporarily unavailable`, {
        headers: { 'Content-Type': 'text/plain' },
      })
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      'Sorry, I encountered an unexpected error. Please try again.',
      { status: 500 }
    )
  }
}
