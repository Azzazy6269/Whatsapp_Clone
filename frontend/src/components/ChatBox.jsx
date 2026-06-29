import React, { useEffect, useState, useRef } from "react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";
import io from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; 
let socket;

const ChatBox = () => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user); 
    socket.on("connected", () => setSocketConnected(true));
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data } = await axios.get(
        ENDPOINT+`/api/messages/${selectedChat._id}`,
        config
      );
      
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Failed to load messages", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      } else {
        console.log("New message in another chat:", newMessageReceived);
      }
    });

    return () => socket.off("message received");
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage.trim()) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const messageToSend = newMessage;
        setNewMessage(""); 

        const { data } = await axios.post(
          ENDPOINT+"/api/messages",
          { content: messageToSend, chatId: selectedChat._id },
          config
        );

        socket.emit("new message", data);

        setMessages([...messages, data]);
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  const getSenderName = (loggedUser, users) => {
    if (!users || users.length < 2) return "Unknown User";
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 h-full bg-[#f8f9fa] hidden md:flex flex-col justify-center items-center text-gray-400 border-b-4 border-[#128C7E]">
        <span className="text-7xl mb-4 text-[#128c7e] opacity-70">💬</span>
        <h2 className="text-2xl font-bold text-gray-700">WhatsApp Web</h2>
        <p className="text-sm text-gray-500 mt-1">Select a chat to start real-time messaging.</p>
      </div>
    );
  }

  return (
    <div 
      className={`flex-1 h-full bg-[#efeae2] flex flex-col ${
        selectedChat ? "flex" : "hidden md:flex"
      }`}
    >
      <div className="p-4 bg-[#075E54] text-white flex items-center gap-3 shadow-md z-10">
        <button 
          className="btn btn-ghost btn-sm md:hidden font-bold text-white hover:bg-[#128C7E]"
          onClick={() => setSelectedChat(null)}
        >
          ⬅ Back
        </button>
        <div>
          <h2 className="font-bold text-lg text-white">
            {selectedChat.isGroupChat 
              ? selectedChat.chatName 
              : getSenderName(user, selectedChat.users)}
          </h2>
          <p className="text-xs text-emerald-300 flex items-center gap-1 mt-0.5">
            <span className={`w-2 h-2 rounded-full inline-block ${socketConnected ? "bg-emerald-400" : "bg-warning"}`}></span>
            {socketConnected ? "online" : "connecting..."}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-30">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg text-[#075E54]"></span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.sender._id === user._id;
            return (
              <div 
                key={msg._id} 
                className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
              >
                {!isMyMessage && selectedChat.isGroupChat && (
                  <div className="chat-header text-xs text-emerald-700 font-bold mb-0.5 px-1">
                    {msg.sender.name}
                  </div>
                )}
                
                <div 
                  className={`chat-bubble shadow-sm text-gray-800 font-sans max-w-[75%] break-words ${
                    isMyMessage 
                      ? "bg-[#e1f7d5] rounded-tr-none" 
                      : "bg-white rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
                
                <div className="chat-footer opacity-60 text-[10px] text-gray-600 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#f0f2f5] border-t border-gray-200 flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          className="input w-full rounded-lg bg-white text-gray-800 border-none shadow-sm focus:outline-none placeholder-gray-400 py-2 px-4 h-10"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={sendMessage}
        />
      </div>
    </div>
  );
};

export default ChatBox;