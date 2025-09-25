import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { user } = useAuth();

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/projects`;
    const scope = encodeURIComponent('openid profile email');
    const responseType = 'token';
    const nonce = crypto.randomUUID();

    if (!clientId) {
      window.location.href = `${import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'}/auth/google/callback`;
      return;
    }

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=${responseType}&scope=${scope}&nonce=${nonce}`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-950/70 border border-slate-700 shadow-xl rounded-xl p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-semibold text-white">MyAlbumPro</h1>
        <p className="text-slate-300">Monte álbuns fotográficos profissionais em minutos.</p>
        <button
          className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 transition text-white font-medium"
          onClick={handleGoogleLogin}
        >
          Entrar com Google
        </button>
        {user ? <p className="text-emerald-300">Sessão ativa como {user.name}</p> : null}
      </div>
    </div>
  );
}

export default LoginPage;
