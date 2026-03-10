'use client'

import { useState } from 'react'
import GroomingHeader from '@/components/grooming/GroomingHeader'
import PhotoUpload from '@/components/grooming/PhotoUpload'
import CoatCondition from '@/components/grooming/CoatCondition'
import GroomingOptions from '@/components/grooming/GroomingOptions'
import GroomingPreview from '@/components/grooming/GroomingPreview'
import Checkout from '@/components/grooming/Checkout'
import GroomingFooter from '@/components/grooming/GroomingFooter'

export type CoatConditionType = {
  tangled: boolean
  dirty: boolean
  matted: boolean
  length: 'short' | 'medium' | 'long'
}

export type GroomingStyle = {
  ears: 'natural' | 'poofy' | 'rounded' | 'trimmed'
  tail: 'natural' | 'bob' | 'pom' | 'flag'
  body: 'natural' | 'smooth' | 'teddy' | 'lion'
  face: 'natural' | 'round' | 'clean' | 'mustache'
  legs: 'natural' | 'fluffy' | 'trimmed' | 'poodle'
}

export type BookingDetails = {
  date: string
  time: string
  estimatedDuration: number
  notes: string
}

const defaultCoatCondition: CoatConditionType = {
  tangled: false,
  dirty: false,
  matted: false,
  length: 'medium'
}

const defaultGroomingStyle: GroomingStyle = {
  ears: 'natural',
  tail: 'natural',
  body: 'natural',
  face: 'natural',
  legs: 'natural'
}

export default function GroomingPage() {
  const [step, setStep] = useState<'upload' | 'condition' | 'style' | 'checkout'>('upload')
  const [dogImage, setDogImage] = useState<string | null>(null)
  const [dogBreed, setDogBreed] = useState<string>('')
  const [coatCondition, setCoatCondition] = useState<CoatConditionType>(defaultCoatCondition)
  const [groomingStyle, setGroomingStyle] = useState<GroomingStyle>(defaultGroomingStyle)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: '',
    time: '',
    estimatedDuration: 60,
    notes: ''
  })

  const handleImageUpload = (imageData: string, breed: string) => {
    setDogImage(imageData)
    setDogBreed(breed)
    setStep('condition')
  }

  const handleConditionSubmit = (condition: CoatConditionType) => {
    setCoatCondition(condition)
    setStep('style')
  }

  const handleStyleConfirm = () => {
    setStep('checkout')
  }

  const handleBack = () => {
    if (step === 'condition') setStep('upload')
    else if (step === 'style') setStep('condition')
    else if (step === 'checkout') setStep('style')
  }

  const calculateEstimate = () => {
    let baseTime = 60
    if (coatCondition.tangled) baseTime += 15
    if (coatCondition.dirty) baseTime += 10
    if (coatCondition.matted) baseTime += 30
    if (coatCondition.length === 'long') baseTime += 20

    const styleAddons = Object.values(groomingStyle).filter(v => v !== 'natural').length
    baseTime += styleAddons * 10

    return baseTime
  }

  return (
    <div className="grooming-app">
      <GroomingHeader />

      <main className="grooming-main">
        <div className="progress-bar">
          <div className={`progress-step ${step === 'upload' ? 'active' : ''} ${['condition', 'style', 'checkout'].includes(step) ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Upload Photo</span>
          </div>
          <div className={`progress-step ${step === 'condition' ? 'active' : ''} ${['style', 'checkout'].includes(step) ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Coat Condition</span>
          </div>
          <div className={`progress-step ${step === 'style' ? 'active' : ''} ${step === 'checkout' ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Style Preview</span>
          </div>
          <div className={`progress-step ${step === 'checkout' ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Checkout</span>
          </div>
        </div>

        {step === 'upload' && (
          <PhotoUpload onImageUpload={handleImageUpload} />
        )}

        {step === 'condition' && dogImage && (
          <CoatCondition
            dogImage={dogImage}
            dogBreed={dogBreed}
            onSubmit={handleConditionSubmit}
            onBack={handleBack}
            initialCondition={coatCondition}
          />
        )}

        {step === 'style' && dogImage && (
          <div className="style-section">
            <div className="style-layout">
              <GroomingPreview
                dogImage={dogImage}
                groomingStyle={groomingStyle}
                dogBreed={dogBreed}
              />
              <GroomingOptions
                groomingStyle={groomingStyle}
                onChange={setGroomingStyle}
                dogBreed={dogBreed}
                coatCondition={coatCondition}
              />
            </div>
            <div className="style-actions">
              <button className="btn btn-outline" onClick={handleBack}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleStyleConfirm}>
                Continue to Checkout
              </button>
            </div>
          </div>
        )}

        {step === 'checkout' && dogImage && (
          <Checkout
            dogImage={dogImage}
            dogBreed={dogBreed}
            coatCondition={coatCondition}
            groomingStyle={groomingStyle}
            estimatedDuration={calculateEstimate()}
            bookingDetails={bookingDetails}
            onBookingChange={setBookingDetails}
            onBack={handleBack}
          />
        )}
      </main>

      <GroomingFooter />
    </div>
  )
}
