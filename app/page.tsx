'use client'

import Image from 'next/image'
import f1GPTLogo from './assets/f1gpt.png'
import { useEffect, useMemo, useRef, useState } from 'react'

/** ---------------- Types ---------------- */
interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp?: number
    status?: 'sending' | 'sent' | 'read'
}

interface Channel {
    id: string
    name: string
    unread?: number
    active?: boolean
}

/** ---------------- Page ---------------- */
export default function Home() {
    /** ---------- State ---------- */
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const listRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Mock channels for sidebar
    const channels: Channel[] = useMemo(
        () => [
            { id: 'general', name: 'General', active: true },
            { id: 'strategy', name: 'Strategy' },
            { id: 'tech-support', name: 'Tech Support', unread: 3 },
            { id: 'random', name: 'Random' },
        ],
        []
    )

    /** ---------- Effects ---------- */
    // Auto-scroll on new messages
    useEffect(() => {
        const el = listRef.current
        if (!el) return
        const smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    }, [messages, isLoading])

    // Keyboard: Cmd/Ctrl+Enter to send
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    })

    /** ---------- Handlers ---------- */
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const trimmed = input.trim()
        if (!trimmed) return

        const userMessage: Message = {
            id: `${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: Date.now(),
            status: 'sent',
        }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed }),
            })
            const data = await res.json()

            const assistantMessage: Message = {
                id: `${Date.now() + 1}`,
                role: 'assistant',
                content: data?.message ?? '…',
                timestamp: Date.now(),
                status: 'read',
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (err) {
            console.error(err)
            const errorMessage: Message = {
                id: `${Date.now() + 2}`,
                role: 'assistant',
                content:
                    'Sorry—something went wrong while processing your request. Please try again.',
                timestamp: Date.now(),
                status: 'sent',
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    /** ---------- Helpers ---------- */
    const fmtTime = (t?: number) =>
        t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

    /** ---------- UI ---------- */
    return (
        <div className="h-dvh w-full bg-ui-bg text-ui-text selection:bg-ui-accent/20">
            {/* App Shell */}
            <div className="grid h-full grid-rows-[auto,1fr] lg:grid-cols-[280px,1fr] lg:grid-rows-1">
                {/* Sidebar */}
                <aside
                    className={`z-20 border-ui-line bg-ui-surface/70 backdrop-blur supports-[backdrop-filter]:bg-ui-surface/40
          lg:static lg:translate-x-0 lg:opacity-100 transition-all duration-300
          fixed left-0 top-0 h-full w-[80vw] max-w-[320px] border-r p-4
          ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:opacity-100'}
        `}
                    aria-label="Navigation sidebar"
                >
                    <div className="flex items-center gap-3 pb-4">
                        <Image src={f1GPTLogo} alt="Logo" width={40} height={40} className="rounded-sm" />
                        <div className="flex flex-col">
                            <span className="font-semibold tracking-tight">Chat Platform</span>
                            <span className="text-xs text-ui-subtle">Modern · Minimal · Fast</span>
                        </div>
                    </div>

                    <nav className="space-y-2" aria-label="Channels">
                        <div className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-ui-subtle">
                            Channels
                        </div>
                        {channels.map(ch => (
                            <button
                                key={ch.id}
                                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left
                transition-all duration-150 hover:bg-ui-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus
                ${ch.active ? 'bg-ui-hover ring-1 ring-ui-line' : ''}
              `}
                                aria-current={ch.active ? 'page' : undefined}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-ui-accent shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />
                                    <span className="truncate">{ch.name}</span>
                                </span>
                                {ch.unread ? (
                                    <span className="rounded-full bg-ui-accent/15 px-2 py-0.5 text-xs text-ui-accent">
                                        {ch.unread}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-6 border-t border-ui-line pt-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ui-accent to-ui-accent-2" />
                                <span
                                    className="absolute -right-0 -bottom-0 inline-block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-ui-surface"
                                    aria-label="Online"
                                    title="Online"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium">You</div>
                                <div className="truncate text-xs text-ui-subtle">Available</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Header (mobile) */}
                <header className="flex items-center justify-between border-b border-ui-line bg-ui-surface px-4 py-2 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(v => !v)}
                        aria-label="Toggle sidebar"
                        className="interactive-btn"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                            <path
                                d="M4 6h16M4 12h10M4 18h16"
                                className="stroke-current"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <Image src={f1GPTLogo} alt="Logo" width={28} height={28} />
                        <span className="text-sm font-semibold">Chat Platform</span>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-ui-accent to-ui-accent-2" />
                </header>

                {/* Chat Column */}
                <section className="flex h-full flex-col">
                    {/* Conversation Header */}
                    <div className="hidden items-center justify-between border-b border-ui-line bg-ui-surface px-5 py-3 lg:flex">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ui-accent to-ui-accent-2" />
                                <span
                                    className="absolute -right-0 -bottom-0 inline-block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-ui-surface"
                                    aria-label="Online"
                                />
                            </div>
                            <div>
                                <div className="text-sm font-semibold leading-tight">F1GPT Pit Wall</div>
                                <div className="text-xs text-ui-subtle">Active now</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="interactive-btn" aria-label="Search in conversation">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path
                                        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35"
                                        className="stroke-current"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                            <button className="interactive-btn" aria-label="More options">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path
                                        d="M12 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
                                        className="fill-current"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto px-3 py-4 sm:px-6"
                        role="log"
                        aria-live="polite"
                        aria-relevant="additions"
                    >
                        {messages.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <ul className="space-y-3">
                                {messages.map(m => (
                                    <li key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[85%] items-end gap-2 sm:max-w-[70%]`}>
                                            {m.role === 'assistant' && <Avatar label="F1" />}
                                            <MessageBubble role={m.role} time={fmtTime(m.timestamp)} status={m.status}>
                                                {m.content}
                                            </MessageBubble>
                                            {m.role === 'user' && <Avatar label="You" />}
                                        </div>
                                    </li>
                                ))}
                                {isLoading && (
                                    <li className="flex justify-start">
                                        <div className="flex max-w-[85%] items-end gap-2 sm:max-w-[70%]">
                                            <Avatar label="F1" />
                                            <TypingBubble />
                                        </div>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Composer */}
                    <form onSubmit={handleSubmit} className="border-t border-ui-line bg-ui-surface px-3 py-3 sm:px-5">
                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                className="interactive-btn"
                                aria-label="Attach file"
                                title="Attach file"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                                    <path
                                        d="M8.5 12.5 12 9a3 3 0 1 1 4.24 4.24l-5.66 5.66a5 5 0 1 1-7.08-7.08l7.78-7.78"
                                        className="stroke-current"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            <label className="sr-only" htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Write a message…  (Shift+Enter = new line, Cmd/Ctrl+Enter = send)"
                                className="composer"
                                disabled={isLoading}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit()
                                    }
                                }}
                            />

                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="send-btn disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Send message"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                                    <path
                                        d="M3 11.5 21 3l-8.5 18-2-7.5L3 11.5Z"
                                        className="fill-current"
                                    />
                                </svg>
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-ui-subtle">
                            Press <kbd className="kbd">Enter</kbd> to send, <kbd className="kbd">Shift</kbd> + <kbd className="kbd">Enter</kbd> for a new line.
                        </p>
                    </form>
                </section>
            </div>

            {/* --------- Global Styles (single-file) --------- */}
            <style jsx global>{`
        /* ---------- Theme ---------- */
        :root {
          --ui-bg: #0b0d12;            /* app background */
          --ui-surface: #11141a;       /* surfaces/cards */
          --ui-elev: #171b23;          /* elevated surfaces */
          --ui-line: #1f2430;          /* borders/dividers */
          --ui-text: #e6e8ee;          /* main text */
          --ui-subtle: #9aa3b2;        /* secondary text */
          --ui-hover: #141923;         /* hover bg */
          --ui-accent: #6ea8ff;        /* primary */
          --ui-accent-2: #7c5cff;      /* secondary accent */
          --ui-focus: rgba(110, 168, 255, 0.6);
          --ui-success: #22c55e;
        }
        .bg-ui-bg { background-color: var(--ui-bg); }
        .bg-ui-surface { background-color: var(--ui-surface); }
        .text-ui-text { color: var(--ui-text); }
        .text-ui-subtle { color: var(--ui-subtle); }
        .border-ui-line { border-color: var(--ui-line); }
        .bg-ui-hover { background-color: var(--ui-hover); }
        .bg-ui-success { background-color: var(--ui-success); }
        .text-ui-accent { color: var(--ui-accent); }
        .ring-ui-focus { --tw-ring-color: var(--ui-focus); }
        .from-ui-accent { --tw-gradient-from: var(--ui-accent); --tw-gradient-to: rgba(110,168,255,0.0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
        .to-ui-accent-2 { --tw-gradient-to: var(--ui-accent-2); }

        /* ---------- Base ---------- */
        html, body, #__next { height: 100%; }
        body { color: var(--ui-text); background: radial-gradient(1200px 800px at 20% -10%, rgba(124,92,255,0.15), transparent 60%), radial-gradient(1200px 800px at 110% 110%, rgba(110,168,255,0.12), transparent 60%), var(--ui-bg); }
        * { scrollbar-width: thin; scrollbar-color: var(--ui-accent) transparent; }

        /* WebKit scrollbar */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--ui-accent), var(--ui-accent-2));
          border-radius: 10px; border: 2px solid transparent; background-clip: padding-box;
        }
        ::-webkit-scrollbar-track { background: transparent; }

        /* ---------- Components ---------- */
        .interactive-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: .5rem; padding: .5rem; border-radius: .6rem;
          background: transparent; color: var(--ui-text); border: 1px solid var(--ui-line);
          transition: transform .12s ease, background-color .12s ease, border-color .12s ease, box-shadow .12s ease;
        }
        .interactive-btn:hover { background: var(--ui-hover); border-color: #2a3242; transform: translateY(-1px); }
        .interactive-btn:active { transform: translateY(0); }
        .interactive-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--ui-focus); }

        .composer {
          flex: 1; resize: none; max-height: 36vh; min-height: 44px;
          padding: .75rem .9rem; border-radius: .8rem;
          background: linear-gradient(180deg, var(--ui-elev), var(--ui-surface));
          border: 1px solid var(--ui-line); color: var(--ui-text);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
          transition: box-shadow .15s ease, border-color .15s ease, transform .06s ease;
          font-size: .95rem; line-height: 1.35;
        }
        .composer:focus { outline: none; border-color: #2a3242; box-shadow: 0 0 0 2px var(--ui-focus), inset 0 0 0 1px rgba(255,255,255,.04); }

        .send-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          height: 44px; padding: 0 .95rem; border-radius: .8rem;
          background: linear-gradient(180deg, var(--ui-accent), var(--ui-accent-2));
          color: #0b0d12; font-weight: 700; letter-spacing: .01em;
          transition: transform .12s ease, filter .12s ease, box-shadow .12s ease;
          box-shadow: 0 6px 16px rgba(124,92,255,.25);
        }
        .send-btn:hover { filter: saturate(1.05) brightness(1.05); transform: translateY(-1px); }
        .send-btn:active { transform: translateY(0); }

        .bubble {
          position: relative;
          padding: .7rem .9rem .6rem .9rem;
          border-radius: 1rem;
          border: 1px solid var(--ui-line);
          box-shadow: 0 1px 0 rgba(255,255,255,.03), 0 8px 24px rgba(0,0,0,.25);
          animation: bubbleIn .18s ease both;
        }
        .bubble--assistant {
          background: linear-gradient(180deg, var(--ui-elev), var(--ui-surface));
          border-top-left-radius: .4rem;
        }
        .bubble--user {
          background: linear-gradient(180deg, rgba(110,168,255,.15), rgba(124,92,255,.18));
          border-top-right-radius: .4rem;
          border-color: rgba(124,92,255,.35);
        }
        .bubble__meta {
          margin-top: .35rem; font-size: .73rem; color: var(--ui-subtle);
          display: flex; gap: .5rem; align-items: center;
        }
        .tick { height: 12px; width: 12px; display: inline-block; }
        .tick--read { color: var(--ui-accent); }

        @keyframes bubbleIn {
          from { transform: translateY(6px) scale(.98); opacity: 0; }
          to   { transform: translateY(0)   scale(1);    opacity: 1; }
        }

        .typing {
          width: 42px; height: 28px; border-radius: 999px;
          display: grid; place-items: center; padding: 0 .6rem;
          background: linear-gradient(180deg, var(--ui-elev), var(--ui-surface));
          border: 1px solid var(--ui-line);
        }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 999px; background: var(--ui-subtle);
          animation: blink 1.2s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: .15s; }
        .typing-dot:nth-child(3) { animation-delay: .3s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: .25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .kbd {
          background: #0e1117; border: 1px solid #2a3242; border-bottom-width: 2px;
          padding: 0 .35rem; border-radius: .35rem; font-variant-ligatures: none;
        }

        /* Motion safety */
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
        }
      `}</style>
        </div>
    )
}

/** ---------------- Smaller Components ---------------- */

function EmptyState() {
    return (
        <div className="mx-auto max-w-xl rounded-xl border border-ui-line bg-ui-surface p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,.25)]">
            <div className="mb-3 flex items-center justify-center gap-2">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-ui-accent to-ui-accent-2" />
                <div className="text-lg font-semibold">Welcome to F1GPT</div>
            </div>
            <p className="text-sm text-ui-subtle">
                Start a conversation to get insights, strategies, and quick answers.
            </p>
            <p className="mt-2 text-xs text-ui-subtle">
                Pro tip: Use <kbd className="kbd">/</kbd> to start a quick action.
            </p>
        </div>
    )
}

function Avatar({ label }: { label: string }) {
    return (
        <div
            className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-ui-accent to-ui-accent-2 text-[10px] font-bold text-[#0b0d12] shadow-[0_6px_16px_rgba(124,92,255,.35)]"
            aria-hidden
            title={label}
        >
            {label.slice(0, 2).toUpperCase()}
        </div>
    )
}

function MessageBubble({
    role,
    time,
    status,
    children,
}: {
    role: 'user' | 'assistant'
    time?: string
    status?: Message['status']
    children: React.ReactNode
}) {
    return (
        <div className={`bubble ${role === 'user' ? 'bubble--user' : 'bubble--assistant'}`}>
            <div className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{children}</div>
            <div className="bubble__meta">
                <span>{time}</span>
                {role === 'user' ? (
                    <span
                        className={`tick ${status === 'read' ? 'tick--read' : ''}`}
                        aria-label={status === 'read' ? 'Read' : status === 'sent' ? 'Sent' : 'Sending'}
                        title={status === 'read' ? 'Read' : status === 'sent' ? 'Sent' : 'Sending'}
                    >
                        {status === 'sending' ? '⋯' : status === 'read' ? '✓✓' : '✓'}
                    </span>
                ) : null}
            </div>
        </div>
    )
}

function TypingBubble() {
    return (
        <div className="typing">
            <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    )
}
