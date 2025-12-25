import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/Layout";
import Home from "./pages/Home";
import SinglePlayer from "./pages/SinglePlayer";
import RequireWallet from "./wallet/components/RequireWallet";


export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/single"
          element={
            <RequireWallet>
              <SinglePlayer />
            </RequireWallet>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
