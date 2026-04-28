import { type ReactNode, useEffect, useMemo, useState } from "react";
import schoolLogoUrl from "../assets/bpc-logo-removebg-preview.png";
import {
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  XCircleIcon,
} from "../components/Icons";
import {
  getTeacherDashboardOverview,
  type TeacherDashboardOverview,
} from "../teacherDashboard";

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

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Present" || status === "Absent" || status === "Late"
      ? status.toLowerCase()
      : "neutral";

  return (
    <span className={`status-chip status-chip--${tone}`}>
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

type TeacherDashboardPageProps = {
  academicYearStart: number;
  schoolName: string;
  teacherName?: string;
};

export function TeacherDashboardPage({
  academicYearStart,
  schoolName,
  teacherName,
}: TeacherDashboardPageProps) {
  const [overview, setOverview] = useState<TeacherDashboardOverview | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [dismissedAlert, setDismissedAlert] = useState(false);

  useEffect(() => {
    void loadOverview();
  }, []);

  useEffect(() => {
    if (overview?.aiInsight) {
      setDismissedAlert(false);
    }
  }, [overview?.aiInsight?.title, overview?.aiInsight?.body]);

  async function loadOverview() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getTeacherDashboardOverview();
      setOverview(response);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to load teacher dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const statCards = useMemo<DashboardStatCard[]>(() => {
    if (!overview) {
      return [];
    }

    const delta = overview.summary.attendanceRateDelta;

    return [
      {
        icon: <ClockIcon className="stat-card__icon" />,
        title: "Today's Class",
        value: overview.todayClass?.subject ?? "No Class Assigned",
        detail: overview.todayClass
          ? `${overview.todayClass.course} • ${overview.todayClass.yearLevel} - ${overview.todayClass.section}`
          : undefined,
        subtext: overview.todayClass
          ? `${overview.todayClass.startTime} - ${overview.todayClass.endTime}`
          : "No teacher schedule found",
        badge:
          overview.todayClass?.status === "active"
            ? { tone: "success", label: "Active" }
            : overview.todayClass?.status === "upcoming"
              ? { tone: "danger", label: "Upcoming" }
              : undefined,
      },
      {
        icon: <UsersIcon className="stat-card__icon" />,
        title: "Total Students",
        value: overview.summary.totalStudents.toLocaleString(),
        subtext: "Enrolled in this session",
      },
      {
        icon: <CheckCircleIcon className="stat-card__icon" />,
        title: "Present Count",
        value: overview.summary.presentCount.toLocaleString(),
        subtext: `${overview.summary.attendanceRate.toFixed(1)}% attendance rate`,
        badge: {
          tone: "success",
          label: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs previous`,
        },
        accent: "teacher-dashboard-card__value--success",
      },
      {
        icon: <XCircleIcon className="stat-card__icon" />,
        title: "Absent Count",
        value: overview.summary.absentCount.toLocaleString(),
        subtext:
          overview.summary.absentCount > 0
            ? "Needs follow-up"
            : "No absences recorded",
      },
    ];
  }, [overview]);

  return (
    <section className="page">
      <header className="teacher-dashboard-hero">
        <div className="teacher-dashboard-hero__main">
          <div className="dashboard-identity teacher-dashboard-identity">
            <img
              className="dashboard-identity__logo"
              src={schoolLogoUrl}
              alt={`${schoolName} logo`}
            />
            <div>
              <p className="dashboard-identity__eyebrow">Teacher Dashboard</p>
              <h1 className="page-title heading-tight teacher-dashboard-title">
                {schoolName}
              </h1>
              <p className="page-subtitle">
                Academic Year {academicYearStart} - {academicYearStart + 1}
              </p>
            </div>
          </div>

          <div className="teacher-dashboard-hero__meta">
            <span className="teacher-dashboard-hero__teacher">
              {teacherName ?? "Teacher"}
            </span>
            <span className="teacher-dashboard-hero__dot" aria-hidden="true" />
            <span className="teacher-dashboard-hero__summary">
              {overview?.attendanceDateLabel
                ? `Overview based on ${overview.attendanceDateLabel}`
                : `Overview for ${overview?.dateLabel ?? ""}`}
            </span>
          </div>
        </div>

        <div className="page-actions teacher-dashboard-actions teacher-dashboard-actions--hero">
          <div className="count-pill teacher-dashboard-date-pill">
            <ClockIcon className="teacher-dashboard-date-icon" />
            {overview?.dateLabel ?? ""}
          </div>
          <button
            className="button button--primary teacher-dashboard-button"
            type="button"
            onClick={() => {
              window.location.hash = "/attendance";
            }}
          >
            Take Attendance
          </button>
        </div>
      </header>

      {pageError ? <p className="login-card__error">{pageError}</p> : null}

      <div className="stats-grid stats-grid--four teacher-dashboard-stats">
        {isLoading ? (
          <p className="page-subtitle">Loading dashboard...</p>
        ) : (
          statCards.map((card) => (
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
          ))
        )}
      </div>

      <div className="teacher-dashboard-content">
        <section className="teacher-dashboard-activity">
          <div className="teacher-dashboard-section-head">
            <h2 className="section-title teacher-dashboard-section-title">
              Recent Activity
            </h2>
            <button
              className="teacher-dashboard-link"
              type="button"
              onClick={() => void loadOverview()}
            >
              Refresh
            </button>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="page-subtitle">
                      Loading activity...
                    </td>
                  </tr>
                ) : overview && overview.recentActivity.length > 0 ? (
                  overview.recentActivity.map((row) => (
                    <tr key={`${row.studentId}-${row.className}`}>
                      <td>
                        <span className="teacher-dashboard-student-name">
                          {row.fullName}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                      <td>{row.className}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="page-subtitle">
                      No recent attendance found.
                    </td>
                  </tr>
                )}
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
                {overview?.nextClass?.classId ?? "--"}
              </div>
              <div>
                <p className="teacher-dashboard-sidecard__name">
                  {overview?.nextClass?.subject ?? "No upcoming class"}
                </p>
                <p className="teacher-dashboard-sidecard__meta">
                  {overview?.nextClass?.time ?? "No time scheduled"}
                </p>
              </div>
            </div>

            <div className="teacher-dashboard-sidecard__footer">
              {/* Countdown progress bar: only show if next class is today */}
              {overview?.nextClass?.isToday &&
              overview.nextClass.time &&
              typeof overview.nextClass.minutesRemaining === "number" ? (
                <div className="teacher-dashboard-sidecard__progress">
                  {/* Progress bar fill based on minutes remaining */}
                  {(() => {
                    // Defensive: check if time is in 'HH:MM AM/PM' format
                    const timeStr = overview.nextClass.time;
                    const match = timeStr.match(
                      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
                    );
                    if (!match) return null;
                    const [, hourStr, minStr, ampm] = match;
                    let hour = parseInt(hourStr, 10);
                    const min = parseInt(minStr, 10);
                    if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
                    if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
                    const now = new Date();
                    const classStart = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate(),
                      hour,
                      min,
                    );
                    const midnight = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate(),
                      0,
                      0,
                    );
                    const totalMins =
                      (classStart.getTime() - midnight.getTime()) / 60000;
                    const minsLeft = overview.nextClass.minutesRemaining;
                    let percent = 100;
                    if (totalMins > 0) {
                      percent = Math.max(
                        0,
                        Math.min(
                          100,
                          ((totalMins - minsLeft) / totalMins) * 100,
                        ),
                      );
                    }
                    return (
                      <div
                        style={{
                          height: 4,
                          background: "#111",
                          width: percent + "%",
                          transition: "width 0.5s",
                          borderRadius: 2,
                          margin: "0 0 2px 0",
                        }}
                      />
                    );
                  })()}
                </div>
              ) : null}
              <p className="teacher-dashboard-sidecard__countdown">
                {overview?.nextClass
                  ? overview.nextClass.isToday
                    ? `${overview.nextClass.minutesRemaining} mins remaining until start`
                    : `${overview.nextClass.dayOfWeek ?? "Upcoming"} class`
                  : "No upcoming class on schedule"}
              </p>
            </div>
          </section>

          {!dismissedAlert && overview?.aiInsight ? (
            <section className="teacher-dashboard-alert">
              <div className="teacher-dashboard-alert__badge">
                <SparkIcon />
                <span>AI Insight</span>
              </div>
              <h3 className="teacher-dashboard-alert__title">
                {overview.aiInsight.title}
              </h3>
              <p className="teacher-dashboard-alert__body">
                {overview.aiInsight.body}
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
