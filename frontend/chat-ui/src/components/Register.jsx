import { useState } from "react";

function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Backend expects username and password as query parameters based on AuthController signature
      const response = await fetch(`http://localhost:5236/api/Auth/register?username=${username}&password=${password}`, {
        method: "POST"
      });

      if (response.ok) {
        setMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
        setTimeout(() => onSwitchToLogin(), 1500);
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
        <h2 className="text-2xl font-bold mb-4 text-center">Kayıt Ol</h2>
        <form onSubmit={handleRegister} className="space-y-4">
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
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Kayıt Ol
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
        <button
          onClick={onSwitchToLogin}
          className="mt-4 w-full text-blue-500 text-sm hover:underline"
        >
          Zaten hesabın var mı? Giriş Yap
        </button>
      </div>
    </div>
  );
}

export default Register;
