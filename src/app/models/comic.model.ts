export interface Comic {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  summary: string;
  chapters: Chapter[];
  lastUpdated?: string; // e.g., "7 Giờ Trước", "1 Giờ Trước"
  isExclusive?: boolean; // Độc quyền
  latestChapter?: string; // e.g., "Chương 507"
  category?: string; // "popular" | "exclusive" | "new"
  genres?: string[]; // Thể loại: ["Action", "Romance", "Comedy", ...]
}

export interface Chapter {
  id: string;
  title: string;
  number: number;
  pages: string[];
}

