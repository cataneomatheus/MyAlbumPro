export type AlbumSize = {
  code: string;
  widthCm: number;
  heightCm: number;
};

export type LayoutSlot = {
  slotId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Layout = {
  id: string;
  name: string;
  slots: LayoutSlot[];
};

export type PageSlot = {
  slotId: string;
  assetId?: string;
  offsetX: number;
  offsetY: number;
  scale: number;
};

export type Page = {
  pageId: string;
  index: number;
  layoutId: string;
  slots: PageSlot[];
};

export type Project = {
  projectId: string;
  title: string;
  albumSize: string;
  ownerId: string;
  pages: Page[];
  createdAt: string;
  updatedAt: string;
};

export type Asset = {
  assetId: string;
  fileName: string;
  mimeType: string;
  s3Key: string;
  thumbKey: string;
  width: number;
  height: number;
  bytes: number;
  thumbnailUrl: string;
};

export type AuthUser = {
  userId: string;
  name: string;
  email: string;
};
