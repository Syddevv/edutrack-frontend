import { useState } from 'react'
import { CheckCircleIcon, ClockIcon, SchoolIcon, SlidersIcon } from '../components/Icons'

export function SettingsPage() {
  const [isAiInsightsEnabled, setIsAiInsightsEnabled] = useState(false)

  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">General Settings</h1>
          <p className="page-subtitle">Configure global settings for your institution, attendance rules, and system preferences.</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="panel settings-card settings-card--wide">
          <div className="panel__title-row">
            <div className="section-label">
              <span className="section-label__icon">
                <SchoolIcon className="table-action-icon" />
              </span>
              <div>
                <h2 className="section-title">School Profile</h2>
                <p className="section-subtitle">Manage your institution&apos;s core details.</p>
              </div>
            </div>
          </div>

          <div className="settings-form settings-form--two">
            <label className="field">
              <span className="field__label">School Name</span>
              <span className="field__input field__input--muted">
                <input type="text" defaultValue="Lincoln High School" />
              </span>
              <span className="field__hint">Update your institution&apos;s display name.</span>
            </label>

            <label className="field">
              <span className="field__label">Academic Year</span>
              <span className="select-wrap">
                <select defaultValue="2023 - 2024">
                  <option>2023 - 2024</option>
                  <option>2024 - 2025</option>
                  <option>2025 - 2026</option>
                </select>
              </span>
              <span className="field__hint field__hint--spacer" aria-hidden="true">
                Reserved helper text spacing.
              </span>
            </label>
          </div>

          <div className="settings-actions">
            <button className="button button--primary" type="button">Save Changes</button>
          </div>
        </section>

        <section className="panel settings-card">
          <div className="panel__title-row">
            <div className="section-label">
              <span className="section-label__icon">
                <SlidersIcon className="table-action-icon" />
              </span>
              <div>
                <h2 className="section-title">System Preferences</h2>
                <p className="section-subtitle">Admin dashboard experience.</p>
              </div>
            </div>
          </div>

          <div className="preference-list">
            <div className="preference-item">
              <div>
                <div className="field__label">AI Insights Assistant</div>
                <div className="field__hint">Smart attendance trends.</div>
              </div>
              <button
                className={`toggle${isAiInsightsEnabled ? ' toggle--on' : ''}`}
                type="button"
                aria-label="Toggle AI Insights"
                aria-pressed={isAiInsightsEnabled}
                onClick={() => setIsAiInsightsEnabled((current) => !current)}
              />
            </div>

            <label className="field">
              <span className="field__label">Default Landing Page</span>
              <span className="select-wrap">
                <select defaultValue="Dashboard Overview">
                  <option>Dashboard Overview</option>
                  <option>Students</option>
                  <option>Reports</option>
                </select>
              </span>
            </label>
          </div>

          <div className="settings-actions settings-actions--compact">
            <button className="button button--primary" type="button">Save</button>
          </div>
        </section>
      </div>

      <section className="panel settings-card">
        <div className="panel__title-row">
          <div className="section-label">
            <span className="section-label__icon">
              <CheckCircleIcon className="table-action-icon" />
            </span>
            <div>
              <h2 className="section-title">Attendance Policy</h2>
              <p className="section-subtitle">Configure how attendance is tracked and marked.</p>
            </div>
          </div>
        </div>

        <div className="settings-form settings-form--policy">
          <label className="field">
            <span className="field__label">Daily Start Time</span>
            <span className="field__input">
              <ClockIcon className="field__icon" />
              <input className="font-data" type="text" defaultValue="08:00 AM" />
              <ClockIcon className="field__icon" />
            </span>
            <span className="field__hint">Classes starting after this time are marked late.</span>
          </label>

          <label className="field">
            <span className="field__label">Late Threshold</span>
            <span className="field__input field__input--split">
              <input className="font-data" type="text" defaultValue="15" />
              <span className="field__suffix">min</span>
            </span>
            <span className="field__hint">Buffer time before marked absent.</span>
          </label>
        </div>

        <div className="settings-divider" />

        <div className="settings-actions">
          <button className="button button--primary" type="button">Save Rules</button>
        </div>
      </section>

    </section>
  )
}
