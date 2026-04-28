import { useEffect, useMemo, useState } from "react";
import { TeacherAssignedClassesEditor, type TeacherAssignedClass } from "./TeacherAssignedClassesEditor";
import type { CreateTeacherInput, TeacherLookupData, TeacherStatus } from "../teachers";
import {
  ActivityIcon,
  CheckCircleIcon,
  CloseIcon,
  LockIcon,
  MailIcon,
  UserAddIcon,
} from "./Icons";

type TeacherAddModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  lookups: TeacherLookupData;
  onClose: () => void;
  onSubmit: (input: CreateTeacherInput) => Promise<void>;
  onSubmitError?: (message: string) => void;
};

const fallbackLookups: TeacherLookupData = {
  subjects: [],
  courses: [],
  yearLevels: [],
  sections: [],
  statuses: ["Active", "On Leave", "Inactive"],
};

function createDefaultDraft(lookups: TeacherLookupData): TeacherAssignedClass {
  return {
    subject: lookups.subjects[0]?.name ?? "",
    courseId: lookups.courses[0]?.id ?? 0,
    yearLevelId: lookups.yearLevels[0]?.id ?? 0,
    sectionId: lookups.sections[0]?.id ?? 0,
    dayOfWeek: "Monday",
    startTime: "08:00",
    endTime: "09:30",
  };
}

export function TeacherAddModal({
  isOpen,
  isSubmitting = false,
  lookups,
  onClose,
  onSubmit,
  onSubmitError,
}: TeacherAddModalProps) {
  const resolvedLookups = useMemo(
    () => ({
      subjects: lookups.subjects,
      courses: lookups.courses,
      yearLevels: lookups.yearLevels,
      sections: lookups.sections,
      statuses: lookups.statuses.length > 0 ? lookups.statuses : fallbackLookups.statuses,
    }),
    [lookups],
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<TeacherStatus>("Active");
  const [assignedClasses, setAssignedClasses] = useState<TeacherAssignedClass[]>([]);
  const [draft, setDraft] = useState<TeacherAssignedClass>(createDefaultDraft(resolvedLookups));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextDraft = createDefaultDraft(resolvedLookups);
    setFullName("");
    setEmail("");
    setPassword("password");
    setStatus("Active");
    setAssignedClasses([]);
    setDraft(nextDraft);
    setError("");
  }, [isOpen, resolvedLookups]);

  if (!isOpen) {
    return null;
  }

  function updateDraft(field: keyof TeacherAssignedClass, value: string | number) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleAddClass() {
    const subject = draft.subject.trim();

    if (subject === "") {
      setError("Subject is required before adding an assigned class.");
      return;
    }

    if (!draft.courseId || !draft.yearLevelId || !draft.sectionId) {
      setError("Course, year level, and section lookups must be loaded first.");
      return;
    }

    if (draft.startTime >= draft.endTime) {
      setError("Class end time must be later than the start time.");
      return;
    }

    setAssignedClasses((current) => [...current, { ...draft, subject }]);
    setDraft((current) => ({
      ...current,
      subject: resolvedLookups.subjects[0]?.name ?? "",
    }));
    setError("");
  }

  async function handleSubmit() {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName === "" || trimmedEmail === "" || password.trim() === "") {
      setError("Full name, email address, and password are required.");
      return;
    }

    if (assignedClasses.length === 0) {
      setError("Add at least one assigned class and schedule.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        status,
        assignedClasses,
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to save teacher.";
      onSubmitError?.(message);
    }
  }

  return (
    <div className="student-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="student-modal teacher-modal teacher-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-teacher-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="student-modal__header teacher-modal__header teacher-modal__header--bordered">
          <div>
            <h2 className="student-modal__title" id="add-teacher-title">
              Add New Teacher
            </h2>
            <p className="student-modal__subtitle">
              Enter details to register a teacher.
            </p>
          </div>
          <button
            className="student-modal__close"
            type="button"
            aria-label="Close add teacher modal"
            onClick={onClose}
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="teacher-modal__body">
          <label className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">
              Full Name <span className="teacher-modal__required">*</span>
            </span>
            <span className="teacher-modal__input-wrap">
              <UserAddIcon className="teacher-modal__input-icon" />
              <input
                className="teacher-modal__input"
                type="text"
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </span>
          </label>

          <div className="teacher-modal__grid">
            <label className="student-modal__field">
              <span className="student-modal__label">
                Email Address <span className="teacher-modal__required">*</span>
              </span>
              <span className="teacher-modal__input-wrap">
                <MailIcon className="teacher-modal__input-icon" />
                <input
                  className="teacher-modal__input"
                  type="email"
                  placeholder="jane@school.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <label className="student-modal__field">
              <span className="student-modal__label">
                Password <span className="teacher-modal__required">*</span>
              </span>
              <span className="teacher-modal__input-wrap">
                <LockIcon className="teacher-modal__input-icon" />
                <input
                  className="teacher-modal__input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </span>
            </label>
          </div>

          <TeacherAssignedClassesEditor
            assignedClasses={assignedClasses}
            draft={draft}
            helperText="Add one or more"
            lookups={resolvedLookups}
            onAddClass={handleAddClass}
            onDraftChange={updateDraft}
            onRemoveClass={(index) =>
              setAssignedClasses((current) => current.filter((_, itemIndex) => itemIndex !== index))
            }
          />

          <label className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">Status</span>
            <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
              <ActivityIcon className="teacher-modal__input-icon" />
              <select
                className="teacher-modal__select"
                value={status}
                onChange={(event) => setStatus(event.target.value as TeacherStatus)}
              >
                {resolvedLookups.statuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </span>
          </label>

          {error ? <p className="login-card__error">{error}</p> : null}
        </div>

        <div className="teacher-modal__footer">
          <button
            className="button button--secondary teacher-modal__footer-button"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="button button--primary teacher-modal__footer-button teacher-modal__footer-button--primary"
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            <CheckCircleIcon className="student-modal__button-icon" />
            {isSubmitting ? "Saving..." : "Save Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
}
