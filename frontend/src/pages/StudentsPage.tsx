import { useState } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { StudentAddModal } from "../components/StudentAddModal";
import { StudentEditModal } from "../components/StudentEditModal";
import { StudentImportModal } from "../components/StudentImportModal";
import {
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "../components/Icons";

type StudentRow = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

const initialStudents: ReadonlyArray<StudentRow> = [
  [
    "Alice Johnson",
    "alice@school.edu",
    "STU-001",
    "BSIS",
    "1st Year",
    "A",
    "Present",
  ],
  ["Bob Smith", "bob@school.edu", "STU-002", "BSIS", "1st Year", "A", "Absent"],
  [
    "Charlie Brown",
    "charlie@school.edu",
    "STU-003",
    "BSOM",
    "2nd Year",
    "B",
    "Present",
  ],
  ["David Lee", "david@school.edu", "STU-004", "BSCA", "1st Year", "A", "Late"],
  [
    "Eva Green",
    "eva@school.edu",
    "STU-005",
    "BSAIS",
    "3rd Year",
    "B",
    "Present",
  ],
  [
    "Frank Miller",
    "frank@school.edu",
    "STU-006",
    "ACT",
    "2nd Year",
    "A",
    "Present",
  ],
];

export function StudentsPage() {
  const [students, setStudents] = useState(initialStudents);
  const [activeModal, setActiveModal] = useState<
    "add" | "import" | "edit" | null
  >(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentRow | null>(
    null,
  );
  const [studentToEdit, setStudentToEdit] = useState<StudentRow | null>(null);

  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">Students</h1>
          <p className="page-subtitle">
            View student list, courses, year levels, and attendance status.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="button button--primary students-control-button"
            type="button"
            onClick={() => setActiveModal("import")}
          >
            <DownloadIcon className="button__icon" />
            Import CSV
          </button>
          <button
            className="button button--primary students-control-button"
            type="button"
            onClick={() => setActiveModal("add")}
          >
            <PlusIcon className="button__icon" />
            Add Student
          </button>
          <div className="count-pill students-total-pill">
            <span>Total:</span>
            <strong>6</strong>
          </div>
        </div>
      </header>

      <section className="panel panel--toolbar">
        <div className="toolbar">
          <label className="search-field search-field--wide">
            <SearchIcon className="search-field__icon" />
            <input type="text" placeholder="Search by student name or ID..." />
          </label>

          <div className="toolbar__actions">
            <button className="select-like students-select" type="button">
              All Courses
            </button>
            <button className="select-like students-select" type="button">
              All Years
            </button>
            <button
              className="icon-button students-refresh-button"
              type="button"
              aria-label="Refresh"
            >
              <RefreshIcon className="button__icon" />
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>STUDENT ID</th>
              <th>COURSE</th>
              <th>YEAR</th>
              <th>SECTION</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student[2]}>
                <td>
                  <div className="table-stack">
                    <div className="person__name">{student[0]}</div>
                    <div className="person__meta">{student[1]}</div>
                  </div>
                </td>
                <td>
                  <span className="data-badge font-data">{student[2]}</span>
                </td>
                <td>
                  <span className="soft-badge">{student[3]}</span>
                </td>
                <td>{student[4]}</td>
                <td>{student[5]}</td>
                <td>
                  <span
                    className={`status-chip status-chip--${student[6].toLowerCase()}`}
                  >
                    {student[6]}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="icon-button icon-button--ghost"
                      type="button"
                      aria-label="Edit"
                      onClick={() => {
                        setStudentToEdit(student);
                        setActiveModal("edit");
                      }}
                    >
                      <PencilIcon className="table-action-icon" />
                    </button>
                    <button
                      className="icon-button icon-button--ghost"
                      type="button"
                      aria-label="Delete"
                      onClick={() => setStudentToDelete(student)}
                    >
                      <TrashIcon className="table-action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {activeModal ? (
        <div
          className="student-modal-backdrop"
          role="presentation"
          onClick={() => setActiveModal(null)}
        >
          {activeModal === "add" && (
            <StudentAddModal
              onClose={() => setActiveModal(null)}
              onAdd={() => setActiveModal(null)}
            />
          )}
          {activeModal === "edit" && (
            <StudentEditModal
              studentToEdit={studentToEdit}
              onClose={() => {
                setActiveModal(null);
                setStudentToEdit(null);
              }}
              onSave={() => {
                setActiveModal(null);
                setStudentToEdit(null);
              }}
            />
          )}
          {activeModal === "import" && (
            <StudentImportModal
              onClose={() => setActiveModal(null)}
              onImport={() => setActiveModal(null)}
            />
          )}
        </div>
      ) : null}
      <ConfirmationDialog
        isOpen={studentToDelete !== null}
        title="Delete Student"
        message={
          studentToDelete
            ? `Are you sure you want to delete ${studentToDelete[0]}?`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            setStudents((current) =>
              current.filter((student) => student[2] !== studentToDelete[2]),
            );
          }
          setStudentToDelete(null);
        }}
      />
    </section>
  );
}
