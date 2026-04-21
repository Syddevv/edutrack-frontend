import { useEffect, useState } from "react";
import { requestPasswordResetCode, resetPassword } from "../auth";
import {
  CloseIcon,
  GraduationCapIcon,
  LockIcon,
  MailIcon,
} from "./Icons";

type ForgotPasswordModalProps = {
  initialEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onResetSuccess: (payload: { email: string; message: string }) => void;
};

type ModalStep = "request" | "verify";

export function ForgotPasswordModal({
  initialEmail,
  isOpen,
  onClose,
  onResetSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ModalStep>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep("request");
    setEmail(initialEmail.trim().toLowerCase());
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setInfo(null);
    setIsSubmitting(false);
  }, [initialEmail, isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleRequestCode() {
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail === "") {
      setError("Enter the email address linked to your EduTrack account.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const response = await requestPasswordResetCode(trimmedEmail);
      setEmail(trimmedEmail);
      setStep("verify");
      setInfo(response.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send the verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    const trimmedEmail = email.trim().toLowerCase();
    const normalizedCode = code.replace(/\D/g, "").slice(0, 6);

    if (normalizedCode.length !== 6) {
      setError("Enter the 6-digit verification code from your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const response = await resetPassword({
        email: trimmedEmail,
        code: normalizedCode,
        newPassword,
      });

      onResetSuccess({
        email: trimmedEmail,
        message: response.message,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset the password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToEmailStep() {
    setStep("request");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setInfo(null);
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
        aria-labelledby="forgot-password-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal__header">
          <div className="auth-modal__brand">
            <span className="auth-modal__logo">
              <GraduationCapIcon className="login-card__logo-icon" />
            </span>
            <div>
              <h2 className="auth-modal__title" id="forgot-password-title">
                {step === "request" ? "Forgot Password" : "Verify Reset Code"}
              </h2>
              <p className="auth-modal__subtitle">
                {step === "request"
                  ? "We will send a 6-digit code to your registered email."
                  : "Enter the code you received and choose a new password."}
              </p>
            </div>
          </div>

          <button
            className="student-modal__close"
            type="button"
            aria-label="Close forgot password modal"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="auth-modal__body">
          {step === "request" ? (
            <label className="field">
              <span className="field__label">Registered Email Address</span>
              <span className="field__input">
                <MailIcon className="field__icon" />
                <input
                  type="email"
                  placeholder="user@school.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                />
              </span>
            </label>
          ) : (
            <>
              <div className="auth-modal__notice">
                <span className="auth-modal__notice-label">Code sent to</span>
                <strong>{email}</strong>
                <span>Codes expire after 15 minutes.</span>
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
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={isSubmitting}
                  />
                </span>
              </label>

              <div className="auth-modal__grid">
                <label className="field">
                  <span className="field__label">New Password</span>
                  <span className="field__input">
                    <LockIcon className="field__icon" />
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={isSubmitting}
                    />
                  </span>
                </label>

                <label className="field">
                  <span className="field__label">Confirm Password</span>
                  <span className="field__input">
                    <LockIcon className="field__icon" />
                    <input
                      type="password"
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </span>
                </label>
              </div>

              <div className="auth-modal__helper-row">
                <button
                  className="link-button"
                  type="button"
                  onClick={handleBackToEmailStep}
                  disabled={isSubmitting}
                >
                  Use a different email
                </button>
                <button
                  className="link-button"
                  type="button"
                  onClick={() => void handleRequestCode()}
                  disabled={isSubmitting}
                >
                  Resend code
                </button>
              </div>
            </>
          )}

          {error ? <p className="login-card__error">{error}</p> : null}
          {info ? <p className="login-card__notice">{info}</p> : null}
        </div>

        <div className="auth-modal__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={step === "request" ? onClose : handleBackToEmailStep}
            disabled={isSubmitting}
          >
            {step === "request" ? "Cancel" : "Back"}
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() =>
              void (step === "request"
                ? handleRequestCode()
                : handleResetPassword())
            }
            disabled={isSubmitting}
          >
            {isSubmitting
              ? step === "request"
                ? "Sending..."
                : "Resetting..."
              : step === "request"
                ? "Send Code"
                : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
