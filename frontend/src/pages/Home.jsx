import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, NotebookPen, LogOut, X } from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";

const TAG_PALETTE = [
  { bg: "bg-emerald-100", text: "text-emerald-800" },
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-sky-100", text: "text-sky-800" },
  { bg: "bg-rose-100", text: "text-rose-800" },
  { bg: "bg-teal-100", text: "text-teal-800" },
  { bg: "bg-orange-100", text: "text-orange-800" },
  { bg: "bg-lime-100", text: "text-lime-800" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-800" },
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
      <header className="border-b border-stone-200/70 bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl border border-emerald-100">
              <NotebookPen size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">AI Notes</h1>
              <p className="text-xs text-stone-500">
                Hi, {user?.name || "there"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/auth", { replace: true });
            }}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition px-3 py-1.5 rounded-lg hover:bg-stone-100"
            title="Sign out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Your notes</h2>
          <p className="text-stone-500 text-sm mt-1">
            {loading
              ? "Loading..."
              : notes.length === 0
              ? "Nothing here yet — tap the + button to start."
              : `${notes.length} note${notes.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {!loading && notes.length === 0 ? (
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
        className="fixed bottom-8 right-8 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-full w-14 h-14 shadow-lg shadow-emerald-700/30 flex items-center justify-center transition hover:scale-105"
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
  const previewText =
    preview.length === 0
      ? "Empty note — click to start writing"
      : preview.length > 180
      ? preview.slice(0, 180) + "…"
      : preview;

  return (
    <div className="group relative bg-white border border-stone-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition">
      <Link to={`/notes/${note._id}`} className="block">
        <h3 className="font-semibold text-lg leading-snug pr-8 mb-2 line-clamp-2">
          {note.title}
        </h3>
        <p
          className={`text-sm leading-relaxed mb-4 line-clamp-4 ${
            preview.length === 0 ? "text-stone-400 italic" : "text-stone-600"
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
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}
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
        className="absolute top-3 right-3 p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition"
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
    <div className="border border-dashed border-stone-300 rounded-2xl p-16 text-center">
      <div className="inline-flex bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 mb-4">
        <NotebookPen size={28} />
      </div>
      <h3 className="text-xl font-semibold">Start your first note</h3>
      <p className="text-stone-500 text-sm mt-1 mb-5">
        Capture an idea, draft a thought, or jot something down.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-medium transition"
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
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-20 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">New note</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">
              Title
            </span>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              placeholder="A short title"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">
              Tags
            </span>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              placeholder="Comma separated (e.g. work, ideas)"
            />
            <span className="text-xs text-stone-400 mt-1 block">
              Optional. Separate multiple tags with commas.
            </span>
          </label>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !title.trim()}
              className="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition disabled:opacity-50"
            >
              {busy ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
