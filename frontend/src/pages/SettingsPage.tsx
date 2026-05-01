import { useEffect, useRef, useState } from "react";
import { getSchoolLogoUrl } from "../branding";
import {
  LockIcon,
  SchoolIcon,
  SlidersIcon,
} from "../components/Icons";
import {
  TwoFactorDisableModal,
  TwoFactorSetupModal,
} from "../components/TwoFactorModals";
import {
  type AppSettings,
  updateAppSettings,
  uploadSchoolLogo,
} from "../settings";
import { getTwoFactorStatus } from "../twoFactor";

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
  const [profileMessage, setProfileMessage] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSchoolName(settings.schoolName);
    setAcademicYearStart(settings.academicYearStart);
    setAiInsightsEnabled(settings.aiInsightsEnabled);
    setDefaultLandingPage(settings.defaultLandingPage);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    let isMounted = true;

    void getTwoFactorStatus()
      .then((status) => {
        if (!isMounted) {
          return;
        }

        setIsTwoFactorEnabled(status.enabled);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Failed to load two-factor authentication status.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsTwoFactorLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshTwoFactorStatus(message?: string) {
    const status = await getTwoFactorStatus();
    setIsTwoFactorEnabled(status.enabled);
    setTwoFactorMessage(message || "");
  }

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

  async function handleLogoUpload() {
    if (!selectedLogoFile || isLogoUploading) {
      return;
    }

    setPageError("");
    setProfileMessage("");
    setIsLogoUploading(true);

    try {
      const updated = await uploadSchoolLogo(selectedLogoFile);
      onSettingsSaved(updated);
      setProfileMessage("School logo updated.");
      setSelectedLogoFile(null);

      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(null);
      }
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to upload school logo.",
      );
    } finally {
      setIsLogoUploading(false);
    }
  }

  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">General Settings</h1>
          <p className="page-subtitle">
            Configure your institution profile, dashboard defaults, and admin
            account security.
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

          <div className="settings-logo-panel">
            <div className="settings-logo-preview-wrap">
              <img
                className="settings-logo-preview"
                src={logoPreviewUrl ?? getSchoolLogoUrl(settings.schoolLogoPath)}
                alt={`${settings.schoolName} logo preview`}
              />
            </div>

            <div className="settings-logo-controls">
              <label className="field">
                <span className="field__label">School Logo</span>
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="settings-logo-input"
                  ref={logoInputRef}
                  type="file"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setProfileMessage("");
                    setPageError("");
                    setSelectedLogoFile(nextFile);

                    if (logoPreviewUrl) {
                      URL.revokeObjectURL(logoPreviewUrl);
                    }

                    setLogoPreviewUrl(
                      nextFile ? URL.createObjectURL(nextFile) : null,
                    );
                  }}
                />
                <span className="field__hint">
                  Upload PNG, JPG, or WEBP up to 2 MB.
                </span>
              </label>

              <button
                className="button button--secondary"
                type="button"
                onClick={() => logoInputRef.current?.click()}
              >
                Choose Logo
              </button>

              <button
                className="button button--primary"
                type="button"
                disabled={!selectedLogoFile || isLogoUploading}
                onClick={() => void handleLogoUpload()}
              >
                {isLogoUploading ? "Uploading..." : "Save Logo"}
              </button>
            </div>
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

      <section className="panel settings-card two-factor-card">
        <div className="two-factor-card__hero">
          <div className="two-factor-card__row">
            <div className="section-label">
              <span className="section-label__icon two-factor-card__icon">
                <LockIcon className="table-action-icon" />
              </span>
              <div>
                <h2 className="section-title">Two-Factor Authentication</h2>
                <p className="section-subtitle">
                  Add an authenticator-based verification step for your admin
                  account.
                </p>
              </div>
            </div>

            <button
              className={`toggle${isTwoFactorEnabled ? " toggle--on" : ""}`}
              type="button"
              aria-label={
                isTwoFactorEnabled
                  ? "Disable two-factor authentication"
                  : "Enable two-factor authentication"
              }
              aria-pressed={isTwoFactorEnabled}
              disabled={isTwoFactorLoading}
              onClick={() => {
                setTwoFactorMessage("");

                if (isTwoFactorEnabled) {
                  setIsDisableModalOpen(true);
                  return;
                }

                setIsSetupModalOpen(true);
              }}
            />
          </div>
        </div>

        <div className="two-factor-card__body">
          <div className="two-factor-card__status">
            <span
              className={`two-factor-card__pill${isTwoFactorEnabled ? " two-factor-card__pill--active" : ""}`}
            >
              {isTwoFactorLoading
                ? "Checking status..."
                : isTwoFactorEnabled
                  ? "Enabled"
                  : "Disabled"}
            </span>
            <span className="field__hint">
              {twoFactorMessage ||
                (isTwoFactorEnabled
                  ? "Your account now expects a second verification method."
                  : "Secure your admin session with one-time passcodes.")}
            </span>
          </div>

          <div className="two-factor-card__actions">
            <button
              className="button button--secondary"
              type="button"
              disabled={isTwoFactorLoading}
              onClick={() => {
                setTwoFactorMessage("");

                if (isTwoFactorEnabled) {
                  setIsDisableModalOpen(true);
                  return;
                }

                setIsSetupModalOpen(true);
              }}
            >
              {isTwoFactorEnabled ? "Manage 2FA" : "Set Up 2FA"}
            </button>
          </div>
        </div>
      </section>

      <TwoFactorSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onEnabled={() =>
          void refreshTwoFactorStatus("Two-factor authentication enabled.")
        }
      />

      <TwoFactorDisableModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onDisabled={() =>
          void refreshTwoFactorStatus("Two-factor authentication disabled.")
        }
      />
    </section>
  );
}
