
export interface FileItem {
  id: string;
  name: string;
  content: string;
  lastModified: number;
  type: string;
  size: number;
}

export type ViewState = 'explorer' | 'editor';

export interface AppState {
  files: FileItem[];
  currentFileId: string | null;
  view: ViewState;
}
