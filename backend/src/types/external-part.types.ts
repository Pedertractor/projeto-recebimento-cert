export type ExternalPartImage = {
  id: number;
  partId: number;
  path: string;
  name: string | null;
  ripSelected: boolean;
  isDeletable: boolean;
};

export type ExternalPartResponse = {
  id: number;
  partCode: string;
  partNumber: string;
  description: string | null;
  group: string;
  client: string | null;
  serverPath: string | null;
  localPath: string | null;
  review: string | null;
  reviewChanged: boolean;
  status: boolean;
  images: ExternalPartImage[];
  createdAt: string;
  updatedAt: string;
};
