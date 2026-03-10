'use client'

import { useState, useRef } from 'react'
import { GroomingStyle } from '@/app/grooming/page'

type Props = {
  dogImage: string
  groomingStyle: GroomingStyle
  dogBreed: string
  geminiFileUri: string | null
  geminiFileMime: string
}

const STYLE_LABELS: Record<string, Record<string, string>> = {
  ears: { poofy: 'Poofy Ears', rounded: 'Rounded Ears', trimmed: 'Trimmed Ears' },
  tail: { bob: 'Bob Tail', pom: 'Pom Pom Tail', flag: 'Flag Tail' },
  body: { smooth: 'Smooth Body', teddy: 'Teddy Bear Cut', lion: 'Lion Cut' },
  face: { round: 'Round Face', clean: 'Clean Face', mustache: 'Mustache' },
  legs: { fluffy: 'Fluffy Legs', trimmed: 'Trimmed Legs', poodle: 'Poodle Legs' },
}

// Resize image to max dimension
function resizeImage(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (img.width <= maxDim && img.height <= maxDim) {
        resolve(dataUrl)
        return
      }
      const scale = maxDim / Math.max(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = dataUrl
  })
}

export default function GroomingPreview({ dogImage, groomingStyle, dogBreed, geminiFileUri, geminiFileMime }: Props) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewOn, setPreviewOn] = useState(false)
  // Track which style combo produced the current preview
  const [previewedStyleKey, setPreviewedStyleKey] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  const activeStyles = Object.entries(groomingStyle).filter(
    ([, value]) => value !== 'natural'
  )

  const styleKey = activeStyles.map(([a, s]) => `${a}:${s}`).join(',')
  const needsNewGeneration = styleKey !== previewedStyleKey

  const generatePreview = async () => {
    if (abortRef.current) abortRef.current.abort()
    if (activeStyles.length === 0) return

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)

    try {
      const changes = activeStyles.map(([area, style]) => ({ area, style }))

      // Use fileUri if available (pre-uploaded, much faster), otherwise fall back to base64
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = { breed: dogBreed, changes }
      if (geminiFileUri) {
        body.fileUri = geminiFileUri
        body.fileMimeType = geminiFileMime
      } else {
        const resized = await resizeImage(dogImage, 1024)
        body.imageBase64 = resized
        body.mimeType = 'image/jpeg'
      }

      const res = await fetch('/api/grooming-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      const data = await res.json()
      if (data.image) {
        setGeneratedImage(data.image)
        setPreviewedStyleKey(styleKey)
        setPreviewOn(true)
      } else {
        throw new Error('No image returned')
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to generate preview')
    } finally {
      setLoading(false)
    }
  }

  const togglePreview = () => {
    if (!generatedImage || needsNewGeneration) {
      // Need to generate first
      generatePreview()
    } else {
      // Toggle between AI preview and original
      setPreviewOn(!previewOn)
    }
  }

  const showingPreview = previewOn && generatedImage && !needsNewGeneration
  const displayImage = showingPreview ? generatedImage : dogImage

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
          ) : showingPreview && !loading ? (
            <div className="changes-indicator" style={{ background: 'rgba(16,185,129,0.85)' }}>
              <span>Grooming Preview</span>
            </div>
          ) : !loading ? (
            <div className="changes-indicator">
              <span>{activeStyles.length} style{activeStyles.length > 1 ? 's' : ''} selected</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Grooming Preview toggle button */}
      {activeStyles.length > 0 && !loading && (
        <button
          className={`btn ${showingPreview ? 'btn-outline' : 'btn-primary'}`}
          style={{ width: '100%', marginTop: '12px' }}
          onClick={togglePreview}
        >
          {showingPreview
            ? 'Grooming Preview: ON — Click to show original'
            : needsNewGeneration
              ? 'Grooming Preview'
              : 'Grooming Preview: OFF — Click to show preview'
          }
        </button>
      )}

      {error && (
        <div className="preview-note" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', marginTop: '12px' }}>
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

      {showingPreview && (
        <div className="preview-note">
          <p>
            <strong>AI Generated Preview</strong> — Shows an approximation of your dog
            with the selected grooming styles. Actual results may vary.
          </p>
        </div>
      )}
    </div>
  )
}
