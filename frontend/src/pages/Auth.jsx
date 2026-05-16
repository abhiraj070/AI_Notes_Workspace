import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotebookPen, Sparkles, Tags, Feather, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside className="hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-zinc-800/80 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-lg">
          <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1] font-serif">
            Notes that quietly{" "}
            <span className="text-emerald-400">organize themselves</span>.
          </h2>
          <p className="text-zinc-400 mt-6 text-base xl:text-lg leading-relaxed">
            noteAi is a calm, focused space to capture ideas, draft thoughts,
            and let AI help you make sense of what you&apos;ve written.
          </p>

          <div className="mt-10 space-y-5">
            <Feature
              icon={<Feather size={16} />}
              title="Distraction-free writing"
              desc="An infinite canvas designed to disappear behind your words."
            />
            <Feature
              icon={<Tags size={16} />}
              title="Effortless organization"
              desc="Tag once, find everything. Color-coded, automatically."
            />
            <Feature
              icon={<Sparkles size={16} />}
              title="Intelligent assistance"
              desc="Summarize, expand, and refine your notes — when you need it."
            />
          </div>
        </div>

        <div className="relative text-xs text-zinc-600">
          © {new Date().getFullYear()} noteAi
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <Brand />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              {mode === "login"
                ? "Sign in to continue to your notes."
                : "Start writing in seconds. No credit card required."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <Field label="Name">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
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
                className={inputCls}
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
                className={inputCls}
                placeholder="At least 6 characters"
              />
            </Field>

            {info && (
              <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                {info}
              </p>
            )}
            {error && (
              <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Create account"}
              {!busy && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>
          </form>

          <p className="text-sm text-center text-zinc-500 mt-8">
            {mode === "login" ? "New to noteAi?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setError("");
                setInfo("");
                setMode(mode === "login" ? "register" : "login");
              }}
              className="text-emerald-400 font-medium hover:text-emerald-300"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Brand() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
        <NotebookPen size={18} />
      </div>
      <div className="text-xl font-semibold tracking-tight">
        <span>note</span>
        <span className="text-emerald-400">Ai</span>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-3.5">
      <div className="bg-zinc-900 text-emerald-400 p-2 rounded-lg h-fit border border-zinc-800">
        {icon}
      </div>
      <div>
        <div className="font-medium text-sm text-zinc-100">{title}</div>
        <div className="text-zinc-400 text-sm mt-0.5 leading-relaxed">
          {desc}
        </div>
      </div>
    </div>
  );
}
