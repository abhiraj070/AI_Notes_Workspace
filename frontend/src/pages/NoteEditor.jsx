import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Loader2, NotebookPen, Pencil, X } from "lucide-react";
import api from "../api";

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

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const initialLoad = useRef(true);
  const debounceRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/users/notes");
        const found = (data.data.notes || []).find((n) => n._id === id);
        if (!cancelled) {
          if (!found) {
            setError("Note not found");
          } else {
            setNote(found);
            setContent(found.content || "");
          }
        }
      } catch (err) {
        if (!cancelled)
          setError(err?.response?.data?.message || "Failed to load note");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (!note) return;

    setStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await api.patch(`/notes/${id}/content`, { content });
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(el.scrollHeight, window.innerHeight - 280) + "px";
  }, [content, note]);

  const openEdit = () => {
    setEditTitle(note.title);
    setEditTags((note.tags || []).join(", "));
    setEditError("");
    setShowEdit(true);
  };

  const closeEdit = () => setShowEdit(false);

  const handleSaveMeta = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError("Title cannot be empty");
      return;
    }
    setEditSaving(true);
    setEditError("");
    try {
      const tags = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { data } = await api.patch(`/notes/${id}`, {
        title: editTitle.trim(),
        tags,
      });
      setNote(data.data.note);
      setShowEdit(false);
    } catch (err) {
      setEditError(err?.response?.data?.message || "Could not save changes");
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3">
        <p className="text-zinc-300">{error || "Note not found"}</p>
        <Link
          to="/"
          className="text-amber-400 font-medium hover:text-amber-300 text-sm"
        >
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition px-2 py-1 rounded-lg hover:bg-zinc-900"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Notes</span>
          </button>
          <Link to="/" className="flex items-center gap-2 group" title="Home">
            <div className="bg-amber-500/10 text-amber-400 p-1.5 rounded-md border border-amber-500/20">
              <NotebookPen size={14} />
            </div>
            <div className="text-sm font-semibold tracking-tight">
              <span>note</span>
              <span className="text-amber-400">Ai</span>
            </div>
          </Link>
          <SaveIndicator status={status} />
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <h1
            className={`text-3xl sm:text-4xl font-semibold tracking-tight font-serif leading-tight flex-1 ${
              note.title === "Untitled" ? "text-zinc-500 italic" : "text-zinc-100"
            }`}
          >
            {note.title}
          </h1>
          <button
            onClick={openEdit}
            className="shrink-0 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/30 px-2.5 py-1.5 rounded-lg transition mt-1"
            title="Edit title and tags"
          >
            <Pencil size={14} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {note.tags.map((t, i) => {
              const c = tagColor(t);
              return (
                <span
                  key={i}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text} ring-1 ${c.ring}`}
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-10 border-t border-zinc-800 pt-10">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full bg-transparent resize-none outline-none text-lg leading-relaxed font-serif text-zinc-200 placeholder:text-zinc-700 placeholder:italic"
            style={{ minHeight: "calc(100vh - 280px)" }}
          />
        </div>
      </article>

      {showEdit && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Edit title & tags</h3>
              <button
                onClick={closeEdit}
                className="text-zinc-500 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Title
                </span>
                <input
                  autoFocus
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition"
                  placeholder="Note title"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Tags
                </span>
                <input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition"
                  placeholder="work, ideas, personal"
                />
                <span className="text-xs text-zinc-600 mt-1.5 block">
                  Separate multiple tags with commas. Leave empty to remove all tags.
                </span>
              </label>

              {editError && (
                <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
                  {editError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 text-zinc-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving || !editTitle.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-zinc-950 font-semibold transition shadow-lg shadow-amber-500/20"
                >
                  {editSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveIndicator({ status }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Loader2 size={14} className="animate-spin" /> Saving
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-400">
        <Check size={14} /> Saved
      </span>
    );
  }
  return <span className="text-xs text-zinc-600">Draft</span>;
}
