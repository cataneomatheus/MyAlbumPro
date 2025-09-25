import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Project } from '../types';

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setIsLoading(true);
        const data = await api.listProjects();
        if (mounted) {
          setProjects(data);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold">Meus Projetos</h1>
          <button
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
            onClick={() => navigate('/editor/new')}
          >
            Novo projeto
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {isLoading ? <p>Carregando...</p> : null}
        {error ? <p className="text-red-400">{error}</p> : null}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.projectId}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition hover:ring-2 hover:ring-emerald-400/60"
            >
              <h2 className="text-lg font-semibold text-white">{project.title}</h2>
              <p className="text-sm text-slate-400">Álbum {project.albumSize}</p>
              <p className="text-xs text-slate-500 mt-2">Atualizado em {new Date(project.updatedAt).toLocaleString()}</p>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/editor/${project.projectId}`}
                  className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-center text-sm text-slate-100 hover:bg-slate-700"
                >
                  Editar
                </Link>
                <Link
                  to={`/viewer/${project.projectId}`}
                  className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-center text-sm text-slate-100 hover:bg-slate-600"
                >
                  Visualizar
                </Link>
              </div>
            </article>
          ))}
        </section>
        {!isLoading && projects.length === 0 && !error ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
            Nenhum projeto ainda. Clique em "Novo projeto" para começar.
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default ProjectsPage;
