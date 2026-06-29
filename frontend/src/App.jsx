import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} exact />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;