import React, { useEffect } from "react";
import { ChatState } from "../context/ChatProvider";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const { user } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) navigate("/");
  }, [navigate]);

  return (
    <div className="w-full h-screen bg-[#eae6df] flex overflow-hidden antialiased font-sans select-none">
      <div className="w-full h-full flex bg-white shadow-2xl overflow-hidden relative">
        {user && <MyChats />}            
        {user && <ChatBox />}
      </div>
    </div>
  );
};

export default ChatPage;