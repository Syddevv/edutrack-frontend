import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "../components/Icons";

type AttendanceStatus = "Present" | "Late" | "Absent";

type AttendanceStudent = {
  id: string;
  name: string;
  course: string;
  status: AttendanceStatus;
};

const initialStudents: AttendanceStudent[] = [
  { id: "STU-001", name: "Alice Johnson", course: "BSIS", status: "Present" },
  { id: "STU-002", name: "Bob Smith", course: "BSIS", status: "Present" },
  { id: "STU-003", name: "Charlie Brown", course: "BSIS", status: "Present" },
  { id: "STU-004", name: "David Lee", course: "BSIS", status: "Present" },
  { id: "STU-005", name: "Eva Green", course: "BSIS", status: "Present" },
  { id: "STU-006", name: "Fiona Cruz", course: "BSIS", status: "Present" },
  { id: "STU-007", name: "George Hall", course: "BSIS", status: "Late" },
  { id: "STU-008", name: "Hannah Scott", course: "BSIS", status: "Late" },
  { id: "STU-009", name: "Ian Turner", course: "BSIS", status: "Late" },
  { id: "STU-010", name: "Julia Reyes", course: "BSIS", status: "Absent" },
  { id: "STU-011", name: "Kevin Moore", course: "BSIS", status: "Absent" },
  { id: "STU-012", name: "Lia Santos", course: "BSIS", status: "Absent" },
  { id: "STU-013", name: "Marco Diaz", course: "BSIS", status: "Present" },
  { id: "STU-014", name: "Nina Patel", course: "BSIS", status: "Present" },
  { id: "STU-015", name: "Owen James", course: "BSIS", status: "Present" },
  { id: "STU-016", name: "Paula Cruz", course: "BSIS", status: "Present" },
  { id: "STU-017", name: "Quinn Garcia", course: "BSIS", status: "Present" },
  { id: "STU-018", name: "Rhea Mendoza", course: "BSIS", status: "Present" },
  { id: "STU-019", name: "Sam Walker", course: "BSIS", status: "Present" },
  { id: "STU-020", name: "Tina Flores", course: "BSIS", status: "Present" },
  { id: "STU-021", name: "Uriel King", course: "BSIS", status: "Present" },
  { id: "STU-022", name: "Vera Young", course: "BSIS", status: "Present" },
  { id: "STU-023", name: "Will Gomez", course: "BSIS", status: "Present" },
  { id: "STU-024", name: "Xena Lim", course: "BSIS", status: "Present" },
  { id: "STU-025", name: "Yasmin Cole", course: "BSIS", status: "Present" },
  { id: "STU-026", name: "Zack Rivera", course: "BSIS", status: "Present" },
  { id: "STU-027", name: "Aiden Fox", course: "BSIS", status: "Present" },
  { id: "STU-028", name: "Bella Nash", course: "BSIS", status: "Present" },
];

const statusOptions: AttendanceStatus[] = ["Present", "Late", "Absent"];

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="teacher-attendance-field__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      aria-hidden="true"
      className="teacher-attendance-footer__save-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 21h14a2 2 0 0 0 2-2V8.41a2 2 0 0 0-.59-1.41l-3.41-3.41A2 2 0 0 0 15.59 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

function StudentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return <span className="teacher-attendance-avatar">{initials}</span>;
}

export function TeacherAttendancePage() {
  const [students, setStudents] = useState(initialStudents);

  const summary = useMemo(() => {
    const present = students.filter((student) => student.status === "Present").length;
    const late = students.filter((student) => student.status === "Late").length;
    const absent = students.filter((student) => student.status === "Absent").length;
    return { present, late, absent, total: students.length };
  }, [students]);

  const markedCount = useMemo(
    () => students.filter((student) => student.status === "Present").length,
    [students]
  );

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  }

  return (
    <section className="page teacher-attendance-page">
      <div className="teacher-attendance-scroll">
        <header className="teacher-attendance-header">
          <div>
            <h1 className="page-title heading-tight teacher-attendance-title">
              Mark Attendance
            </h1>
            <p className="page-subtitle teacher-attendance-subtitle">
              Record daily attendance for your class section.
            </p>
          </div>

          <div className="teacher-attendance-filters">
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Course</span>
              <select className="teacher-attendance-select" defaultValue="BSIS">
                <option>BSIS</option>
                <option>BSOM</option>
                <option>BSCA</option>
                <option>BSAIS</option>
                <option>ACT</option>
              </select>
            </label>
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Year</span>
              <select className="teacher-attendance-select" defaultValue="1st Year">
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </label>
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Section</span>
              <select className="teacher-attendance-select" defaultValue="A">
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </label>
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Date</span>
              <div className="teacher-attendance-date-field">
                <input type="text" defaultValue="10/24/2023" />
                <CalendarIcon />
              </div>
            </label>
          </div>
        </header>

        <div className="teacher-attendance-summary">
          <article className="teacher-attendance-summary-card">
            <div className="teacher-attendance-summary-card__icon teacher-attendance-summary-card__icon--present">
              <CheckCircleIcon className="stat-card__icon" />
            </div>
            <div>
              <p className="teacher-attendance-summary-card__label">Present</p>
              <p className="teacher-attendance-summary-card__value">{summary.present}</p>
            </div>
          </article>

          <article className="teacher-attendance-summary-card">
            <div className="teacher-attendance-summary-card__icon teacher-attendance-summary-card__icon--late">
              <ClockIcon className="stat-card__icon" />
            </div>
            <div>
              <p className="teacher-attendance-summary-card__label">Late</p>
              <p className="teacher-attendance-summary-card__value">{summary.late}</p>
            </div>
          </article>

          <article className="teacher-attendance-summary-card">
            <div className="teacher-attendance-summary-card__icon teacher-attendance-summary-card__icon--absent">
              <XCircleIcon className="stat-card__icon" />
            </div>
            <div>
              <p className="teacher-attendance-summary-card__label">Absent</p>
              <p className="teacher-attendance-summary-card__value">{summary.absent}</p>
            </div>
          </article>
        </div>

        <section className="panel teacher-attendance-panel">
          <div className="teacher-attendance-panel__head">
            <h2 className="section-title teacher-attendance-panel__title">
              Student List
            </h2>
            <span className="teacher-attendance-panel__count">
              {summary.total} Students
            </span>
          </div>

          <div className="teacher-attendance-table-wrap">
            <table className="data-table teacher-attendance-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>ID Number</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="teacher-attendance-student">
                        <StudentAvatar name={student.name} />
                        <span className="teacher-attendance-student__name">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="font-data teacher-attendance-id">{student.id}</td>
                    <td>
                      <div className="teacher-attendance-segmented">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            className={`teacher-attendance-segmented__button${
                              student.status === status
                                ? ` teacher-attendance-segmented__button--${status.toLowerCase()}`
                                : ""
                            }`}
                            type="button"
                            onClick={() => updateStatus(student.id, status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="teacher-attendance-footer">
        <p className="teacher-attendance-footer__meta">
          {markedCount} of {summary.total} students marked
        </p>
        <div className="teacher-attendance-footer__actions">
          <button className="button button--secondary teacher-attendance-footer__button" type="button">
            Cancel
          </button>
          <button className="button button--primary teacher-attendance-footer__button teacher-attendance-footer__button--save" type="button">
            <SaveIcon />
            Save Attendance
          </button>
        </div>
      </footer>
    </section>
  );
}
