type ConfirmationDialogProps = {
  cancelLabel?: string
  confirmLabel: string
  isOpen: boolean
  message: string
  onCancel: () => void
  onConfirm: () => void
  title: string
  tone?: 'default' | 'danger'
}

export function ConfirmationDialog({
  cancelLabel = 'Cancel',
  confirmLabel,
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
  tone = 'default',
}: ConfirmationDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="student-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirmation-modal__body">
          <h2 className="confirmation-modal__title" id="confirmation-dialog-title">{title}</h2>
          <p className="confirmation-modal__message">{message}</p>
        </div>

        <div className="confirmation-modal__actions">
          <button className="button button--secondary confirmation-modal__button" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`button confirmation-modal__button confirmation-modal__button--confirm${tone === 'danger' ? ' confirmation-modal__button--danger' : ' button--primary'}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
