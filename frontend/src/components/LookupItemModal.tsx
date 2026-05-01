import { useEffect, useState } from "react";
import { CheckCircleIcon, CloseIcon, CourseIcon } from "./Icons";

type LookupItemModalProps = {
  initialValue?: {
    code: string;
    name: string;
  } | null;
  isOpen: boolean;
  isSubmitting: boolean;
  itemLabel: "Subject" | "Course";
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (value: { code: string; name: string }) => Promise<void> | void;
  onSubmitError: (message: string) => void;
};

export function LookupItemModal({
  initialValue = null,
  isOpen,
  isSubmitting,
  itemLabel,
  mode,
  onClose,
  onSubmit,
  onSubmitError,
}: LookupItemModalProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [code, setCode] = useState(initialValue?.code ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(initialValue?.name ?? "");
    setCode(initialValue?.code ?? "");
    setError("");
  }, [initialValue, isOpen]);

  if (!isOpen) {
    return null;
  }

  const title = mode === "create" ? `Add ${itemLabel}` : `Edit ${itemLabel}`;
  const submitLabel = mode === "create" ? `Save ${itemLabel}` : `Update ${itemLabel}`;

  return (
    <div className="student-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="student-modal lookup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lookup-item-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="student-modal__header">
          <div>
            <h2 className="student-modal__title" id="lookup-item-modal-title">
              {title}
            </h2>
            <p className="student-modal__subtitle">
              Keep {itemLabel.toLowerCase()} records aligned with the rest of the
              system.
            </p>
          </div>
          <button
            className="student-modal__close"
            type="button"
            aria-label={`Close ${title.toLowerCase()} modal`}
            onClick={onClose}
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <form
          className="student-modal__form lookup-modal__form"
          onSubmit={async (event) => {
            event.preventDefault();

            const trimmedName = name.trim();
            const trimmedCode = code.trim();

            if (trimmedName === "") {
              const message = `${itemLabel} name is required.`;
              setError(message);
              onSubmitError(message);
              return;
            }

            setError("");

            try {
              await onSubmit({
                name: trimmedName,
                code: trimmedCode,
              });
            } catch (submitError) {
              const message =
                submitError instanceof Error
                  ? submitError.message
                  : `Unable to save ${itemLabel.toLowerCase()}.`;
              setError(message);
              onSubmitError(message);
            }
          }}
        >
          <label className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">{itemLabel} Name</span>
            <span className="teacher-modal__input-wrap">
              <CourseIcon className="teacher-modal__input-icon" />
              <input
                className="teacher-modal__input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={`Enter ${itemLabel.toLowerCase()} name`}
              />
            </span>
          </label>

          <label className="student-modal__field student-modal__field--full">
            <span className="student-modal__label">Code</span>
            <span className="teacher-modal__input-wrap">
              <CourseIcon className="teacher-modal__input-icon" />
              <input
                className="teacher-modal__input font-data"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={`Enter ${itemLabel.toLowerCase()} code`}
              />
            </span>
          </label>

          {error ? <p className="login-card__error">{error}</p> : null}

          <div className="student-modal__actions lookup-modal__actions">
            <button
              className="button button--secondary student-modal__button-light"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="button button--primary student-modal__button-dark student-modal__button-dark--icon"
              type="submit"
              disabled={isSubmitting}
            >
              <CheckCircleIcon className="student-modal__button-icon" />
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
