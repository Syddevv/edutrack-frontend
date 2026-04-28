import { useEffect, useMemo, useState } from "react";
import { StatusModal } from "../components/StatusModal";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "../components/Icons";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import {
  getTeacherAttendance,
  saveTeacherAttendance,
  type AttendanceStatus,
  type TeacherAttendanceAssignment,
  type TeacherAttendanceStudent,
} from "../teacherAttendance";

const statusOptions: AttendanceStatus[] = ["Present", "Late", "Absent"];

function getTodayDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function uniqueById<T extends { id: number }>(items: T[]) {
  const seen = new Set<number>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

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
  const [feedback, setFeedback] = useState<{
    message: string;
    title: string;
    tone: "success" | "error";
  } | null>(null);
  const [assignments, setAssignments] = useState<TeacherAttendanceAssignment[]>(
    [],
  );
  const [students, setStudents] = useState<TeacherAttendanceStudent[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAction, setSaveAction] = useState<"save" | "reset">("save");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    void loadAttendance(selectedDate, selectedClassId ?? undefined);
  }, [selectedDate, selectedClassId]);

  async function loadAttendance(date: string, classId?: number) {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getTeacherAttendance(date, classId);
      setAssignments(response.assignments);
      setStudents(response.students);
      setSelectedDate(response.date);
      setSelectedClassId((current) =>
        current === response.selectedClassId
          ? current
          : response.selectedClassId,
      );
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load attendance.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const selectedAssignment = useMemo(
    () =>
      assignments.find(
        (assignment) => assignment.classId === selectedClassId,
      ) ?? null,
    [assignments, selectedClassId],
  );

  const courseOptions = useMemo(
    () => uniqueById(assignments.map((assignment) => assignment.course)),
    [assignments],
  );

  const yearOptions = useMemo(() => {
    const filteredAssignments = selectedAssignment
      ? assignments.filter(
          (assignment) => assignment.course.id === selectedAssignment.course.id,
        )
      : assignments;

    return uniqueById(
      filteredAssignments.map((assignment) => assignment.yearLevel),
    );
  }, [assignments, selectedAssignment]);

  const sectionOptions = useMemo(() => {
    const filteredAssignments = selectedAssignment
      ? assignments.filter(
          (assignment) =>
            assignment.course.id === selectedAssignment.course.id &&
            assignment.yearLevel.id === selectedAssignment.yearLevel.id,
        )
      : assignments;

    return uniqueById(
      filteredAssignments.map((assignment) => assignment.section),
    );
  }, [assignments, selectedAssignment]);

  const summary = useMemo(() => {
    const present = students.filter(
      (student) => student.status === "Present",
    ).length;
    const late = students.filter((student) => student.status === "Late").length;
    const absent = students.filter(
      (student) => student.status === "Absent",
    ).length;
    const marked = students.filter((student) => student.status !== null).length;

    return { present, late, absent, total: students.length, marked };
  }, [students]);

  function chooseAssignment(nextValues: {
    courseId?: number;
    yearLevelId?: number;
    sectionId?: number;
  }) {
    if (assignments.length === 0) {
      return;
    }

    const currentCourseId =
      nextValues.courseId ?? selectedAssignment?.course.id;
    const currentYearLevelId =
      nextValues.yearLevelId ?? selectedAssignment?.yearLevel.id;
    const currentSectionId =
      nextValues.sectionId ?? selectedAssignment?.section.id;

    const exactMatch = assignments.find(
      (assignment) =>
        assignment.course.id === currentCourseId &&
        assignment.yearLevel.id === currentYearLevelId &&
        assignment.section.id === currentSectionId,
    );

    const courseYearMatch = assignments.find(
      (assignment) =>
        assignment.course.id === currentCourseId &&
        assignment.yearLevel.id === currentYearLevelId,
    );

    const courseMatch = assignments.find(
      (assignment) => assignment.course.id === currentCourseId,
    );

    const fallback =
      exactMatch ?? courseYearMatch ?? courseMatch ?? assignments[0];

    setSelectedClassId(fallback?.classId ?? null);
  }

  function updateStatus(studentId: number, status: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );
  }

  async function submitAttendance(
    records: TeacherAttendanceStudent[],
    successMessage: string,
    action: "save" | "reset",
  ) {
    if (selectedClassId === null) {
      return;
    }

    setIsSaving(true);
    setSaveAction(action);
    setPageError("");

    try {
      const response = await saveTeacherAttendance({
        classId: selectedClassId,
        date: selectedDate,
        records: records.map((student) => ({
          studentId: student.id,
          status: student.status,
        })),
      });

      setAssignments(response.assignments);
      setStudents(response.students);
      setSelectedDate(response.date);
      setSelectedClassId(response.selectedClassId);
      setFeedback({
        title: action === "reset" ? "Attendance Reset" : "Attendance Saved",
        message: successMessage,
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        title: "Save Failed",
        message:
          error instanceof Error ? error.message : "Failed to save attendance.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
      setSaveAction("save");
    }
  }

  async function handleSave() {
    await submitAttendance(students, "Attendance saved successfully.", "save");
  }

  async function handleReset() {
    await submitAttendance(
      students.map((student) => ({ ...student, status: null })),
      "Attendance reset successfully.",
      "reset",
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
              Record daily attendance for your assigned class section.
            </p>
            {selectedAssignment ? (
              <p className="page-subtitle teacher-attendance-subtitle">
                {selectedAssignment.subject} • {selectedAssignment.startTime} -{" "}
                {selectedAssignment.endTime}
              </p>
            ) : null}
          </div>

          <div className="teacher-attendance-filters">
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Course</span>
              <select
                className="teacher-attendance-select"
                value={selectedAssignment?.course.id ?? ""}
                disabled={assignments.length === 0 || isLoading}
                onChange={(event) =>
                  chooseAssignment({ courseId: Number(event.target.value) })
                }
              >
                {courseOptions.length === 0 ? (
                  <option value="">No assignment</option>
                ) : (
                  courseOptions.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code || course.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Year</span>
              <select
                className="teacher-attendance-select"
                value={selectedAssignment?.yearLevel.id ?? ""}
                disabled={assignments.length === 0 || isLoading}
                onChange={(event) =>
                  chooseAssignment({ yearLevelId: Number(event.target.value) })
                }
              >
                {yearOptions.length === 0 ? (
                  <option value="">No assignment</option>
                ) : (
                  yearOptions.map((yearLevel) => (
                    <option key={yearLevel.id} value={yearLevel.id}>
                      {yearLevel.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Section</span>
              <select
                className="teacher-attendance-select"
                value={selectedAssignment?.section.id ?? ""}
                disabled={assignments.length === 0 || isLoading}
                onChange={(event) =>
                  chooseAssignment({ sectionId: Number(event.target.value) })
                }
              >
                {sectionOptions.length === 0 ? (
                  <option value="">No assignment</option>
                ) : (
                  sectionOptions.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="teacher-attendance-filter">
              <span className="teacher-attendance-filter__label">Date</span>
              <div className="teacher-attendance-date-field">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                  }}
                />
                <CalendarIcon />
              </div>
            </label>
          </div>
        </header>

        {pageError ? <p className="login-card__error">{pageError}</p> : null}

        <div className="teacher-attendance-summary">
          <article className="teacher-attendance-summary-card">
            <div className="teacher-attendance-summary-card__icon teacher-attendance-summary-card__icon--present">
              <CheckCircleIcon className="stat-card__icon" />
            </div>
            <div>
              <p className="teacher-attendance-summary-card__label">Present</p>
              <p className="teacher-attendance-summary-card__value">
                {summary.present}
              </p>
            </div>
          </article>

          <article className="teacher-attendance-summary-card">
            <div className="teacher-attendance-summary-card__icon teacher-attendance-summary-card__icon--late">
              <ClockIcon className="stat-card__icon" />
            </div>
            <div>
              <p className="teacher-attendance-summary-card__label">Late</p>
              <p className="teacher-attendance-summary-card__value">
                {summary.late}
              </p>
            </div>
          </article>

          <article className="teacher-attendance-summary-card">
            <div className="teacher-attendance-summary-card__icon teacher-attendance-summary-card__icon--absent">
              <XCircleIcon className="stat-card__icon" />
            </div>
            <div>
              <p className="teacher-attendance-summary-card__label">Absent</p>
              <p className="teacher-attendance-summary-card__value">
                {summary.absent}
              </p>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="page-subtitle">
                      Loading attendance...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="teacher-attendance-student">
                          <StudentAvatar name={student.fullName} />
                          <span className="teacher-attendance-student__name">
                            {student.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="font-data teacher-attendance-id">
                        {student.studentId}
                      </td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="page-subtitle">
                      {assignments.length === 0
                        ? "No assigned classes found."
                        : "No students found for this class."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="teacher-attendance-footer">
        <p className="teacher-attendance-footer__meta">
          {summary.marked} of {summary.total} students marked
        </p>
        <div className="teacher-attendance-footer__actions">
          <button
            className="button button--secondary teacher-attendance-footer__button"
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={
              isLoading ||
              isSaving ||
              selectedClassId === null ||
              assignments.length === 0
            }
          >
            {isSaving && saveAction === "reset"
              ? "Resetting..."
              : "Reset Attendance"}
          </button>
          <button
            className="button button--primary teacher-attendance-footer__button teacher-attendance-footer__button--save"
            type="button"
            onClick={() => void handleSave()}
            disabled={
              isLoading ||
              isSaving ||
              selectedClassId === null ||
              assignments.length === 0
            }
          >
            <SaveIcon />
            {isSaving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </footer>

      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title="Reset Attendance"
        message="Clear all attendance records for the selected class and date?"
        confirmLabel="Reset Attendance"
        tone="danger"
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          setIsResetConfirmOpen(false);
          void handleReset();
        }}
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
