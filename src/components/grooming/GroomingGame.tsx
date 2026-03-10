'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type FurTuft = {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  alive: boolean
}

type Prize = {
  emoji: string
  name: string
}

const PRIZES: Prize[] = [
  { emoji: '🦴', name: 'Golden Bone' },
  { emoji: '🎾', name: 'Championship Tennis Ball' },
  { emoji: '👑', name: 'Royal Crown' },
  { emoji: '🥩', name: 'Wagyu Steak' },
  { emoji: '🏠', name: 'Luxury Doghouse' },
  { emoji: '💎', name: 'Diamond Collar' },
  { emoji: '🧸', name: 'Giant Teddy Bear' },
  { emoji: '🍖', name: 'T-Bone Supreme' },
  { emoji: '🛁', name: 'Spa Day Pass' },
  { emoji: '🏆', name: 'Grand Champion Trophy' },
]

function generateFur(count: number): FurTuft[] {
  const tufts: FurTuft[] = []
  for (let i = 0; i < count; i++) {
    // Distribute around the dog area (center of the game board)
    const angle = Math.random() * Math.PI * 2
    const dist = 20 + Math.random() * 55
    tufts.push({
      id: i,
      x: 50 + Math.cos(angle) * dist * 0.8,
      y: 48 + Math.sin(angle) * dist * 0.85,
      size: 14 + Math.random() * 12,
      rotation: Math.random() * 360,
      alive: true,
    })
  }
  return tufts
}

function getLevelConfig(level: number) {
  const baseFur = 10
  const baseTime = 10
  return {
    furCount: baseFur + level * 4,
    timeLimit: Math.max(4, baseTime - level * 0.7),
    clickPower: Math.max(1, 2 - Math.floor(level / 4)),
  }
}

export default function GroomingGame() {
  const [level, setLevel] = useState(1)
  const [fur, setFur] = useState<FurTuft[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [prize, setPrize] = useState<Prize | null>(null)
  const [totalWins, setTotalWins] = useState(0)
  const [snipEffects, setSnipEffects] = useState<{ id: number; x: number; y: number }[]>()
  const snipIdRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startLevel = useCallback((lvl: number) => {
    const config = getLevelConfig(lvl)
    setFur(generateFur(config.furCount))
    setTimeLeft(config.timeLimit)
    setGameState('playing')
    setPrize(null)
    setSnipEffects([])
  }, [])

  // Start first level on mount
  useEffect(() => {
    startLevel(1)
  }, [startLevel])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = +(prev - 0.1).toFixed(1)
        if (next <= 0) {
          setGameState('lost')
          return 0
        }
        return next
      })
    }, 100)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState])

  // Check win condition
  useEffect(() => {
    if (gameState !== 'playing') return
    const alive = fur.filter(f => f.alive).length
    if (fur.length > 0 && alive === 0) {
      setGameState('won')
      const wins = totalWins + 1
      setTotalWins(wins)
      setPrize(PRIZES[(wins - 1) % PRIZES.length])
    }
  }, [fur, gameState, totalWins])

  const handleTuftClick = (id: number, e: React.MouseEvent) => {
    if (gameState !== 'playing') return
    e.stopPropagation()

    const rect = (e.currentTarget as HTMLElement).closest('.gg-board')?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const sid = snipIdRef.current++
      setSnipEffects(prev => [...(prev || []), { id: sid, x, y }])
      setTimeout(() => {
        setSnipEffects(prev => (prev || []).filter(s => s.id !== sid))
      }, 500)
    }

    const config = getLevelConfig(level)
    setFur(prev => {
      const updated = [...prev]
      // Remove the clicked tuft
      const idx = updated.findIndex(f => f.id === id && f.alive)
      if (idx >= 0) updated[idx] = { ...updated[idx], alive: false }
      // Remove extra nearby tufts based on click power
      let extra = config.clickPower - 1
      if (extra > 0) {
        const clicked = updated.find(f => f.id === id)
        if (clicked) {
          for (let i = 0; i < updated.length && extra > 0; i++) {
            if (updated[i].alive) {
              const dx = updated[i].x - clicked.x
              const dy = updated[i].y - clicked.y
              if (Math.sqrt(dx * dx + dy * dy) < 18) {
                updated[i] = { ...updated[i], alive: false }
                extra--
              }
            }
          }
        }
      }
      return updated
    })
  }

  const handleNextLevel = () => {
    const next = level + 1
    setLevel(next)
    startLevel(next)
  }

  const handleRetry = () => {
    startLevel(level)
  }

  const aliveCount = fur.filter(f => f.alive).length
  const totalCount = fur.length
  const progress = totalCount > 0 ? ((totalCount - aliveCount) / totalCount) * 100 : 0
  const config = getLevelConfig(level)
  const urgency = timeLeft < config.timeLimit * 0.3

  return (
    <div className="gg-container">
      <div className="gg-hud">
        <div className="gg-level">Level {level}</div>
        <div className={`gg-timer ${urgency ? 'gg-urgent' : ''}`}>
          {timeLeft.toFixed(1)}s
        </div>
        <div className="gg-score">{totalWins} {totalWins === 1 ? 'win' : 'wins'}</div>
      </div>

      <div className="gg-progress-bar">
        <div className="gg-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="gg-board">
        {/* Base dog - gets more visible as fur is removed */}
        <div className="gg-dog" style={{ opacity: 0.3 + (progress / 100) * 0.7 }}>
          🐩
        </div>

        {/* Shaggy overlay - fades as you trim */}
        {aliveCount > 0 && (
          <div className="gg-shaggy" style={{ opacity: Math.min(1, aliveCount / totalCount + 0.1) }}>
            🐕
          </div>
        )}

        {/* Fur tufts */}
        {fur.map(tuft =>
          tuft.alive ? (
            <button
              key={tuft.id}
              className="gg-tuft"
              style={{
                left: `${tuft.x}%`,
                top: `${tuft.y}%`,
                fontSize: `${tuft.size}px`,
                transform: `translate(-50%, -50%) rotate(${tuft.rotation}deg)`,
              }}
              onClick={(e) => handleTuftClick(tuft.id, e)}
            />
          ) : null
        )}

        {/* Snip effects */}
        {(snipEffects || []).map(s => (
          <span key={s.id} className="gg-snip" style={{ left: s.x, top: s.y }}>
            ✂️
          </span>
        ))}

        {/* Win overlay */}
        {gameState === 'won' && prize && (
          <div className="gg-win-overlay">
            <div className="gg-ribbon">🏅</div>
            <div className="gg-win-text">Groomed!</div>
            <div className="gg-prize">
              <span className="gg-prize-emoji">{prize.emoji}</span>
              <span className="gg-prize-name">{prize.name}</span>
            </div>
            <button className="gg-next-btn" onClick={handleNextLevel}>
              Level {level + 1} &rarr;
            </button>
          </div>
        )}

        {/* Lose overlay */}
        {gameState === 'lost' && (
          <div className="gg-lose-overlay">
            <div className="gg-lose-icon">😿</div>
            <div className="gg-lose-text">Too slow!</div>
            <div className="gg-lose-sub">{aliveCount} tuft{aliveCount !== 1 ? 's' : ''} remaining</div>
            <button className="gg-retry-btn" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <p className="gg-hint">
        {gameState === 'playing'
          ? 'Tap the fur to trim!'
          : gameState === 'won'
            ? 'Nice work, groomer!'
            : 'Better luck next time!'
        }
      </p>
    </div>
  )
}
