import { useEffect, useState } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { StatusModal } from "../components/StatusModal";
import { getReportsOverview, type ReportsOverview } from "../reports";
import { DownloadIcon, RefreshIcon } from "../components/Icons";
import schoolLogoUrl from "../assets/bpc-logo-removebg-preview.png";
import {
  buildCsv,
  downloadCsv,
  formatFilenameDate,
  SCHOOL_NAME,
  type CsvCell,
} from "../csvExport";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function getSchoolLogoReference() {
  return new URL(schoolLogoUrl, window.location.origin).href;
}

function buildReportsCsv(overview: ReportsOverview) {
  const rows: CsvCell[][] = [
    ["School Name", SCHOOL_NAME],
    ["School Logo", getSchoolLogoReference()],
    ["Report", "Reports Overview"],
    ["Generated At", overview.generatedAt],
    ["Exported At", new Date().toLocaleString()],
    [],
    ["SUMMARY"],
    ["Metric", "Value", "Details"],
    [
      "Attendance Rate",
      formatPercent(overview.reportsSummary.attendanceRate),
      `${formatSignedPercent(overview.reportsSummary.attendanceRateDelta)} vs last week`,
    ],
    [
      "Late Arrivals",
      overview.reportsSummary.lateArrivalsThisWeek,
      "This week",
    ],
    [],
    ["TOP ABSENCE BREAKDOWN"],
    ["Student ID", "Student Name", "Course", "Absences", "Attendance Rate"],
    ...overview.absenceBreakdown.map((row) => [
      row.studentCode,
      row.fullName,
      row.course,
      row.absences,
      formatPercent(row.attendanceRate),
    ]),
    [],
    ["COURSE PERFORMANCE"],
    [
      "Course",
      "Students",
      "Attendance Rate",
      "Trend Direction",
      "Trend Change",
    ],
    ...overview.courseStats.map((course) => [
      course.course,
      course.studentCount,
      formatPercent(course.attendanceRate),
      course.trendDirection === "up" ? "Up" : "Down",
      formatPercent(course.trendDelta),
    ]),
  ];

  return buildCsv(rows);
}

export function ReportsPage() {
  const [feedback, setFeedback] = useState<{
    message: string;
    title: string;
    tone: "success" | "error";
  } | null>(null);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [overview, setOverview] = useState<ReportsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    void loadOverview();
  }, []);

  async function loadOverview() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getReportsOverview();
      setOverview(response);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load reports.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportCsv() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setPageError("");

    try {
      const exportOverview = overview ?? (await getReportsOverview());
      const csv = buildReportsCsv(exportOverview);
      downloadCsv(csv, `reports-overview-${formatFilenameDate(new Date())}.csv`);
      setIsExportConfirmOpen(false);
      setFeedback({
        title: "Export Complete",
        message: "The reports overview CSV was generated successfully.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        title: "Export Failed",
        message:
          error instanceof Error ? error.message : "Failed to export reports.",
        tone: "error",
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">Reports Overview</h1>
          <p className="page-subtitle">
            Track attendance trends, course performance, and generated
            institution reports.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => void loadOverview()}
          >
            <RefreshIcon className="button__icon" />
            Refresh
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

      <div className="stats-grid stats-grid--reports">
        <article className="stat-card">
          <div className="stat-card__head">
            <div>
              <p className="stat-card__label">Attendance Rate</p>
              <div className="stat-card__value">
                {overview
                  ? `${overview.reportsSummary.attendanceRate.toFixed(1)}%`
                  : "--"}
              </div>
            </div>
            <span className="pill pill--success">
              {overview
                ? `${overview.reportsSummary.attendanceRateDelta >= 0 ? "+" : ""}${overview.reportsSummary.attendanceRateDelta.toFixed(1)}%`
                : "--"}
            </span>
          </div>
          <p className="stat-card__hint">Compared to last week</p>
        </article>

        <article className="stat-card">
          <div className="stat-card__head">
            <div>
              <p className="stat-card__label">Late Arrivals</p>
              <div className="stat-card__value">
                {overview
                  ? overview.reportsSummary.lateArrivalsThisWeek.toLocaleString()
                  : "--"}
              </div>
            </div>
            <span className="pill pill--neutral">This week</span>
          </div>
          <p className="stat-card__hint">
            Students marked late across all classes
          </p>
        </article>
      </div>

      {pageError ? <p className="login-card__error">{pageError}</p> : null}

      <div className="reports-layout">
        <section className="panel">
          <div className="panel__title-row">
            <div>
              <h2 className="section-title">Top Absence Breakdown</h2>
              <p className="section-subtitle">
                Students with the highest recorded absences.
              </p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>COURSE</th>
                <th>ABSENCES</th>
                <th>RATE</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="page-subtitle">
                    Loading reports...
                  </td>
                </tr>
              ) : overview && overview.absenceBreakdown.length > 0 ? (
                overview.absenceBreakdown.map((row) => (
                  <tr key={row.studentId}>
                    <td>
                      <div className="table-stack">
                        <div className="person__name">{row.fullName}</div>
                        <div className="person__meta font-data">
                          {row.studentCode}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="soft-badge">{row.course}</span>
                    </td>
                    <td>{row.absences}</td>
                    <td>
                      <div className="rate-cell">
                        <div className="mini-bar">
                          <span style={{ width: `${row.attendanceRate}%` }} />
                        </div>
                        <span className="rate-cell__value">
                          {row.attendanceRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="page-subtitle">
                    No absence data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="panel reports-sidepanel">
          <div className="panel__title-row">
            <div>
              <h2 className="section-title">By Course</h2>
              <p className="section-subtitle">Attendance trend snapshots.</p>
            </div>
          </div>

          <div className="course-list">
            {isLoading ? (
              <p className="page-subtitle">Loading course trends...</p>
            ) : overview && overview.courseStats.length > 0 ? (
              overview.courseStats.map((course) => (
                <article className="course-card" key={course.course}>
                  <div className="course-card__top">
                    <div>
                      <div className="course-card__name">{course.course}</div>
                      <div className="person__meta">
                        {course.studentCount.toLocaleString()}{" "}
                        {course.studentCount === 1 ? "student" : "students"}
                      </div>
                    </div>
                    <div className="course-card__score">
                      <span>{course.attendanceRate}%</span>
                      <span className={`trend trend--${course.trendDirection}`}>
                        {course.trendDirection === "up"
                          ? `↗ ${course.trendDelta.toFixed(1)}`
                          : `↘ ${course.trendDelta.toFixed(1)}`}
                      </span>
                    </div>
                  </div>
                  <div className="mini-bar mini-bar--full">
                    <span style={{ width: `${course.attendanceRate}%` }} />
                  </div>
                </article>
              ))
            ) : (
              <p className="page-subtitle">No course data found.</p>
            )}
          </div>
        </aside>
      </div>

      <ConfirmationDialog
        isOpen={isExportConfirmOpen}
        title="Export Reports CSV"
        message="Export this reports overview as a CSV file?"
        confirmLabel={isExporting ? "Exporting..." : "Export CSV"}
        onCancel={() => setIsExportConfirmOpen(false)}
        onConfirm={() => void handleExportCsv()}
      />
      <StatusModal
        isOpen={feedback !== null}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        tone={feedback?.tone ?? "success"}
        onClose={() => setFeedback(null)}
      />
    </section>
  );
}
