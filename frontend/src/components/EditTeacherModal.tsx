import { useEffect, useState } from "react";
import {
  TeacherAssignedClassesEditor,
  type TeacherAssignedClass,
} from "./TeacherAssignedClassesEditor";
import type {
  TeacherLookupData,
  TeacherRecord,
  TeacherStatus,
  UpdateTeacherInput,
} from "../teachers";
import {
  ActivityIcon,
  CheckCircleIcon,
  CloseIcon,
  MailIcon,
  UserAddIcon,
} from "./Icons";

type EditTeacherModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  lookups: TeacherLookupData;
  onClose: () => void;
  onSubmit: (input: UpdateTeacherInput) => Promise<void>;
  onSubmitError?: (message: string) => void;
  teacher: TeacherRecord | null;
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

export function EditTeacherModal({
  isOpen,
  isSubmitting = false,
  lookups,
  onClose,
  onSubmit,
  onSubmitError,
  teacher,
}: EditTeacherModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<TeacherStatus>("Active");
  const [assignedClasses, setAssignedClasses] = useState<TeacherAssignedClass[]>([]);
  const [draft, setDraft] = useState<TeacherAssignedClass>(createDefaultDraft(lookups));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teacher || !isOpen) {
      return;
    }

    setFullName(teacher.fullName);
    setEmail(teacher.email);
    setStatus(teacher.status);
    setAssignedClasses(
      teacher.assignedClasses.map((item) => ({
        subject: item.subject,
        courseId: item.course.id,
        yearLevelId: item.yearLevel.id,
        sectionId: item.section.id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      })),
    );
    setDraft(createDefaultDraft(lookups));
    setError("");
  }, [isOpen, lookups, teacher]);

  if (!isOpen || !teacher) {
    return null;
  }

  const currentTeacher = teacher;

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
      subject: lookups.subjects[0]?.name ?? "",
    }));
    setError("");
  }

  async function handleSubmit() {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName === "" || trimmedEmail === "") {
      setError("Full name and email address are required.");
      return;
    }

    if (assignedClasses.length === 0) {
      setError("Add at least one assigned class and schedule.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        teacherId: currentTeacher.id,
        fullName: trimmedName,
        email: trimmedEmail,
        status,
        assignedClasses,
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to update teacher.";
      onSubmitError?.(message);
    }
  }

  return (
    <div
      className="student-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="student-modal edit-teacher-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-teacher-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edit-teacher-modal__header">
          <div className="edit-teacher-modal__identity">
            <div className="avatar avatar--photo edit-teacher-modal__avatar">
              {currentTeacher.fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((name) => name[0])
                .join("")}
            </div>
            <div>
              <h2 className="student-modal__title" id="edit-teacher-title">
                Edit Teacher
              </h2>
              <div className="edit-teacher-modal__id">ID: {currentTeacher.teacherId}</div>
            </div>
          </div>

          <button
            className="student-modal__close"
            type="button"
            aria-label="Close edit teacher modal"
            onClick={onClose}
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="edit-teacher-modal__body">
          <label className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">
              Full Name <span className="teacher-modal__required">*</span>
            </span>
            <span className="teacher-modal__input-wrap">
              <UserAddIcon className="teacher-modal__input-icon" />
              <input
                className="teacher-modal__input"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </span>
          </label>

          <label className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">
              Email Address <span className="teacher-modal__required">*</span>
            </span>
            <span className="teacher-modal__input-wrap">
              <MailIcon className="teacher-modal__input-icon" />
              <input
                className="teacher-modal__input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>

          <TeacherAssignedClassesEditor
            assignedClasses={assignedClasses}
            draft={draft}
            lookups={lookups}
            onAddClass={handleAddClass}
            onDraftChange={updateDraft}
            onRemoveClass={(index) =>
              setAssignedClasses((current) =>
                current.filter((_, itemIndex) => itemIndex !== index),
              )
            }
          />

          <label className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">Status</span>
            <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
              <ActivityIcon className="teacher-modal__input-icon" />
              <select
                className="teacher-modal__select"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TeacherStatus)
                }
              >
                {lookups.statuses.map((option) => (
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
