import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const LoginPage = lazy(() => import('./routes/LoginPage'));
const ProjectsPage = lazy(() => import('./routes/ProjectsPage'));
const EditorPage = lazy(() => import('./routes/EditorPage'));
const ViewerPage = lazy(() => import('./routes/ViewerPage'));

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="p-6 text-slate-200">Carregando...</div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/editor/:projectId" element={<EditorPage />} />
            <Route path="/viewer/:projectId" element={<ViewerPage />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;










