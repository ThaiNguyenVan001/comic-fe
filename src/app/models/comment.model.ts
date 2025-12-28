export interface Comment {
  id: string;
  comicId: string;
  chapterId?: string; // Optional: nếu comment ở chapter cụ thể
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  createdAt: Date;
  parentId?: string; // Để hỗ trợ reply comment
  replies?: Comment[];
  likes?: number;
  isLiked?: boolean;
}

