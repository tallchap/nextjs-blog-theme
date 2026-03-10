'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GroomingStyle } from '@/app/grooming/page'

type Props = {
  dogImage: string
  groomingStyle: GroomingStyle
  dogBreed: string
}

const STYLE_LABELS: Record<string, Record<string, string>> = {
  ears: { poofy: 'Poofy Ears', rounded: 'Rounded Ears', trimmed: 'Trimmed Ears' },
  tail: { bob: 'Bob Tail', pom: 'Pom Pom Tail', flag: 'Flag Tail' },
  body: { smooth: 'Smooth Body', teddy: 'Teddy Bear Cut', lion: 'Lion Cut' },
  face: { round: 'Round Face', clean: 'Clean Face', mustache: 'Mustache' },
  legs: { fluffy: 'Fluffy Legs', trimmed: 'Trimmed Legs', poodle: 'Poodle Legs' },
}

export default function GroomingPreview({ dogImage, groomingStyle, dogBreed }: Props) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track the style key that produced the current generated image
  const lastStyleKeyRef = useRef<string>('')

  const activeStyles = Object.entries(groomingStyle).filter(
    ([, value]) => value !== 'natural'
  )

  const styleKey = activeStyles.map(([a, s]) => `${a}:${s}`).join(',')

  const generatePreview = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()

    if (activeStyles.length === 0) {
      setGeneratedImage(null)
      setError(null)
      lastStyleKeyRef.current = ''
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)

    try {
      const changes = activeStyles.map(([area, style]) => ({ area, style }))
      const res = await fetch('/api/grooming-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dogImage,
          mimeType: dogImage.match(/data:([^;]+)/)?.[1] || 'image/jpeg',
          breed: dogBreed,
          changes,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      const data = await res.json()
      if (data.image) {
        setGeneratedImage(data.image)
        lastStyleKeyRef.current = styleKey
      } else {
        throw new Error('No image returned')
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to generate preview')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleKey, dogImage, dogBreed])

  // Debounce: wait 800ms after last style change before generating
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      generatePreview()
    }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [generatePreview])

  const displayImage = generatedImage || dogImage

  return (
    <div className="grooming-preview">
      <div className="preview-header">
        <h3>Style Preview</h3>
        <p>{dogBreed}</p>
      </div>

      <div className="preview-image-container">
        <img src={displayImage} alt="Your dog" className="preview-base-image" />

        {loading && (
          <div className="analyzing-overlay">
            <div className="analyzing-spinner"></div>
            <p>Generating groomed preview...</p>
          </div>
        )}

        <div className="preview-indicators">
          {activeStyles.length === 0 ? (
            <div className="no-changes-indicator">
              <span>No style changes - Natural look</span>
            </div>
          ) : generatedImage && !loading ? (
            <div className="changes-indicator" style={{ background: 'rgba(16,185,129,0.85)' }}>
              <span>AI preview - {activeStyles.length} style{activeStyles.length > 1 ? 's' : ''} applied</span>
            </div>
          ) : !loading ? (
            <div className="changes-indicator">
              <span>{activeStyles.length} style{activeStyles.length > 1 ? 's' : ''} selected</span>
            </div>
          ) : null}
        </div>
      </div>

      {error && (
        <div className="preview-note" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
          <p><strong>Preview error:</strong> {error}</p>
          <button
            className="btn btn-outline"
            style={{ marginTop: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={generatePreview}
          >
            Retry
          </button>
        </div>
      )}

      <div className="preview-legend">
        <h4>Applied Styles:</h4>
        {activeStyles.length === 0 ? (
          <p className="no-styles">Select styles from the options to see AI preview</p>
        ) : (
          <ul className="style-legend">
            {activeStyles.map(([area, style]) => (
              <li key={area} className="legend-item">
                <span className="legend-text">
                  {area.charAt(0).toUpperCase() + area.slice(1)}: {STYLE_LABELS[area]?.[style] || style}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {generatedImage && (
        <div className="preview-note">
          <p>
            <strong>AI Generated Preview</strong> - Shows an approximation of your dog
            with the selected grooming styles. Actual results may vary.
          </p>
        </div>
      )}
    </div>
  )
}
