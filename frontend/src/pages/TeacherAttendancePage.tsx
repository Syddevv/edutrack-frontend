import {
  CheckCircleIcon,
  ClockIcon,
  SearchIcon,
  UsersIcon,
  XCircleIcon,
} from "../components/Icons";

const attendanceSummary = [
  {
    title: "Total Students",
    value: "32",
    hint: "This class roster",
    icon: <UsersIcon className="stat-card__icon" />,
  },
  {
    title: "Present",
    value: "28",
    hint: "87.5% checked in",
    icon: <CheckCircleIcon className="stat-card__icon" />,
  },
  {
    title: "Absent",
    value: "4",
    hint: "Needs follow-up",
    icon: <XCircleIcon className="stat-card__icon" />,
  },
  {
    title: "Marked At",
    value: "09:12 AM",
    hint: "Most recent update",
    icon: <ClockIcon className="stat-card__icon" />,
  },
] as const;

const attendanceRows = [
  ["Alice Johnson", "AJ-101", "Present"],
  ["Bob Smith", "BS-102", "Absent"],
  ["Charlie Brown", "CB-103", "Present"],
  ["David Lee", "DL-104", "Late"],
  ["Eva Green", "EG-105", "Present"],
  ["Fiona Cruz", "FC-106", "Present"],
] as const;

function AttendanceStatus({ status }: { status: string }) {
  return (
    <span className={`status-chip status-chip--${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

export function TeacherAttendancePage() {
  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">Attendance</h1>
          <p className="page-subtitle">
            Track class attendance and review today&apos;s check-ins.
          </p>
        </div>
        <div className="page-actions">
          <label className="search-field search-field--medium">
            <SearchIcon className="search-field__icon" />
            <input type="text" placeholder="Search student" />
          </label>
          <button className="button button--primary" type="button">
            Mark All Present
          </button>
        </div>
      </header>

      <div className="stats-grid stats-grid--four">
        {attendanceSummary.map((card) => (
          <article className="stat-card stat-card--compact" key={card.title}>
            <div className="stat-card__head">
              <div className="stat-card__icon-wrap">{card.icon}</div>
            </div>
            <p className="stat-card__label">{card.title}</p>
            <div className="stat-card__value">{card.value}</div>
            <p className="stat-card__hint">{card.hint}</p>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="panel__title-row">
          <h2 className="section-title">Today&apos;s Roster</h2>
          <p className="section-subtitle">
            Update each student&apos;s status for Math 101.
          </p>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRows.map((row) => (
              <tr key={row[1]}>
                <td>
                  <div className="person">
                    <div className="avatar avatar--photo">
                      {row[0]
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="person__name">{row[0]}</div>
                      <div className="person__meta">Math 101</div>
                    </div>
                  </div>
                </td>
                <td className="font-data">{row[1]}</td>
                <td>
                  <AttendanceStatus status={row[2]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
