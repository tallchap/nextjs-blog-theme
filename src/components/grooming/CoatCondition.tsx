'use client'

import { useState } from 'react'
import { CoatConditionType } from '@/app/grooming/page'

type Props = {
  dogImage: string
  dogBreed: string
  onSubmit: (condition: CoatConditionType) => void
  onBack: () => void
  initialCondition: CoatConditionType
}

export default function CoatCondition({ dogImage, dogBreed, onSubmit, onBack, initialCondition }: Props) {
  const [condition, setCondition] = useState<CoatConditionType>(initialCondition)

  const handleToggle = (field: 'tangled' | 'dirty' | 'matted') => {
    setCondition(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleLengthChange = (length: 'short' | 'medium' | 'long') => {
    setCondition(prev => ({ ...prev, length }))
  }

  return (
    <section className="coat-condition-section">
      <div className="container">
        <div className="condition-header">
          <h2>Tell us about {dogBreed}'s coat</h2>
          <p>This helps us provide accurate time estimates and pricing</p>
        </div>

        <div className="condition-layout">
          <div className="condition-preview">
            <img src={dogImage} alt="Your dog" className="dog-preview-image" />
            <div className="breed-badge">{dogBreed}</div>
          </div>

          <div className="condition-form">
            <div className="condition-group">
              <h3>Coat Condition</h3>
              <p className="group-description">Select all that apply</p>

              <div className="condition-options">
                <button
                  className={`condition-card ${condition.tangled ? 'selected' : ''}`}
                  onClick={() => handleToggle('tangled')}
                >
                  <span className="condition-icon">🔗</span>
                  <span className="condition-label">Tangled</span>
                  <span className="condition-desc">Some knots that need brushing out</span>
                  <span className="time-impact">+15 min</span>
                </button>

                <button
                  className={`condition-card ${condition.dirty ? 'selected' : ''}`}
                  onClick={() => handleToggle('dirty')}
                >
                  <span className="condition-icon">🛁</span>
                  <span className="condition-label">Dirty</span>
                  <span className="condition-desc">Needs extra cleaning and scrubbing</span>
                  <span className="time-impact">+10 min</span>
                </button>

                <button
                  className={`condition-card ${condition.matted ? 'selected' : ''}`}
                  onClick={() => handleToggle('matted')}
                >
                  <span className="condition-icon">🧶</span>
                  <span className="condition-label">Matted</span>
                  <span className="condition-desc">Severe tangles requiring careful de-matting</span>
                  <span className="time-impact">+30 min</span>
                </button>
              </div>
            </div>

            <div className="condition-group">
              <h3>Coat Length</h3>
              <p className="group-description">Current length before grooming</p>

              <div className="length-options">
                <button
                  className={`length-card ${condition.length === 'short' ? 'selected' : ''}`}
                  onClick={() => handleLengthChange('short')}
                >
                  <div className="length-visual short"></div>
                  <span className="length-label">Short</span>
                  <span className="length-desc">Less than 1 inch</span>
                </button>

                <button
                  className={`length-card ${condition.length === 'medium' ? 'selected' : ''}`}
                  onClick={() => handleLengthChange('medium')}
                >
                  <div className="length-visual medium"></div>
                  <span className="length-label">Medium</span>
                  <span className="length-desc">1-3 inches</span>
                </button>

                <button
                  className={`length-card ${condition.length === 'long' ? 'selected' : ''}`}
                  onClick={() => handleLengthChange('long')}
                >
                  <div className="length-visual long"></div>
                  <span className="length-label">Long</span>
                  <span className="length-desc">More than 3 inches</span>
                  <span className="time-impact">+20 min</span>
                </button>
              </div>
            </div>

            <div className="condition-summary">
              <h4>Estimated Additional Time:</h4>
              <p className="time-estimate">
                {(condition.tangled ? 15 : 0) +
                 (condition.dirty ? 10 : 0) +
                 (condition.matted ? 30 : 0) +
                 (condition.length === 'long' ? 20 : 0)} minutes
              </p>
            </div>

            <div className="condition-actions">
              <button className="btn btn-outline" onClick={onBack}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => onSubmit(condition)}>
                Choose Grooming Style
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
