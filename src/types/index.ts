export type TaskCategory = 'project' | 'learning';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string | null;
  completedAt?: string | null;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type: 'image' | 'file';
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority?: TaskPriority;
  startDate?: string | null;
  dueDate?: string | null;
  subtasks: SubTask[];
  progress: number;
  isCompleted: boolean;
  attachments?: TaskAttachment[];
  engineeringNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  images?: string[];
  linkPreview?: LinkPreviewData;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}