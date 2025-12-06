// types/style.ts

export interface Style {
  id: number;
  styleId: string;
  name: string;
  description: string;
  longDescription?: string | null;
  color: string;
  finish: string;
  lighting: string;
  previewImageUrl: string;
  finalImageUrl: string;
}
