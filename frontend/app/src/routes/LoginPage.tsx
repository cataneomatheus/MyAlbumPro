import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const highlights = [
  {
    title: 'Layouts Inteligentes',
    description: 'Monte composicoes em segundos com sugestoes dinamicas para cada Pagina.',
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="currentColor" opacity="0.18" />
        <rect x="8" y="8" width="10" height="16" rx="2" fill="currentColor" opacity="0.45" />
        <rect x="20" y="8" width="4" height="8" rx="1" fill="currentColor" />
        <rect x="20" y="18" width="4" height="6" rx="1" fill="currentColor" opacity="0.65" />
      </svg>
    ),
  },
  {
    title: 'Ajustes Naturais',
    description: 'Refine enquadramentos com snapping, zoom e posicionamento guiado em tempo real.',
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <path d="M6 10h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        <path d="M10 16h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 22h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        <circle cx="22" cy="10" r="3.5" fill="currentColor" opacity="0.28" />
      </svg>
    ),
  },
  {
    title: 'Controle de Qualidade',
    description: 'Veja metricas, histogramas e alertas de resolucao antes de exportar.',
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <path d="M8 24V14l8-6 8 6v10H8Z" fill="currentColor" opacity="0.2" />
        <path d="M8 24h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        <path d="M12 24v-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 24v-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: 'Exportacao Profissional',
    description: 'Gere PDFs calibrados para graficas, com marcas de corte e sangria automaticas.',
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <path d="M9 9h14v10l-7 7-7-7V9Z" fill="currentColor" opacity="0.18" />
        <path d="M13 13h6v8l-3 3-3-3v-8Z" fill="currentColor" />
        <path d="M11 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
];

const CameraMark = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
    <rect x="6" y="12" width="36" height="28" rx="8" fill="currentColor" opacity="0.12" />
    <path
      d="M18 16.5h12l2-3.5h-16l2 3.5Z"
      fill="currentColor"
      opacity="0.28"
    />
    <circle cx="24" cy="26" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="24" cy="26" r="4" fill="currentColor" opacity="0.65" />
    <circle cx="34" cy="19" r="2.2" fill="currentColor" opacity="0.45" />
  </svg>
);

const GoogleGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M12 3.5c2.1 0 3.6.9 4.4 1.6l2.9-2.9C17.7.7 15.2 0 12 0 7.3 0 3.1 2.7 1.2 6.6l3.4 2.7C5.7 5.7 8.6 3.5 12 3.5Z" fill="#ea4335" />
    <path d="M23.5 12.3c0-.8-.1-1.4-.2-2.1H12v4h6.6c-.3 1.4-1 2.6-2.1 3.4l3.3 2.6c1.9-1.8 2.7-4.3 2.7-7.9Z" fill="#4285f4" />
    <path d="M4.6 14.7c-.4-1.2-.4-2.6 0-3.8L1.2 8.2C.4 10 0 11.9 0 14s.4 4 1.2 5.8l3.4-2.7Z" fill="#fbbc05" />
    <path d="M12 24c3.2 0 5.9-1 7.9-2.8l-3.3-2.6c-.9.6-2.1 1.1-3.6 1.1-3.4 0-6.3-2.3-7.3-5.3L1.2 19.8C3.1 23.3 7.3 24 12 24Z" fill="#34a853" />
  </svg>
);

function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading, setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devName, setDevName] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
  const isClientConfigured = useMemo(() => clientId.trim().length > 0 && !clientId.startsWith('missing'), [clientId]);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/projects', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid profile email',
    onError: () => {
      setError('Nao foi possivel iniciar o login com Google. Verifique a configuracao do OAuth.');
    },
    onSuccess: async (response) => {
      const tokenDetails = response as TokenResponse & { id_token?: string };
      const idToken = tokenDetails.id_token;
      if (!idToken) {
        setError('Nao foi possivel obter a credencial do Google.');
        return;
      }

      setError(null);
      setIsAuthenticating(true);
      try {
        const authenticated = await api.googleSignIn(idToken);
        setUser(authenticated);
        navigate('/projects', { replace: true });
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Falha ao autenticar com o servidor.');
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
  });

  const handleDevLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsAuthenticating(true);
    try {
      const authenticated = await api.devSignIn({ email: devEmail, name: devName });
      setUser(authenticated);
      navigate('/projects', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Modo desenvolvimento indisponivel. Ajuste o backend ou tente novamente.');
      } else {
        setError('Nao foi possivel autenticar em modo desenvolvimento.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute -left-32 top-[-4rem] h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute right-[-8rem] top-48 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <section className="flex flex-1 items-center justify-center px-8 py-16 lg:px-16">
          <div className="max-w-xl space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              MyAlbumPro Studio
            </div>
            <header className="space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Crie albuns inesqueciveis com estetica editorial e automacao inteligente
              </h1>
              <p className="text-lg text-slate-300">
                Organize bibliotecas, experimente composicoes e finalize projetos profissionais com um fluxo
                enxuto, colaborativo e pronto para impressao.
              </p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-400/50 hover:bg-slate-900/80"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    {item.icon}
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="flex flex-1 items-center justify-center border-t border-slate-800/60 bg-slate-950/80 px-6 py-12 backdrop-blur lg:max-w-lg lg:border-l lg:border-t-0 lg:px-10">
          <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-emerald-500/10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <CameraMark />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Acesse com sua conta</h2>
                <p className="text-sm text-slate-400">
                  Centralize bibliotecas, layouts, exportacoes e acompanhe o status de cada album em um painel unico.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => login()}
                disabled={isAuthenticating || !isClientConfigured}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 px-4 py-3 text-base font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/40 transition group-hover:bg-emerald-500/50">
                  <GoogleGlyph />
                </span>
                {isAuthenticating ? 'Conectando...' : 'Entrar com Google'}
              </button>
              {!isClientConfigured ? (
                <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-300">
                    Sem client id configurado, utilize o modo desenvolvimento para testar rapidamente.
                  </p>
                  <form onSubmit={handleDevLogin} className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="dev-email">
                        Email
                      </label>
                      <input
                        id="dev-email"
                        type="email"
                        value={devEmail}
                        onChange={(event) => setDevEmail(event.target.value)}
                        placeholder="dev@local.test"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="dev-name">
                        Nome
                      </label>
                      <input
                        id="dev-name"
                        type="text"
                        value={devName}
                        onChange={(event) => setDevName(event.target.value)}
                        placeholder="Desenvolvedor"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20 disabled:cursor-progress"
                    >
                      {isAuthenticating ? 'Conectando...' : 'Entrar em modo desenvolvimento'}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
            {error ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
            ) : null}
            {user ? (
              <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                Sessao ativa como <span className="font-semibold">{user.name}</span>.
              </p>
            ) : null}
            <div className="space-y-1 text-xs text-slate-500">
              <p>Ao continuar voce concorda com as diretrizes de uso profissional do MyAlbumPro Studio.</p>
              <p>Em conformidade com LGPD e armazenamento regional via MinIO seguro.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;

