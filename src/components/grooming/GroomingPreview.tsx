'use client'

import { useState, useRef } from 'react'
import { GroomingStyle } from '@/app/grooming/page'
import GroomingGame from './GroomingGame'

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

type TabType = 'your-dog' | 'lookbook'

export default function GroomingPreview({ dogImage, groomingStyle, dogBreed, geminiFileUri, geminiFileMime }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('your-dog')

  // Your Dog state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewOn, setPreviewOn] = useState(false)
  const [previewedStyleKey, setPreviewedStyleKey] = useState<string>('')

  // Lookbook state
  const [lookbookBaseImage, setLookbookBaseImage] = useState<string | null>(null)
  const [lookbookGroomedImage, setLookbookGroomedImage] = useState<string | null>(null)
  const [lookbookLoading, setLookbookLoading] = useState(false)
  const [lookbookError, setLookbookError] = useState<string | null>(null)
  const [lookbookPreviewOn, setLookbookPreviewOn] = useState(false)
  const [lookbookStyleKey, setLookbookStyleKey] = useState<string>('')

  // Debug
  const [lastDebug, setLastDebug] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const lookbookAbortRef = useRef<AbortController | null>(null)

  const activeStyles = Object.entries(groomingStyle).filter(
    ([, value]) => value !== 'natural'
  )

  const styleKey = activeStyles.map(([a, s]) => `${a}:${s}`).join(',')
  const needsNewGeneration = styleKey !== previewedStyleKey
  const lookbookNeedsNewGeneration = styleKey !== lookbookStyleKey

  // Fetch lookbook base image on first access
  const fetchLookbookBase = async () => {
    if (lookbookBaseImage) return
    try {
      const res = await fetch(`/api/lookbook-base?breed=${encodeURIComponent(dogBreed)}`)
      const data = await res.json()
      if (data.image) setLookbookBaseImage(data.image)
    } catch {
      // silently fail - base image is optional
    }
  }

  const generateBothPreviews = async () => {
    if (activeStyles.length === 0) return
    const changes = activeStyles.map(([area, style]) => ({ area, style }))

    // Fire both in parallel
    const yourDogPromise = generateYourDogPreview(changes)
    const lookbookPromise = generateLookbookPreview(changes)
    await Promise.allSettled([yourDogPromise, lookbookPromise])
  }

  const generateYourDogPreview = async (changes: { area: string; style: string }[]) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)
    const startTime = Date.now()

    try {
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

      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
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

  const generateLookbookPreview = async (changes: { area: string; style: string }[]) => {
    if (lookbookAbortRef.current) lookbookAbortRef.current.abort()
    const controller = new AbortController()
    lookbookAbortRef.current = controller
    setLookbookLoading(true)
    setLookbookError(null)

    // Also fetch base image if we don't have it
    fetchLookbookBase()

    try {
      const res = await fetch('/api/lookbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breed: dogBreed, changes }),
        signal: controller.signal,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
      if (data.image) {
        setLookbookGroomedImage(data.image)
        setLookbookStyleKey(styleKey)
        setLookbookPreviewOn(true)
      } else {
        throw new Error('No image returned')
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setLookbookError(err instanceof Error ? err.message : 'Failed to generate lookbook preview')
    } finally {
      setLookbookLoading(false)
    }
  }

  const togglePreview = () => {
    if (!generatedImage || needsNewGeneration) {
      generateBothPreviews()
    } else {
      setPreviewOn(!previewOn)
    }
  }

  const toggleLookbookPreview = () => {
    if (!lookbookGroomedImage || lookbookNeedsNewGeneration) {
      const changes = activeStyles.map(([area, style]) => ({ area, style }))
      generateLookbookPreview(changes)
    } else {
      setLookbookPreviewOn(!lookbookPreviewOn)
    }
  }

  // Determine what to display
  const isYourDog = activeTab === 'your-dog'
  const showingYourDogPreview = previewOn && generatedImage && !needsNewGeneration
  const showingLookbookPreview = lookbookPreviewOn && lookbookGroomedImage && !lookbookNeedsNewGeneration

  const displayImage = isYourDog
    ? (showingYourDogPreview ? generatedImage : dogImage)
    : (showingLookbookPreview ? lookbookGroomedImage : (lookbookBaseImage || dogImage))

  const currentLoading = isYourDog ? loading : lookbookLoading
  const currentError = isYourDog ? error : lookbookError

  return (
    <div className="grooming-preview">
      <div className="preview-header">
        <h3>Style Preview</h3>
        <p>{dogBreed}</p>
      </div>

      {/* Tab Switcher */}
      <div className="preview-tab-switcher">
        <button
          className={`preview-tab ${activeTab === 'your-dog' ? 'preview-tab-active preview-tab-yourdog' : ''}`}
          onClick={() => setActiveTab('your-dog')}
        >
          📸 Your Dog
        </button>
        <button
          className={`preview-tab ${activeTab === 'lookbook' ? 'preview-tab-active preview-tab-lookbook' : ''}`}
          onClick={() => { setActiveTab('lookbook'); fetchLookbookBase() }}
        >
          📖 Lookbook
          {lookbookGroomedImage && !showingLookbookPreview && lookbookNeedsNewGeneration ? '' :
            lookbookGroomedImage && activeTab !== 'lookbook' ? ' ✨' : ''}
        </button>
      </div>

      <div className="preview-image-container">
        <img src={displayImage!} alt={isYourDog ? 'Your dog' : `${dogBreed} lookbook`} className="preview-base-image" />

        {currentLoading && (
          <div className="grooming-loading-overlay">
            <GroomingGame />
          </div>
        )}

        <div className="preview-indicators">
          {activeStyles.length === 0 ? (
            <div className="no-changes-indicator">
              <span>No style changes - Natural look</span>
            </div>
          ) : isYourDog ? (
            showingYourDogPreview && !loading ? (
              <div className="changes-indicator" style={{ background: 'rgba(124, 58, 237, 0.85)' }}>
                <span>📸 Your Dog — Groomed</span>
              </div>
            ) : !loading ? (
              <div className="changes-indicator">
                <span>{activeStyles.length} style{activeStyles.length > 1 ? 's' : ''} selected</span>
              </div>
            ) : null
          ) : (
            showingLookbookPreview && !lookbookLoading ? (
              <div className="changes-indicator" style={{ background: 'rgba(245, 158, 11, 0.85)' }}>
                <span>📖 Lookbook — Groomed</span>
              </div>
            ) : !lookbookLoading && lookbookBaseImage ? (
              <div className="changes-indicator" style={{ background: 'rgba(245, 158, 11, 0.85)' }}>
                <span>📖 Lookbook — Ungroomed</span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {activeStyles.length > 0 && !currentLoading && (
        isYourDog ? (
          <button
            className={`btn ${showingYourDogPreview ? 'btn-outline' : 'btn-primary'}`}
            style={{ width: '100%', marginTop: '12px' }}
            onClick={togglePreview}
          >
            {showingYourDogPreview
              ? 'Grooming Preview: ON — Click to show original'
              : needsNewGeneration
                ? 'Grooming Preview'
                : 'Grooming Preview: OFF — Click to show preview'
            }
          </button>
        ) : (
          <button
            className={`btn ${showingLookbookPreview ? 'btn-outline' : 'btn-primary'}`}
            style={{ width: '100%', marginTop: '12px', borderColor: '#f59e0b', color: showingLookbookPreview ? '#f59e0b' : '#fff', background: showingLookbookPreview ? 'transparent' : '#f59e0b' }}
            onClick={toggleLookbookPreview}
          >
            {showingLookbookPreview
              ? 'Lookbook: Groomed — Click to show ungroomed'
              : lookbookNeedsNewGeneration
                ? 'Show Lookbook Preview'
                : 'Lookbook: Ungroomed — Click to show groomed'
            }
          </button>
        )
      )}

      {currentError && (
        <div className="preview-note" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', marginTop: '12px' }}>
          <p><strong>Preview error:</strong> {currentError}</p>
          <button
            className="btn btn-outline"
            style={{ marginTop: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => isYourDog ? generateBothPreviews() : generateLookbookPreview(activeStyles.map(([a, s]) => ({ area: a, style: s })))}
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

      {(showingYourDogPreview || showingLookbookPreview) && (
        <div className="preview-note">
          <p>
            <strong>AI Generated Preview</strong> — {isYourDog
              ? 'Shows an approximation of your dog with the selected grooming styles.'
              : `Shows how a ${dogBreed} looks with these grooming styles.`
            } Actual results may vary.
          </p>
        </div>
      )}

      {lastDebug && (
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '0.75rem', opacity: 0.6 }}
          onClick={() => setShowDebug(true)}
        >
          Debug Last API Call
        </button>
      )}

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
