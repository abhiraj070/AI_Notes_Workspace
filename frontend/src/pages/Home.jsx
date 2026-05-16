import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, NotebookPen, LogOut, X, Sparkles } from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";

const TAG_PALETTE = [
  { bg: "bg-emerald-500/15", text: "text-emerald-300", ring: "ring-emerald-500/20" },
  { bg: "bg-amber-500/15", text: "text-amber-300", ring: "ring-amber-500/20" },
  { bg: "bg-sky-500/15", text: "text-sky-300", ring: "ring-sky-500/20" },
  { bg: "bg-rose-500/15", text: "text-rose-300", ring: "ring-rose-500/20" },
  { bg: "bg-teal-500/15", text: "text-teal-300", ring: "ring-teal-500/20" },
  { bg: "bg-orange-500/15", text: "text-orange-300", ring: "ring-orange-500/20" },
  { bg: "bg-lime-500/15", text: "text-lime-300", ring: "ring-lime-500/20" },
  { bg: "bg-fuchsia-500/15", text: "text-fuchsia-300", ring: "ring-fuchsia-500/20" },
];

function tagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

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

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
              <NotebookPen size={18} />
            </div>
            <div className="text-lg font-semibold tracking-tight">
              <span>note</span>
              <span className="text-emerald-400">Ai</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-zinc-400">
              Hi, <span className="text-zinc-200">{user?.name || "there"}</span>
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/auth", { replace: true });
              }}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition px-3 py-1.5 rounded-lg hover:bg-zinc-900"
              title="Sign out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight font-serif">
              Your notes
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              {loading
                ? "Loading..."
                : notes.length === 0
                ? "Nothing here yet — tap the + button to start."
                : `${notes.length} note${notes.length === 1 ? "" : "s"}`}
            </p>
          </div>
          {!loading && notes.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 px-4 py-2 rounded-lg font-semibold transition"
            >
              <Plus size={18} /> New note
            </button>
          )}
        </div>

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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onDelete={() => handleDelete(note._id)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowCreate(true)}
        className="sm:hidden fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 rounded-full w-14 h-14 shadow-xl shadow-emerald-500/25 flex items-center justify-center transition hover:scale-105"
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

function NoteCard({ note, onDelete }) {
  const preview = (note.content || "").trim();
  const isEmpty = preview.length === 0;
  const previewText = isEmpty
    ? "Empty note — click to start writing"
    : preview.length > 180
    ? preview.slice(0, 180) + "…"
    : preview;

  return (
    <div className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/40 hover:bg-zinc-900 transition">
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
      <div className="inline-flex bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 mb-5">
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
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 px-4 py-2 rounded-lg font-semibold transition"
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
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
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition"
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
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition"
              placeholder="work, ideas, personal"
            />
            <span className="text-xs text-zinc-600 mt-1.5 block">
              Optional. Separate multiple tags with commas.
            </span>
          </label>

          {error && (
            <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
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
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-semibold transition disabled:opacity-50"
            >
              {busy ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
