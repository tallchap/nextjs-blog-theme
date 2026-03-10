'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type FurTuft = {
  id: number
  x: number
  y: number
  size: number
  alive: boolean
}

const PRIZES = [
  { emoji: '🦴', name: 'Golden Bone' },
  { emoji: '🎾', name: 'Tennis Ball Trophy' },
  { emoji: '👑', name: 'Royal Crown' },
  { emoji: '🥩', name: 'Wagyu Steak' },
  { emoji: '💎', name: 'Diamond Collar' },
  { emoji: '🧸', name: 'Giant Teddy Bear' },
  { emoji: '🛁', name: 'Spa Day Pass' },
  { emoji: '🏆', name: 'Grand Champion Cup' },
]

// Place fur tufts directly on the dog body area (center region)
function generateFur(count: number): FurTuft[] {
  const tufts: FurTuft[] = []
  // Dog body zones: head, body left, body right, legs
  const zones = [
    { cx: 50, cy: 25, rx: 18, ry: 12 },  // head
    { cx: 38, cy: 48, rx: 14, ry: 18 },  // left body
    { cx: 62, cy: 48, rx: 14, ry: 18 },  // right body
    { cx: 50, cy: 50, rx: 20, ry: 15 },  // center body
    { cx: 35, cy: 72, rx: 10, ry: 10 },  // front legs
    { cx: 65, cy: 72, rx: 10, ry: 10 },  // back legs
    { cx: 50, cy: 35, rx: 22, ry: 10 },  // upper body
  ]
  for (let i = 0; i < count; i++) {
    const zone = zones[i % zones.length]
    tufts.push({
      id: i,
      x: zone.cx + (Math.random() - 0.5) * 2 * zone.rx,
      y: zone.cy + (Math.random() - 0.5) * 2 * zone.ry,
      size: 20 + Math.random() * 16,
      alive: true,
    })
  }
  return tufts
}

function getLevelConfig(level: number) {
  return {
    furCount: 8 + level * 5,
    timeLimit: Math.max(5, 12 - (level - 1) * 1),
  }
}

export default function GroomingGame() {
  const [level, setLevel] = useState(1)
  const [fur, setFur] = useState<FurTuft[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [totalWins, setTotalWins] = useState(0)
  const [snips, setSnips] = useState<{ id: number; x: number; y: number }[]>([])
  const snipId = useRef(0)

  const startLevel = useCallback((lvl: number) => {
    const config = getLevelConfig(lvl)
    setFur(generateFur(config.furCount))
    setTimeLeft(config.timeLimit)
    setGameState('playing')
    setSnips([])
  }, [])

  useEffect(() => { startLevel(1) }, [startLevel])

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        const next = +(prev - 0.1).toFixed(1)
        if (next <= 0) { setGameState('lost'); return 0 }
        return next
      })
    }, 100)
    return () => clearInterval(iv)
  }, [gameState])

  // Win check
  useEffect(() => {
    if (gameState !== 'playing' || fur.length === 0) return
    if (fur.every(f => !f.alive)) {
      setGameState('won')
      setTotalWins(w => w + 1)
    }
  }, [fur, gameState])

  const handleClick = (id: number, e: React.MouseEvent) => {
    if (gameState !== 'playing') return
    e.stopPropagation()

    // Snip effect at click position
    const board = (e.currentTarget as HTMLElement).closest('.gg-board')
    if (board) {
      const rect = board.getBoundingClientRect()
      const sid = snipId.current++
      setSnips(prev => [...prev, { id: sid, x: e.clientX - rect.left, y: e.clientY - rect.top }])
      setTimeout(() => setSnips(prev => prev.filter(s => s.id !== sid)), 500)
    }

    setFur(prev => prev.map(f => f.id === id ? { ...f, alive: false } : f))
  }

  const aliveCount = fur.filter(f => f.alive).length
  const totalCount = fur.length
  const trimmed = totalCount > 0 ? (totalCount - aliveCount) / totalCount : 0
  const config = getLevelConfig(level)
  const urgent = timeLeft < config.timeLimit * 0.3
  const prize = PRIZES[(totalWins - 1) % PRIZES.length]

  return (
    <div className="gg-container">
      <div className="gg-hud">
        <span className="gg-level">Level {level}</span>
        <span className={`gg-timer ${urgent ? 'gg-urgent' : ''}`}>{timeLeft.toFixed(1)}s</span>
        {totalWins > 0 && <span className="gg-score">{totalWins}x 🏅</span>}
      </div>

      <div className="gg-progress-bar">
        <div className="gg-progress-fill" style={{ width: `${trimmed * 100}%` }} />
      </div>

      <div className="gg-board">
        {/* Groomed poodle underneath — fades in as fur is removed */}
        <div className={`gg-poodle ${gameState === 'won' ? 'gg-dance' : ''}`} style={{ opacity: 0.15 + trimmed * 0.85 }}>
          🐩
        </div>

        {/* Shaggy dog on top — fades out as fur is removed */}
        <div className="gg-shaggy" style={{ opacity: Math.max(0, 1 - trimmed * 1.3) }}>
          🐕
        </div>

        {/* Fur tufts layered on the dog */}
        {fur.map(tuft =>
          tuft.alive ? (
            <button
              key={tuft.id}
              className="gg-tuft"
              style={{
                left: `${tuft.x}%`,
                top: `${tuft.y}%`,
                width: tuft.size,
                height: tuft.size,
              }}
              onClick={(e) => handleClick(tuft.id, e)}
            />
          ) : null
        )}

        {/* Scissors snip effects */}
        {snips.map(s => (
          <span key={s.id} className="gg-snip" style={{ left: s.x, top: s.y }}>✂️</span>
        ))}

        {/* Win: blue ribbon + dancing poodle */}
        {gameState === 'won' && (
          <div className="gg-win-overlay">
            <div className="gg-ribbon">🥇</div>
            <div className="gg-win-text">Groomed!</div>
            <div className="gg-prize">
              <span>{prize.emoji}</span>
              <span className="gg-prize-name">{prize.name}</span>
            </div>
            <button className="gg-next-btn" onClick={() => { setLevel(l => l + 1); startLevel(level + 1) }}>
              Level {level + 1} &rarr;
            </button>
          </div>
        )}

        {/* Lose */}
        {gameState === 'lost' && (
          <div className="gg-lose-overlay">
            <div className="gg-lose-icon">😿</div>
            <div className="gg-lose-text">Too slow!</div>
            <button className="gg-retry-btn" onClick={() => startLevel(level)}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <p className="gg-hint">
        {gameState === 'playing' ? 'Tap the fur to groom!' : gameState === 'won' ? 'Good boy!' : 'Try again!'}
      </p>
    </div>
  )
}
