import { useMemo, useState } from "react";
import {
  ActivityIcon,
  CheckCircleIcon,
  CloseIcon,
  CourseIcon,
  MailIcon,
  PlusIcon,
  SectionIcon,
  UserAddIcon,
  YearLevelIcon,
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

export function EditTeacherModal({
  isOpen,
  onClose,
  teacher,
}: EditTeacherModalProps) {
  const [assignedClasses, setAssignedClasses] = useState(["BSIS • 1st Year - A"]);

  const parsedAssignedClass = useMemo(() => {
    if (!teacher) {
      return {
        course: "BSIS",
        section: "A",
        year: "1st Year",
      };
    }

    const [course = "BSIS", year = "1st Year", section = "A"] = teacher.assignedClass
      .split(" - ")
      .map((item) => item.trim());

    return { course, section, year };
  }, [teacher]);

  if (!isOpen || !teacher) {
    return null;
  }

  return (
    <div className="student-modal-backdrop" role="presentation" onClick={onClose}>
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

          <div className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">
              Assigned Classes <span className="teacher-modal__required">*</span>{" "}
              <span className="edit-teacher-modal__helper">Add one or more</span>
            </span>

            <div className="edit-teacher-modal__class-box">
              <div className="edit-teacher-modal__class-grid">
                <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
                  <CourseIcon className="teacher-modal__input-icon" />
                  <select className="teacher-modal__select" defaultValue={parsedAssignedClass.course}>
                    <option>BSIS</option>
                    <option>BSOM</option>
                    <option>BSAIS</option>
                    <option>ACT</option>
                  </select>
                </span>

                <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
                  <YearLevelIcon className="teacher-modal__input-icon" />
                  <select className="teacher-modal__select" defaultValue={parsedAssignedClass.year}>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </span>

                <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
                  <SectionIcon className="teacher-modal__input-icon" />
                  <select className="teacher-modal__select" defaultValue={parsedAssignedClass.section}>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </span>

                <button
                  className="button button--primary edit-teacher-modal__add-button"
                  type="button"
                  onClick={() => {
                    const nextTag = `${parsedAssignedClass.course} • ${parsedAssignedClass.year} - ${parsedAssignedClass.section}`;
                    setAssignedClasses((current) =>
                      current.includes(nextTag) ? current : [...current, nextTag],
                    );
                  }}
                >
                  <PlusIcon className="button__icon" />
                  Add
                </button>
              </div>

              <div className="edit-teacher-modal__chips">
                {assignedClasses.map((item) => (
                  <button
                    key={item}
                    className="edit-teacher-modal__chip"
                    type="button"
                    onClick={() =>
                      setAssignedClasses((current) => current.filter((entry) => entry !== item))
                    }
                  >
                    <span>{item}</span>
                    <CloseIcon className="edit-teacher-modal__chip-icon" />
                  </button>
                ))}
              </div>
            </div>
          </div>

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
