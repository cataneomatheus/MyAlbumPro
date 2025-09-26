import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FullScreenViewer from '../components/FullScreenViewer';
import { api, ApiError } from '../lib/api';
import type { Asset, Layout, Project } from '../types';
import { useAuth } from '../context/AuthContext';

function ViewerPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const projectId = params.projectId!;

  const [project, setProject] = useState<Project | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [projectResponse, layoutData, assetData] = await Promise.all([
          api.getProject(projectId),
          api.getLayouts(),
          api.listAssets(),
        ]);
        if (!active) return;
        setProject(projectResponse);
        setLayouts(layoutData);
        setAssets(assetData);
      } catch (err) {
        if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
          navigate('/login', { replace: true });
          return;
        }
        setError((err as Error).message);
      }
    }
    if (user) {
      load();
    }
    return () => {
      active = false;
    };
  }, [projectId, user, navigate]);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-400/40 border-t-emerald-400" />
        <p className="mt-4 text-sm text-slate-400">Carregando projeto...</p>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>
    );
  }

  return <FullScreenViewer project={project} layouts={layouts} assets={assets} onClose={() => navigate(-1)} />;
}

export default ViewerPage;










