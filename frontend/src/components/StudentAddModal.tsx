import { CloseIcon } from "./Icons";

interface StudentAddModalProps {
  onClose: () => void;
  onAdd: () => void;
}

export function StudentAddModal({ onClose, onAdd }: StudentAddModalProps) {
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
            className="student-modal__input student-modal__input--focus"
            type="text"
            placeholder="e.g. Alice"
          />
        </label>

        <label className="student-modal__field">
          <span className="student-modal__label">Last Name</span>
          <input
            className="student-modal__input"
            type="text"
            placeholder="e.g. Johnson"
          />
        </label>

        <label className="student-modal__field student-modal__field--full">
          <span className="student-modal__label">Email</span>
          <input
            className="student-modal__input"
            type="email"
            placeholder="student@school.edu"
          />
        </label>

        <label className="student-modal__field student-modal__field--full">
          <span className="student-modal__label">Course</span>
          <select className="student-modal__select" defaultValue="">
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

        <label className="student-modal__field">
          <span className="student-modal__label">Year Level</span>
          <select className="student-modal__select" defaultValue="">
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
          <select className="student-modal__select" defaultValue="">
            <option value="" disabled>
              Section
            </option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>
        </label>
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
          onClick={onAdd}
        >
          Add Student
        </button>
      </div>
    </div>
  );
}
