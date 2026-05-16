import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import api from "../api";

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

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | saved
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Autosize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(el.scrollHeight, window.innerHeight - 200) + "px";
  }, [content, note]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3">
        <p className="text-stone-600">{error || "Note not found"}</p>
        <Link
          to="/"
          className="text-emerald-700 font-medium hover:underline text-sm"
        >
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200/70 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition px-2 py-1 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Notes</span>
          </button>
          <SaveIndicator status={status} />
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-serif">
          {note.title}
        </h1>
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {note.tags.map((t, i) => {
              const c = tagColor(t);
              return (
                <span
                  key={i}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-8 border-t border-stone-200 pt-8">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full bg-transparent resize-none outline-none text-lg leading-relaxed font-serif placeholder:text-stone-300 placeholder:italic"
            style={{ minHeight: "calc(100vh - 200px)" }}
          />
        </div>
      </article>
    </div>
  );
}

function SaveIndicator({ status }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-stone-500">
        <Loader2 size={14} className="animate-spin" /> Saving
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-700">
        <Check size={14} /> Saved
      </span>
    );
  }
  return <span className="text-xs text-stone-400">Draft</span>;
}
