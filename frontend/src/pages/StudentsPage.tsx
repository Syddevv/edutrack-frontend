import { useEffect, useMemo, useState } from "react";
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
import {
  createStudent,
  deleteStudent,
  getStudents,
  importStudents,
  type ImportStudentsResult,
  type StudentLookupData,
  type StudentRecord,
  updateStudent,
} from "../students";

const emptyLookups: StudentLookupData = {
  courses: [],
  yearLevels: [],
  sections: [],
};

const STUDENTS_PER_PAGE = 10;

function getStatusTone(status: StudentRecord["attendanceStatus"]) {
  if (status === "No Record") {
    return null;
  }

  return status.toLowerCase();
}

export function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [lookups, setLookups] = useState<StudentLookupData>(emptyLookups);
  const [activeModal, setActiveModal] = useState<
    "add" | "import" | "edit" | null
  >(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(
    null,
  );
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [selectedYearLevelId, setSelectedYearLevelId] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isImportSubmitting, setIsImportSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    void loadStudents();
  }, []);

  async function loadStudents() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getStudents();
      setStudents(response.students);
      setLookups(response.lookups);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load students.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const searchableText = [
        student.fullName,
        student.email,
        student.studentId,
        student.course.code ?? student.course.name,
        student.yearLevel.name,
        student.section.name,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = query === "" || searchableText.includes(query);
      const matchesCourse =
        selectedCourseId === 0 || student.course.id === selectedCourseId;
      const matchesYear =
        selectedYearLevelId === 0 ||
        student.yearLevel.id === selectedYearLevelId;
      const matchesSection =
        selectedSectionId === 0 || student.section.id === selectedSectionId;

      return matchesSearch && matchesCourse && matchesYear && matchesSection;
    });
  }, [
    searchTerm,
    selectedCourseId,
    selectedYearLevelId,
    selectedSectionId,
    students,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCourseId,
    selectedYearLevelId,
    selectedSectionId,
    students.length,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE),
  );
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);
  }, [currentPage, filteredStudents]);

  async function handleCreateStudent(
    input: Parameters<typeof createStudent>[0],
  ) {
    setIsAddSubmitting(true);

    try {
      await createStudent(input);
      await loadStudents();
      setActiveModal(null);
    } finally {
      setIsAddSubmitting(false);
    }
  }

  async function handleEditStudent(input: Parameters<typeof updateStudent>[0]) {
    setIsEditSubmitting(true);

    try {
      await updateStudent(input);
      await loadStudents();
      setActiveModal(null);
      setStudentToEdit(null);
    } finally {
      setIsEditSubmitting(false);
    }
  }

  async function handleDeleteStudent() {
    if (!studentToDelete) {
      return;
    }

    setIsDeleteSubmitting(true);

    try {
      await deleteStudent(studentToDelete.id);
      await loadStudents();
      setStudentToDelete(null);
    } finally {
      setIsDeleteSubmitting(false);
    }
  }

  async function handleImportStudents(
    file: File,
  ): Promise<ImportStudentsResult> {
    setIsImportSubmitting(true);

    try {
      const result = await importStudents(file);
      await loadStudents();
      setActiveModal(null);
      setPageError(
        result.errors.length > 0
          ? `Imported ${result.importedCount} student(s), skipped ${result.skippedCount}. ${result.errors[0]}`
          : "",
      );
      return result;
    } finally {
      setIsImportSubmitting(false);
    }
  }

  return (
    <section className="page students-page">
      <div className="students-page__header">
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
              <strong>{filteredStudents.length}</strong>
            </div>
          </div>
        </header>

        <section className="panel panel--toolbar">
          <div className="toolbar">
            <label className="search-field search-field--wide">
              <SearchIcon className="search-field__icon" />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="toolbar__actions">
              <select
                className="select-like students-select"
                value={selectedCourseId}
                onChange={(event) =>
                  setSelectedCourseId(Number(event.target.value))
                }
              >
                <option value={0}>All Courses</option>
                {lookups.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code ?? course.name}
                  </option>
                ))}
              </select>
              <select
                className="select-like students-select"
                value={selectedYearLevelId}
                onChange={(event) =>
                  setSelectedYearLevelId(Number(event.target.value))
                }
              >
                <option value={0}>All Years</option>
                {lookups.yearLevels.map((yearLevel) => (
                  <option key={yearLevel.id} value={yearLevel.id}>
                    {yearLevel.name}
                  </option>
                ))}
              </select>
              <select
                className="select-like students-select"
                value={selectedSectionId}
                onChange={(event) =>
                  setSelectedSectionId(Number(event.target.value))
                }
              >
                <option value={0}>All Sections</option>
                {lookups.sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
              <button
                className="icon-button students-refresh-button"
                type="button"
                aria-label="Refresh"
                onClick={() => void loadStudents()}
              >
                <RefreshIcon className="button__icon" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="panel students-page__table-panel">
        {pageError ? <p className="login-card__error">{pageError}</p> : null}

        {isLoading ? (
          <p className="page-subtitle">Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="page-subtitle">No students found.</p>
        ) : (
          <div className="students-page__table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>STUDENT ID</th>
                  <th>COURSE</th>
                  <th>YEAR</th>
                  <th>SECTION</th>
                  <th>LATEST STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="table-stack">
                        <div className="person__name">{student.fullName}</div>
                        <div className="person__meta">{student.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="data-badge font-data">
                        {student.studentId}
                      </span>
                    </td>
                    <td>
                      <span className="soft-badge">
                        {student.course.code ?? student.course.name}
                      </span>
                    </td>
                    <td>{student.yearLevel.name}</td>
                    <td>{student.section.name}</td>
                    <td>
                      {getStatusTone(student.attendanceStatus) ? (
                        <span
                          className={`status-chip status-chip--${getStatusTone(student.attendanceStatus)}`}
                        >
                          {student.attendanceStatus}
                        </span>
                      ) : (
                        <span className="data-badge">
                          {student.attendanceStatus}
                        </span>
                      )}
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
          </div>
        )}
        {!isLoading && filteredStudents.length > 0 ? (
          <div className="table-footer students-page__footer">
            <span>
              Showing {(currentPage - 1) * STUDENTS_PER_PAGE + 1}-
              {Math.min(
                currentPage * STUDENTS_PER_PAGE,
                filteredStudents.length,
              )}{" "}
              of {filteredStudents.length}
            </span>
            <div className="pagination">
              <button
                className="button button--secondary button--small"
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
        ) : null}
      </section>

      {activeModal ? (
        <div
          className="student-modal-backdrop"
          role="presentation"
          onClick={() => setActiveModal(null)}
        >
          {activeModal === "add" && (
            <StudentAddModal
              isOpen
              isSubmitting={isAddSubmitting}
              lookups={lookups}
              onClose={() => setActiveModal(null)}
              onAdd={handleCreateStudent}
            />
          )}
          {activeModal === "edit" && (
            <StudentEditModal
              isSubmitting={isEditSubmitting}
              lookups={lookups}
              studentToEdit={studentToEdit}
              onClose={() => {
                setActiveModal(null);
                setStudentToEdit(null);
              }}
              onSave={handleEditStudent}
            />
          )}
          {activeModal === "import" && (
            <StudentImportModal
              isSubmitting={isImportSubmitting}
              onClose={() => setActiveModal(null)}
              onImport={handleImportStudents}
            />
          )}
        </div>
      ) : null}
      <ConfirmationDialog
        isOpen={studentToDelete !== null}
        title="Delete Student"
        message={
          studentToDelete
            ? `Are you sure you want to delete ${studentToDelete.fullName}?`
            : ""
        }
        confirmLabel={isDeleteSubmitting ? "Deleting..." : "Delete"}
        tone="danger"
        onCancel={() => setStudentToDelete(null)}
        onConfirm={() => void handleDeleteStudent()}
      />
    </section>
  );
}
