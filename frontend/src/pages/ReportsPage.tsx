import { useState } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import {
  DownloadIcon,
  FilterIcon,
} from "../components/Icons";

const absenceRows = [
  ["David Lee", "STU-004", "BSCA", "8", 62],
  ["Bob Smith", "STU-002", "BSIS", "6", 71],
  ["Marie Cruz", "STU-018", "ACT", "5", 74],
  ["Liam Park", "STU-022", "BSAIS", "5", 76],
] as const;

const courseStats = [
  ["BSIS", "312 students", "94%", "up", "1.8"],
  ["BSOM", "248 students", "91%", "down", "0.6"],
  ["BSCA", "196 students", "87%", "down", "2.4"],
  ["BSAIS", "220 students", "93%", "up", "0.9"],
  ["ACT", "264 students", "89%", "up", "1.2"],
] as const;

export function ReportsPage() {
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);

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
          <button className="button button--secondary" type="button">
            <FilterIcon className="button__icon" />
            Filter
          </button>
          <button className="button button--primary" type="button" onClick={() => setIsExportConfirmOpen(true)}>
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
              <div className="stat-card__value">91.2%</div>
            </div>
            <span className="pill pill--success">+1.4%</span>
          </div>
          <p className="stat-card__hint">Compared to last week</p>
        </article>

        <article className="stat-card">
          <div className="stat-card__head">
            <div>
              <p className="stat-card__label">Late Arrivals</p>
              <div className="stat-card__value">38</div>
            </div>
            <span className="pill pill--neutral">This week</span>
          </div>
          <p className="stat-card__hint">
            Students marked late across all classes
          </p>
        </article>
      </div>

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
              {absenceRows.map((row) => (
                <tr key={row[1]}>
                  <td>
                    <div className="table-stack">
                      <div className="person__name">{row[0]}</div>
                      <div className="person__meta font-data">{row[1]}</div>
                    </div>
                  </td>
                  <td>
                    <span className="soft-badge">{row[2]}</span>
                  </td>
                  <td>{row[3]}</td>
                  <td>
                    <div className="rate-cell">
                      <div className="mini-bar">
                        <span style={{ width: `${row[4]}%` }} />
                      </div>
                      <span className="rate-cell__value">{row[4]}%</span>
                    </div>
                  </td>
                </tr>
              ))}
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
            {courseStats.map((course) => (
              <article className="course-card" key={course[0]}>
                <div className="course-card__top">
                  <div>
                    <div className="course-card__name">{course[0]}</div>
                    <div className="person__meta">{course[1]}</div>
                  </div>
                  <div className="course-card__score">
                    <span>{course[2]}</span>
                    <span className={`trend trend--${course[3]}`}>
                      {course[3] === "up" ? `↗ ${course[4]}` : `↘ ${course[4]}`}
                    </span>
                  </div>
                </div>
                <div className="mini-bar mini-bar--full">
                  <span style={{ width: course[2] }} />
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <ConfirmationDialog
        isOpen={isExportConfirmOpen}
        title="Export Reports CSV"
        message="Export this reports overview as a CSV file?"
        confirmLabel="Export CSV"
        onCancel={() => setIsExportConfirmOpen(false)}
        onConfirm={() => setIsExportConfirmOpen(false)}
      />

    </section>
  )
}
