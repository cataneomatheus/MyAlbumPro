import type { AlbumSize, Layout, Project, Asset, AuthUser, AuthSession } from "../types";
import { getAccessToken, setSession, getSession, clearSession } from "./session";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export class ApiError extends Error {
  public code: string;

  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.code = code;
  }
}

function resolveUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const headers = new Headers(init?.headers as HeadersInit);

    if (init?.body && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(path, {
      ...init,
      headers,
    });

    if (response.status === 401) {
      clearSession();
      throw new ApiError("Sessao expirada, faca login novamente.", "UNAUTHORIZED");
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();

    if (!response.ok) {
      throw new ApiError(text || response.statusText, "HTTP_ERROR");
    }

    if (!text) {
      return undefined as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new ApiError("Resposta invalida do servidor.", "PARSE_ERROR", { cause: error });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Nao foi possivel conectar ao servidor.", "NETWORK_ERROR", { cause: error });
  }
}

type AuthResponse = {
  userId: string;
  accessToken: string;
  expiresAt: string;
  name: string;
  email: string;
  pictureUrl: string;
};

type DevLoginPayload = {
  email?: string;
  name?: string;
};

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
    const assets = await request<Asset[]>(`${API_BASE}/assets`);
    return assets.map((asset) => ({
      ...asset,
      thumbnailUrl: resolveUrl(asset.thumbnailUrl || `/assets/${asset.assetId}/thumbnail`),
    }));
  },
  async autoFill(projectId: string): Promise<Project> {
    return request(`${API_BASE}/projects/${projectId}/autofill`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
  async updateProject(project: Project): Promise<Project> {
    return request(`${API_BASE}/projects/${project.projectId}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  },
  async getMe(): Promise<AuthUser> {
    const result = await request<{
      userId: string;
      email: string;
      name: string;
      pictureUrl?: string;
    }>(`${API_BASE}/me`);

    const user: AuthUser = {
      userId: result.userId,
      email: result.email,
      name: result.name,
      pictureUrl: result.pictureUrl,
    };

    const session = getSession();
    if (session) {
      setSession({ ...session, user });
    }

    return user;
  },
  async googleSignIn(idToken: string): Promise<AuthUser> {
    const payload = await request<AuthResponse>(`${API_BASE}/auth/google/callback`, {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });

    const session: AuthSession = {
      accessToken: payload.accessToken,
      expiresAt: payload.expiresAt,
      user: {
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        pictureUrl: payload.pictureUrl,
      },
    };

    setSession(session);
    return session.user;
  },
  async devSignIn(payload: DevLoginPayload): Promise<AuthUser> {
    const body = {
      email: payload.email?.trim() ?? "",
      name: payload.name?.trim() ?? "",
    };

    const response = await request<AuthResponse>(`${API_BASE}/auth/dev-login`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const session: AuthSession = {
      accessToken: response.accessToken,
      expiresAt: response.expiresAt,
      user: {
        userId: response.userId,
        name: response.name,
        email: response.email,
        pictureUrl: response.pictureUrl,
      },
    };

    setSession(session);
    return session.user;
  },
  async signOut(): Promise<void> {
    try {
      await request(`${API_BASE}/auth/signout`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== "UNAUTHORIZED") {
        throw error;
      }
    } finally {
      clearSession();
    }
  },
};
