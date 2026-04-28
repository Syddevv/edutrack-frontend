import { useState } from "react";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
import { LoginTwoFactorModal } from "../components/TwoFactorModals";
import { GraduationCapIcon, LockIcon, MailIcon } from "../components/Icons";
import type { LoginChallenge } from "../auth";

type LoginPageProps = {
  onLogin: (credentials: {
    email: string;
    password: string;
    expectedRole: "admin" | "teacher";
    rememberMe: boolean;
  }) => Promise<{ error: string | null; challenge: LoginChallenge | null }>;
  onVerifyLoginTwoFactor: (code: string) => Promise<string | null>;
};

export function LoginPage({
  onLogin,
  onVerifyLoginTwoFactor,
}: LoginPageProps) {
  const [email, setEmail] = useState("user@school.edu");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginChallenge, setLoginChallenge] = useState<LoginChallenge | null>(null);

  async function handleLogin(expectedRole: "admin" | "teacher") {
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    const result = await onLogin({
      email,
      password,
      expectedRole,
      rememberMe,
    });

    setLoginChallenge(result.challenge);
    setError(result.error);
    setIsSubmitting(false);
  }

  async function handleVerifyLoginTwoFactor(code: string) {
    setIsSubmitting(true);
    const nextError = await onVerifyLoginTwoFactor(code);
    setIsSubmitting(false);

    if (nextError) {
      return nextError;
    }

    setLoginChallenge(null);
    setError(null);

    return null;
  }

  return (
    <>
      <div className="login-screen">
        <div className="login-card">
          <div className="login-card__logo">
            <GraduationCapIcon className="login-card__logo-icon" />
          </div>

          <header className="login-card__header">
            <h1 className="page-title">EduTrack</h1>
            <p className="page-subtitle">
              Welcome back, please enter your details.
            </p>
          </header>

          <div className="login-form">
            <label className="field">
              <span className="field__label">Email</span>
              <span className="field__input">
                <MailIcon className="field__icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Password</span>
              <span className="field__input">
                <LockIcon className="field__icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </span>
            </label>

            {error ? <p className="login-card__error">{error}</p> : null}
            {notice ? <p className="login-card__notice">{notice}</p> : null}

            <div className="login-card__meta">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Keep me logged in</span>
              </label>
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setIsForgotPasswordOpen(true);
                }}
              >
                Forgot password?
              </button>
            </div>

            <div className="login-card__actions">
              <button
                className="button button--primary button--stretch"
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleLogin("admin")}
              >
                {isSubmitting ? "Logging in..." : "Login as Admin"}
              </button>
              <button
                className="button button--secondary button--stretch"
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleLogin("teacher")}
              >
                Login as Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        initialEmail={email}
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onResetSuccess={({ email: resetEmail, message }) => {
          setEmail(resetEmail);
          setPassword("");
          setError(null);
          setNotice(message);
          setIsForgotPasswordOpen(false);
        }}
      />

      <LoginTwoFactorModal
        email={loginChallenge?.email ?? email}
        isOpen={loginChallenge !== null}
        isSubmitting={isSubmitting}
        onClose={() => {
          setLoginChallenge(null);
          setIsSubmitting(false);
        }}
        onVerify={handleVerifyLoginTwoFactor}
      />
    </>
  );
}
