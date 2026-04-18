import { useState } from "react";
import { TeacherAssignedClassesEditor, type TeacherAssignedClass } from "./TeacherAssignedClassesEditor";
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
  onClose: () => void;
};

const defaultDraft: TeacherAssignedClass = {
  subject: "",
  course: "BSIS",
  year: "1st Year",
  section: "A",
  startTime: "08:00 AM",
  endTime: "09:30 AM",
};

export function TeacherAddModal({ isOpen, onClose }: TeacherAddModalProps) {
  const [assignedClasses, setAssignedClasses] = useState<TeacherAssignedClass[]>([]);
  const [draft, setDraft] = useState<TeacherAssignedClass>(defaultDraft);

  if (!isOpen) {
    return null;
  }

  function updateDraft(field: keyof TeacherAssignedClass, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleAddClass() {
    if (!draft.subject.trim()) {
      return;
    }

    setAssignedClasses((current) => [...current, { ...draft, subject: draft.subject.trim() }]);
    setDraft((current) => ({ ...current, subject: "" }));
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
                  defaultValue="password"
                />
              </span>
            </label>
          </div>

          <TeacherAssignedClassesEditor
            assignedClasses={assignedClasses}
            draft={draft}
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
              <select className="teacher-modal__select" defaultValue="Active">
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>
            </span>
          </label>
        </div>

        <div className="teacher-modal__footer">
          <button
            className="button button--secondary teacher-modal__footer-button"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button button--primary teacher-modal__footer-button teacher-modal__footer-button--primary"
            type="button"
          >
            <CheckCircleIcon className="student-modal__button-icon" />
            Save Teacher
          </button>
        </div>
      </div>
    </div>
  );
}
