import { Dashboard } from "./components/Dashboard";
import { LoginScreen } from "./components/LoginScreen";
import { useAuth } from "./hooks/useAuth";

// Authentication status ke hisaab se app ki main screen choose karta hai.
export default function App() {
  const {
    authenticated,
    instanceUrl,
    loading,
    authNotice,
    setAuthNotice,
    login,
    logout,
  } = useAuth();

  // Session check complete hone tak loading state dikhata hai.
  if (loading) {
    return (
      <div className="page-center">
        <p className="muted">Checking session…</p>
      </div>
    );
  }

  // Login nahi hua ho to Salesforce login screen aur notice dikhata hai.
  if (!authenticated) {
    return (
      <div className="page-center">
        <LoginScreen onLogin={login} notice={authNotice} />
      </div>
    );
  }

  // Login ke baad records dashboard ko auth details aur logout actions deta hai.
  return (
    <Dashboard
      instanceUrl={instanceUrl}
      onLogout={logout}
      notice={authNotice}
      onClearNotice={() => setAuthNotice(null)}
    />
  );
}
