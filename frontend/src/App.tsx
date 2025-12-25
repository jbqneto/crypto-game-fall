import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/Layout";
import Home from "./pages/Home";
import SinglePlayer from "./pages/SinglePlayer";
import RequireWallet from "./wallet/components/RequireWallet";
import RoomLobby from "./pages/RoomLobby";


export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={
          <RequireWallet>
            <RoomLobby />
          </RequireWallet>
        } />
        <Route
          path="/single"
          element={<SinglePlayer />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
