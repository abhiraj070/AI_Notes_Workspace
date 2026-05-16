import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  NotebookPen,
  LogOut,
  X,
  Sparkles,
  Quote,
  FileText,
  Tag,
  Clock,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";

const TAG_PALETTE = [
  { bg: "bg-amber-500/15", text: "text-amber-300", ring: "ring-amber-500/20" },
  { bg: "bg-sky-500/15", text: "text-sky-300", ring: "ring-sky-500/20" },
  { bg: "bg-rose-500/15", text: "text-rose-300", ring: "ring-rose-500/20" },
  { bg: "bg-orange-500/15", text: "text-orange-300", ring: "ring-orange-500/20" },
  { bg: "bg-fuchsia-500/15", text: "text-fuchsia-300", ring: "ring-fuchsia-500/20" },
  { bg: "bg-cyan-500/15", text: "text-cyan-300", ring: "ring-cyan-500/20" },
  { bg: "bg-blue-500/15", text: "text-blue-300", ring: "ring-blue-500/20" },
  { bg: "bg-yellow-500/15", text: "text-yellow-300", ring: "ring-yellow-500/20" },
];

function tagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function formatRelative(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/users/notes");
        if (!cancelled) setNotes(data.data.notes || []);
      } catch (err) {
        if (err?.response?.status === 401) {
          logout();
          navigate("/auth", { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(
    () =>
      activeTag
        ? notes.filter((n) => n.tags?.includes(activeTag))
        : notes,
    [notes, activeTag]
  );

  const lastEdited = useMemo(() => {
    if (!notes.length) return null;
    return notes.reduce((latest, n) => {
      const t = new Date(n.updatedAt || n.createdAt || 0).getTime();
      return t > latest ? t : latest;
    }, 0);
  }, [notes]);

  const handleCreated = (note) => {
    setNotes((n) => [note, ...n]);
    setShowCreate(false);
    navigate(`/notes/${note._id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    const prev = notes;
    setNotes((n) => n.filter((x) => x._id !== id));
    try {
      await api.delete(`/notes/${id}`);
    } catch {
      setNotes(prev);
      alert("Failed to delete note.");
    }
  };

  const handleSignOut = () => {
    if (!confirm("Sign out of noteAi?")) return;
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-[400px] right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none -z-0" />

      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg border border-amber-500/20">
              <NotebookPen size={18} />
            </div>
            <div className="text-lg font-semibold tracking-tight">
              <span>note</span>
              <span className="text-amber-400">Ai</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition px-3 py-1.5 rounded-lg hover:bg-zinc-900"
            title="Sign out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 relative">
        <Hero
          name={user?.name || "there"}
          notesCount={notes.length}
          tagsCount={allTags.length}
          lastEditedAt={lastEdited}
          onCreate={() => setShowCreate(true)}
        />

        <div className="mt-12 mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight font-serif">
              {activeTag ? (
                <span>
                  Notes tagged{" "}
                  <span className="text-amber-400">#{activeTag}</span>
                </span>
              ) : (
                "Your notes"
              )}
            </h2>
            <p className="text-zinc-500 text-sm mt-1.5">
              {loading
                ? "Loading..."
                : filteredNotes.length === 0
                ? activeTag
                  ? "No notes with this tag yet."
                  : "Nothing here yet — tap the + button to start."
                : `${filteredNotes.length} note${
                    filteredNotes.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
        </div>

        {!loading && allTags.length > 0 && (
          <TagFilter
            tags={allTags}
            active={activeTag}
            onChange={setActiveTag}
          />
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <EmptyState onCreate={() => setShowCreate(true)} />
          ) : filteredNotes.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-10 text-center bg-zinc-900/30">
              <p className="text-zinc-400">
                No notes match{" "}
                <span className="text-amber-400">#{activeTag}</span> yet.
              </p>
              <button
                onClick={() => setActiveTag(null)}
                className="mt-3 text-sm text-amber-400 hover:text-amber-300 font-medium"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={() => handleDelete(note._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <button
        onClick={() => setShowCreate(true)}
        className="sm:hidden fixed bottom-6 right-6 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 rounded-full w-14 h-14 shadow-xl shadow-amber-500/30 flex items-center justify-center transition hover:scale-105 z-20"
        title="New note"
        aria-label="Create new note"
      >
        <Plus size={24} />
      </button>

      {showCreate && (
        <CreateNoteModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function Hero({ name, quote, notesCount, tagsCount, lastEditedAt, onCreate }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.02] to-zinc-900/40 p-7 sm:p-9 backdrop-blur-sm">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-medium uppercase tracking-wider mb-3">
            <Sparkles size={14} /> {greeting()}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-serif">
            Hello,{" "}
            <span className="text-amber-400">{name.split(" ")[0]}</span>.
          </h1>
          <p className="text-zinc-400 mt-3 text-base leading-relaxed max-w-md">
            Your private space for ideas, drafts, and everything in between.
            What will you capture today?
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Stat
              icon={<FileText size={14} />}
              label="Notes"
              value={notesCount}
            />
            <Stat icon={<Tag size={14} />} label="Tags" value={tagsCount} />
            {lastEditedAt && (
              <Stat
                icon={<Clock size={14} />}
                label="Last edit"
                value={formatRelative(lastEditedAt)}
              />
            )}
          </div>

          <button
            onClick={onCreate}
            className="mt-6 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 px-5 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-amber-500/25"
          >
            <Plus size={18} /> Create a note
          </button>
        </div>

        
      </div>
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
      <span className="text-amber-400">{icon}</span>
      <span className="text-xs text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-zinc-100">{value}</span>
    </div>
  );
}

function TagFilter({ tags, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={() => onChange(null)}
        className={`text-xs font-medium px-3 py-1.5 rounded-full transition border ${
          active === null
            ? "bg-amber-400 text-zinc-950 border-amber-400"
            : "bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-700"
        }`}
      >
        All
      </button>
      {tags.map((t) => {
        const c = tagColor(t);
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => onChange(isActive ? null : t)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition border ring-1 ${
              isActive
                ? `${c.bg} ${c.text} ${c.ring} border-transparent`
                : `bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 ${c.ring}`
            }`}
          >
            #{t}
          </button>
        );
      })}
    </div>
  );
}

function NoteCard({ note, onDelete }) {
  const preview = (note.content || "").trim();
  const isEmpty = preview.length === 0;
  const previewText = isEmpty
    ? "Empty note — click to start writing"
    : preview.length > 180
    ? preview.slice(0, 180) + "…"
    : preview;

  return (
    <div className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-amber-500/40 hover:bg-zinc-900 transition">
      <Link to={`/notes/${note._id}`} className="block">
        <h3 className="font-semibold text-lg leading-snug pr-9 mb-2 line-clamp-2 text-zinc-100 font-serif">
          {note.title}
        </h3>
        <p
          className={`text-sm leading-relaxed mb-4 line-clamp-4 ${
            isEmpty ? "text-zinc-600 italic" : "text-zinc-400"
          }`}
        >
          {previewText}
        </p>
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((t, i) => {
              const c = tagColor(t);
              return (
                <span
                  key={i}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} ring-1 ${c.ring}`}
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}
        {note.updatedAt && (
          <p className="text-[11px] text-zinc-600 mt-3 uppercase tracking-wider">
            {formatRelative(note.updatedAt)}
          </p>
        )}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
        title="Delete note"
        aria-label="Delete note"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center bg-zinc-900/30">
      <div className="inline-flex bg-amber-500/10 text-amber-400 p-4 rounded-2xl border border-amber-500/20 mb-5">
        <Sparkles size={28} />
      </div>
      <h3 className="text-xl font-semibold font-serif">
        Start your first note
      </h3>
      <p className="text-zinc-500 text-sm mt-1.5 mb-6 max-w-sm mx-auto">
        Capture an idea, draft a thought, or jot something down. Your notes live
        here, organized by tags.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 px-4 py-2 rounded-lg font-semibold transition shadow-lg shadow-amber-500/20"
      >
        <Plus size={18} /> Create note
      </button>
    </div>
  );
}

function CreateNoteModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError("");
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { data } = await api.post("/notes/", { title: title.trim(), tags });
      onCreated(data.data.note);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create note");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">New note</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Title
            </span>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition"
              placeholder="A short, descriptive title"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Tags
            </span>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition"
              placeholder="work, ideas, personal"
            />
            <span className="text-xs text-zinc-600 mt-1.5 block">
              Optional. Separate multiple tags with commas.
            </span>
          </label>

          {error && (
            <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 text-zinc-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !title.trim()}
              className="flex-1 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-semibold transition disabled:opacity-50 disabled:hover:bg-amber-400 shadow-lg shadow-amber-500/20"
            >
              {busy ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
