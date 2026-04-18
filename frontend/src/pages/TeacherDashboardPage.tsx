import { type ReactNode, useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  XCircleIcon,
} from "../components/Icons";

type DashboardStatCard = {
  icon: ReactNode;
  title: string;
  value: string;
  detail?: string;
  subtext: string;
  badge?: {
    tone: "success" | "danger";
    label: string;
  };
  accent?: string;
};

const statCards: DashboardStatCard[] = [
  {
    icon: <ClockIcon className="stat-card__icon" />,
    title: "Today's Class",
    value: "Math 101",
    detail: "BSIS • 1st Year - A",
    subtext: "09:00 AM - 10:30 AM",
    badge: { tone: "success", label: "Active" },
  },
  {
    icon: <UsersIcon className="stat-card__icon" />,
    title: "Total Students",
    value: "32",
    subtext: "Enrolled in this session",
  },
  {
    icon: <CheckCircleIcon className="stat-card__icon" />,
    title: "Present Count",
    value: "28",
    subtext: "87.5% attendance rate",
    badge: { tone: "success", label: "+2% vs last week" },
    accent: "teacher-dashboard-card__value--success",
  },
  {
    icon: <XCircleIcon className="stat-card__icon" />,
    title: "Absent Count",
    value: "4",
    subtext: "Needs follow-up",
  },
];

const recentActivityRows = [
  { name: "Alice Johnson", status: "Present", className: "Math 101" },
  { name: "Bob Smith", status: "Absent", className: "Math 101" },
  { name: "Charlie Brown", status: "Present", className: "Math 101" },
  { name: "David Lee", status: "Late", className: "Math 101" },
  { name: "Eva Green", status: "Present", className: "Math 101" },
] as const;

const nextClassData = {
  code: "11",
  name: "Physics 202",
  location: "Lab Room 3B",
  time: "11:00 AM",
  minutesRemaining: 45,
} as const;

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-chip status-chip--${status.toLowerCase()}`}>
      <span className="teacher-dashboard-status-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="teacher-dashboard-sidecard__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="teacher-dashboard-alert__badge-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2.75l1.85 4.73 4.9 1.24-3.77 3.02.28 5.14L12 14.75l-3.26 2.13.28-5.14L5.25 8.72l4.9-1.24L12 2.75z" />
    </svg>
  );
}

export function TeacherDashboardPage() {
  const [dismissedAlert, setDismissedAlert] = useState(false);

  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight teacher-dashboard-title">
            Dashboard
          </h1>
          <p className="page-subtitle">Overview for Monday, October 24th</p>
        </div>
        <div className="page-actions teacher-dashboard-actions">
          <div className="count-pill teacher-dashboard-date-pill">
            <ClockIcon className="teacher-dashboard-date-icon" />
            Oct 24, 2023
          </div>
          <button
            className="button button--primary teacher-dashboard-button"
            type="button"
          >
            Take Attendance
          </button>
        </div>
      </header>

      <div className="stats-grid stats-grid--four teacher-dashboard-stats">
        {statCards.map((card) => (
          <article
            className="stat-card teacher-dashboard-card"
            key={card.title}
          >
            <div className="stat-card__head">
              <div className="stat-card__icon-wrap">{card.icon}</div>
              {card.badge ? (
                <span className={`pill pill--${card.badge.tone}`}>
                  {card.badge.label}
                </span>
              ) : null}
            </div>
            <p className="stat-card__label">{card.title}</p>
            <div
              className={`stat-card__value teacher-dashboard-card__value${
                "accent" in card && card.accent ? ` ${card.accent}` : ""
              }`}
            >
              {card.value}
            </div>
            {card.detail ? (
              <p className="teacher-dashboard-card__detail">{card.detail}</p>
            ) : null}
            <p className="stat-card__hint">{card.subtext}</p>
          </article>
        ))}
      </div>

      <div className="teacher-dashboard-content">
        <section className="teacher-dashboard-activity">
          <div className="teacher-dashboard-section-head">
            <h2 className="section-title teacher-dashboard-section-title">
              Recent Activity
            </h2>
            <a className="teacher-dashboard-link" href="#">
              View All
            </a>
          </div>

          <section className="panel">
            <table className="data-table teacher-dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
                {recentActivityRows.map((row) => (
                  <tr key={row.name}>
                    <td>
                      <span className="teacher-dashboard-student-name">
                        {row.name}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>{row.className}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>

        <aside className="teacher-dashboard-sidebar">
          <section className="panel teacher-dashboard-sidecard">
            <div className="teacher-dashboard-sidecard__head">
              <h3 className="teacher-dashboard-sidecard__title">Next Class</h3>
              <button
                className="icon-button teacher-dashboard-sidecard__icon-button"
                type="button"
                aria-label="Class reminders"
              >
                <BellIcon />
              </button>
            </div>

            <div className="teacher-dashboard-sidecard__body">
              <div className="teacher-dashboard-sidecard__code">
                {nextClassData.code}
              </div>
              <div>
                <p className="teacher-dashboard-sidecard__name">
                  {nextClassData.name}
                </p>
                <p className="teacher-dashboard-sidecard__meta">
                  {nextClassData.location} • {nextClassData.time}
                </p>
              </div>
            </div>

            <div className="teacher-dashboard-sidecard__footer">
              <div className="teacher-dashboard-sidecard__progress" />
              <p className="teacher-dashboard-sidecard__countdown">
                {nextClassData.minutesRemaining} mins remaining until start
              </p>
            </div>
          </section>

          {!dismissedAlert ? (
            <section className="teacher-dashboard-alert">
              <div className="teacher-dashboard-alert__badge">
                <SparkIcon />
                <span>AI Insight</span>
              </div>
              <h3 className="teacher-dashboard-alert__title">
                Attendance Alert
              </h3>
              <p className="teacher-dashboard-alert__body">
                David Lee has been late 3 times this week. Would you like to
                schedule a quick check-in meeting?
              </p>
              <div className="teacher-dashboard-alert__actions">
                <button
                  className="button teacher-dashboard-alert__button teacher-dashboard-alert__button--ghost"
                  type="button"
                  onClick={() => setDismissedAlert(true)}
                >
                  Dismiss
                </button>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
