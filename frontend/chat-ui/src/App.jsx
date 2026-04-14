import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState("login"); // "login", "register", "chat"

  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);

  // Check for existing session
  useEffect(() => {
    const savedToken = localStorage.getItem("chat_token");
    const savedUser = localStorage.getItem("chat_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView("chat");
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5236/chatHub", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) newConnection.stop();
    };
  }, [user]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR");
          connection.on("ReceiveMessage", (senderName, message) => {
            setMessages((prev) => [
              ...prev,
              { senderName, content: message },
            ]);
          });
        })
        .catch((err) => console.error(err));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (!connection || !user?.id || !receiverId || !message) return;

    try {
      await connection.invoke("SendMessage", user.id, receiverId, message);

      setMessages((prev) => [
        ...prev,
        { senderName: "Sen", content: message }
      ]);

      setMessage("");
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");
    setToken(null);
    setUser(null);
    setView("login");
    if (connection) connection.stop();
  };

  if (view === "login") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <Login
          onLoginSuccess={(data) => {
            setToken(data.token);
            setUser({ id: data.id || data.Id, username: data.username || data.Username });
            setView("chat");
          }}
          onSwitchToRegister={() => setView("register")}
        />
      </div>
    );
  }

  if (view === "register") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <Register onSwitchToLogin={() => setView("login")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl border-4 border-gray-400 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-gray-300 border-b-4 border-gray-400 shadow-inner">
          <h2 className="text-2xl font-black uppercase tracking-tighter">CHAT APP</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-black uppercase tracking-tight">Kullanıcı: <b className="text-blue-800 underline decoration-2">{user?.username}</b></span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white font-black rounded-lg shadow-lg hover:bg-red-800 transition-all text-xs border-2 border-red-900 active:scale-95"
            >
              ÇIKIŞ
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col bg-gray-50 p-4 border-2 border-gray-100 rounded-lg shadow-inner">
            <label className="text-xs font-black mb-2 uppercase tracking-widest text-gray-400">Mesaj Gönderilecek Kullanıcı ID</label>
            <input
              placeholder="Alıcı ID Girin..."
              className="border-4 border-gray-300 p-3 rounded bg-white font-black focus:border-blue-500 outline-none placeholder:font-normal placeholder:italic"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <input
              placeholder="Mesajınızı buraya yazın..."
              className="flex-1 border-4 border-gray-300 p-4 rounded-lg bg-white font-bold focus:border-blue-500 outline-none shadow-md"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-700 text-white px-10 py-4 rounded-lg font-black shadow-2xl hover:bg-blue-900 transition-all active:scale-95 border-b-8 border-blue-900 text-xl"
            >
              GÖNDER
            </button>
          </div>

          <div className="border-4 border-gray-200 rounded-xl bg-gray-50 shadow-inner">
            <h3 className="bg-gray-200 p-3 font-black text-gray-700 border-b-4 border-gray-300 text-center uppercase tracking-widest text-sm">Mesaj Kayıtları</h3>
            <div className="p-6 h-[350px] overflow-y-auto space-y-4 bg-white/50 backdrop-blur-sm">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20">
                  <span className="text-4xl mb-2">💬</span>
                  <p className="font-black italic uppercase">Henüz Mesajlaşma Yok</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.senderName === "Sen" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 rounded-2xl border-4 shadow-xl max-w-[85%] ${msg.senderName === "Sen" ? "bg-blue-600 border-blue-800 text-white rounded-br-none" : "bg-gray-100 border-gray-300 text-black rounded-bl-none font-bold"}`}>
                      <b className="text-[10px] block border-b-2 border-white/20 mb-2 uppercase italic tracking-widest">{msg.senderName === "Sen" ? "SİZDEN GELEN" : `GÖNDEREN: ${msg.senderName}`}</b>
                      <span className="text-base leading-snug">{msg.content}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;