import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Editor from "./pages/Editor";

function App() {
  return (
    <div className="h-screen">
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/editor/room1" />} />

          {/* Editor Route */}
          <Route path="/editor/:roomId" element={<Editor />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;