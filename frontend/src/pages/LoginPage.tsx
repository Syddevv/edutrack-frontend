import { useState } from "react";
import { GraduationCapIcon, LockIcon, MailIcon } from "../components/Icons";

type LoginPageProps = {
  onLogin: (credentials: {
    email: string;
    password: string;
    expectedRole: "admin" | "teacher";
  }) => Promise<string | null>;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("user@school.edu");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(expectedRole: "admin" | "teacher") {
    setIsSubmitting(true);
    setError(null);

    const nextError = await onLogin({
      email,
      password,
      expectedRole,
    });

    setError(nextError);
    setIsSubmitting(false);
  }

  return (
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

          <div className="login-card__meta">
            <label className="checkbox">
              <input type="checkbox" />
              <span>Keep me logged in</span>
            </label>
            <button className="link-button" type="button">
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

        <p className="login-card__footer">
          Don&apos;t have an account?{" "}
          <button className="link-button link-button--inline" type="button">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}
