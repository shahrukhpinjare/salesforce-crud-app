import { useCallback, useEffect, useState } from "react";
import {
  createRecord,
  deleteRecord,
  fetchObjects,
  fetchRecord,
  updateRecord,
} from "../api/client";
import { useInfiniteRecords } from "../hooks/useInfiniteRecords";
import { ConfirmDialog } from "./ConfirmDialog";
import { RecordFormModal } from "./RecordFormModal";
import { RecordsTable } from "./RecordsTable";

// Salesforce records dashboard: object select, record CRUD aur session controls manage karta hai.
export function Dashboard({ instanceUrl, onLogout, notice, onClearNotice }) {
  // Selected object, open modal, delete state aur user-facing errors track hote hain.
  const [objects, setObjects] = useState([]);
  const [objectName, setObjectName] = useState("Account");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Selected object ke paginated records aur loading/error controls hook se milte hain.
  const {
    fields,
    records,
    hasMore,
    loading,
    loadingMore,
    error,
    reload,
    loadMore,
  } = useInfiniteRecords(objectName);

  // Backend se supported objects load karta hai; request fail ho to known defaults dikhata hai.
  useEffect(() => {
    fetchObjects()
      .then((data) => {
        setObjects(data.objects || []);
      })
      .catch(() => {
        setObjects(["Account", "Opportunity", "Lead", "Contact", "Case"]);
      });
  }, []);

  // Naya record banane wala form open karta hai.
  const openCreate = () => setModal({ mode: "create", record: null });

  // Table row se complete record fetch karke view modal kholta hai.
  const openView = useCallback(
    async (row) => {
      setActionError(null);
      try {
        const full = await fetchRecord(objectName, row.Id);
        setModal({ mode: "view", record: full });
      } catch (err) {
        setActionError(err.message);
      }
    },
    [objectName],
  );

  // Table row se complete record fetch karke edit modal kholta hai.
  const openEdit = useCallback(
    async (row) => {
      setActionError(null);
      try {
        const full = await fetchRecord(objectName, row.Id);
        setModal({ mode: "edit", record: full });
      } catch (err) {
        setActionError(err.message);
      }
    },
    [objectName],
  );

  // Form mode ke hisaab se record create/update karta hai, phir table reload karta hai.
  const handleSubmit = async (body) => {
    if (modal.mode === "create") {
      await createRecord(objectName, body);
    } else if (modal.mode === "edit") {
      await updateRecord(objectName, modal.record.Id, body);
    }
    await reload();
  };

  // Delete confirm hone par record delete karta hai aur result ke baad list refresh karta hai.
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setActionError(null);
    try {
      await deleteRecord(objectName, deleteTarget.Id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  // Record-list error ko action error ke saath ek hi banner mein show karta hai.
  const listError = error || actionError;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Salesforce CRUD</p>
          <h1>{objectName} records</h1>
        </div>
        <div className="topbar-actions">
          {instanceUrl ? (
            <span className="chip" title={instanceUrl}>
              Connected
            </span>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {notice ? (
        <div className="banner banner-info">
          {notice}
          <button
            type="button"
            className="banner-dismiss"
            onClick={onClearNotice}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {listError ? (
        <div className="banner banner-error">{listError}</div>
      ) : null}

      <section className="toolbar">
        <label className="select-wrap">
          <span>Object</span>
          <select
            value={objectName}
            onChange={(e) => setObjectName(e.target.value)}
          >
            {objects.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Create record
        </button>
      </section>

      <RecordsTable
        objectName={objectName}
        fields={fields}
        records={records}
        hasMore={hasMore}
        loading={loading}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        onView={openView}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {modal ? (
        <RecordFormModal
          mode={modal.mode}
          objectName={objectName}
          fields={fields}
          record={modal.record}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Delete record"
          message={`Delete this ${objectName} record (${deleteTarget.Id})? This cannot be undone.`}
          confirmLabel="Delete"
          busy={deleteBusy}
          onCancel={() => !deleteBusy && setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
