import type { RouteKey } from "../App";
import { GraduationCapIcon, LockIcon, MailIcon } from "../components/Icons";

type LoginPageProps = {
  onLogin: (route: RouteKey) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
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
              <input type="email" defaultValue="user@school.edu" />
            </span>
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <span className="field__input">
              <LockIcon className="field__icon" />
              <input type="password" defaultValue="password" />
            </span>
          </label>

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
              onClick={() => onLogin("dashboard")}
            >
              Login as Admin
            </button>
            <button
              className="button button--secondary button--stretch"
              type="button"
              onClick={() => onLogin("teacher-dashboard")}
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
