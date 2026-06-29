import React, { useEffect, useState, useRef } from "react";
import { ChatState } from "../context/ChatProvider";
import axiosActual from "axios";
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
      
      const { data } = await axiosActual.get(
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

        const { data } = await axiosActual.post(
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

  const getAvatarBgColor = (name) => {
    const colors = ["bg-[#25D366]", "bg-[#128C7E]", "bg-[#34b7f1]", "bg-[#9c27b0]", "bg-[#e91e63]", "bg-[#ff9800]", "bg-[#009688]"];
    if (!name) return colors[0];
    const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 h-full bg-[#f0f2f5] hidden md:flex flex-col justify-center items-center text-gray-400 border-b-[6px] border-[#00a884] transition-all duration-500">
        <div className="text-center p-8 max-w-sm transform transition-transform duration-500 hover:scale-105">
          <span className="text-8xl mb-4 text-[#00a884] opacity-80 block drop-shadow-sm">💬</span>
          <h2 className="text-2xl font-light text-[#41525d] tracking-wide">WhatsApp Web</h2>
          <p className="text-xs text-[#667781] mt-2 leading-relaxed">Select a conversation or create one via email to enjoy dynamic, fully real-time communication.</p>
        </div>
      </div>
    );
  }

  const activeChatName = selectedChat.isGroupChat ? selectedChat.chatName : getSenderName(user, selectedChat.users);
  const headerLetter = activeChatName ? activeChatName.charAt(0).toUpperCase() : "?";
  const headerAvatarBg = getAvatarBgColor(activeChatName);

  return (
    <div 
      className={`flex-1 h-full bg-[#efeae2] flex flex-col transition-all duration-300 ease-in-out ${
        selectedChat ? "flex" : "hidden md:flex"
      }`}
    >
      <div className="p-2 bg-[#075E54] text-white flex items-center gap-3.5 shadow-md z-10 border-b border-[#128C7E]/30">
        <button 
          className="btn btn-ghost btn-sm md:hidden font-semibold text-white hover:bg-[#128C7E] rounded-xl transition-all"
          onClick={() => setSelectedChat(null)}
        >
          ⬅ Back
        </button>

        <div className="avatar placeholder flex-shrink-0">
          <div className={`${headerAvatarBg} text-white rounded-full w-10 h-10 shadow-sm flex items-center justify-center font-bold text-sm border border-white/10`}>
            <span>{selectedChat.isGroupChat ? "👥" : headerLetter}</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h2 className="font-semibold text-[15.5px] text-white tracking-wide leading-tight">
            {activeChatName}
          </h2>
          <p className="text-[11px] flex items-center gap-1.5 mt-0.5 font-medium text-emerald-200/90">
            <span className={`w-2 h-2 rounded-full inline-block transition-all duration-500 ${socketConnected ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-amber-400 animate-pulse"}`}></span>
            {socketConnected ? "online" : "connecting..."}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#efeae2] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-40 scroll-smooth">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg text-[#00a884]"></span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.sender._id === user._id;
            return (
              <div 
                key={msg._id} 
                className={`chat ${isMyMessage ? "chat-end" : "chat-start"} opacity-95 animate-[fadeIn_0.2s_ease-out]`}
              >
                {!isMyMessage && selectedChat.isGroupChat && (
                  <div className="chat-header text-[11px] text-[#008069] font-bold mb-0.5 px-2 tracking-wide">
                    {msg.sender.name}
                  </div>
                )}
                
                {/* حواف دائرية محترفة ومطابقة لواتساب بالكامل */}
                <div 
                  className={`chat-bubble shadow-[0_1px_0.5px_rgba(11,20,26,.13)] text-[#111b21] font-sans max-w-[70%] md:max-w-[60%] break-words px-3.5 py-1.5 text-[14.5px] leading-relaxed transition-all duration-200 ${
                    isMyMessage 
                      ? "bg-[#d9fdd3] rounded-2xl rounded-tr-none" 
                      : "bg-white rounded-2xl rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
                
                <div className="chat-footer opacity-75 text-[9.5px] text-[#667781] mt-1 px-1.5 font-medium">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#f0f2f5] border-t border-gray-200/50 flex items-center transition-all">
        <input
          type="text"
          placeholder="Type a message..."
          className="input w-full rounded-full bg-white text-[#111b21] border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 placeholder-[#667781] py-2.5 px-5 h-10.5 text-[14.5px] transition-all duration-200"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={sendMessage}
        />
      </div>
    </div>
  );
};

export default ChatBox;