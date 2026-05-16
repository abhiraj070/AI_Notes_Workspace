import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {NotebookPen, Sparkles, Tags, Feather, ArrowRight, Mail, Lock, User, Eye, EyeOff} from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-lg">
          <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1] font-serif">
            Notes that quietly{" "}
            <span className="text-amber-400">organize themselves</span>.
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

      <main className="flex items-center justify-center p-6 lg:p-12 min-h-screen relative">
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative animate-fade-in">
          <div className="lg:hidden mb-10 flex justify-center">
            <Brand />
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl shadow-black/40 p-8 sm:p-10">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
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
                <Field label="Name" icon={<User size={15} />}>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    placeholder="Your name"
                  />
                </Field>
              )}
              <Field label="Email" icon={<Mail size={15} />}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="your@email.com"
                />
              </Field>
              <Field label="Password" icon={<Lock size={15} />}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls + " pr-10"}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Field>

              {info && (
                <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  {info}
                </p>
              )}
              {error && (
                <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="group w-full bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:hover:bg-amber-400 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
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

            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs uppercase tracking-wider text-zinc-600">
                or
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <p className="text-sm text-center text-zinc-400">
              {mode === "login" ? "New to noteAi?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setError("");
                  setInfo("");
                  setMode(mode === "login" ? "register" : "login");
                }}
                className="text-amber-400 font-medium hover:text-amber-300"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="text-xs text-zinc-600 text-center mt-6">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition";

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-1.5 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}

function Brand() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg border border-amber-500/20">
        <NotebookPen size={18} />
      </div>
      <div className="text-xl font-semibold tracking-tight">
        <span>note</span>
        <span className="text-amber-400">Ai</span>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-3.5">
      <div className="bg-zinc-900 text-amber-400 p-2 rounded-lg h-fit border border-zinc-800">
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
