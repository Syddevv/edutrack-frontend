import { useState } from "react";
import { ChangeClassModal, type TeacherClassSelection } from "../components/ChangeClassModal";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { DownloadIcon, FilterIcon, RefreshIcon, UsersIcon } from "../components/Icons";

type SummaryCard = {
  title: string;
  value: string;
  meta: string;
  badge?: string;
  badgeTone?: "success";
};

const summaryCards: SummaryCard[] = [
  {
    title: "Class Attendance Rate",
    value: "90.8%",
    meta: "vs. last week",
    badge: "↑1.2%",
    badgeTone: "success",
  },
  {
    title: "Total Students",
    value: "32",
    meta: "Enrolled in your section",
  },
  {
    title: "Sessions Marked",
    value: "18/20",
    meta: "This month",
  },
];

const atRiskStudents = [
  { name: "Bob Smith", id: "STU-002", absences: 6, rate: 71 },
  { name: "Marco Tan", id: "STU-014", absences: 5, rate: 76 },
  { name: "Jenna Cruz", id: "STU-027", absences: 4, rate: 78 },
] as const;

const weeklyAttendance = [
  { day: "Mon", value: 94, trend: "up" },
  { day: "Tue", value: 91, trend: "up" },
  { day: "Wed", value: 96, trend: "up" },
  { day: "Thu", value: 88, trend: "down" },
  { day: "Fri", value: 85, trend: "down" },
] as const;

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="teacher-reports-panel__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 3.8 18.2A1.4 1.4 0 0 0 5 20.3h14a1.4 1.4 0 0 0 1.2-2.1L12 3Z" />
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function TrendArrow({ direction }: { direction: "up" | "down" }) {
  if (direction === "up") {
    return <span className="teacher-reports-trend teacher-reports-trend--up">↗</span>;
  }

  return <span className="teacher-reports-trend teacher-reports-trend--down">↘</span>;
}

function formatClass(selection: TeacherClassSelection) {
  return `${selection.course} • ${selection.year} - ${selection.section}`;
}

export function TeacherReportsPage() {
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [isChangeClassOpen, setIsChangeClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TeacherClassSelection>({
    course: "BSIS",
    year: "1st Year",
    section: "A",
  });

  return (
    <section className="page teacher-reports-page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight teacher-reports-title">
            Class Reports
          </h1>
          <p className="page-subtitle teacher-reports-subtitle">
            Showing data for{" "}
            <span className="teacher-reports-chip">{formatClass(selectedClass)}</span>
          </p>
        </div>
        <div className="page-actions teacher-reports-actions">
          <button
            className="button button--primary teacher-reports-change-button"
            type="button"
            onClick={() => setIsChangeClassOpen(true)}
          >
            <RefreshIcon className="button__icon" />
            Change Class
          </button>
          <button className="button button--secondary" type="button">
            <FilterIcon className="button__icon" />
            Filter
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => setIsExportConfirmOpen(true)}
          >
            <DownloadIcon className="button__icon" />
            Export CSV
          </button>
        </div>
      </header>

      <div className="teacher-reports-stats">
        {summaryCards.map((card) => (
          <article className="stat-card teacher-reports-stat" key={card.title}>
            <p className="teacher-reports-stat__label">{card.title}</p>
            <div className="teacher-reports-stat__value-row">
              <div className="teacher-reports-stat__value">{card.value}</div>
              {"badge" in card && card.badge ? (
                <span
                  className={`teacher-reports-stat__badge teacher-reports-stat__badge--${card.badgeTone}`}
                >
                  {card.badge}
                </span>
              ) : null}
            </div>
            <p className="teacher-reports-stat__meta">{card.meta}</p>
          </article>
        ))}
      </div>

      <div className="teacher-reports-layout">
        <section className="panel teacher-reports-panel">
          <div className="teacher-reports-panel__head">
            <div className="teacher-reports-panel__title-wrap">
              <AlertIcon />
              <h2 className="section-title teacher-reports-panel__title">
                At-Risk Students
              </h2>
            </div>
            <span className="teacher-reports-panel__caption">Below 80% attendance</span>
          </div>

          <table className="data-table teacher-reports-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Absences</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {atRiskStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="table-stack">
                      <div className="person__name">{student.name}</div>
                      <div className="person__meta font-data">{student.id}</div>
                    </div>
                  </td>
                  <td className="teacher-reports-table__number">{student.absences}</td>
                  <td>
                    <div className="rate-cell">
                      <div className="mini-bar">
                        <span style={{ width: `${student.rate}%` }} />
                      </div>
                      <span className="rate-cell__value">{student.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="panel teacher-reports-sidepanel">
          <div className="teacher-reports-sidepanel__head">
            <div className="teacher-reports-sidepanel__title-wrap">
              <UsersIcon className="teacher-reports-sidepanel__icon" />
              <h2 className="section-title teacher-reports-sidepanel__title">
                Weekly Attendance
              </h2>
            </div>
          </div>

          <div className="teacher-reports-week-list">
            {weeklyAttendance.map((item) => (
              <article className="teacher-reports-week-card" key={item.day}>
                <div className="teacher-reports-week-card__top">
                  <span className="teacher-reports-week-card__day">{item.day}</span>
                  <div className="teacher-reports-week-card__value">
                    <span>{item.value}%</span>
                    <TrendArrow direction={item.trend} />
                  </div>
                </div>
                <div className="mini-bar mini-bar--full teacher-reports-week-card__bar">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <ChangeClassModal
        isOpen={isChangeClassOpen}
        currentSelection={selectedClass}
        onClose={() => setIsChangeClassOpen(false)}
        onApply={(selection) => {
          setSelectedClass(selection);
          setIsChangeClassOpen(false);
        }}
      />

      <ConfirmationDialog
        isOpen={isExportConfirmOpen}
        title="Export Class Report CSV"
        message="Export the current class report as a CSV file?"
        confirmLabel="Export CSV"
        onCancel={() => setIsExportConfirmOpen(false)}
        onConfirm={() => setIsExportConfirmOpen(false)}
      />
    </section>
  );
}
