// Destructive action confirm karne ke liye reusable modal dialog.
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  busy,
}) {
  return (
    // Backdrop par click karne se dialog cancel hota hai.
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      {/* Dialog ke andar click backdrop tak nahi jaata, isliye modal band nahi hota. */}
      <div
        className="modal modal-sm"
        role="alertdialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
        </header>
        <div className="modal-body">
          <p>{message}</p>
          <footer className="modal-footer">
            {/* Busy state mein duplicate action rokne ke liye buttons disable hote hain. */}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={busy}
            >
              {/* Action chal raha ho to progress label dikhata hai. */}
              {busy ? "Deleting…" : confirmLabel}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
