import { CheckCircleIcon, CloseIcon, XCircleIcon } from "./Icons";

type StatusModalProps = {
  actionLabel?: string;
  isOpen: boolean;
  message: string;
  onClose: () => void;
  title: string;
  tone: "success" | "error";
};

export function StatusModal({
  actionLabel = "Close",
  isOpen,
  message,
  onClose,
  title,
  tone,
}: StatusModalProps) {
  if (!isOpen) {
    return null;
  }

  const Icon = tone === "success" ? CheckCircleIcon : XCircleIcon;

  return (
    <div className="student-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`confirmation-modal status-modal status-modal--${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirmation-modal__body status-modal__body">
          <div className={`status-modal__icon status-modal__icon--${tone}`}>
            <Icon className="status-modal__icon-svg" />
          </div>
          <div className="status-modal__content">
            <h2 className="confirmation-modal__title" id="status-modal-title">
              {title}
            </h2>
            <p className="confirmation-modal__message">{message}</p>
          </div>
          <button
            className="student-modal__close status-modal__close"
            type="button"
            aria-label="Close status modal"
            onClick={onClose}
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="confirmation-modal__actions status-modal__actions">
          <button
            className={`button confirmation-modal__button status-modal__button status-modal__button--${tone}`}
            type="button"
            onClick={onClose}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
