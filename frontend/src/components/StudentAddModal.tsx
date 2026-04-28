import { useEffect, useState } from "react";
import { CloseIcon } from "./Icons";
import type { CreateStudentInput, StudentLookupData } from "../students";

interface StudentAddModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  lookups: StudentLookupData;
  onClose: () => void;
  onAdd: (input: CreateStudentInput) => Promise<void>;
  onSubmitError?: (message: string) => void;
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

export function StudentAddModal({
  isOpen,
  isSubmitting = false,
  lookups,
  onClose,
  onAdd,
  onSubmitError,
}: StudentAddModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState(getDefaultCourseId(lookups));
  const [yearLevelId, setYearLevelId] = useState(getDefaultYearLevelId(lookups));
  const [sectionId, setSectionId] = useState(getDefaultSectionId(lookups));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFirstName("");
    setLastName("");
    setEmail("");
    setCourseId(getDefaultCourseId(lookups));
    setYearLevelId(getDefaultYearLevelId(lookups));
    setSectionId(getDefaultSectionId(lookups));
    setError("");
  }, [isOpen, lookups]);

  if (!isOpen) {
    return null;
  }

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
      await onAdd({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        courseId,
        yearLevelId,
        sectionId,
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to add student.";
      onSubmitError?.(message);
    }
  }

  return (
    <div
      className="student-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="student-modal__header">
        <h2 className="student-modal__title" id="add-student-title">
          Add New Student
        </h2>
        <button
          className="student-modal__close"
          type="button"
          aria-label="Close add student modal"
          onClick={onClose}
        >
          <CloseIcon className="student-modal__close-icon" />
        </button>
      </div>

      <div className="student-modal__form student-modal__form--add">
        <label className="student-modal__field">
          <span className="student-modal__label">First Name</span>
          <input
            className="student-modal__input"
            type="text"
            placeholder="e.g. Alice"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </label>

        <label className="student-modal__field">
          <span className="student-modal__label">Last Name</span>
          <input
            className="student-modal__input"
            type="text"
            placeholder="e.g. Johnson"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </label>

        <label className="student-modal__field student-modal__field--full">
          <span className="student-modal__label">Email</span>
          <input
            className="student-modal__input"
            type="email"
            placeholder="student@school.edu"
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
          {isSubmitting ? "Adding..." : "Add Student"}
        </button>
      </div>
    </div>
  );
}
