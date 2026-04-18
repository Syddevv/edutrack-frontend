import { useRef, useState } from "react";
import { CheckCircleIcon, CloseIcon, UploadIcon } from "./Icons";
import type { ImportStudentsResult } from "../students";

interface StudentImportModalProps {
  isSubmitting?: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportStudentsResult>;
}

export function StudentImportModal({
  isSubmitting = false,
  onClose,
  onImport,
}: StudentImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  function handleFileSelect(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFile(null);
      setError("Please select a valid CSV file.");
      return;
    }

    setSelectedFile(file);
    setError("");
    setSummary("");
  }

  async function handleImport() {
    if (!selectedFile) {
      setError("Select a CSV file first.");
      return;
    }

    setError("");

    try {
      const result = await onImport(selectedFile);
      setSummary(
        `Imported ${result.importedCount} student${result.importedCount === 1 ? "" : "s"}${result.skippedCount > 0 ? `, skipped ${result.skippedCount}` : ""}.`,
      );

      if (result.errors.length > 0) {
        setError(result.errors.slice(0, 3).join(" "));
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Import failed.");
    }
  }

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
          Course may use code or name. Year may use values like 1 or 1st Year.
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(event) => handleFileSelect(event.target.files)}
      />

      <button
        className="student-modal__dropzone"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFileSelect(event.dataTransfer.files);
        }}
      >
        <span className="student-modal__dropzone-icon">
          <UploadIcon className="student-modal__dropzone-icon-svg" />
        </span>
        <span className="student-modal__dropzone-title">
          {selectedFile ? selectedFile.name : "Click to upload CSV"}
        </span>
        <span className="student-modal__dropzone-text">
          {selectedFile
            ? `${Math.max(1, Math.round(selectedFile.size / 1024))} KB selected`
            : "or drag and drop your file here"}
        </span>
      </button>

      {summary ? <p className="student-modal__notice-text">{summary}</p> : null}
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
          className="button button--primary student-modal__button-dark student-modal__button-dark--icon"
          type="button"
          onClick={() => void handleImport()}
          disabled={isSubmitting}
        >
          <CheckCircleIcon className="student-modal__button-icon" />
          {isSubmitting ? "Importing..." : "Import Students"}
        </button>
      </div>
    </div>
  );
}
