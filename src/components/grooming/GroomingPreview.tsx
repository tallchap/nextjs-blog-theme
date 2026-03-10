'use client'

import { GroomingStyle } from '@/app/grooming/page'

type Props = {
  dogImage: string
  groomingStyle: GroomingStyle
  dogBreed: string
}

const STYLE_OVERLAYS: Record<string, Record<string, { color: string; label: string }>> = {
  ears: {
    poofy: { color: 'rgba(255, 182, 193, 0.5)', label: 'Poofy Ears' },
    rounded: { color: 'rgba(173, 216, 230, 0.5)', label: 'Rounded Ears' },
    trimmed: { color: 'rgba(144, 238, 144, 0.5)', label: 'Trimmed Ears' },
  },
  tail: {
    bob: { color: 'rgba(255, 218, 185, 0.5)', label: 'Bob Tail' },
    pom: { color: 'rgba(221, 160, 221, 0.5)', label: 'Pom Pom Tail' },
    flag: { color: 'rgba(176, 224, 230, 0.5)', label: 'Flag Tail' },
  },
  body: {
    smooth: { color: 'rgba(255, 255, 200, 0.3)', label: 'Smooth Body' },
    teddy: { color: 'rgba(222, 184, 135, 0.4)', label: 'Teddy Bear Cut' },
    lion: { color: 'rgba(255, 165, 0, 0.3)', label: 'Lion Cut' },
  },
  face: {
    round: { color: 'rgba(255, 192, 203, 0.4)', label: 'Round Face' },
    clean: { color: 'rgba(200, 255, 200, 0.3)', label: 'Clean Face' },
    mustache: { color: 'rgba(139, 69, 19, 0.3)', label: 'Mustache' },
  },
  legs: {
    fluffy: { color: 'rgba(230, 230, 250, 0.4)', label: 'Fluffy Legs' },
    trimmed: { color: 'rgba(144, 238, 144, 0.3)', label: 'Trimmed Legs' },
    poodle: { color: 'rgba(255, 182, 193, 0.4)', label: 'Poodle Legs' },
  },
}

export default function GroomingPreview({ dogImage, groomingStyle, dogBreed }: Props) {
  const activeStyles = Object.entries(groomingStyle).filter(
    ([, value]) => value !== 'natural'
  )

  return (
    <div className="grooming-preview">
      <div className="preview-header">
        <h3>Style Preview</h3>
        <p>{dogBreed}</p>
      </div>

      <div className="preview-image-container">
        <img src={dogImage} alt="Your dog" className="preview-base-image" />

        {/* Overlay indicators */}
        <div className="style-overlays">
          {activeStyles.map(([area, style]) => {
            const overlay = STYLE_OVERLAYS[area]?.[style]
            if (!overlay) return null
            return (
              <div
                key={area}
                className={`style-overlay overlay-${area}`}
                style={{ backgroundColor: overlay.color }}
              >
                <span className="overlay-label">{overlay.label}</span>
              </div>
            )
          })}
        </div>

        {/* Visual indicators showing what areas are being styled */}
        <div className="preview-indicators">
          {activeStyles.length === 0 ? (
            <div className="no-changes-indicator">
              <span>No style changes - Natural look</span>
            </div>
          ) : (
            <div className="changes-indicator">
              <span>{activeStyles.length} style change{activeStyles.length > 1 ? 's' : ''} applied</span>
            </div>
          )}
        </div>
      </div>

      <div className="preview-legend">
        <h4>Applied Styles:</h4>
        {activeStyles.length === 0 ? (
          <p className="no-styles">Select styles from the options to see preview</p>
        ) : (
          <ul className="style-legend">
            {activeStyles.map(([area, style]) => {
              const overlay = STYLE_OVERLAYS[area]?.[style]
              return (
                <li key={area} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: overlay?.color || '#ccc' }}
                  ></span>
                  <span className="legend-text">
                    {area.charAt(0).toUpperCase() + area.slice(1)}: {style}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="preview-note">
        <p>
          <strong>Note:</strong> This preview shows the style areas that will be groomed.
          The actual result will depend on your dog's coat type and condition.
        </p>
      </div>
    </div>
  )
}
