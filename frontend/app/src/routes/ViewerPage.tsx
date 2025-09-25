import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FullScreenViewer from '../components/FullScreenViewer';
import { api } from '../lib/api';
import type { Asset, Layout, Project } from '../types';

function ViewerPage() {
  const params = useParams();
  const projectId = params.projectId!;
  const [project, setProject] = useState<Project | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const [projectResponse, layoutData, assetData] = await Promise.all([
        api.getProject(projectId),
        api.getLayouts(),
        api.listAssets(),
      ]);
      if (!active) return;
      setProject(projectResponse);
      setLayouts(layoutData);
      setAssets(assetData);
    }
    load();
    return () => {
      active = false;
    };
  }, [projectId]);

  if (!project) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Carregando...</div>;
  }

  return <FullScreenViewer project={project} layouts={layouts} assets={assets} onClose={() => history.back()} />;
}

export default ViewerPage;
