import { useEffect, useState } from "react";
import { CheckCircleIcon, SchoolIcon, SlidersIcon } from "../components/Icons";
import { type AppSettings, updateAppSettings } from "../settings";

type SettingsPageProps = {
  settings: AppSettings;
  onSettingsSaved: (settings: AppSettings) => void;
};

const landingPageOptions: Array<{
  label: string;
  value: AppSettings["defaultLandingPage"];
}> = [
  { label: "Dashboard Overview", value: "dashboard" },
  { label: "Students", value: "students" },
  { label: "Teachers", value: "teachers" },
  { label: "Reports", value: "reports" },
  { label: "Settings", value: "settings" },
];

function formatAcademicYear(startYear: number) {
  return `${startYear} - ${startYear + 1}`;
}

export function SettingsPage({ settings, onSettingsSaved }: SettingsPageProps) {
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [academicYearStart, setAcademicYearStart] = useState(
    settings.academicYearStart,
  );
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(
    settings.aiInsightsEnabled,
  );
  const [defaultLandingPage, setDefaultLandingPage] = useState(
    settings.defaultLandingPage,
  );
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(
    settings.lateThresholdMinutes,
  );
  const [profileMessage, setProfileMessage] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [policyMessage, setPolicyMessage] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    setSchoolName(settings.schoolName);
    setAcademicYearStart(settings.academicYearStart);
    setAiInsightsEnabled(settings.aiInsightsEnabled);
    setDefaultLandingPage(settings.defaultLandingPage);
    setLateThresholdMinutes(settings.lateThresholdMinutes);
  }, [settings]);

  async function saveProfile() {
    setPageError("");
    setProfileMessage("");

    try {
      const updated = await updateAppSettings({
        schoolName,
        academicYearStart,
      });

      onSettingsSaved(updated);
      setProfileMessage("School profile saved.");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to save school profile.",
      );
    }
  }

  async function savePreferences() {
    setPageError("");
    setPreferencesMessage("");

    try {
      const updated = await updateAppSettings({
        aiInsightsEnabled,
        defaultLandingPage,
      });

      onSettingsSaved(updated);
      setPreferencesMessage("System preferences saved.");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to save system preferences.",
      );
    }
  }

  async function savePolicy() {
    setPageError("");
    setPolicyMessage("");

    try {
      const updated = await updateAppSettings({
        lateThresholdMinutes,
      });

      onSettingsSaved(updated);
      setPolicyMessage("Attendance policy saved.");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to save attendance policy.",
      );
    }
  }

  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">General Settings</h1>
          <p className="page-subtitle">
            Configure global settings for your institution, attendance rules,
            and system preferences.
          </p>
        </div>
      </header>

      {pageError ? <p className="login-card__error">{pageError}</p> : null}

      <div className="settings-grid">
        <section className="panel settings-card settings-card--wide">
          <div className="panel__title-row">
            <div className="section-label">
              <span className="section-label__icon">
                <SchoolIcon className="table-action-icon" />
              </span>
              <div>
                <h2 className="section-title">School Profile</h2>
                <p className="section-subtitle">
                  Manage your institution&apos;s core details.
                </p>
              </div>
            </div>
          </div>

          <div className="settings-form settings-form--two">
            <label className="field">
              <span className="field__label">School Name</span>
              <span className="field__input field__input--muted">
                <input
                  type="text"
                  value={schoolName}
                  onChange={(event) => {
                    setProfileMessage("");
                    setSchoolName(event.target.value);
                  }}
                />
              </span>
              <span className="field__hint">
                Update your institution&apos;s display name.
              </span>
            </label>

            <label className="field">
              <span className="field__label">Academic Year</span>
              <span className="select-wrap">
                <select
                  value={academicYearStart}
                  onChange={(event) => {
                    setProfileMessage("");
                    setAcademicYearStart(Number(event.target.value));
                  }}
                >
                  {settings.validAcademicYearStarts.map((year) => (
                    <option key={year} value={year}>
                      {formatAcademicYear(year)}
                    </option>
                  ))}
                </select>
              </span>
              <span className="field__hint">
                Only valid school years up to the current year are allowed.
              </span>
            </label>
          </div>

          <div className="settings-actions">
            <span className="field__hint">{profileMessage || " "}</span>
            <button
              className="button button--primary"
              type="button"
              onClick={() => void saveProfile()}
            >
              Save Changes
            </button>
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
                className={`toggle${aiInsightsEnabled ? " toggle--on" : ""}`}
                type="button"
                aria-label="Toggle AI Insights"
                aria-pressed={aiInsightsEnabled}
                onClick={() => {
                  setPreferencesMessage("");
                  setAiInsightsEnabled((current) => !current);
                }}
              />
            </div>

            <label className="field">
              <span className="field__label">Default Landing Page</span>
              <span className="select-wrap">
                <select
                  value={defaultLandingPage}
                  onChange={(event) => {
                    setPreferencesMessage("");
                    setDefaultLandingPage(
                      event.target.value as AppSettings["defaultLandingPage"],
                    );
                  }}
                >
                  {landingPageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </div>

          <div className="settings-actions settings-actions--compact">
            <span className="field__hint">{preferencesMessage || " "}</span>
            <button
              className="button button--primary"
              type="button"
              onClick={() => void savePreferences()}
            >
              Save
            </button>
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
              <p className="section-subtitle">
                Configure how attendance is tracked and marked.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-form settings-form--policy">
          <label className="field">
            <span className="field__label">Late Threshold</span>
            <span className="field__input field__input--split">
              <input
                className="font-data"
                type="number"
                min={1}
                max={180}
                value={lateThresholdMinutes}
                onChange={(event) => {
                  setPolicyMessage("");
                  setLateThresholdMinutes(Number(event.target.value));
                }}
              />
              <span className="field__suffix">min</span>
            </span>
            <span className="field__hint">
              Minutes allowed before a student is counted late.
            </span>
          </label>
        </div>

        <div className="settings-divider" />

        <div className="settings-actions">
          <span className="field__hint">{policyMessage || " "}</span>
          <button
            className="button button--primary"
            type="button"
            onClick={() => void savePolicy()}
          >
            Save Rules
          </button>
        </div>
      </section>
    </section>
  );
}
