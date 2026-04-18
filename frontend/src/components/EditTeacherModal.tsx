import { useEffect, useState } from "react";
import {
  TeacherAssignedClassesEditor,
  type TeacherAssignedClass,
} from "./TeacherAssignedClassesEditor";
import {
  ActivityIcon,
  CheckCircleIcon,
  CloseIcon,
  MailIcon,
  UserAddIcon,
} from "./Icons";

export type EditTeacherData = {
  assignedClass: string;
  email: string;
  id: string;
  name: string;
  status: string;
};

type EditTeacherModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teacher: EditTeacherData | null;
};

const defaultDraft: TeacherAssignedClass = {
  subject: "General",
  course: "BSIS",
  year: "1st Year",
  section: "A",
  startTime: "08:00 AM",
  endTime: "09:30 AM",
};

function parseAssignedClass(assignedClass: string): TeacherAssignedClass {
  const parts = assignedClass.split(" - ").map((item) => item.trim());
  return {
    subject: "General",
    course: parts[0] ?? defaultDraft.course,
    year: parts[1] ?? defaultDraft.year,
    section: parts[2] ?? defaultDraft.section,
    startTime: defaultDraft.startTime,
    endTime: defaultDraft.endTime,
  };
}

export function EditTeacherModal({
  isOpen,
  onClose,
  teacher,
}: EditTeacherModalProps) {
  const [assignedClasses, setAssignedClasses] = useState<
    TeacherAssignedClass[]
  >([]);
  const [draft, setDraft] = useState<TeacherAssignedClass>(defaultDraft);

  useEffect(() => {
    if (teacher && isOpen) {
      const parsed = parseAssignedClass(teacher.assignedClass);
      setDraft(parsed);
      setAssignedClasses([parsed]);
    }
  }, [isOpen, teacher]);

  if (!isOpen || !teacher) {
    return null;
  }

  function updateDraft(field: keyof TeacherAssignedClass, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleAddClass() {
    if (!draft.subject.trim()) {
      return;
    }

    setAssignedClasses((current) => [
      ...current,
      { ...draft, subject: draft.subject.trim() },
    ]);
    setDraft((current) => ({ ...current, subject: "" }));
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
              {teacher.name
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </div>
            <div>
              <h2 className="student-modal__title" id="edit-teacher-title">
                Edit Teacher
              </h2>
              <div className="edit-teacher-modal__id">ID: {teacher.id}</div>
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
                defaultValue={teacher.name}
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
                defaultValue={teacher.email}
              />
            </span>
          </label>

          <TeacherAssignedClassesEditor
            assignedClasses={assignedClasses}
            draft={draft}
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
                defaultValue={teacher.status}
              >
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
