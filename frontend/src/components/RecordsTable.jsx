import { useEffect, useRef } from "react";

// Table cell values ko display-friendly text mein convert karta hai.
function formatCell(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Table columns mein Id aur Case ke liye extra Case Number include karta hai.
function displayColumns(objectName, fields) {
  const cols = [{ apiName: "Id", label: "Id" }];
  if (objectName === "Case") {
    cols.push({ apiName: "CaseNumber", label: "Case Number" });
  }
  return [...cols, ...fields];
}

// Records table dikhata hai aur scroll ke through agle pages load karta hai.
export function RecordsTable({
  objectName,
  fields,
  records,
  hasMore,
  loading,
  loadingMore,
  onLoadMore,
  onView,
  onEdit,
  onDelete,
}) {
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  const columns = displayColumns(objectName, fields);

  // Sentinel scroll area ke paas aane par next page load hota hai; cleanup observer disconnect karta hai.
  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && !loadingMore) {
          onLoadMore();
        }
      },
      { root, rootMargin: "120px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore, records.length]);

  // Initial data load ya empty result ke liye alag UI states dikhata hai.
  if (loading) {
    return <div className="state-box">Loading records…</div>;
  }

  if (!records.length) {
    return (
      <div className="state-box">
        No records found. Create one to get started.
      </div>
    );
  }

  return (
    // Scrollable table mein record fields aur per-row actions render hote hain.
    <div className="table-wrap" ref={scrollRef}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.apiName}>{col.label}</th>
            ))}
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr key={row.Id}>
              {columns.map((col) => (
                <td key={col.apiName}>{formatCell(row[col.apiName])}</td>
              ))}
              <td className="col-actions">
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => onView(row)}
                >
                  View
                </button>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-link btn-link-danger"
                  onClick={() => onDelete(row)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
      {loadingMore ? (
        <p className="load-more-hint">Loading more records…</p>
      ) : null}
      {!hasMore && records.length > 0 ? (
        <p className="load-more-hint muted">End of list</p>
      ) : null}
    </div>
  );
}
