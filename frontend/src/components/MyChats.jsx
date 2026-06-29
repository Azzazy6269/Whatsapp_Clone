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

  return (
    <div 
      className={`w-full md:w-96 h-full bg-white border-r border-gray-200 flex flex-col ${
        selectedChat ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="py-1 px-4 flex justify-between items-center bg-[#075E54] text-white shadow-sm z-10">
        <div>
          <h2 className="text-xl font-bold tracking-wide">Chats 💬</h2>
          <p className="text-[11px] text-emerald-200 opacity-90 mt-0.5">Logged in as: {user?.name}</p>
        </div>
        <button 
          className="btn btn-xs bg-[#128C7E] hover:bg-[#0b534a] border-none text-white font-medium px-3 rounded"
          onClick={() => {
            localStorage.removeItem("userInfo");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>

      <div className="p-2 bg-[#f0f2f5] border-b border-gray-200 transition-all duration-200">
        {!showAddChat ? (
          <button 
            onClick={() => setShowAddChat(true)}
            className="w-full btn btn-sm bg-[#128C7E] hover:bg-[#075E54] text-white border-none rounded-lg text-xs tracking-wide shadow-sm"
          >
            ➕ Start New Chat (by Email)
          </button>
        ) : (
          <form onSubmit={handleCreateChat} className="flex gap-1.5 items-center bg-white p-1 rounded-lg shadow-inner">
            <input
              type="email"
              placeholder="Enter friend's email..."
              className="input input-sm w-full bg-transparent text-gray-800 text-xs focus:outline-none border-none h-8 px-2"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className={`btn btn-sm bg-[#128C7E] hover:bg-[#075E54] text-white border-none h-8 min-h-0 text-xs px-3 rounded-md ${addLoading ? "loading" : ""}`}
              disabled={addLoading}
            >
              {addLoading ? "" : "Chat"}
            </button>
            <button 
              type="button" 
              onClick={() => { setShowAddChat(false); setEmailInput(""); }}
              className="btn btn-sm btn-ghost btn-circle text-gray-400 hover:text-gray-600 h-8 w-8 min-h-0"
            >
              ✕
            </button>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white divide-y divide-gray-100">
        {chats.length === 0 ? (
          <div className="text-center p-8 text-gray-400 text-sm font-sans">
            No chats available.<br/>Click the button above to start one!
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = selectedChat?._id === chat._id;
            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? "bg-[#e9edef]"
                    : "hover:bg-[#f5f6f6] bg-white"
                }`}
              >
                <div className="avatar placeholder">
                  <div className="bg-gray-200 text-gray-600 rounded-full w-12 shadow-inner">
                    <span className="text-lg">{chat.isGroupChat ? "👥" : "👤"}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900 text-[15px] truncate">
                      {chat.isGroupChat ? chat.chatName : getSenderName(user, chat.users)}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1 font-sans">
                    {chat.latestMessage ? (
                      <>
                        <span className="font-medium text-gray-700">{chat.latestMessage.sender.name}: </span>
                        {chat.latestMessage.content}
                      </>
                    ) : (
                      <span className="italic text-gray-400">No messages yet...</span>
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