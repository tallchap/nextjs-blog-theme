'use client'

import { useState, useEffect } from 'react'
import GroomingHeader from '@/components/grooming/GroomingHeader'
import GroomingFooter from '@/components/grooming/GroomingFooter'

type PricingConfig = {
  baseGrooming: number
  tangled: number
  dirty: number
  matted: number
  longCoat: number
  styleAddon: number
}

type TimeConfig = {
  baseTime: number
  tangledTime: number
  dirtyTime: number
  mattedTime: number
  longCoatTime: number
  styleAddonTime: number
}

type BusinessInfo = {
  businessName: string
  address: string
  phone: string
  email: string
  openingTime: string
  closingTime: string
  daysOpen: string[]
}

const DEFAULT_PRICING: PricingConfig = {
  baseGrooming: 50,
  tangled: 15,
  dirty: 10,
  matted: 35,
  longCoat: 20,
  styleAddon: 8,
}

const DEFAULT_TIME: TimeConfig = {
  baseTime: 60,
  tangledTime: 15,
  dirtyTime: 10,
  mattedTime: 30,
  longCoatTime: 20,
  styleAddonTime: 10,
}

const DEFAULT_BUSINESS: BusinessInfo = {
  businessName: 'PawStyle Grooming',
  address: '123 Pet Street, San Francisco, CA 94102',
  phone: '(555) 123-4567',
  email: 'hello@pawstyle.com',
  openingTime: '09:00',
  closingTime: '18:00',
  daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'time' | 'business' | 'appointments'>('pricing')
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)
  const [time, setTime] = useState<TimeConfig>(DEFAULT_TIME)
  const [business, setBusiness] = useState<BusinessInfo>(DEFAULT_BUSINESS)
  const [saved, setSaved] = useState(false)

  // Load saved config from localStorage
  useEffect(() => {
    const savedPricing = localStorage.getItem('grooming-pricing')
    const savedTime = localStorage.getItem('grooming-time')
    const savedBusiness = localStorage.getItem('grooming-business')

    if (savedPricing) setPricing(JSON.parse(savedPricing))
    if (savedTime) setTime(JSON.parse(savedTime))
    if (savedBusiness) setBusiness(JSON.parse(savedBusiness))
  }, [])

  const handleSave = () => {
    localStorage.setItem('grooming-pricing', JSON.stringify(pricing))
    localStorage.setItem('grooming-time', JSON.stringify(time))
    localStorage.setItem('grooming-business', JSON.stringify(business))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePricingChange = (key: keyof PricingConfig, value: string) => {
    setPricing(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  const handleTimeChange = (key: keyof TimeConfig, value: string) => {
    setTime(prev => ({ ...prev, [key]: parseInt(value) || 0 }))
  }

  const handleBusinessChange = (key: keyof BusinessInfo, value: string | string[]) => {
    setBusiness(prev => ({ ...prev, [key]: value }))
  }

  const toggleDay = (day: string) => {
    setBusiness(prev => ({
      ...prev,
      daysOpen: prev.daysOpen.includes(day)
        ? prev.daysOpen.filter(d => d !== day)
        : [...prev.daysOpen, day]
    }))
  }

  // Sample appointments data
  const appointments = [
    { id: 1, date: '2026-03-11', time: '10:00 AM', dog: 'Max', breed: 'Golden Retriever', status: 'confirmed', total: 85 },
    { id: 2, date: '2026-03-11', time: '2:00 PM', dog: 'Bella', breed: 'Poodle', status: 'pending', total: 95 },
    { id: 3, date: '2026-03-12', time: '9:00 AM', dog: 'Charlie', breed: 'Shih Tzu', status: 'confirmed', total: 78 },
    { id: 4, date: '2026-03-12', time: '11:30 AM', dog: 'Luna', breed: 'Maltese', status: 'confirmed', total: 68 },
  ]

  return (
    <div className="grooming-app">
      <GroomingHeader />

      <main className="admin-main">
        <div className="container">
          <div className="admin-header">
            <h1>Groomer Portal</h1>
            <p>Configure your pricing, time estimates, and business settings</p>
          </div>

          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={() => setActiveTab('pricing')}
            >
              💰 Pricing
            </button>
            <button
              className={`admin-tab ${activeTab === 'time' ? 'active' : ''}`}
              onClick={() => setActiveTab('time')}
            >
              ⏱️ Time Estimates
            </button>
            <button
              className={`admin-tab ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              🏪 Business Info
            </button>
            <button
              className={`admin-tab ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              📅 Appointments
            </button>
          </div>

          <div className="admin-content">
            {activeTab === 'pricing' && (
              <div className="admin-panel">
                <h2>Pricing Configuration</h2>
                <p>Set your prices for grooming services</p>

                <div className="config-grid">
                  <div className="config-item">
                    <label htmlFor="baseGrooming">Base Grooming Price</label>
                    <div className="input-with-prefix">
                      <span>$</span>
                      <input
                        type="number"
                        id="baseGrooming"
                        value={pricing.baseGrooming}
                        onChange={(e) => handlePricingChange('baseGrooming', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <span className="config-desc">Standard grooming service</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="tangled">Tangled Coat Add-on</label>
                    <div className="input-with-prefix">
                      <span>$</span>
                      <input
                        type="number"
                        id="tangled"
                        value={pricing.tangled}
                        onChange={(e) => handlePricingChange('tangled', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <span className="config-desc">Extra charge for tangled coats</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="dirty">Dirty Coat Add-on</label>
                    <div className="input-with-prefix">
                      <span>$</span>
                      <input
                        type="number"
                        id="dirty"
                        value={pricing.dirty}
                        onChange={(e) => handlePricingChange('dirty', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <span className="config-desc">Extra charge for dirty coats</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="matted">Matted Coat Add-on</label>
                    <div className="input-with-prefix">
                      <span>$</span>
                      <input
                        type="number"
                        id="matted"
                        value={pricing.matted}
                        onChange={(e) => handlePricingChange('matted', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <span className="config-desc">Extra charge for matted coats (labor intensive)</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="longCoat">Long Coat Add-on</label>
                    <div className="input-with-prefix">
                      <span>$</span>
                      <input
                        type="number"
                        id="longCoat"
                        value={pricing.longCoat}
                        onChange={(e) => handlePricingChange('longCoat', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <span className="config-desc">Extra charge for long coats</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="styleAddon">Style Option (each)</label>
                    <div className="input-with-prefix">
                      <span>$</span>
                      <input
                        type="number"
                        id="styleAddon"
                        value={pricing.styleAddon}
                        onChange={(e) => handlePricingChange('styleAddon', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <span className="config-desc">Per style customization (ears, tail, body, etc.)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'time' && (
              <div className="admin-panel">
                <h2>Time Estimate Configuration</h2>
                <p>Set time estimates for accurate scheduling</p>

                <div className="config-grid">
                  <div className="config-item">
                    <label htmlFor="baseTime">Base Grooming Time</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        id="baseTime"
                        value={time.baseTime}
                        onChange={(e) => handleTimeChange('baseTime', e.target.value)}
                        min="0"
                      />
                      <span>min</span>
                    </div>
                    <span className="config-desc">Standard grooming duration</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="tangledTime">Tangled Coat Extra Time</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        id="tangledTime"
                        value={time.tangledTime}
                        onChange={(e) => handleTimeChange('tangledTime', e.target.value)}
                        min="0"
                      />
                      <span>min</span>
                    </div>
                    <span className="config-desc">Additional time for tangled coats</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="dirtyTime">Dirty Coat Extra Time</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        id="dirtyTime"
                        value={time.dirtyTime}
                        onChange={(e) => handleTimeChange('dirtyTime', e.target.value)}
                        min="0"
                      />
                      <span>min</span>
                    </div>
                    <span className="config-desc">Additional time for dirty coats</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="mattedTime">Matted Coat Extra Time</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        id="mattedTime"
                        value={time.mattedTime}
                        onChange={(e) => handleTimeChange('mattedTime', e.target.value)}
                        min="0"
                      />
                      <span>min</span>
                    </div>
                    <span className="config-desc">Additional time for matted coats</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="longCoatTime">Long Coat Extra Time</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        id="longCoatTime"
                        value={time.longCoatTime}
                        onChange={(e) => handleTimeChange('longCoatTime', e.target.value)}
                        min="0"
                      />
                      <span>min</span>
                    </div>
                    <span className="config-desc">Additional time for long coats</span>
                  </div>

                  <div className="config-item">
                    <label htmlFor="styleAddonTime">Per Style Add-on Time</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        id="styleAddonTime"
                        value={time.styleAddonTime}
                        onChange={(e) => handleTimeChange('styleAddonTime', e.target.value)}
                        min="0"
                      />
                      <span>min</span>
                    </div>
                    <span className="config-desc">Extra time per style option</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="admin-panel">
                <h2>Business Information</h2>
                <p>Update your business details</p>

                <div className="business-form">
                  <div className="form-group">
                    <label htmlFor="businessName">Business Name</label>
                    <input
                      type="text"
                      id="businessName"
                      value={business.businessName}
                      onChange={(e) => handleBusinessChange('businessName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      value={business.address}
                      onChange={(e) => handleBusinessChange('address', e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        value={business.phone}
                        onChange={(e) => handleBusinessChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        value={business.email}
                        onChange={(e) => handleBusinessChange('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="openingTime">Opening Time</label>
                      <input
                        type="time"
                        id="openingTime"
                        value={business.openingTime}
                        onChange={(e) => handleBusinessChange('openingTime', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="closingTime">Closing Time</label>
                      <input
                        type="time"
                        id="closingTime"
                        value={business.closingTime}
                        onChange={(e) => handleBusinessChange('closingTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Days Open</label>
                    <div className="days-selector">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`day-button ${business.daysOpen.includes(day) ? 'selected' : ''}`}
                          onClick={() => toggleDay(day)}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="admin-panel">
                <h2>Upcoming Appointments</h2>
                <p>Manage your scheduled grooming sessions</p>

                <div className="appointments-list">
                  {appointments.map(apt => (
                    <div key={apt.id} className={`appointment-card ${apt.status}`}>
                      <div className="apt-date">
                        <span className="apt-day">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="apt-date-num">{new Date(apt.date).getDate()}</span>
                      </div>
                      <div className="apt-details">
                        <h4>{apt.dog} - {apt.breed}</h4>
                        <p>{apt.time}</p>
                      </div>
                      <div className="apt-status">
                        <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                        <span className="apt-total">${apt.total}</span>
                      </div>
                      <div className="apt-actions">
                        <button className="btn-small">View</button>
                        <button className="btn-small btn-outline">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              {saved && <span className="save-message">✓ Changes saved successfully!</span>}
            </div>
          </div>
        </div>
      </main>

      <GroomingFooter />
    </div>
  )
}
