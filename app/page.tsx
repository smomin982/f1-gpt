'use client'

import Image from 'next/image'
import f1GPTLogo from './assets/f1gpt.png'
import { useChat } from 'ai/react'
import { Orbitron } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import PromptSuggestionsRow from './components/PromptSuggestionsRow'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load theme from localStorage only after component mounts
  useEffect(() => {
    if (mounted) {
      const savedTheme = localStorage.getItem('f1gpt-theme') as 'light' | 'dark'
      if (savedTheme) setTheme(savedTheme)
    }
  }, [mounted])

  // Save theme to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('f1gpt-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Handle suggestion selection
  const handleSuggestionSelect = async (prompt: string) => {
    // Use the append method to directly send the message
    await append({
      content: prompt,
      role: 'user'
    })
  }

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <main className={`chat-page ${orbitron.className}`}>
        <aside className="sidebar">
          <div className="logo-placeholder" />
          <nav className="nav-links">
            <a href="#">Chat</a>
            <a href="#">Teams</a>
            <a href="#">Drivers</a>
            <a href="#">Races</a>
          </nav>
        </aside>
        <section className="chat-container">
          <header className="chat-header">
            <h1>F1GPT Command Center</h1>
            <p>Loading...</p>
          </header>
        </section>
      </main>
    )
  }

  return (
    <main className={`chat-page ${orbitron.className}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <Image src={f1GPTLogo} alt="F1GPT Logo" width={140} height={60} />
        <nav className="nav-links">
          <a href="#">Chat</a>
          <a href="#">Teams</a>
          <a href="#">Drivers</a>
          <a href="#">Races</a>
        </nav>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </aside>

      {/* Chat area */}
      <section className="chat-container">
        <header className="chat-header">
          <h1>F1GPT Command Center</h1>
          <p>Ask me anything about Formula 1 🚦</p>
        </header>

        <div className="chat-box">
          {messages.length === 0 ? (
            <>
              <p className="placeholder">Start a conversation about Formula 1…</p>
              <PromptSuggestionsRow onSuggestionSelect={handleSuggestionSelect} />
            </>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="bubble">
                  <div className="meta">{msg.role === 'user' ? 'You' : 'F1GPT'}</div>
                  <div className="content">{msg.content}</div>
                </div>
                {/* Reactions */}
                <div className="actions">
                  <button aria-label="Like message"><ThumbsUp size={14} /></button>
                  <button aria-label="Dislike message"><ThumbsDown size={14} /></button>
                  <button
                    aria-label="Copy message"
                    onClick={() => navigator.clipboard.writeText(msg.content)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant">
              <div className="bubble">
                <div className="meta">F1GPT</div>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder="Ask about F1 drivers, teams, races..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </section>
    </main>
  )
}
