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
    'Vizsla', 'Weimaraner', 'Irish Setter', 'Brittany',
  ],
  'Toy': [
    'Chihuahua', 'Pomeranian', 'Yorkshire Terrier', 'Maltese',
    'Shih Tzu', 'Cavalier King Charles', 'Papillon', 'Havanese',
    'Toy Poodle', 'Pekingese',
  ],
  'Terrier': [
    'Yorkshire Terrier', 'Schnauzer', 'West Highland White Terrier', 'Bull Terrier',
    'Airedale Terrier', 'Scottish Terrier', 'Jack Russell Terrier', 'Cairn Terrier',
  ],
  'Working': [
    'Rottweiler', 'Boxer', 'Great Dane', 'Doberman Pinscher',
    'Bernese Mountain Dog', 'Saint Bernard', 'Newfoundland', 'Mastiff',
  ],
  'Herding': [
    'German Shepherd', 'Border Collie', 'Australian Shepherd', 'Corgi',
    'Shetland Sheepdog', 'Belgian Malinois', 'Old English Sheepdog', 'Collie',
  ],
  'Hound': [
    'Beagle', 'Dachshund', 'Basset Hound', 'Greyhound',
    'Bloodhound', 'Whippet', 'Afghan Hound', 'Rhodesian Ridgeback',
  ],
  'Non-Sporting': [
    'Bulldog', 'Poodle', 'Bichon Frise', 'Dalmatian',
    'Chow Chow', 'Shiba Inu', 'Boston Terrier', 'French Bulldog',
  ],
  'Designer / Mixed': [
    'Goldendoodle', 'Labradoodle', 'Cockapoo', 'Bernedoodle',
    'Maltipoo', 'Cavapoo', 'Pomsky', 'Aussiedoodle',
    'Puggle', 'Mixed Breed',
  ],
}

// Deduplicated flat list for search
const ALL_BREEDS = Array.from(new Set(Object.values(BREED_CATEGORIES).flat())).sort()

export default function PhotoUpload({ onImageUpload }: Props) {
  const [dragActive, setDragActive] = useState(false)
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
          mimeType: imageData.match(/data:([^;]+)/)?.[1] || 'image/jpeg',
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
        setPreviewImage(result)
        analyzeImage(result)
      }
      reader.readAsDataURL(file)
    }
  }, [analyzeImage])

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

  return (
    <section className="photo-upload-section">
      <div className="container">
        <div className="upload-header">
          <h1>Upload Your Dog&apos;s Photo</h1>
          <p>We&apos;ll analyze the photo and suggest the best grooming options for your furry friend</p>
        </div>

        {!previewImage ? (
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
        ) : (
          <div className="preview-container">
            <div className="preview-image-wrapper">
              <img src={previewImage} alt="Your dog" className="preview-image" />
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
                      {/* Search */}
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

                      {/* Search results */}
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
                          {/* Category tabs */}
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

                          {/* Breeds in selected category */}
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
        )}

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
