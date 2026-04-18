import { useEffect, useState } from "react";
import { CloseIcon } from "./Icons";
import type { StudentLookupData, StudentRecord, UpdateStudentInput } from "../students";

interface StudentEditModalProps {
  isSubmitting?: boolean;
  lookups: StudentLookupData;
  studentToEdit: StudentRecord | null;
  onClose: () => void;
  onSave: (input: UpdateStudentInput) => Promise<void>;
}

function getDefaultCourseId(lookups: StudentLookupData) {
  return lookups.courses[0]?.id ?? 0;
}

function getDefaultYearLevelId(lookups: StudentLookupData) {
  return lookups.yearLevels[0]?.id ?? 0;
}

function getDefaultSectionId(lookups: StudentLookupData) {
  return lookups.sections[0]?.id ?? 0;
}

export function StudentEditModal({
  isSubmitting = false,
  lookups,
  studentToEdit,
  onClose,
  onSave,
}: StudentEditModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState(getDefaultCourseId(lookups));
  const [yearLevelId, setYearLevelId] = useState(getDefaultYearLevelId(lookups));
  const [sectionId, setSectionId] = useState(getDefaultSectionId(lookups));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentToEdit) {
      return;
    }

    setFirstName(studentToEdit.firstName);
    setLastName(studentToEdit.lastName);
    setEmail(studentToEdit.email);
    setCourseId(studentToEdit.course.id || getDefaultCourseId(lookups));
    setYearLevelId(studentToEdit.yearLevel.id || getDefaultYearLevelId(lookups));
    setSectionId(studentToEdit.section.id || getDefaultSectionId(lookups));
    setError("");
  }, [lookups, studentToEdit]);

  if (!studentToEdit) return null;

  const currentStudent = studentToEdit;

  async function handleSubmit() {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedFirstName === "" || trimmedLastName === "" || trimmedEmail === "") {
      setError("First name, last name, and email are required.");
      return;
    }

    if (!courseId || !yearLevelId || !sectionId) {
      setError("Course, year level, and section are required.");
      return;
    }

    setError("");

    try {
      await onSave({
        studentId: currentStudent.id,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        courseId,
        yearLevelId,
        sectionId,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update student.");
    }
  }

  return (
    <div
      className="student-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-student-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="student-modal__header">
        <div>
          <h2 className="student-modal__title" id="edit-student-title">
            Edit Student
          </h2>
          <p className="student-modal__subtitle">
            Update the student's details below.
          </p>
        </div>
        <button
          className="student-modal__close"
          type="button"
          aria-label="Close edit student modal"
          onClick={onClose}
        >
          <CloseIcon className="student-modal__close-icon" />
        </button>
      </div>

      <div className="student-modal__form student-modal__form--edit">
        <div className="student-modal__row">
          <label className="student-modal__field">
            <span className="student-modal__label">First Name</span>
            <input
              className="student-modal__input"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </label>

          <label className="student-modal__field">
            <span className="student-modal__label">Last Name</span>
            <input
              className="student-modal__input"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </label>
        </div>

        <label className="student-modal__field student-modal__field--full">
          <span className="student-modal__label">Email</span>
          <input
            className="student-modal__input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="student-modal__field student-modal__field--full">
          <span className="student-modal__label">Course</span>
          <select
            className="student-modal__select"
            value={courseId}
            onChange={(event) => setCourseId(Number(event.target.value))}
          >
            {lookups.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code ?? course.name}
              </option>
            ))}
          </select>
        </label>

        <div className="student-modal__row">
          <label className="student-modal__field">
            <span className="student-modal__label">Year Level</span>
            <select
              className="student-modal__select"
              value={yearLevelId}
              onChange={(event) => setYearLevelId(Number(event.target.value))}
            >
              {lookups.yearLevels.map((yearLevel) => (
                <option key={yearLevel.id} value={yearLevel.id}>
                  {yearLevel.name}
                </option>
              ))}
            </select>
          </label>

          <label className="student-modal__field">
            <span className="student-modal__label">Section</span>
            <select
              className="student-modal__select"
              value={sectionId}
              onChange={(event) => setSectionId(Number(event.target.value))}
            >
              {lookups.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? <p className="login-card__error">{error}</p> : null}

      <div className="student-modal__actions">
        <button
          className="button button--secondary student-modal__button-light"
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="button button--primary student-modal__button-dark"
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
