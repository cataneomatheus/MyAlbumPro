import type { AlbumSize, Layout, Project, Asset, AuthUser } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ApiError';
    this.code = code;
  }

  public code: string;
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (response.status === 401) {
      throw new ApiError('Sessão expirada, faça login novamente.', 'UNAUTHORIZED');
    }

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(text || response.statusText, 'HTTP_ERROR');
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const text = await response.text();
    return (text ? (JSON.parse(text) as T) : (undefined as unknown as T));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Não foi possível conectar ao servidor.', 'NETWORK_ERROR', { cause: error });
  }
}

export const api = {
  async getAlbumSizes(): Promise<AlbumSize[]> {
    return request(`${API_BASE}/albums/sizes`);
  },
  async getLayouts(): Promise<Layout[]> {
    return request(`${API_BASE}/layouts`);
  },
  async listProjects(): Promise<Project[]> {
    return request(`${API_BASE}/projects`);
  },
  async getProject(projectId: string): Promise<Project> {
    return request(`${API_BASE}/projects/${projectId}`);
  },
  async listAssets(): Promise<Asset[]> {
    return request(`${API_BASE}/assets`);
  },
  async autoFill(projectId: string): Promise<Project> {
    return request(`${API_BASE}/projects/${projectId}/autofill`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
  async updateProject(project: Project): Promise<Project> {
    return request(`${API_BASE}/projects/${project.projectId}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },
  async getMe(): Promise<AuthUser> {
    return request(`${API_BASE}/me`);
  },
  async googleSignIn(idToken: string): Promise<AuthUser> {
    return request(`${API_BASE}/auth/google/callback`, {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },
  async signOut(): Promise<void> {
    await request(`${API_BASE}/auth/signout`, { method: 'POST' });
  },
};
