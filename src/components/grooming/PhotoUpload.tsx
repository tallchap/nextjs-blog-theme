'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type Props = {
  onImageUpload: (imageData: string, breed: string) => void
}

const DOG_BREEDS = [
  'Golden Retriever', 'Poodle', 'Labrador', 'German Shepherd', 'Bulldog',
  'Shih Tzu', 'Yorkshire Terrier', 'Maltese', 'Bichon Frise', 'Cocker Spaniel',
  'Schnauzer', 'Husky', 'Pomeranian', 'Cavalier King Charles', 'Border Collie',
  'Dachshund', 'Beagle', 'Boxer', 'Great Dane', 'Mixed Breed'
]

export default function PhotoUpload({ onImageUpload }: Props) {
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [detectedBreed, setDetectedBreed] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [manualBreed, setManualBreed] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeImage = useCallback(async (imageData: string) => {
    setIsAnalyzing(true)
    // Simulate AI breed detection
    await new Promise(resolve => setTimeout(resolve, 1500))
    const randomBreed = DOG_BREEDS[Math.floor(Math.random() * DOG_BREEDS.length)]
    setDetectedBreed(randomBreed)
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

  // Global paste listener for clipboard images
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="photo-upload-section">
      <div className="container">
        <div className="upload-header">
          <h1>Upload Your Dog's Photo</h1>
          <p>We'll analyze the photo and suggest the best grooming options for your furry friend</p>
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
            <h3>Drop your dog's photo here</h3>
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
                    <span className="label">Detected Breed:</span>
                    <span className="breed-name">{detectedBreed}</span>
                  </div>
                  <div className="breed-override">
                    <label>Not quite right? Select the correct breed:</label>
                    <select
                      value={manualBreed}
                      onChange={(e) => setManualBreed(e.target.value)}
                    >
                      <option value="">Use detected breed</option>
                      {DOG_BREEDS.map(breed => (
                        <option key={breed} value={breed}>{breed}</option>
                      ))}
                    </select>
                  </div>
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
            <li>Use a well-lit photo showing your dog's full body</li>
            <li>Ensure the photo is clear and not blurry</li>
            <li>Side or 3/4 angle works best for style preview</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
