import { useEffect, useState } from "react";

// Configured fields ke liye initial blank form values banata hai.
function emptyValues(fields) {
  const values = {};
  for (const f of fields) {
    values[f.apiName] = "";
  }
  return values;
}

// Record data ko input-friendly strings mein badalta hai; record na ho to blank values deta hai.
function recordToValues(record, fields) {
  const values = emptyValues(fields);
  if (!record) return values;
  for (const f of fields) {
    const v = record[f.apiName];
    values[f.apiName] = v === null || v === undefined ? "" : String(v);
  }
  return values;
}

// Create, edit aur read-only view ke liye dynamic record form modal.
export function RecordFormModal({
  mode,
  objectName,
  fields,
  record,
  onClose,
  onSubmit,
}) {
  // View mode mein fields editable nahi hote aur save action nahi dikhaya jata.
  const isView = mode === "view";
  const title =
    mode === "create"
      ? `Create ${objectName}`
      : mode === "edit"
        ? `Edit ${objectName}`
        : `View ${objectName}`;

  const [values, setValues] = useState(() => recordToValues(record, fields));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Record, fields ya mode badalne par form values ko sync karke purana error clear karta hai.
  useEffect(() => {
    setValues(recordToValues(record, fields));
    setError(null);
  }, [record, fields, mode]);

  // Form values validate/convert karke parent ko bhejta hai aur submit state manage karta hai.
  async function handleSubmit(e) {
    e.preventDefault();
    if (isView) return;

    setSubmitting(true);
    setError(null);

    const body = {};
    for (const f of fields) {
      const raw = values[f.apiName];
      // Blank fields request mein nahi bhejte; number type ko numeric value banate hain.
      if (raw === "" || raw === undefined) continue;
      if (f.type === "number") {
        body[f.apiName] = Number(raw);
      } else {
        body[f.apiName] = raw;
      }
    }

    try {
      await onSubmit(body);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Backdrop click modal close karta hai; modal ke andar click close event ko rokta hai.
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="record-modal-title">{title}</h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          {error ? <div className="banner banner-error">{error}</div> : null}

          {/* Existing record ka ID sirf dikhaya jata hai, edit nahi hota. */}
          {record?.Id ? (
            <div className="field-row">
              <label>Id</label>
              <input type="text" value={record.Id} readOnly disabled />
            </div>
          ) : null}

          {/* Config ke mutabik har field ka label, input type aur editable state render hota hai. */}
          {fields.map((f) => (
            <div className="field-row" key={f.apiName}>
              <label htmlFor={`field-${f.apiName}`}>
                {f.label}
                {f.requiredOnCreate && mode === "create" ? " *" : ""}
              </label>
              <input
                id={`field-${f.apiName}`}
                type={
                  f.type === "number"
                    ? "number"
                    : f.type === "date"
                      ? "date"
                      : "text"
                }
                value={values[f.apiName]}
                readOnly={isView}
                disabled={isView}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [f.apiName]: e.target.value,
                  }))
                }
              />
            </div>
          ))}

          <footer className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {isView ? "Close" : "Cancel"}
            </button>
            {!isView ? (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Saving…"
                  : mode === "create"
                    ? "Create"
                    : "Save changes"}
              </button>
            ) : null}
          </footer>
        </form>
      </div>
    </div>
  );
}
