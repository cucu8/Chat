import { useState } from "react";

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Backend expects username and password as query parameters
      const response = await fetch(`http://localhost:5236/api/Auth/login?username=${username}&password=${password}`, {
        method: "POST"
      });

      if (response.ok) {
        const data = await response.json();
        // data contains: token, Id, Username
        localStorage.setItem("chat_token", data.token);
        localStorage.setItem("chat_user", JSON.stringify({ id: data.id, username: data.username }));
        
        onLoginSuccess(data);
      } else {
        const error = await response.text();
        setMessage("Hata: " + error);
      }
    } catch (err) {
      setMessage("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Giriş Yap</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            className="w-full border p-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Giriş Yap
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
        <button
          onClick={onSwitchToRegister}
          className="mt-4 w-full text-blue-500 text-sm hover:underline"
        >
          Hesabın yok mu? Kayıt Ol
        </button>
      </div>
    </div>
  );
}

export default Login;
