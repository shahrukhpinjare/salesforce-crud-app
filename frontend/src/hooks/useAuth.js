import { useCallback, useEffect, useState } from "react";
import {
  logout as apiLogout,
  fetchAuthStatus,
  getLoginUrl,
} from "../api/client";

// Authentication state aur Salesforce login/logout flow ko components ke liye manage karta hai.
export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [instanceUrl, setInstanceUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState(null);

  // Backend se current session status refresh karke auth state update karta hai.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuthStatus();
      setAuthenticated(Boolean(data.authenticated));
      setInstanceUrl(data.instanceUrl || null);
    } catch (err) {
      setAuthenticated(false);
      setInstanceUrl(null);
      setAuthNotice(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // OAuth redirect ke success/error query params dikhata hai, phir URL se hata kar status check karta hai.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    const authError = params.get("auth_error");

    if (auth === "success") {
      setAuthNotice("Logged in to Salesforce successfully.");
    } else if (authError) {
      setAuthNotice(decodeURIComponent(authError));
    }

    if (auth || authError) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    refresh();
  }, [refresh]);

  // Browser ko backend ke Salesforce OAuth login endpoint par redirect karta hai.
  const login = useCallback(() => {
    window.location.href = getLoginUrl();
  }, []);

  // Backend session logout karke local authentication state aur notice update karta hai.
  const logout = useCallback(async () => {
    await apiLogout();
    setAuthenticated(false);
    setInstanceUrl(null);
    setAuthNotice("Logged out.");
  }, []);

  // Hook ka state aur actions component ke use ke liye return karta hai.
  return {
    authenticated,
    instanceUrl,
    loading,
    authNotice,
    setAuthNotice,
    login,
    logout,
    refresh,
  };
}
