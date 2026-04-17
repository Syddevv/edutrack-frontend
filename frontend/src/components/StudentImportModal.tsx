import { CheckCircleIcon, CloseIcon, UploadIcon } from "./Icons";

interface StudentImportModalProps {
  onClose: () => void;
  onImport: () => void;
}

export function StudentImportModal({
  onClose,
  onImport,
}: StudentImportModalProps) {
  return (
    <div
      className="student-modal student-modal--import"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-students-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="student-modal__header">
        <div>
          <h2 className="student-modal__title" id="import-students-title">
            Import Students from CSV
          </h2>
          <p className="student-modal__subtitle">
            Upload a CSV file to bulk-import students into the database.
          </p>
        </div>
        <button
          className="student-modal__close"
          type="button"
          aria-label="Close import students modal"
          onClick={onClose}
        >
          <CloseIcon className="student-modal__close-icon" />
        </button>
      </div>

      <div className="student-modal__notice">
        <div className="student-modal__notice-title">Required CSV columns:</div>
        <div className="student-modal__notice-code">
          first_name, last_name, email, course, year, section
        </div>
        <div className="student-modal__notice-text">
          Allowed courses: BSIS, BSOM, BSCA, BSAIS, ACT
        </div>
      </div>

      <button className="student-modal__dropzone" type="button">
        <span className="student-modal__dropzone-icon">
          <UploadIcon className="student-modal__dropzone-icon-svg" />
        </span>
        <span className="student-modal__dropzone-title">
          Click to upload CSV
        </span>
        <span className="student-modal__dropzone-text">
          or drag and drop your file here
        </span>
      </button>

      <div className="student-modal__actions">
        <button
          className="button button--secondary student-modal__button-light"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="button button--primary student-modal__button-dark student-modal__button-dark--icon"
          type="button"
          onClick={onImport}
        >
          <CheckCircleIcon className="student-modal__button-icon" />
          Import Students
        </button>
      </div>
    </div>
  );
}
