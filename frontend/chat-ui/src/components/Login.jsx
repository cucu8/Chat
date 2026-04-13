import { useState } from "react";

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5236/api/Auth/login?username=${username}&password=${password}`, {
        method: "POST"
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("chat_token", data.token);
        localStorage.setItem("chat_user", JSON.stringify({ id: data.id || data.Id, username: data.username || data.Username }));
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg border-4 border-gray-400 shadow-2xl w-full max-w-sm text-center">
        <h2 className="text-3xl font-black mb-6 text-gray-800 border-b-4 border-gray-100 pb-2">GİRİŞ YAP</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            className="border-4 border-gray-300 p-3 rounded bg-white font-bold focus:border-blue-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            className="border-4 border-gray-300 p-3 rounded bg-white font-bold focus:border-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-black py-4 px-6 rounded-lg shadow-xl hover:bg-blue-800 transition-all text-xl active:scale-95"
          >
            OTURUM AÇ
          </button>
        </form>
        {message && <p className="mt-4 text-red-600 font-black bg-red-50 p-2 border-2 border-red-200 rounded">{message}</p>}
        <button
          onClick={onSwitchToRegister}
          className="mt-8 text-blue-700 hover:text-blue-900 font-black underline uppercase text-sm"
        >
          Kayıt Ol (Üye Değil misin?)
        </button>
      </div>
    </div>
  );
}

export default Login;
