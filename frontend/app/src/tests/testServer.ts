import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const apiUrl = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

const sampleProject = {
  projectId: 'proj-1',
  title: 'Viagem',
  albumSize: '30x30',
  ownerId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: [
    {
      pageId: 'page-1',
      index: 0,
      layoutId: 'layout-1',
      slots: [
        { slotId: 'slot-a', assetId: 'asset-1', offsetX: 0, offsetY: 0, scale: 1 },
      ],
    },
  ],
};

const sampleLayouts = [
  {
    id: 'layout-1',
    name: 'Cheio',
    slots: [{ slotId: 'slot-a', x: 0.05, y: 0.05, width: 0.9, height: 0.9 }],
  },
  {
    id: 'layout-2',
    name: 'Dois',
    slots: [
      { slotId: 'slot-left', x: 0.05, y: 0.1, width: 0.4, height: 0.8 },
      { slotId: 'slot-right', x: 0.55, y: 0.1, width: 0.4, height: 0.8 },
    ],
  },
];

const sampleAssets = [
  {
    assetId: 'asset-1',
    fileName: 'foto.jpg',
    mimeType: 'image/jpeg',
    s3Key: 'foto',
    thumbKey: 'foto-thumb',
    width: 1200,
    height: 800,
    bytes: 1024,
    thumbnailUrl: 'https://picsum.photos/seed/asset-1/120/120',
  },
];

export const handlers = [
  http.get(`${apiUrl}/albums/sizes`, () =>
    HttpResponse.json([
      { code: '30x30', widthCm: 30, heightCm: 30 },
      { code: '40x40', widthCm: 40, heightCm: 40 },
    ]),
  ),
  http.get(`${apiUrl}/layouts`, () => HttpResponse.json(sampleLayouts)),
  http.get(`${apiUrl}/projects`, () => HttpResponse.json([sampleProject])),
  http.get(`${apiUrl}/projects/:id`, () => HttpResponse.json(sampleProject)),
  http.post(`${apiUrl}/projects/:id/autofill`, () => HttpResponse.json(sampleProject)),
  http.put(`${apiUrl}/projects/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),
  http.get(`${apiUrl}/assets`, () => HttpResponse.json(sampleAssets)),
  http.get(`${apiUrl}/me`, () =>
    HttpResponse.json({ userId: 'user-1', name: 'Alice', email: 'alice@example.com', pictureUrl: '' }),
  ),
  http.post(`${apiUrl}/auth/google/callback`, () =>
    HttpResponse.json({
      userId: 'user-1',
      accessToken: 'jwt-token',
      expiresAt: new Date().toISOString(),
      name: 'Alice',
      email: 'alice@example.com',
      pictureUrl: '',
    }),
  ),
  http.post(`${apiUrl}/auth/signout`, () => HttpResponse.json(null, { status: 204 })),
];

export const server = setupServer(...handlers);










