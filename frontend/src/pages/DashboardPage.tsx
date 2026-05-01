import { useEffect, useMemo, useState } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { StatusModal } from "../components/StatusModal";
import {
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  RefreshIcon,
  SearchIcon,
  UsersIcon,
  XCircleIcon,
} from "../components/Icons";
import { getSchoolLogoUrl } from "../branding";
import { getDashboardOverview, type DashboardOverview } from "../dashboard";
import { getStudents, type StudentRecord } from "../students";

const DASHBOARD_ROWS_PER_PAGE = 7;

function getStatusTone(status: DashboardOverview["rows"][number]["status"]) {
  if (status === "No Record") {
    return null;
  }

  return status.toLowerCase();
}

function escapeCsvCell(value: string | number | null | undefined) {
  const stringValue =
    value === null || value === undefined ? "" : String(value);

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function formatFilenameDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildStudentsCsv(
  students: StudentRecord[],
  schoolName: string,
  schoolLogoPath?: string | null,
) {
  const generatedAt = new Date();
  const rows: Array<Array<string | number>> = [
    ["School Name", schoolName],
    ["School Logo", getSchoolLogoUrl(schoolLogoPath)],
    ["Generated At", generatedAt.toLocaleString()],
    [],
    ["Student Name", "Course", "Year", "Section"],
    ...students.map((student) => [
      student.fullName,
      student.course.code || student.course.name,
      student.yearLevel.name,
      student.section.name,
    ]),
  ];

  return `\uFEFF${rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\r\n")}`;
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type DashboardPageProps = {
  academicYearStart: number;
  schoolName: string;
  schoolLogoPath?: string | null;
};

export function DashboardPage({
  academicYearStart,
  schoolName,
  schoolLogoPath,
}: DashboardPageProps) {
  const [feedback, setFeedback] = useState<{
    message: string;
    title: string;
    tone: "success" | "error";
  } | null>(null);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
      const response = await getDashboardOverview();
      setOverview(response);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportStudentsCsv() {
    setIsExporting(true);
    setPageError("");

    try {
      const response = await getStudents();
      const csv = buildStudentsCsv(response.students, schoolName, schoolLogoPath);
      downloadCsv(csv, `students-${formatFilenameDate(new Date())}.csv`);
      setIsExportConfirmOpen(false);
      setFeedback({
        title: "Export Complete",
        message: "The student CSV file was generated successfully.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        title: "Export Failed",
        message:
          error instanceof Error ? error.message : "Failed to export students.",
        tone: "error",
      });
    } finally {
      setIsExporting(false);
    }
  }

  const filteredRows = useMemo(() => {
    if (!overview) {
      return [];
    }

    const query = searchTerm.trim().toLowerCase();

    return overview.rows.filter((row) => {
      if (query === "") {
        return true;
      }

      return [
        row.fullName,
        row.studentCode,
        row.course,
        row.yearSection,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [overview, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filteredRows.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / DASHBOARD_ROWS_PER_PAGE),
  );
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * DASHBOARD_ROWS_PER_PAGE;
    return filteredRows.slice(startIndex, startIndex + DASHBOARD_ROWS_PER_PAGE);
  }, [currentPage, filteredRows]);

  const overviewCards = overview
    ? [
        {
          icon: <UsersIcon className="stat-card__icon" />,
          title: "Total Students",
          value: overview.summary.totalStudents.toLocaleString(),
        },
        {
          icon: <CheckCircleIcon className="stat-card__icon" />,
          title: "Present Today",
          value: (
            overview.summary.presentToday + overview.summary.lateToday
          ).toLocaleString(),
        },
        {
          icon: <XCircleIcon className="stat-card__icon" />,
          title: "Absent Today",
          value: overview.summary.absentToday.toLocaleString(),
        },
        {
          icon: <ClockIcon className="stat-card__icon" />,
          title: "Late Today",
          value: overview.summary.lateToday.toLocaleString(),
        },
      ]
    : [];

  return (
    <section className="page dashboard-page">
      <header className="page__topbar">
        <div className="dashboard-identity">
          <img
            className="dashboard-identity__logo"
            src={getSchoolLogoUrl(schoolLogoPath)}
            alt={`${schoolName} logo`}
          />
          <div>
            <p className="dashboard-identity__eyebrow">Admin Dashboard</p>
            <h1 className="page-title heading-tight">{schoolName}</h1>
            <p className="page-subtitle">
              Academic Year {academicYearStart} - {academicYearStart + 1} •
              Daily attendance snapshot and student records overview.
            </p>
          </div>
        </div>
        <div className="page-date">{overview?.dateLabel ?? ""}</div>
      </header>

      <div className="stats-grid stats-grid--four">
        {overviewCards.map((card) => (
          <article className="stat-card" key={card.title}>
            <div className="stat-card__head">
              <div className="stat-card__icon-wrap">{card.icon}</div>
            </div>
            <p className="stat-card__label">{card.title}</p>
            <div className="stat-card__value">{card.value}</div>
          </article>
        ))}
      </div>

      <section className="panel dashboard-page__panel">
        <div className="toolbar">
          <label className="search-field">
            <SearchIcon className="search-field__icon" />
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <div className="toolbar__actions">
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
        </div>

        {pageError ? <p className="login-card__error">{pageError}</p> : null}

        {isLoading ? (
          <p className="page-subtitle">Loading dashboard...</p>
        ) : filteredRows.length === 0 ? (
          <p className="page-subtitle">No dashboard records found.</p>
        ) : (
          <>
            <div className="dashboard-page__table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>STUDENT NAME</th>
                    <th>COURSE</th>
                    <th>YEAR</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row) => (
                    <tr key={`${row.studentId}-${row.studentCode}`}>
                      <td>
                        <div>
                          <div className="person__name">{row.fullName}</div>
                          <div className="person__meta font-data">
                            ID: {row.studentCode}
                          </div>
                        </div>
                      </td>
                      <td>{row.course}</td>
                      <td>{row.yearSection}</td>
                      <td>{row.date ?? "No Record"}</td>
                      <td>
                        {getStatusTone(row.status) ? (
                          <span
                            className={`status-chip status-chip--${getStatusTone(row.status)}`}
                          >
                            {row.status}
                          </span>
                        ) : (
                          <span className="data-badge">{row.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer dashboard-page__footer">
              <span>
                Showing {(currentPage - 1) * DASHBOARD_ROWS_PER_PAGE + 1}-
                {Math.min(
                  currentPage * DASHBOARD_ROWS_PER_PAGE,
                  filteredRows.length,
                )}{" "}
                of {filteredRows.length} results
              </span>
              <div className="pagination">
                <button
                  className="button button--secondary button--small"
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="count-pill">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="button button--secondary button--small"
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      <ConfirmationDialog
        isOpen={isExportConfirmOpen}
        title="Export Students CSV"
        message="Export the complete student list with name, course, year, and section?"
        confirmLabel={isExporting ? "Exporting..." : "Export CSV"}
        onCancel={() => setIsExportConfirmOpen(false)}
        onConfirm={() => void handleExportStudentsCsv()}
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
