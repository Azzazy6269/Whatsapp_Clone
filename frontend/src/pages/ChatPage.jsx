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
    <div className="w-full h-screen bg-base-200 flex overflow-hidden">
      {user && <MyChats />}
      
      {user && <ChatBox />}
    </div>
  );
};

export default ChatPage;