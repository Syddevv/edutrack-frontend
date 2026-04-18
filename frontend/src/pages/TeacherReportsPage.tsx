import { useEffect, useMemo, useState } from "react";
import {
  ChangeClassModal,
  type TeacherClassSelection,
} from "../components/ChangeClassModal";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { DownloadIcon, FilterIcon, RefreshIcon } from "../components/Icons";
import {
  getTeacherReports,
  type TeacherReportsOverview,
} from "../teacherReports";

type SummaryCard = {
  title: string;
  value: string;
  meta: string;
  badge?: string;
  badgeTone?: "success";
};

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

function formatClass(selection: TeacherClassSelection) {
  return `${selection.course} • ${selection.year} - ${selection.section}`;
}

export function TeacherReportsPage() {
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [isChangeClassOpen, setIsChangeClassOpen] = useState(false);
  const [overview, setOverview] = useState<TeacherReportsOverview | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    void loadReports(selectedClassId ?? undefined);
  }, [selectedClassId]);

  async function loadReports(classId?: number) {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getTeacherReports(classId);
      setOverview(response);
      setSelectedClassId((current) =>
        current === response.selectedClassId ? current : response.selectedClassId
      );
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load teacher reports."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const selectedClass = useMemo(
    () =>
      overview?.assignments.find(
        (assignment) => assignment.classId === overview.selectedClassId
      ) ?? null,
    [overview]
  );

  const summaryCards = useMemo<SummaryCard[]>(() => {
    if (!overview) {
      return [];
    }

    const delta = overview.summary.attendanceRateDelta;

    return [
      {
        title: "Class Attendance Rate",
        value: `${overview.summary.attendanceRate.toFixed(1)}%`,
        meta: "vs. last week",
        badge: `${delta >= 0 ? "↑" : "↓"}${Math.abs(delta).toFixed(1)}%`,
        badgeTone: "success",
      },
      {
        title: "Total Students",
        value: overview.summary.totalStudents.toLocaleString(),
        meta: "Enrolled in your section",
      },
    ];
  }, [overview]);

  return (
    <section className="page teacher-reports-page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight teacher-reports-title">
            Class Reports
          </h1>
          <p className="page-subtitle teacher-reports-subtitle">
            Showing data for{" "}
            <span className="teacher-reports-chip">
              {selectedClass ? formatClass(selectedClass) : "No class assigned"}
            </span>
          </p>
          {selectedClass ? (
            <p className="page-subtitle teacher-reports-subtitle">
              {selectedClass.subject} • {selectedClass.startTime} -{" "}
              {selectedClass.endTime}
            </p>
          ) : null}
        </div>
        <div className="page-actions teacher-reports-actions">
          <button
            className="button button--primary teacher-reports-change-button"
            type="button"
            onClick={() => setIsChangeClassOpen(true)}
            disabled={isLoading || !overview || overview.assignments.length === 0}
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

      {pageError ? <p className="login-card__error">{pageError}</p> : null}

      <div className="teacher-reports-stats">
        {isLoading ? (
          <p className="page-subtitle">Loading class reports...</p>
        ) : summaryCards.length > 0 ? (
          summaryCards.map((card) => (
            <article className="stat-card teacher-reports-stat" key={card.title}>
              <p className="teacher-reports-stat__label">{card.title}</p>
              <div className="teacher-reports-stat__value-row">
                <div className="teacher-reports-stat__value">{card.value}</div>
                {card.badge ? (
                  <span
                    className={`teacher-reports-stat__badge teacher-reports-stat__badge--${card.badgeTone}`}
                  >
                    {card.badge}
                  </span>
                ) : null}
              </div>
              <p className="teacher-reports-stat__meta">{card.meta}</p>
            </article>
          ))
        ) : (
          <p className="page-subtitle">No report data available.</p>
        )}
      </div>

      <div className="teacher-reports-layout teacher-reports-layout--single">
        <section className="panel teacher-reports-panel">
          <div className="teacher-reports-panel__head">
            <div className="teacher-reports-panel__title-wrap">
              <AlertIcon />
              <h2 className="section-title teacher-reports-panel__title">
                At-Risk Students
              </h2>
            </div>
            <span className="teacher-reports-panel__caption">
              Below 80% attendance
            </span>
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
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="page-subtitle">
                    Loading at-risk students...
                  </td>
                </tr>
              ) : overview && overview.atRiskStudents.length > 0 ? (
                overview.atRiskStudents.map((student) => (
                  <tr key={student.studentId}>
                    <td>
                      <div className="table-stack">
                        <div className="person__name">{student.fullName}</div>
                        <div className="person__meta font-data">
                          {student.studentCode}
                        </div>
                      </div>
                    </td>
                    <td className="teacher-reports-table__number">
                      {student.absences}
                    </td>
                    <td>
                      <div className="rate-cell">
                        <div className="mini-bar">
                          <span style={{ width: `${student.attendanceRate}%` }} />
                        </div>
                        <span className="rate-cell__value">
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="page-subtitle">
                    No at-risk students found for this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <ChangeClassModal
        assignedClasses={overview?.assignments ?? []}
        currentSelection={selectedClass}
        isOpen={isChangeClassOpen}
        onClose={() => setIsChangeClassOpen(false)}
        onApply={(selection) => {
          setSelectedClassId(selection.classId);
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
