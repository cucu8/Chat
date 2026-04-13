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
      .withUrl(`http://localhost:5236/chatHub?userId=${user.id}`)
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
          connection.on("ReceiveMessage", (senderId, message) => {
            setMessages((prev) => [
              ...prev,
              { senderId, content: message },
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
        { senderId: user.id, content: message }
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
    return <Login 
      onLoginSuccess={(data) => {
        setToken(data.token);
        // Note: Backend returns 'id' not 'Id' sometimes depending on JSON serialization
        setUser({ id: data.id || data.Id, username: data.username || data.Username });
        setView("chat");
      }} 
      onSwitchToRegister={() => setView("register")} 
    />;
  }

  if (view === "register") {
    return <Register onSwitchToLogin={() => setView("login")} />;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">Chat App</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hoş geldin, <b>{user?.username}</b></span>
          <button 
            onClick={handleLogout}
            className="text-red-500 hover:underline text-sm"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı ID:</label>
        <input
          placeholder="ReceiverId (Göndermek istediğiniz kişinin ID'si)"
          className="w-full border p-2 rounded"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-6">
        <input
          placeholder="Mesaj yaz..."
          className="flex-1 border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Gönder
        </button>
      </div>

      <div className="border rounded p-4 bg-gray-50 h-[400px] overflow-y-auto">
        <h3 className="font-bold mb-2 border-b pb-1">Mesajlar</h3>
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div key={index} className={`p-2 rounded ${msg.senderId === user.id ? "bg-blue-100 ml-auto max-w-[80%]" : "bg-gray-200 mr-auto max-w-[80%]"}`}>
              <b className="text-xs block text-gray-500">{msg.senderId === user.id ? "Sen" : `Gönderen: ${msg.senderId}`}</b>
              <span>{msg.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;