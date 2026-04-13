import { useState } from "react";

function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg border-4 border-gray-400 shadow-2xl w-full max-w-sm text-center">
        <h2 className="text-3xl font-black mb-6 text-gray-800 border-b-4 border-gray-100 pb-2">KAYIT OL</h2>
        <form onSubmit={handleRegister} className="flex flex-col space-y-5">
          <input
            type="text"
            placeholder="Kullanıcı Adı Belirleyin"
            className="border-4 border-gray-300 p-3 rounded bg-white font-bold focus:border-green-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre Belirleyin"
            className="border-4 border-gray-300 p-3 rounded bg-white font-bold focus:border-green-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white font-black py-4 px-6 rounded-lg shadow-xl hover:bg-green-800 transition-all text-xl active:scale-95"
          >
            HESAP OLUŞTUR
          </button>
        </form>
        {message && <p className="mt-4 text-gray-700 font-black bg-green-50 p-2 border-2 border-green-200 rounded">{message}</p>}
        <button
          onClick={onSwitchToLogin}
          className="mt-8 text-green-700 hover:text-green-900 font-black underline uppercase text-sm"
        >
          Geri Dön (Giriş Yap)
        </button>
      </div>
    </div>
  );
}

export default Register;
