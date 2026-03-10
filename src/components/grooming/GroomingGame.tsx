'use client'

import { useState, useEffect, useMemo } from 'react'

type Question = {
  question: string
  options: string[]
  stat: string // label for the comparison stat
  statValues: Record<string, number> // percentage of dog owners who picked each option
}

const ALL_QUESTIONS: Question[] = [
  {
    question: "Do you know your dog's exact birthday?",
    options: ['Yes, to the day!', 'Roughly', 'No idea'],
    stat: 'of dog owners',
    statValues: { 'Yes, to the day!': 42, 'Roughly': 38, 'No idea': 20 },
  },
  {
    question: 'Does your dog sleep in bed with you?',
    options: ['Every night', 'Sometimes', 'Never'],
    stat: 'of dog owners',
    statValues: { 'Every night': 45, 'Sometimes': 30, 'Never': 25 },
  },
  {
    question: 'How does your dog react to bath time?',
    options: ['Loves it!', 'Tolerates it', 'Total drama'],
    stat: 'of dogs',
    statValues: { 'Loves it!': 18, 'Tolerates it': 37, 'Total drama': 45 },
  },
  {
    question: 'Does your dog have a favorite toy?',
    options: ['Yes, obsessed', 'A few favorites', 'Destroys them all'],
    stat: 'of dogs',
    statValues: { 'Yes, obsessed': 52, 'A few favorites': 33, 'Destroys them all': 15 },
  },
  {
    question: 'How does your dog greet you when you come home?',
    options: ['Full zoomies', 'Tail wag + kisses', 'Cool & casual'],
    stat: 'of dogs',
    statValues: { 'Full zoomies': 35, 'Tail wag + kisses': 48, 'Cool & casual': 17 },
  },
  {
    question: 'Does your dog know any tricks?',
    options: ['5+ tricks', 'Sit & shake', 'Just vibes'],
    stat: 'of dogs',
    statValues: { '5+ tricks': 28, 'Sit & shake': 44, 'Just vibes': 28 },
  },
  {
    question: "What's your dog's stance on the vacuum?",
    options: ['Mortal enemy', 'Suspicious', 'Couldn\'t care less'],
    stat: 'of dogs',
    statValues: { 'Mortal enemy': 40, 'Suspicious': 35, 'Couldn\'t care less': 25 },
  },
  {
    question: 'Does your dog have a middle name?',
    options: ['Obviously', 'Just a nickname', 'No'],
    stat: 'of dog owners',
    statValues: { 'Obviously': 33, 'Just a nickname': 40, 'No': 27 },
  },
  {
    question: 'How often do you talk to your dog like a person?',
    options: ['Constantly', 'A lot', 'Sometimes'],
    stat: 'of dog owners',
    statValues: { 'Constantly': 55, 'A lot': 32, 'Sometimes': 13 },
  },
  {
    question: 'Has your dog ever stolen food off the counter?',
    options: ['Multiple times', 'Once (that I know of)', 'Never'],
    stat: 'of dogs',
    statValues: { 'Multiple times': 38, 'Once (that I know of)': 30, 'Never': 32 },
  },
  {
    question: "What's your dog's energy level?",
    options: ['Turbo mode 24/7', 'Active but chill', 'Professional napper'],
    stat: 'of dogs',
    statValues: { 'Turbo mode 24/7': 25, 'Active but chill': 45, 'Professional napper': 30 },
  },
  {
    question: 'Does your dog get along with other dogs?',
    options: ['Best friends with all', 'Selective', 'Prefers humans'],
    stat: 'of dogs',
    statValues: { 'Best friends with all': 40, 'Selective': 42, 'Prefers humans': 18 },
  },
  {
    question: 'Does your dog have an Instagram account?',
    options: ['Yes!', 'Thought about it', 'No way'],
    stat: 'of dog owners',
    statValues: { 'Yes!': 15, 'Thought about it': 30, 'No way': 55 },
  },
  {
    question: 'How does your dog feel about car rides?',
    options: ['Head out the window!', 'Sleeps the whole time', 'Gets anxious'],
    stat: 'of dogs',
    statValues: { 'Head out the window!': 50, 'Sleeps the whole time': 28, 'Gets anxious': 22 },
  },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GroomingGame() {
  const questions = useMemo(() => shuffle(ALL_QUESTIONS), [])
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(0)

  const q = questions[qIndex % questions.length]

  // Auto-advance after showing the stat for 2.5s
  useEffect(() => {
    if (!selected) return
    const timer = setTimeout(() => {
      setSelected(null)
      setQIndex(i => i + 1)
    }, 2500)
    return () => clearTimeout(timer)
  }, [selected])

  const handlePick = (option: string) => {
    if (selected) return
    setSelected(option)
    setAnswered(a => a + 1)
  }

  const yourPct = selected ? q.statValues[selected] ?? 0 : 0

  return (
    <div className="dq-container">
      <div className="dq-header">
        <span className="dq-icon">🐾</span>
        <span className="dq-title">Dog Parent Quiz</span>
        <span className="dq-count">{answered} answered</span>
      </div>

      <div className="dq-question">{q.question}</div>

      <div className="dq-options">
        {q.options.map(opt => {
          const pct = q.statValues[opt] ?? 0
          const isSelected = selected === opt
          const showResult = selected !== null
          return (
            <button
              key={opt}
              className={`dq-option ${isSelected ? 'dq-selected' : ''} ${showResult ? 'dq-revealed' : ''}`}
              onClick={() => handlePick(opt)}
              disabled={showResult}
            >
              <span className="dq-option-text">{opt}</span>
              {showResult && (
                <div className="dq-bar-wrap">
                  <div className="dq-bar" style={{ width: `${pct}%` }} />
                  <span className="dq-pct">{pct}%</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="dq-stat-callout">
          <span className="dq-stat-pct">{yourPct}%</span> {q.stat} picked the same!
        </div>
      )}

      <p className="dq-footer-text">
        {selected ? 'Next question coming...' : 'While your preview generates...'}
      </p>
    </div>
  )
}
