import { CloseIcon } from "./Icons";

type StudentRow = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

interface StudentEditModalProps {
  studentToEdit: StudentRow | null;
  onClose: () => void;
  onSave: () => void;
}

export function StudentEditModal({
  studentToEdit,
  onClose,
  onSave,
}: StudentEditModalProps) {
  if (!studentToEdit) return null;

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
              className="student-modal__input student-modal__input--focus"
              type="text"
              defaultValue={studentToEdit?.[0].split(" ")[0] || ""}
            />
          </label>

          <label className="student-modal__field">
            <span className="student-modal__label">Last Name</span>
            <input
              className="student-modal__input"
              type="text"
              defaultValue={
                studentToEdit?.[0].split(" ").slice(1).join(" ") || ""
              }
            />
          </label>
        </div>

        <label className="student-modal__field student-modal__field--full">
          <span className="student-modal__label">Email</span>
          <input
            className="student-modal__input"
            type="email"
            defaultValue={studentToEdit?.[1] || ""}
          />
        </label>

        <label className="student-modal__field student-modal__field--full">
          <span className="student-modal__label">Course</span>
          <select
            className="student-modal__select"
            defaultValue={studentToEdit?.[3] || ""}
          >
            <option value="" disabled>
              Select a course
            </option>
            <option>BSIS</option>
            <option>BSOM</option>
            <option>BSCA</option>
            <option>BSAIS</option>
            <option>ACT</option>
          </select>
        </label>

        <div className="student-modal__row">
          <label className="student-modal__field">
            <span className="student-modal__label">Year Level</span>
            <select
              className="student-modal__select"
              defaultValue={studentToEdit?.[4] || ""}
            >
              <option value="" disabled>
                Year
              </option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </label>

          <label className="student-modal__field">
            <span className="student-modal__label">Section</span>
            <select
              className="student-modal__select"
              defaultValue={studentToEdit?.[5] || ""}
            >
              <option value="" disabled>
                Section
              </option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </label>
        </div>
      </div>

      <div className="student-modal__actions">
        <button
          className="button button--secondary student-modal__button-light"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="button button--primary student-modal__button-dark"
          type="button"
          onClick={onSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
