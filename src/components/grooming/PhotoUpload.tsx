'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'

type Props = {
  onImageUpload: (imageData: string, breed: string) => void
}

const BREED_CATEGORIES: Record<string, string[]> = {
  'Popular': [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Poodle',
    'Bulldog', 'Beagle', 'Rottweiler', 'Husky',
  ],
  'Sporting': [
    'Golden Retriever', 'Labrador Retriever', 'Cocker Spaniel', 'English Springer Spaniel',
    'Vizsla', 'Weimaraner', 'Irish Setter', 'Brittany', 'Sporting Mutt',
  ],
  'Toy': [
    'Chihuahua', 'Pomeranian', 'Yorkshire Terrier', 'Maltese',
    'Shih Tzu', 'Cavalier King Charles', 'Papillon', 'Havanese',
    'Toy Poodle', 'Pekingese', 'Toy Mutt',
  ],
  'Terrier': [
    'Yorkshire Terrier', 'Schnauzer', 'West Highland White Terrier', 'Bull Terrier',
    'Airedale Terrier', 'Scottish Terrier', 'Jack Russell Terrier', 'Cairn Terrier', 'Terrier Mutt',
  ],
  'Working': [
    'Rottweiler', 'Boxer', 'Great Dane', 'Doberman Pinscher',
    'Bernese Mountain Dog', 'Saint Bernard', 'Newfoundland', 'Mastiff', 'Working Mutt',
  ],
  'Herding': [
    'German Shepherd', 'Border Collie', 'Australian Shepherd', 'Corgi',
    'Shetland Sheepdog', 'Belgian Malinois', 'Old English Sheepdog', 'Collie', 'Herding Mutt',
  ],
  'Hound': [
    'Beagle', 'Dachshund', 'Basset Hound', 'Greyhound',
    'Bloodhound', 'Whippet', 'Afghan Hound', 'Rhodesian Ridgeback', 'Hound Mutt',
  ],
  'Non-Sporting': [
    'Bulldog', 'Poodle', 'Bichon Frise', 'Dalmatian',
    'Chow Chow', 'Shiba Inu', 'Boston Terrier', 'French Bulldog', 'Non-Sporting Mutt',
  ],
  'Designer / Mixed': [
    'Goldendoodle', 'Labradoodle', 'Cockapoo', 'Bernedoodle',
    'Maltipoo', 'Cavapoo', 'Pomsky', 'Aussiedoodle',
    'Puggle', 'Mixed Breed', 'Designer Mutt',
  ],
}

const ALL_BREEDS = Array.from(new Set(Object.values(BREED_CATEGORIES).flat())).sort()

// Crop image to 1:1 square given offset
function cropToSquare(
  dataUrl: string,
  cropX: number,
  cropY: number,
  cropSize: number,
  naturalW: number,
  naturalH: number,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const outSize = Math.min(cropSize, 1024)
      canvas.width = outSize
      canvas.height = outSize
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, outSize, outSize)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = dataUrl
  })
}

export default function PhotoUpload({ onImageUpload }: Props) {
  const [dragActive, setDragActive] = useState(false)
  // Raw uploaded image (before crop)
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [rawDimensions, setRawDimensions] = useState<{ w: number; h: number } | null>(null)
  const [needsCrop, setNeedsCrop] = useState(false)
  const [cropOffset, setCropOffset] = useState(0.5) // 0-1 position along the longer axis

  // Cropped / final image
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [detectedBreed, setDetectedBreed] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [manualBreed, setManualBreed] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showBreedPicker, setShowBreedPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const analyzeImage = useCallback(async (imageData: string) => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/detect-breed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData,
          mimeType: 'image/jpeg',
        }),
      })
      const data = await res.json()
      setDetectedBreed(data.breed || 'Mixed Breed')
    } catch {
      setDetectedBreed('Mixed Breed')
    }
    setIsAnalyzing(false)
  }, [])

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        // Load image to check dimensions
        const img = new window.Image()
        img.onload = () => {
          const ratio = img.width / img.height
          setRawImage(result)
          setRawDimensions({ w: img.width, h: img.height })
          // If close to square (within 5%), auto-crop center
          if (ratio > 0.95 && ratio < 1.05) {
            setNeedsCrop(false)
            const size = Math.min(img.width, img.height)
            const cx = (img.width - size) / 2
            const cy = (img.height - size) / 2
            cropToSquare(result, cx, cy, size, img.width, img.height).then((cropped) => {
              setPreviewImage(cropped)
              analyzeImage(cropped)
            })
          } else {
            setNeedsCrop(true)
            setCropOffset(0.5)
          }
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }, [analyzeImage])

  const handleCrop = useCallback(async () => {
    if (!rawImage || !rawDimensions) return
    const { w, h } = rawDimensions
    const size = Math.min(w, h)
    let cx = 0, cy = 0
    if (w > h) {
      // Landscape: slide horizontally
      cx = (w - size) * cropOffset
      cy = 0
    } else {
      // Portrait: slide vertically
      cx = 0
      cy = (h - size) * cropOffset
    }
    const cropped = await cropToSquare(rawImage, cx, cy, size, w, h)
    setPreviewImage(cropped)
    setNeedsCrop(false)
    analyzeImage(cropped)
  }, [rawImage, rawDimensions, cropOffset, analyzeImage])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) handleFile(file)
          return
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handleFile])

  const filteredBreeds = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    return ALL_BREEDS.filter(b => b.toLowerCase().includes(q))
  }, [searchQuery])

  const selectBreed = (breed: string) => {
    setManualBreed(breed)
    setShowBreedPicker(false)
    setSearchQuery('')
    setActiveCategory(null)
  }

  const handleContinue = () => {
    if (previewImage) {
      const breed = manualBreed || detectedBreed || 'Mixed Breed'
      onImageUpload(previewImage, breed)
    }
  }

  const handleReset = () => {
    setRawImage(null)
    setRawDimensions(null)
    setNeedsCrop(false)
    setPreviewImage(null)
    setDetectedBreed('')
    setManualBreed('')
    setShowBreedPicker(false)
    setSearchQuery('')
    setActiveCategory(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayBreed = manualBreed || detectedBreed

  // Compute crop preview style
  const cropPreviewStyle = useMemo(() => {
    if (!rawDimensions) return {}
    const { w, h } = rawDimensions
    const isLandscape = w > h
    const size = Math.min(w, h)
    const maxSlide = Math.max(w, h) - size
    const offset = maxSlide * cropOffset
    const pctSize = (size / (isLandscape ? w : h)) * 100
    if (isLandscape) {
      const pctLeft = (offset / w) * 100
      return {
        left: `${pctLeft}%`,
        top: '0%',
        width: `${pctSize}%`,
        height: '100%',
      }
    } else {
      const pctTop = (offset / h) * 100
      return {
        left: '0%',
        top: `${pctTop}%`,
        width: '100%',
        height: `${pctSize}%`,
      }
    }
  }, [rawDimensions, cropOffset])

  // Render: upload zone
  if (!rawImage) {
    return (
      <section className="photo-upload-section">
        <div className="container">
          <div className="upload-header">
            <h1>Upload Your Dog&apos;s Photo</h1>
            <p>We&apos;ll analyze the photo and suggest the best grooming options for your furry friend</p>
          </div>
          <div
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📷</div>
            <h3>Drop your dog&apos;s photo here</h3>
            <p>or click to browse files</p>
            <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>You can also <strong>paste</strong> an image from your clipboard (Ctrl+V / Cmd+V)</p>
            <div className="upload-formats">Supports JPG, PNG, WEBP</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden-input"
            />
          </div>
          <div className="upload-tips">
            <h4>Tips for best results:</h4>
            <ul>
              <li>Use a well-lit photo showing your dog&apos;s full body</li>
              <li>Ensure the photo is clear and not blurry</li>
              <li>Side or 3/4 angle works best for style preview</li>
            </ul>
          </div>
        </div>
      </section>
    )
  }

  // Render: crop step
  if (needsCrop && rawImage) {
    return (
      <section className="photo-upload-section">
        <div className="container">
          <div className="upload-header">
            <h1>Crop to Square</h1>
            <p>Drag the slider to position the square crop area over your dog</p>
          </div>
          <div className="preview-container">
            <div className="crop-wrapper">
              <img src={rawImage} alt="Crop preview" className="crop-image" />
              {/* Dark overlay outside crop */}
              <div className="crop-overlay">
                <div className="crop-hole" style={cropPreviewStyle} />
              </div>
            </div>
            <div style={{ padding: '16px 0' }}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={cropOffset}
                onChange={(e) => setCropOffset(parseFloat(e.target.value))}
                className="crop-slider"
              />
            </div>
            <div className="preview-actions">
              <button className="btn btn-outline" onClick={handleReset}>
                Choose Different Photo
              </button>
              <button className="btn btn-primary" onClick={handleCrop}>
                Crop &amp; Continue
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Render: preview + breed detection
  return (
    <section className="photo-upload-section">
      <div className="container">
        <div className="upload-header">
          <h1>Upload Your Dog&apos;s Photo</h1>
          <p>We&apos;ll analyze the photo and suggest the best grooming options for your furry friend</p>
        </div>
        <div className="preview-container">
          <div className="preview-image-wrapper" style={{ aspectRatio: '1/1' }}>
            <img src={previewImage!} alt="Your dog" className="preview-image" style={{ aspectRatio: '1/1', objectFit: 'cover' }} />
            {isAnalyzing && (
              <div className="analyzing-overlay">
                <div className="analyzing-spinner"></div>
                <p>Analyzing your dog...</p>
              </div>
            )}
          </div>

          <div className="breed-detection">
            {isAnalyzing ? (
              <p className="detecting">Detecting breed...</p>
            ) : (
              <>
                <div className="detected-breed">
                  <span className="label">
                    {manualBreed ? 'Selected Breed:' : 'Detected Breed:'}
                  </span>
                  <span className="breed-name">{displayBreed}</span>
                </div>

                {!showBreedPicker ? (
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => {
                      setShowBreedPicker(true)
                      setTimeout(() => searchInputRef.current?.focus(), 100)
                    }}
                  >
                    Not right? Change breed
                  </button>
                ) : (
                  <div className="breed-picker">
                    <div className="breed-search">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search breeds..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          if (e.target.value) setActiveCategory(null)
                        }}
                        className="breed-search-input"
                      />
                    </div>

                    {filteredBreeds ? (
                      <div className="breed-grid">
                        {filteredBreeds.length === 0 ? (
                          <p className="no-breeds-found">No breeds match &quot;{searchQuery}&quot;</p>
                        ) : (
                          filteredBreeds.map(breed => (
                            <button
                              key={breed}
                              className={`breed-chip ${displayBreed === breed ? 'active' : ''}`}
                              onClick={() => selectBreed(breed)}
                            >
                              {breed}
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="breed-categories">
                          {Object.keys(BREED_CATEGORIES).map(cat => (
                            <button
                              key={cat}
                              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        {activeCategory && (
                          <div className="breed-grid">
                            {BREED_CATEGORIES[activeCategory].map(breed => (
                              <button
                                key={breed}
                                className={`breed-chip ${displayBreed === breed ? 'active' : ''}`}
                                onClick={() => selectBreed(breed)}
                              >
                                {breed}
                              </button>
                            ))}
                          </div>
                        )}
                        {!activeCategory && (
                          <p className="breed-picker-hint">Select a category or search above</p>
                        )}
                      </>
                    )}

                    <button
                      className="btn btn-outline"
                      style={{ width: '100%', marginTop: '12px', padding: '8px' }}
                      onClick={() => {
                        setShowBreedPicker(false)
                        setSearchQuery('')
                        setActiveCategory(null)
                      }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="preview-actions">
            <button className="btn btn-outline" onClick={handleReset}>
              Choose Different Photo
            </button>
            <button
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={isAnalyzing}
            >
              Continue
            </button>
          </div>
        </div>

        <div className="upload-tips">
          <h4>Tips for best results:</h4>
          <ul>
            <li>Use a well-lit photo showing your dog&apos;s full body</li>
            <li>Ensure the photo is clear and not blurry</li>
            <li>Side or 3/4 angle works best for style preview</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
