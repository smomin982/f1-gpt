'use client'

import { useState, useEffect, useMemo } from 'react'

interface PromptSuggestion {
  id: string
  text: string
  emoji: string
  description: string
  category: 'drivers' | 'teams' | 'races' | 'stats' | 'history' | 'rules'
  keywords: string[]
}

interface PromptSuggestionsRowProps {
  onSuggestionSelect: (prompt: string) => void
}

const PromptSuggestionsRow: React.FC<PromptSuggestionsRowProps> = ({ onSuggestionSelect }) => {
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentSuggestions, setCurrentSuggestions] = useState<PromptSuggestion[]>([])
  const [isClient, setIsClient] = useState(false)

  const allPromptSuggestions: PromptSuggestion[] = useMemo(() => [
    {
      id: '1',
      text: "Who is the current Formula One World Champion?",
      emoji: "🏆",
      description: "Current season championship leader",
      category: 'drivers',
      keywords: ['champion', 'winner', 'title', 'current']
    },
    {
      id: '2', 
      text: "Which F1 team has the fastest car this season?",
      emoji: "🏎️",
      description: "Performance analysis and team rankings",
      category: 'teams',
      keywords: ['fastest', 'performance', 'car', 'speed']
    },
    {
      id: '3',
      text: "When is the next Formula 1 race?",
      emoji: "🏁",
      description: "Upcoming race schedule and calendar",
      category: 'races',
      keywords: ['next', 'schedule', 'calendar', 'upcoming']
    },
    {
      id: '4',
      text: "What are the latest F1 driver transfers?",
      emoji: "🔄",
      description: "Recent driver moves and rumors",
      category: 'drivers',
      keywords: ['transfer', 'moves', 'driver', 'changes']
    },
    {
      id: '5',
      text: "Show me lap record statistics",
      emoji: "⚡",
      description: "Speed records and performance data",
      category: 'stats',
      keywords: ['record', 'fastest', 'lap', 'statistics']
    },
    {
      id: '6',
      text: "Explain F1 DRS system and rules",
      emoji: "📋",
      description: "Technical regulations and systems",
      category: 'rules',
      keywords: ['DRS', 'rules', 'regulations', 'technical']
    },
    {
      id: '7',
      text: "Which circuits are new to F1 this season?",
      emoji: "🗺️",
      description: "Track information and circuit details",
      category: 'races',
      keywords: ['circuits', 'tracks', 'new', 'venues']
    },
    {
      id: '8',
      text: "Compare Hamilton vs Verstappen career stats",
      emoji: "📊",
      description: "Driver comparison and achievements",
      category: 'stats',
      keywords: ['compare', 'Hamilton', 'Verstappen', 'stats']
    },
    {
      id: '9',
      text: "Tell me about F1 history and legends",
      emoji: "📚",
      description: "Historical moments and legendary drivers",
      category: 'history',
      keywords: ['history', 'legends', 'past', 'classic']
    },
    {
      id: '10',
      text: "What are the current constructor standings?",
      emoji: "🏭",
      description: "Team championship positions",
      category: 'teams',
      keywords: ['constructor', 'standings', 'team', 'points']
    }
  ], [])

  const categories = [
    { id: 'all', label: 'All Topics', emoji: '🌟' },
    { id: 'drivers', label: 'Drivers', emoji: '👨‍🏎️' },
    { id: 'teams', label: 'Teams', emoji: '🏎️' },
    { id: 'races', label: 'Races', emoji: '🏁' },
    { id: 'stats', label: 'Statistics', emoji: '📊' },
    { id: 'history', label: 'History', emoji: '📚' },
    { id: 'rules', label: 'Rules', emoji: '📋' }
  ]

  // Set client-side flag after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update suggestions when category changes or client loads
  useEffect(() => {
    if (selectedCategory === 'all') {
      if (isClient) {
        // Only randomize on client-side after hydration
        const shuffled = [...allPromptSuggestions].sort(() => 0.5 - Math.random())
        setCurrentSuggestions(shuffled.slice(0, 5))
      } else {
        // Use deterministic order for SSR
        setCurrentSuggestions(allPromptSuggestions.slice(0, 5))
      }
    } else {
      // Show all suggestions from selected category
      const filtered = allPromptSuggestions.filter(
        suggestion => suggestion.category === selectedCategory
      )
      setCurrentSuggestions(filtered)
    }
  }, [selectedCategory, allPromptSuggestions, isClient])

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    onSuggestionSelect(suggestion.text)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  return (
    <div className="prompt-suggestions-container">
      <div className="suggestions-header">
        <h3>Quick Start Suggestions</h3>
        <p>Click on any suggestion below to begin your F1 conversation</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            <span className="category-emoji">{category.emoji}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>
      
      <div className="prompt-suggestions-grid">
        {currentSuggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            className={`suggestion-card ${hoveredSuggestion === suggestion.id ? 'hovered' : ''}`}
            onClick={() => handleSuggestionClick(suggestion)}
            onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
            onMouseLeave={() => setHoveredSuggestion(null)}
            aria-label={`Ask: ${suggestion.text}`}
          >
            <div className="suggestion-emoji">{suggestion.emoji}</div>
            <div className="suggestion-content">
              <div className="suggestion-text">{suggestion.text}</div>
              <div className="suggestion-description">{suggestion.description}</div>
              <div className="suggestion-keywords">
                {suggestion.keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">#{keyword}</span>
                ))}
              </div>
            </div>
            <div className="suggestion-category">{suggestion.category}</div>
          </button>
        ))}
      </div>

      <div className="suggestions-footer">
        <span className="tip-text">💡 Pro tip: Use category filters to find specific topics or explore random suggestions</span>
      </div>
    </div>
  )
}

export default PromptSuggestionsRow