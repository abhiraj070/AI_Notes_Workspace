import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotebookPen } from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/", { replace: true });
      } else {
        await register(name, email, password);
        setMode("login");
        setName("");
        setPassword("");
        setInfo("Account created. Please sign in to continue.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100">
            <NotebookPen size={22} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Notes</h1>
          <p className="text-sm text-stone-500">
            {mode === "login"
              ? "Welcome back. Sign in to continue."
              : "Create your account to get started."}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-7">
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <Field label="Name">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                  placeholder="Jane Doe"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                placeholder="At least 6 characters"
              />
            </Field>

            {info && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                {info}
              </p>
            )}
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
            >
              {busy
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-sm text-center text-stone-500 mt-6">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setError("");
              setInfo("");
              setMode(mode === "login" ? "register" : "login");
            }}
            className="text-emerald-700 font-medium hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
