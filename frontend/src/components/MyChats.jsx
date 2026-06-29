import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";

const MyChats = () => {
  const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();

  const [showAddChat, setShowAddChat] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/chats`, config);
      setChats(data);
    } catch (error) {
      console.error("Failed to load chats", error);
    }
  };

  useEffect(() => {
    if (user) fetchChats();
    // eslint-disable-next-line
  }, [user]);

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setAddLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(`${ENDPOINT}/api/chats`, { email: emailInput }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      
      setSelectedChat(data);
      setEmailInput("");
      setShowAddChat(false);
    } catch (error) {
      console.error("Failed to create chat", error);
      alert(error.response?.data?.message || "User not found or failed to start chat.");
    } finally {
      setAddLoading(false);
    }
  };

  const getSenderName = (loggedUser, users) => {
    if (!users || users.length < 2) return "Unknown User";
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  const getAvatarBgColor = (name) => {
    const colors = [
      "bg-[#25D366]", "bg-[#128C7E]", "bg-[#34b7f1]", 
      "bg-[#9c27b0]", "bg-[#e91e63]", "bg-[#ff9800]", "bg-[#009688]"
    ];
    if (!name) return colors[0];
    const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  return (
    <div 
      className={`w-full md:w-[400px] h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        selectedChat ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="py-1 px-4 flex justify-between items-center bg-[#075E54] text-white shadow-md z-10 border-b border-[#128C7E]/30">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Chats <span className="text-lg opacity-90">💬</span>
          </h2>
          <p className="text-[11px] text-emerald-200 font-medium mt-0.5">Logged in as: <span className="text-white font-bold">{user?.name}</span></p>
        </div>
        <button 
          className="btn btn-xs bg-[#128C7E] hover:bg-[#0b534a] border-none text-white font-semibold px-3 py-1.5 h-auto rounded-xl shadow-sm transition-all duration-200"
          onClick={() => {
            localStorage.removeItem("userInfo");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>

      <div className="p-2.5 bg-white border-b border-gray-100 transition-all duration-200">
        {!showAddChat ? (
          <button 
            onClick={() => setShowAddChat(true)}
            className="w-full btn btn-sm bg-[#f0f2f5] hover:bg-[#e9edef] text-[#00a884] hover:text-[#008069] border-none rounded-xl text-xs font-bold tracking-wide shadow-none transition-all duration-200 py-2 h-auto"
          >
            ➕ Start New Chat (by Email)
          </button>
        ) : (
          <form onSubmit={handleCreateChat} className="flex gap-2 items-center bg-[#f0f2f5] p-1.5 rounded-xl border border-gray-200/50 transition-all">
            <input
              type="email"
              placeholder="Enter friend's email..."
              className="input input-sm w-full bg-white text-gray-800 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00a884]/40 border border-gray-200 h-8 px-2.5 transition-all"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className={`btn btn-sm bg-[#00a884] hover:bg-[#008069] text-white border-none h-8 min-h-0 text-xs px-4 rounded-lg font-bold shadow-sm ${addLoading ? "loading" : ""}`}
              disabled={addLoading}
            >
              {addLoading ? "" : "Chat"}
            </button>
            <button 
              type="button" 
              onClick={() => { setShowAddChat(false); setEmailInput(""); }}
              className="btn btn-sm btn-ghost btn-circle text-[#667781] hover:bg-gray-200 h-8 w-8 min-h-0 transition-all"
            >
              ✕
            </button>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white divide-y divide-gray-100/70">
        {chats.length === 0 ? (
          <div className="text-center p-12 text-[#667781] text-sm font-sans flex flex-col justify-center items-center gap-2 h-full opacity-70">
            <span className="text-4xl">📥</span>
            <p className="font-medium">No conversations yet.</p>
            <p className="text-xs text-gray-400">Click the button above to discover friends!</p>
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = selectedChat?._id === chat._id;
            const currentChatName = chat.isGroupChat ? chat.chatName : getSenderName(user, chat.users);
            const firstLetter = currentChatName ? currentChatName.charAt(0).toUpperCase() : "?";
            const avatarBg = getAvatarBgColor(currentChatName);

            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3.5 p-3.5 cursor-pointer transition-all duration-200 relative ${
                  isSelected 
                    ? "bg-[#eae6df]/60 border-l-[4px] border-[#00a884]"
                    : "hover:bg-[#f5f6f6] bg-white border-l-[4px] border-transparent"
                }`}
              >
                <div className="avatar placeholder flex-shrink-0">
                  <div className={`${avatarBg} text-white rounded-full w-12 h-12 shadow-sm flex items-center justify-center font-bold tracking-wider text-base transform transition-transform duration-300 ${isSelected ? "scale-105" : ""}`}>
                    <span>{chat.isGroupChat ? "👥" : firstLetter}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h3 className={`font-semibold text-[15px] truncate transition-colors ${isSelected ? "text-[#111b21] font-bold" : "text-[#111b21]"}`}>
                      {currentChatName}
                    </h3>
                  </div>
                  <p className="text-[13px] text-[#667781] truncate mt-0.5 font-sans flex items-center gap-1">
                    {chat.latestMessage ? (
                      <>
                        <span className="font-semibold text-gray-600 max-w-[80px] truncate">{chat.latestMessage.sender.name}: </span>
                        <span className="truncate">{chat.latestMessage.content}</span>
                      </>
                    ) : (
                      <span className="italic text-gray-400 text-xs flex items-center gap-1">✨ Say hi to start the chat!</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyChats;