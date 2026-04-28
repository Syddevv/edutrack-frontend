import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CloseIcon, LockIcon } from "./Icons";
import {
  disableTwoFactor,
  enableTwoFactor,
  prepareTwoFactorSetup,
  type TwoFactorSetup,
} from "../twoFactor";

type SetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEnabled: () => void;
};

type DisableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDisabled: () => void;
};

type LoginChallengeModalProps = {
  email: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<string | null>;
};

function normalizeCode(value: string) {
  return value.replace(/\D+/g, "").slice(0, 6);
}

export function TwoFactorSetupModal({
  isOpen,
  onClose,
  onEnabled,
}: SetupModalProps) {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSetup(null);
      setQrCodeDataUrl("");
      setCode("");
      setError("");
      setInfo("");
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError("");
    setInfo("");

    void prepareTwoFactorSetup()
      .then(async (payload) => {
        const dataUrl = await QRCode.toDataURL(payload.otpauthUrl, {
          margin: 1,
          width: 320,
          color: {
            dark: "#111111",
            light: "#f8f8f8",
          },
        });

        if (!isMounted) {
          return;
        }

        setSetup(payload);
        setQrCodeDataUrl(dataUrl);
      })
      .catch((requestError) => {
        if (!isMounted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to prepare two-factor setup.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  async function handleSubmit() {
    if (!setup) {
      return;
    }

    setError("");
    setInfo("");

    if (code.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setIsSubmitting(true);

    try {
      await enableTwoFactor(code);
      onEnabled();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to enable two-factor authentication.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="student-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="two-factor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="two-factor-setup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="two-factor-modal__header">
          <div className="two-factor-modal__brand">
            <span className="two-factor-modal__logo">
              <LockIcon className="table-action-icon" />
            </span>
            <div>
              <h2
                className="two-factor-modal__title"
                id="two-factor-setup-title"
              >
                Set Up Two-Factor Authentication
              </h2>
              <p className="two-factor-modal__subtitle">
                Scan the QR code with Google Authenticator or Microsoft
                Authenticator, then verify with a 6-digit code.
              </p>
            </div>
          </div>

          <button
            className="student-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Close two-factor setup"
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="two-factor-modal__body">
          {isLoading ? (
            <div className="two-factor-modal__panel two-factor-modal__panel--centered">
              Preparing your secure setup...
            </div>
          ) : null}

          {!isLoading && setup ? (
            <>
              <div className="two-factor-modal__panel two-factor-modal__panel--qr">
                {qrCodeDataUrl ? (
                  <img
                    className="two-factor-modal__qr"
                    src={qrCodeDataUrl}
                    alt="Two-factor QR code"
                  />
                ) : (
                  <span className="field__hint">
                    Generating QR code preview...
                  </span>
                )}
              </div>

              <label className="field">
                <span className="field__label">Authentication Code</span>
                <span className="field__input two-factor-modal__input-wrap">
                  <input
                    className="font-data two-factor-modal__code-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={code}
                    onChange={(event) => {
                      setError("");
                      setInfo("");
                      setCode(normalizeCode(event.target.value));
                    }}
                  />
                </span>
              </label>
            </>
          ) : null}

          {error ? <p className="login-card__error">{error}</p> : null}
          {info ? <p className="login-card__notice">{info}</p> : null}
        </div>

        <div className="two-factor-modal__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!setup || isLoading || isSubmitting}
          >
            {isSubmitting ? "Enabling..." : "Enable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TwoFactorDisableModal({
  isOpen,
  onClose,
  onDisabled,
}: DisableModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setCode("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  async function handleSubmit() {
    setError("");

    if (currentPassword.trim() === "" || code.length !== 6) {
      setError("Enter your current password and 6-digit authentication code.");
      return;
    }

    setIsSubmitting(true);

    try {
      await disableTwoFactor(currentPassword, code);
      onDisabled();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to disable two-factor authentication.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="student-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="two-factor-modal two-factor-modal--compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="two-factor-disable-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="two-factor-modal__header">
          <div className="two-factor-modal__brand">
            <span className="two-factor-modal__logo two-factor-modal__logo--outline">
              <LockIcon className="table-action-icon" />
            </span>
            <div>
              <h2
                className="two-factor-modal__title"
                id="two-factor-disable-title"
              >
                Disable Two-Factor Authentication
              </h2>
              <p className="two-factor-modal__subtitle">
                Confirm with your password and current authenticator code before
                removing 2FA.
              </p>
            </div>
          </div>

          <button
            className="student-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Close disable two-factor authentication"
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="two-factor-modal__body">
          <label className="field">
            <span className="field__label">Current Password</span>
            <span className="field__input two-factor-modal__input-wrap">
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(event) => {
                  setError("");
                  setCurrentPassword(event.target.value);
                }}
              />
            </span>
          </label>

          <label className="field">
            <span className="field__label">Authentication Code</span>
            <span className="field__input two-factor-modal__input-wrap">
              <input
                className="font-data two-factor-modal__code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(event) => {
                  setError("");
                  setCode(normalizeCode(event.target.value));
                }}
              />
            </span>
          </label>

          {error ? <p className="login-card__error">{error}</p> : null}
        </div>

        <div className="two-factor-modal__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button button--primary two-factor-modal__danger"
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Disabling..." : "Disable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoginTwoFactorModal({
  email,
  isOpen,
  isSubmitting,
  onClose,
  onVerify,
}: LoginChallengeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCode("");
      setError(null);
    }
  }, [isOpen]);

  async function handleVerify() {
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setError(null);
    const nextError = await onVerify(code);

    if (nextError) {
      setError(nextError);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="auth-modal-backdrop"
      role="presentation"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-two-factor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal__header">
          <div className="auth-modal__brand">
            <span className="auth-modal__logo">
              <LockIcon className="login-card__logo-icon" />
            </span>
            <div className="auth-modal__copy auth-modal__copy--centered">
              <h2 className="auth-modal__title" id="login-two-factor-title">
                Verify Two-Factor Authentication
              </h2>
              <p className="auth-modal__subtitle">
                Enter the current 6-digit code from your authenticator app to
                finish signing in.
              </p>
            </div>
          </div>

          <button
            className="student-modal__close"
            type="button"
            aria-label="Close two-factor login modal"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="auth-modal__body">
          <div className="auth-modal__notice">
            <span className="auth-modal__notice-label">Signing in as</span>
            <strong>{email}</strong>
            <span>Use the code currently shown in your authenticator app.</span>
          </div>

          <label className="field">
            <span className="field__label">6-Digit Code</span>
            <span className="field__input auth-modal__code-wrap">
              <LockIcon className="field__icon" />
              <input
                className="auth-modal__code-input font-data"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => {
                  setError(null);
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                }}
                disabled={isSubmitting}
              />
            </span>
          </label>

          {error ? <p className="login-card__error">{error}</p> : null}
        </div>

        <div className="auth-modal__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => void handleVerify()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
