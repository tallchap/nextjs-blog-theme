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

type DebugInfo = {
  request: Record<string, unknown>
  response: Record<string, unknown>
  timestamp: string
  durationMs: number
}

const STYLE_LABELS: Record<string, Record<string, string>> = {
  ears: { poofy: 'Poofy Ears', rounded: 'Rounded Ears', trimmed: 'Trimmed Ears' },
  tail: { bob: 'Bob Tail', pom: 'Pom Pom Tail', flag: 'Flag Tail' },
  body: { smooth: 'Smooth Body', teddy: 'Teddy Bear Cut', lion: 'Lion Cut' },
  face: { round: 'Round Face', clean: 'Clean Face', mustache: 'Mustache' },
  legs: { fluffy: 'Fluffy Legs', trimmed: 'Trimmed Legs', poodle: 'Poodle Legs' },
}

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
  const [previewedStyleKey, setPreviewedStyleKey] = useState<string>('')
  const [lastDebug, setLastDebug] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)
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

    const startTime = Date.now()

    try {
      const changes = activeStyles.map(([area, style]) => ({ area, style }))

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

      // Save request for debug (exclude large base64 from display)
      const debugRequest = {
        ...body,
        imageBase64: body.imageBase64 ? `[base64 ${Math.round(body.imageBase64.length / 1024)}KB]` : undefined,
      }

      const res = await fetch('/api/grooming-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      const data = await res.json()
      const durationMs = Date.now() - startTime

      // Save debug info
      setLastDebug({
        request: debugRequest,
        response: {
          status: res.status,
          ok: res.ok,
          image: data.image ? `[image ${Math.round(data.image.length / 1024)}KB]` : undefined,
          error: data.error || undefined,
        },
        timestamp: new Date().toISOString(),
        durationMs,
      })

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }

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
      generatePreview()
    } else {
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
          <div className="grooming-loading-overlay">
            <div className="grooming-animation">
              <span className="grooming-dog">🐕</span>
              <span className="grooming-scissors">✂️</span>
            </div>
            <p className="grooming-loading-text">Grooming in progress...</p>
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

      {activeStyles.length > 0 && !loading && (
        <button
          className={`btn ${showingPreview ? 'btn-outline' : 'btn-primary'}`}
          style={{ width: '100%', marginTop: '12px' }}
          onClick={togglePreview}
        >
          {showingPreview
            ? 'Grooming Preview: ON \u2014 Click to show original'
            : needsNewGeneration
              ? 'Grooming Preview'
              : 'Grooming Preview: OFF \u2014 Click to show preview'
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
            <strong>AI Generated Preview</strong> \u2014 Shows an approximation of your dog
            with the selected grooming styles. Actual results may vary.
          </p>
        </div>
      )}

      {/* Debug button */}
      {lastDebug && (
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '0.75rem', opacity: 0.6 }}
          onClick={() => setShowDebug(true)}
        >
          Debug Last API Call
        </button>
      )}

      {/* Debug modal */}
      {showDebug && lastDebug && (
        <div className="debug-modal-overlay" onClick={() => setShowDebug(false)}>
          <div className="debug-modal" onClick={(e) => e.stopPropagation()}>
            <div className="debug-modal-header">
              <h3>Last API Call</h3>
              <button className="debug-close" onClick={() => setShowDebug(false)}>&times;</button>
            </div>
            <div className="debug-modal-body">
              <div className="debug-meta">
                <span>Time: {lastDebug.timestamp}</span>
                <span>Duration: {(lastDebug.durationMs / 1000).toFixed(1)}s</span>
              </div>
              <h4>Request</h4>
              <pre className="debug-json">{JSON.stringify(lastDebug.request, null, 2)}</pre>
              <h4>Response</h4>
              <pre className="debug-json">{JSON.stringify(lastDebug.response, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
