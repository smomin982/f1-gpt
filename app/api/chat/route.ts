 import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // For now, return a simple response
    // Later we'll integrate with your F1 database and AI model
    const response = `You asked about: "${message}". I'm F1GPT, your Formula 1 expert! Currently setting up my knowledge base. Soon I'll be able to answer detailed questions about drivers, teams, races, and F1 history using my extensive database.`

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
