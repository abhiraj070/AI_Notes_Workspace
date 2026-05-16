import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {Plus,Trash2,NotebookPen,LogOut,Sparkles,FileText,Tag,Clock} from "lucide-react";
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

const tagColor = (tag) => {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5 || h >= 21) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const formatRelative = (dateStr) => {
  if (!dateStr) return "";
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 10080) return `${Math.floor(m / 1440)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(null);
  const [creating, setCreating] = useState(false);

  // --- Fetch notes on mount ---
  useEffect(() => {
    let cancelled = false;
    sessionStorage.removeItem("notes:refresh");
    api
      .get("/users/notes")
      .then(({ data }) => !cancelled && setNotes(data.data.notes || []))
      .catch((err) => {
        if (err?.response?.status === 401) {
          logout();
          navigate("/auth", { replace: true });
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Derived data ---
  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return [...set];
  }, [notes]);

  const filteredNotes = activeTag
    ? notes.filter((n) => n.tags?.includes(activeTag))
    : notes;

  const lastEdited = notes.length
    ? Math.max(...notes.map((n) => +new Date(n.updatedAt || n.createdAt || 0)))
    : null;

  // --- Handlers ---
  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const { data } = await api.post("/notes/", {});
      const note = data.data.note;
      setNotes((n) => [note, ...n]);
      navigate(`/notes/${note._id}`);
    } catch (err) {
      alert(err?.response?.data?.message || "Could not create note");
    } finally {
      setCreating(false);
    }
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
      {/* --- Background glow --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* --- Header --- */}
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
        {/* --- Hero --- */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.02] to-zinc-900/40 p-7 sm:p-9 backdrop-blur-sm">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-medium uppercase tracking-wider mb-3">
              <Sparkles size={14} /> {greeting()}
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-serif">
              Hello,{" "}
              <span className="text-amber-400">
                {(user?.name || "there").split(" ")[0]}
              </span>
              .
            </h1>
            <p className="text-zinc-400 mt-3 text-base leading-relaxed max-w-md">
              Your private space for ideas, drafts, and everything in between.
              What will you capture today?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-amber-400">
                  <FileText size={14} />
                </span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Notes
                </span>
                <span className="text-sm font-semibold text-zinc-100">
                  {notes.length}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-amber-400">
                  <Tag size={14} />
                </span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Tags
                </span>
                <span className="text-sm font-semibold text-zinc-100">
                  {allTags.length}
                </span>
              </div>
              {lastEdited && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <span className="text-amber-400">
                    <Clock size={14} />
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">
                    Last edit
                  </span>
                  <span className="text-sm font-semibold text-zinc-100">
                    {formatRelative(lastEdited)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="mt-6 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-zinc-950 font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/25"
            >
              <Plus size={18} /> {creating ? "Creating..." : "Create a note"}
            </button>
          </div>
        </section>

        {/* --- Notes section header --- */}
        <div className="mt-12 mb-6">
          <h2 className="text-2xl font-semibold tracking-tight font-serif">
            {activeTag ? (
              <>
                Notes tagged{" "}
                <span className="text-amber-400">#{activeTag}</span>
              </>
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

        {/* --- Tag filter --- */}
        {!loading && allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition border ${
                activeTag === null
                  ? "bg-amber-400 text-zinc-950 border-amber-400"
                  : "bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              All
            </button>
            {allTags.map((t) => {
              const c = tagColor(t);
              const isActive = activeTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTag(isActive ? null : t)}
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
        )}

        {/* --- Notes grid --- */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Loading skeleton */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center bg-zinc-900/30">
              {/* Empty state — no notes yet */}
              <div className="inline-flex bg-amber-500/10 text-amber-400 p-4 rounded-2xl border border-amber-500/20 mb-5">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-semibold font-serif">
                Start your first note
              </h3>
              <p className="text-zinc-500 text-sm mt-1.5 mb-6 max-w-sm mx-auto">
                Capture an idea, draft a thought, or jot something down. Your
                notes live here, organized by tags.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-zinc-950 font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-amber-500/20"
              >
                <Plus size={18} /> {creating ? "Creating..." : "Create note"}
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-10 text-center bg-zinc-900/30">
              {/* Empty state — no notes for active tag */}
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
              {/* Notes cards */}
              {filteredNotes.map((note) => {
                const preview = (note.summary || note.content || "").trim();
                const isEmpty = preview.length === 0;
                const previewText = isEmpty
                  ? "Empty note — click to start writing"
                  : preview.length > 180
                  ? preview.slice(0, 180) + "…"
                  : preview;
                return (
                  <div
                    key={note._id}
                    className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-amber-500/40 hover:bg-zinc-900 transition"
                  >
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
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${c.bg} ${c.text} ${c.ring}`}
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
                        handleDelete(note._id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* --- Mobile FAB (create note) --- */}
      <button
        onClick={handleCreate}
        disabled={creating}
        className="sm:hidden fixed bottom-6 right-6 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-zinc-950 rounded-full w-14 h-14 shadow-xl shadow-amber-500/30 flex items-center justify-center transition hover:scale-105 z-20"
        title="New note"
        aria-label="Create new note"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
