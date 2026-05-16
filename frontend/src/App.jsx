import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Auth from "./pages/Auth.jsx";
import Home from "./pages/Home.jsx";
import NoteEditor from "./pages/NoteEditor.jsx";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function PublicOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicOnly>
            <Auth />
          </PublicOnly>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <Home />
          </Protected>
        }
      />
      <Route
        path="/notes/:id"
        element={
          <Protected>
            <NoteEditor />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
