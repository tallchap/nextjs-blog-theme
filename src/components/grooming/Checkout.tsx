'use client'

import { useState } from 'react'
import { CoatConditionType, GroomingStyle, BookingDetails } from '@/app/grooming/page'

type Props = {
  dogImage: string
  dogBreed: string
  coatCondition: CoatConditionType
  groomingStyle: GroomingStyle
  estimatedDuration: number
  bookingDetails: BookingDetails
  onBookingChange: (details: BookingDetails) => void
  onBack: () => void
}

// Default pricing - this would come from groomer config in production
const BASE_PRICES = {
  baseGrooming: 50,
  tangled: 15,
  dirty: 10,
  matted: 35,
  longCoat: 20,
  styleAddon: 8,
}

const AVAILABLE_TIMES = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
  '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
]

export default function Checkout({
  dogImage,
  dogBreed,
  coatCondition,
  groomingStyle,
  estimatedDuration,
  bookingDetails,
  onBookingChange,
  onBack
}: Props) {
  const [step, setStep] = useState<'schedule' | 'payment' | 'confirmation'>('schedule')
  const [isProcessing, setIsProcessing] = useState(false)

  const styleAddons = Object.values(groomingStyle).filter(v => v !== 'natural').length

  const calculatePrice = () => {
    let total = BASE_PRICES.baseGrooming
    if (coatCondition.tangled) total += BASE_PRICES.tangled
    if (coatCondition.dirty) total += BASE_PRICES.dirty
    if (coatCondition.matted) total += BASE_PRICES.matted
    if (coatCondition.length === 'long') total += BASE_PRICES.longCoat
    total += styleAddons * BASE_PRICES.styleAddon
    return total
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bookingDetails.date && bookingDetails.time) {
      setStep('payment')
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep('confirmation')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <section className="checkout-section">
      <div className="container">
        <div className="checkout-layout">
          {/* Order Summary Sidebar */}
          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="summary-dog">
              <img src={dogImage} alt="Your dog" className="summary-dog-image" />
              <span className="summary-breed">{dogBreed}</span>
            </div>

            <div className="summary-items">
              <div className="summary-item">
                <span>Base Grooming</span>
                <span>${BASE_PRICES.baseGrooming}</span>
              </div>

              {coatCondition.tangled && (
                <div className="summary-item addon">
                  <span>De-tangling</span>
                  <span>+${BASE_PRICES.tangled}</span>
                </div>
              )}

              {coatCondition.dirty && (
                <div className="summary-item addon">
                  <span>Deep Cleaning</span>
                  <span>+${BASE_PRICES.dirty}</span>
                </div>
              )}

              {coatCondition.matted && (
                <div className="summary-item addon">
                  <span>De-matting</span>
                  <span>+${BASE_PRICES.matted}</span>
                </div>
              )}

              {coatCondition.length === 'long' && (
                <div className="summary-item addon">
                  <span>Long Coat</span>
                  <span>+${BASE_PRICES.longCoat}</span>
                </div>
              )}

              {styleAddons > 0 && (
                <div className="summary-item addon">
                  <span>Style Options ({styleAddons})</span>
                  <span>+${styleAddons * BASE_PRICES.styleAddon}</span>
                </div>
              )}

              <div className="summary-total">
                <span>Total</span>
                <span>${calculatePrice()}</span>
              </div>
            </div>

            <div className="summary-time">
              <span className="time-icon">⏱️</span>
              <div>
                <strong>Estimated Duration</strong>
                <p>{estimatedDuration} minutes</p>
              </div>
            </div>

            <div className="selected-styles">
              <h4>Selected Styles:</h4>
              <ul>
                {Object.entries(groomingStyle).map(([area, style]) => (
                  <li key={area} className={style === 'natural' ? 'natural' : ''}>
                    <span className="style-area">{area}:</span>
                    <span className="style-value">{style}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Steps */}
          <div className="checkout-main">
            {step === 'schedule' && (
              <div className="checkout-step">
                <h2>Schedule Your Appointment</h2>
                <p>Choose a convenient date and time for your grooming session</p>

                <form onSubmit={handleScheduleSubmit} className="schedule-form">
                  <div className="form-group">
                    <label htmlFor="date">Select Date</label>
                    <input
                      type="date"
                      id="date"
                      min={getMinDate()}
                      value={bookingDetails.date}
                      onChange={(e) => onBookingChange({ ...bookingDetails, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Select Time</label>
                    <div className="time-slots">
                      {AVAILABLE_TIMES.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot ${bookingDetails.time === time ? 'selected' : ''}`}
                          onClick={() => onBookingChange({ ...bookingDetails, time })}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Special Instructions (optional)</label>
                    <textarea
                      id="notes"
                      placeholder="Any special requests or notes for the groomer..."
                      value={bookingDetails.notes}
                      onChange={(e) => onBookingChange({ ...bookingDetails, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={onBack}>
                      Back to Styling
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!bookingDetails.date || !bookingDetails.time}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="checkout-step">
                <h2>Payment Details</h2>
                <p>Complete your booking with secure payment</p>

                <div className="appointment-preview">
                  <h4>Appointment Details</h4>
                  <p><strong>Date:</strong> {formatDate(bookingDetails.date)}</p>
                  <p><strong>Time:</strong> {bookingDetails.time}</p>
                  <p><strong>Duration:</strong> ~{estimatedDuration} minutes</p>
                </div>

                <form onSubmit={handlePaymentSubmit} className="payment-form">
                  <div className="form-group">
                    <label htmlFor="cardName">Name on Card</label>
                    <input type="text" id="cardName" placeholder="John Doe" required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiry">Expiry Date</label>
                      <input type="text" id="expiry" placeholder="MM/YY" maxLength={5} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input type="text" id="cvv" placeholder="123" maxLength={4} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email for Confirmation</label>
                    <input type="email" id="email" placeholder="your@email.com" required />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setStep('schedule')}
                    >
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : `Pay $${calculatePrice()}`}
                    </button>
                  </div>
                </form>

                <div className="payment-secure">
                  <span>🔒</span> Your payment is secure and encrypted
                </div>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="checkout-step confirmation">
                <div className="confirmation-icon">✅</div>
                <h2>Booking Confirmed!</h2>
                <p>Your grooming appointment has been scheduled</p>

                <div className="confirmation-details">
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{formatDate(bookingDetails.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{bookingDetails.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">~{estimatedDuration} minutes</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Paid</span>
                    <span className="detail-value">${calculatePrice()}</span>
                  </div>
                </div>

                <div className="confirmation-message">
                  <p>A confirmation email has been sent to your email address.</p>
                  <p>Please arrive 5 minutes early with your dog.</p>
                </div>

                <div className="confirmation-actions">
                  <button className="btn btn-outline">Add to Calendar</button>
                  <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Book Another Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
