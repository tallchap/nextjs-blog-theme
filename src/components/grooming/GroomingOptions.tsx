'use client'

import { GroomingStyle, CoatConditionType } from '@/app/grooming/page'

type Props = {
  groomingStyle: GroomingStyle
  onChange: (style: GroomingStyle) => void
  dogBreed: string
  coatCondition: CoatConditionType
}

const STYLE_OPTIONS = {
  ears: [
    { value: 'natural', label: 'Natural', icon: '🐕', description: 'Keep ears as is' },
    { value: 'poofy', label: 'Poofy', icon: '☁️', description: 'Full and fluffy ears' },
    { value: 'rounded', label: 'Rounded', icon: '⭕', description: 'Soft rounded shape' },
    { value: 'trimmed', label: 'Trimmed', icon: '✂️', description: 'Neatly trimmed' },
  ],
  tail: [
    { value: 'natural', label: 'Natural', icon: '🐕', description: 'Keep tail as is' },
    { value: 'bob', label: 'Bob', icon: '🎾', description: 'Short rounded bob' },
    { value: 'pom', label: 'Pom Pom', icon: '🧸', description: 'Fluffy pom at end' },
    { value: 'flag', label: 'Flag', icon: '🚩', description: 'Feathered flag style' },
  ],
  body: [
    { value: 'natural', label: 'Natural', icon: '🐕', description: 'Light trim only' },
    { value: 'smooth', label: 'Smooth', icon: '✨', description: 'Short all over' },
    { value: 'teddy', label: 'Teddy Bear', icon: '🧸', description: 'Fluffy teddy look' },
    { value: 'lion', label: 'Lion Cut', icon: '🦁', description: 'Mane with short body' },
  ],
  face: [
    { value: 'natural', label: 'Natural', icon: '🐕', description: 'Keep face as is' },
    { value: 'round', label: 'Round', icon: '🌕', description: 'Rounded face trim' },
    { value: 'clean', label: 'Clean', icon: '✨', description: 'Short and neat' },
    { value: 'mustache', label: 'Mustache', icon: '🥸', description: 'Keep mustache fur' },
  ],
  legs: [
    { value: 'natural', label: 'Natural', icon: '🐕', description: 'Keep legs as is' },
    { value: 'fluffy', label: 'Fluffy', icon: '☁️', description: 'Full fluffy legs' },
    { value: 'trimmed', label: 'Trimmed', icon: '✂️', description: 'Neat trim' },
    { value: 'poodle', label: 'Poodle', icon: '🐩', description: 'Poodle style puffs' },
  ],
}

export default function GroomingOptions({ groomingStyle, onChange, dogBreed, coatCondition }: Props) {
  const handleChange = (area: keyof GroomingStyle, value: string) => {
    onChange({ ...groomingStyle, [area]: value })
  }

  const getRecommendations = () => {
    const recs: string[] = []
    if (dogBreed.toLowerCase().includes('poodle')) {
      recs.push('Poodle cuts work great for this breed!')
    }
    if (dogBreed.toLowerCase().includes('shih') || dogBreed.toLowerCase().includes('maltese')) {
      recs.push('Teddy bear cut is popular for this breed')
    }
    if (coatCondition.matted) {
      recs.push('Due to matting, a smooth cut may be needed in affected areas')
    }
    if (coatCondition.length === 'long') {
      recs.push('Long coat allows for many style options')
    }
    return recs
  }

  const recommendations = getRecommendations()

  return (
    <div className="grooming-options">
      <div className="options-header">
        <h2>Choose Your Style</h2>
        <p>Select the grooming style for each area. Toggle options to see the preview update.</p>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations-box">
          <h4>💡 Recommendations for {dogBreed}</h4>
          <ul>
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {(Object.keys(STYLE_OPTIONS) as Array<keyof typeof STYLE_OPTIONS>).map((area) => (
        <div key={area} className="option-group">
          <h3 className="option-area-title">
            {area.charAt(0).toUpperCase() + area.slice(1)}
          </h3>
          <div className="option-buttons">
            {STYLE_OPTIONS[area].map((option) => (
              <button
                key={option.value}
                className={`option-button ${groomingStyle[area] === option.value ? 'selected' : ''}`}
                onClick={() => handleChange(area, option.value)}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                <span className="option-desc">{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="style-summary">
        <h4>Selected Style Summary</h4>
        <ul className="summary-list">
          {(Object.entries(groomingStyle) as [keyof GroomingStyle, string][]).map(([area, value]) => {
            if (value === 'natural') return null
            const option = STYLE_OPTIONS[area].find(o => o.value === value)
            return (
              <li key={area}>
                <strong>{area}:</strong> {option?.label} {option?.icon}
              </li>
            )
          })}
        </ul>
        {Object.values(groomingStyle).every(v => v === 'natural') && (
          <p className="no-changes">No style changes selected - natural look</p>
        )}
      </div>
    </div>
  )
}
