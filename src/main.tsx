import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { VotingOverlay } from "./pages/VotingOverlay.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { MatchProvider } from "./contexts/MatchContext";
import { VotingProvider } from "./contexts/VotingContext";
import { PlayerProvider } from "./contexts/PlayerContext";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <PlayerProvider>
        <MatchProvider>
          <VotingProvider>
            <Routes>
              {/* Ruta pública para overlay de votación (sin login) */}
              <Route path="/voting-overlay" element={<VotingOverlay />} />

              {/* Ruta principal del dashboard (requiere login) */}
              <Route path="/*" element={<App />} />
            </Routes>
          </VotingProvider>
        </MatchProvider>
      </PlayerProvider>
    </AuthProvider>
  </BrowserRouter>
);