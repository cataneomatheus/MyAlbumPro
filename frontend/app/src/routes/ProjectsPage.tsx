import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Project } from '../types';
import { useAuth } from '../context/AuthContext';

function ProjectsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.listProjects();
        if (mounted) {
          setProjects(data);
        }
      } catch (err) {
        if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
          navigate('/login', { replace: true });
          return;
        }
        setError((err as Error).message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    if (user) {
      load();
    }
    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  const stats = useMemo(() => {
    const totalPages = projects.reduce((acc, project) => acc + project.pages.length, 0);
    const recent = projects.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    return {
      total: projects.length,
      totalPages,
      lastUpdated: recent ? new Date(recent.updatedAt) : null,
    };
  }, [projects]);

  const handleCreateProject = () => {
    navigate('/editor/new');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const avatar = user?.pictureUrl;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/70 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Painel</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Meus projetos</h1>
            <p className="text-sm text-slate-400">Organize colecoes, acompanhe revisoes e mantenha o pipeline pronto para impressao.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              onClick={handleCreateProject}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-600/70" />
                <span className="relative -mt-[1px] text-base font-semibold">+</span>
              </span>
              Novo projeto
            </button>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-800 text-sm font-semibold text-emerald-200">
                {avatar ? (
                  <img src={avatar} alt={user?.name ?? 'Usuario'} className="h-full w-full object-cover" />
                ) : (
                  (user?.name ?? 'M')[0]?.toUpperCase() ?? 'M'
                )}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 rounded-lg bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Projetos ativos</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Paginas no portfolio</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.totalPages}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Ultima atualizacao</p>
            <p className="mt-2 text-lg font-medium text-white">
              {stats.lastUpdated ? stats.lastUpdated.toLocaleString() : '-'}
            </p>
          </div>
        </section>
        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">Carregando projetos...</div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div>
        ) : null}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.projectId}
              className="group flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-400/40 hover:bg-slate-900/80"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">{project.title}</h2>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                    {project.albumSize}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Atualizado em {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-6 flex gap-2">
                <Link
                  to={`/editor/${project.projectId}`}
                  className="flex-1 rounded-xl bg-slate-800 px-4 py-2 text-center text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                >
                  Editar
                </Link>
                <Link
                  to={`/viewer/${project.projectId}`}
                  className="flex-1 rounded-xl bg-slate-700 px-4 py-2 text-center text-sm font-medium text-slate-100 transition hover:bg-slate-600"
                >
                  Visualizar
                </Link>
              </div>
            </article>
          ))}
        </section>
        {!isLoading && projects.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/60 p-10 text-center text-slate-400">
            Nenhum projeto ainda. Clique em <span className="text-emerald-300">"Novo projeto"</span> para comecar um album.
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default ProjectsPage;










