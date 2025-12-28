import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Comic, Chapter } from '../models/comic.model';

@Injectable({
  providedIn: 'root'
})
export class CrawlService {
  private baseUrl = 'https://truyenqqno.com';
  private corsProxy = 'https://api.allorigins.win/raw?url='; // CORS proxy miễn phí

  constructor(private http: HttpClient) {}

  /**
   * Crawl danh sách truyện từ trang chủ
   */
  crawlHomePage(): Observable<Comic[]> {
    const url = `${this.corsProxy}${encodeURIComponent(this.baseUrl)}`;
    
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(html => this.parseComicsFromHTML(html)),
      catchError(error => {
        console.error('Error crawling homepage:', error);
        return of([]);
      })
    );
  }

  /**
   * Crawl thông tin chi tiết một truyện
   */
  crawlComicDetail(comicSlug: string): Observable<Comic | null> {
    const url = `${this.corsProxy}${encodeURIComponent(`${this.baseUrl}/truyen/${comicSlug}`)}`;
    
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(html => this.parseComicDetail(html, comicSlug)),
      catchError(error => {
        console.error('Error crawling comic detail:', error);
        return of(null);
      })
    );
  }

  /**
   * Crawl danh sách chương của một truyện
   */
  crawlChapters(comicSlug: string): Observable<Chapter[]> {
    const url = `${this.corsProxy}${encodeURIComponent(`${this.baseUrl}/truyen/${comicSlug}`)}`;
    
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(html => this.parseChapters(html, comicSlug)),
      catchError(error => {
        console.error('Error crawling chapters:', error);
        return of([]);
      })
    );
  }

  /**
   * Crawl ảnh của một chương
   */
  crawlChapterImages(comicSlug: string, chapterNumber: number): Observable<string[]> {
    const url = `${this.corsProxy}${encodeURIComponent(`${this.baseUrl}/truyen/${comicSlug}/chuong-${chapterNumber}`)}`;
    
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(html => this.parseChapterImages(html)),
      catchError(error => {
        console.error('Error crawling chapter images:', error);
        return of([]);
      })
    );
  }

  /**
   * Parse danh sách truyện từ HTML
   */
  private parseComicsFromHTML(html: string): Comic[] {
    const comics: Comic[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Tìm các section: Truyện Hay, Độc Quyền, Mới Cập Nhật
    const sections = doc.querySelectorAll('.list-stories, .story-item, [class*="comic"]');
    
    sections.forEach((section, index) => {
      const titleEl = section.querySelector('h3, .title, a[href*="/truyen/"]');
      const coverEl = section.querySelector('img');
      const chapterEl = section.querySelector('.chapter, [class*="chapter"]');
      const timeEl = section.querySelector('.time, [class*="time"]');

      if (titleEl && coverEl) {
        const title = titleEl.textContent?.trim() || '';
        const coverImage = coverEl.getAttribute('src') || coverEl.getAttribute('data-src') || '';
        const link = titleEl.closest('a')?.getAttribute('href') || '';
        const slug = this.extractSlugFromUrl(link);
        const latestChapter = chapterEl?.textContent?.trim() || '';
        const lastUpdated = timeEl?.textContent?.trim() || '';

        if (title && slug) {
          comics.push({
            id: slug,
            title: title,
            author: 'Đang tải...',
            coverImage: this.getFullImageUrl(coverImage),
            summary: '',
            lastUpdated: lastUpdated,
            latestChapter: latestChapter,
            category: this.determineCategory(section),
            isExclusive: section.closest('[class*="exclusive"]') !== null,
            chapters: []
          });
        }
      }
    });

    return comics;
  }

  /**
   * Parse thông tin chi tiết truyện
   */
  private parseComicDetail(html: string, slug: string): Comic | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const titleEl = doc.querySelector('h1, .comic-title, [class*="title"]');
    const coverEl = doc.querySelector('.cover img, .comic-cover img, [class*="cover"] img');
    const authorEl = doc.querySelector('.author, [class*="author"]');
    const summaryEl = doc.querySelector('.summary, .description, [class*="summary"], [class*="description"]');
    const chapterList = doc.querySelectorAll('.chapter-list a, [class*="chapter"] a');

    if (!titleEl) return null;

    const title = titleEl.textContent?.trim() || '';
    const coverImage = coverEl?.getAttribute('src') || coverEl?.getAttribute('data-src') || '';
    const author = authorEl?.textContent?.trim() || 'Chưa có thông tin';
    const summary = summaryEl?.textContent?.trim() || '';

    const chapters: Chapter[] = [];
    chapterList.forEach((link, index) => {
      const chapterText = link.textContent?.trim() || '';
      const chapterMatch = chapterText.match(/chương\s*(\d+)/i);
      if (chapterMatch) {
        const chapterNum = parseInt(chapterMatch[1]);
        chapters.push({
          id: `${slug}-${chapterNum}`,
          title: chapterText,
          number: chapterNum,
          pages: []
        });
      }
    });

    return {
      id: slug,
      title: title,
      author: author,
      coverImage: this.getFullImageUrl(coverImage),
      summary: summary,
      chapters: chapters,
      latestChapter: chapters.length > 0 ? `Chương ${chapters[chapters.length - 1].number}` : '',
      category: 'popular'
    };
  }

  /**
   * Parse danh sách chương
   */
  private parseChapters(html: string, comicSlug: string): Chapter[] {
    const chapters: Chapter[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const chapterLinks = doc.querySelectorAll('a[href*="/chuong-"], a[href*="/chapter-"]');
    
    chapterLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.trim() || '';
      const match = href.match(/chuong-(\d+)|chapter-(\d+)/i);
      
      if (match) {
        const chapterNum = parseInt(match[1] || match[2]);
        chapters.push({
          id: `${comicSlug}-${chapterNum}`,
          title: text || `Chương ${chapterNum}`,
          number: chapterNum,
          pages: []
        });
      }
    });

    return chapters.sort((a, b) => b.number - a.number);
  }

  /**
   * Parse ảnh của một chương
   */
  private parseChapterImages(html: string): string[] {
    const images: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Tìm tất cả ảnh trong phần đọc truyện
    const imageElements = doc.querySelectorAll('.reading-content img, .chapter-content img, [class*="reading"] img, [class*="chapter"] img');
    
    imageElements.forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
      if (src && !src.includes('placeholder') && !src.includes('logo')) {
        images.push(this.getFullImageUrl(src));
      }
    });

    return images;
  }

  /**
   * Lấy URL ảnh đầy đủ
   */
  private getFullImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${this.baseUrl}${url}`;
    return `${this.baseUrl}/${url}`;
  }

  /**
   * Extract slug từ URL
   */
  private extractSlugFromUrl(url: string): string {
    const match = url.match(/\/truyen\/([^\/]+)/);
    return match ? match[1] : url.split('/').pop() || '';
  }

  /**
   * Xác định category của truyện
   */
  private determineCategory(element: Element): 'popular' | 'exclusive' | 'new' {
    const parent = element.closest('[class*="section"], [class*="category"]');
    const classList = parent?.className || element.className || '';
    
    if (classList.includes('exclusive') || classList.includes('độc quyền')) {
      return 'exclusive';
    }
    if (classList.includes('new') || classList.includes('mới')) {
      return 'new';
    }
    return 'popular';
  }

  /**
   * Crawl toàn bộ thông tin một truyện (bao gồm ảnh chương)
   */
  crawlFullComic(comicSlug: string): Observable<Comic | null> {
    return forkJoin({
      detail: this.crawlComicDetail(comicSlug),
      chapters: this.crawlChapters(comicSlug)
    }).pipe(
      switchMap(({ detail, chapters }) => {
        if (!detail) return of(null);

        // Lấy 5 chương gần nhất và crawl ảnh
        const recentChapters = chapters.slice(0, 5);
        if (recentChapters.length === 0) {
          return of(detail);
        }

        const chapterObservables = recentChapters.map(chapter =>
          this.crawlChapterImages(comicSlug, chapter.number).pipe(
            map(images => ({
              ...chapter,
              pages: images
            })),
            catchError(() => of({ ...chapter, pages: [] }))
          )
        );

        return forkJoin(chapterObservables).pipe(
          map(chaptersWithImages => ({
            ...detail,
            chapters: chaptersWithImages
          }))
        );
      }),
      catchError(() => of(null))
    );
  }
}

