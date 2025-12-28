import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comic, Chapter } from '../models/comic.model';

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private comicsKey = 'cms_comics';
  private comicsSubject = new BehaviorSubject<Comic[]>(this.loadComicsFromStorage());
  public comics$ = this.comicsSubject.asObservable();

  constructor() {
    // Load từ localStorage khi khởi tạo
    this.loadComics();
  }

  /**
   * Lấy tất cả truyện từ CMS
   */
  getAllComics(): Observable<Comic[]> {
    return this.comics$;
  }

  /**
   * Lấy một truyện theo ID
   */
  getComicById(id: string): Comic | undefined {
    const comics = this.comicsSubject.value;
    return comics.find(c => c.id === id);
  }

  /**
   * Thêm truyện mới
   */
  addComic(comic: Comic): void {
    const comics = [...this.comicsSubject.value, comic];
    this.saveComics(comics);
    this.comicsSubject.next(comics);
  }

  /**
   * Cập nhật truyện
   */
  updateComic(id: string, updatedComic: Partial<Comic>): void {
    const comics = this.comicsSubject.value.map(comic => 
      comic.id === id ? { ...comic, ...updatedComic } : comic
    );
    this.saveComics(comics);
    this.comicsSubject.next(comics);
  }

  /**
   * Xóa truyện
   */
  deleteComic(id: string): void {
    const comics = this.comicsSubject.value.filter(comic => comic.id !== id);
    this.saveComics(comics);
    this.comicsSubject.next(comics);
  }

  /**
   * Thêm chương vào truyện
   */
  addChapter(comicId: string, chapter: Chapter): void {
    const comics = this.comicsSubject.value.map(comic => {
      if (comic.id === comicId) {
        const updatedChapters = [...comic.chapters, chapter].sort((a, b) => a.number - b.number);
        return { ...comic, chapters: updatedChapters };
      }
      return comic;
    });
    this.saveComics(comics);
    this.comicsSubject.next(comics);
  }

  /**
   * Cập nhật chương
   */
  updateChapter(comicId: string, chapterId: string, updatedChapter: Partial<Chapter>): void {
    const comics = this.comicsSubject.value.map(comic => {
      if (comic.id === comicId) {
        const updatedChapters = comic.chapters.map(ch => 
          ch.id === chapterId ? { ...ch, ...updatedChapter } : ch
        );
        return { ...comic, chapters: updatedChapters };
      }
      return comic;
    });
    this.saveComics(comics);
    this.comicsSubject.next(comics);
  }

  /**
   * Xóa chương
   */
  deleteChapter(comicId: string, chapterId: string): void {
    const comics = this.comicsSubject.value.map(comic => {
      if (comic.id === comicId) {
        const updatedChapters = comic.chapters.filter(ch => ch.id !== chapterId);
        return { ...comic, chapters: updatedChapters };
      }
      return comic;
    });
    this.saveComics(comics);
    this.comicsSubject.next(comics);
  }

  /**
   * Lưu vào localStorage
   */
  private saveComics(comics: Comic[]): void {
    try {
      localStorage.setItem(this.comicsKey, JSON.stringify(comics));
    } catch (error) {
      console.error('Error saving comics to localStorage:', error);
    }
  }

  /**
   * Load từ localStorage
   */
  private loadComicsFromStorage(): Comic[] {
    try {
      const stored = localStorage.getItem(this.comicsKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading comics from localStorage:', error);
    }
    return [];
  }

  /**
   * Load comics
   */
  private loadComics(): void {
    const comics = this.loadComicsFromStorage();
    this.comicsSubject.next(comics);
  }

  /**
   * Export dữ liệu
   */
  exportData(): string {
    return JSON.stringify(this.comicsSubject.value, null, 2);
  }

  /**
   * Import dữ liệu
   */
  importData(jsonData: string): boolean {
    try {
      const comics = JSON.parse(jsonData);
      if (Array.isArray(comics)) {
        this.saveComics(comics);
        this.comicsSubject.next(comics);
        return true;
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
    return false;
  }
}


