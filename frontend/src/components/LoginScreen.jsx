// Salesforce OAuth login start karne wali initial screen.
export function LoginScreen({ onLogin, notice }) {
  return (
    <div className="login-card">
      <div className="login-inner">
        <p className="eyebrow">CloudVandana Assignment</p>
        <h1>Salesforce CRUD</h1>
        <p className="muted">
          Manage Account, Opportunity, Lead, Contact, and Case records via OAuth
          2.0 — without opening the native Salesforce UI.
        </p>
        {/* Login ya OAuth flow se aaya optional status/error notice dikhata hai. */}
        {notice ? <div className="banner banner-info">{notice}</div> : null}
        {/* Parent ka onLogin callback Salesforce sign-in flow start karta hai. */}
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onLogin}
        >
          Login to Salesforce
        </button>
      </div>
    </div>
  );
}
