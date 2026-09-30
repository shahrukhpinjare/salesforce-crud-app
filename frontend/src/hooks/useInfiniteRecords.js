import { useCallback, useEffect, useRef, useState } from "react";
import { fetchObjectFields, fetchRecords } from "../api/client";

// Har request mein kitne records fetch karne hain.
const PAGE_SIZE = 20;

// Selected Salesforce object ke fields aur records ko pages mein load karne wala hook.
export function useInfiniteRecords(objectName) {
  const [fields, setFields] = useState([]);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  // State update hone ka wait kiye bina concurrent load requests ko rokta hai.
  const loadingRef = useRef(false);

  // Naye object ke liye state reset karke fields aur pehla records page parallel load karta hai.
  const resetAndLoad = useCallback(async () => {
    if (!objectName) return;
    setLoading(true);
    setError(null);
    setRecords([]);
    setPage(0);
    setHasMore(true);
    loadingRef.current = true;

    try {
      const [fieldsRes, recordsRes] = await Promise.all([
        fetchObjectFields(objectName),
        fetchRecords(objectName, 0, PAGE_SIZE),
      ]);
      setFields(fieldsRes.fields || []);
      setRecords(recordsRes.records || []);
      setHasMore(Boolean(recordsRes.hasMore));
      setPage(1);
    } catch (err) {
      setError(err.message);
      setFields([]);
      setRecords([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [objectName]);

  // Object change hone par uske fields aur first page automatically reload hote hain.
  useEffect(() => {
    resetAndLoad();
  }, [resetAndLoad]);

  // Agla page fetch karke existing records ke end mein jodta hai.
  const loadMore = useCallback(async () => {
    if (!objectName || !hasMore || loadingRef.current) return;

    loadingRef.current = true;
    setLoadingMore(true);
    setError(null);

    try {
      const recordsRes = await fetchRecords(objectName, page, PAGE_SIZE);
      const batch = recordsRes.records || [];
      setRecords((prev) => [...prev, ...batch]);
      setHasMore(Boolean(recordsRes.hasMore));
      setPage((p) => p + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [objectName, hasMore, page]);

  // Data, loading/error states aur reload/load-more actions caller ko deta hai.
  return {
    fields,
    records,
    hasMore,
    loading,
    loadingMore,
    error,
    reload: resetAndLoad,
    loadMore,
  };
}
