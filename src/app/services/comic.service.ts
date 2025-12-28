import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Comic, Chapter } from '../models/comic.model';
import { CrawlService } from './crawl.service';

@Injectable({
  providedIn: 'root'
})
export class ComicService {
  private useCrawl = false; // Bật/tắt crawl từ truyenqqno.com
  private comicsCache: Comic[] = [];

  constructor(
    private crawlService: CrawlService
  ) {
    // Load dữ liệu mẫu ban đầu
    this.loadSampleData();
  }

  /**
   * Lấy danh sách truyện phổ biến
   */
  getPopularComics(): Observable<Comic[]> {
    return of(this.getSamplePopularComics());
  }

  /**
   * Lấy danh sách truyện độc quyền
   */
  getExclusiveComics(): Observable<Comic[]> {
    return of(this.getSampleExclusiveComics());
  }

  /**
   * Lấy danh sách truyện mới
   */
  getNewComics(): Observable<Comic[]> {
    return of(this.getSampleNewComics());
  }

  /**
   * Lấy thông tin chi tiết một truyện
   */
  getComicById(id: string): Observable<Comic | undefined> {
    const sampleComic = this.findSampleComic(id);
    return of(sampleComic);
  }

  /**
   * Làm giàu comic với ảnh chương từ crawl
   */
  private enrichComicWithImages(comic: Comic): Observable<Comic> {
    if (!comic.chapters || comic.chapters.length === 0) {
      return of(comic);
    }

    // Lấy 3 chương đầu và crawl ảnh
    const chaptersToEnrich = comic.chapters.slice(0, 3);
    const chapterObservables = chaptersToEnrich.map(chapter => {
      const slug = this.extractSlugFromTitle(comic.title);
      return this.crawlService.crawlChapterImages(slug, chapter.number).pipe(
        map(images => ({
          ...chapter,
          pages: images.length > 0 ? images : chapter.pages
        })),
        catchError(() => of(chapter))
      );
    });

    return forkJoin(chapterObservables).pipe(
      map(enrichedChapters => {
        const otherChapters = comic.chapters.slice(3);
        return {
          ...comic,
          chapters: [...enrichedChapters, ...otherChapters]
        };
      }),
      catchError(() => of(comic))
    );
  }

  /**
   * Lấy một chương cụ thể
   */
  getChapter(comicId: string, chapterId: string): Observable<Chapter | undefined> {
    return this.getComicById(comicId).pipe(
      map(comic => {
        if (!comic) return undefined;
        return comic.chapters.find(ch => ch.id === chapterId);
      }),
      switchMap(chapter => {
        if (!chapter || (chapter.pages && chapter.pages.length > 0)) {
          return of(chapter);
        }
        // Nếu chưa có ảnh, thử crawl
        const slug = this.extractSlugFromTitle(this.findSampleComic(comicId)?.title || '');
        return this.crawlService.crawlChapterImages(slug, chapter.number).pipe(
          map(images => ({
            ...chapter,
            pages: images
          })),
          catchError(() => of(chapter))
        );
      })
    );
  }

  /**
   * Lấy tất cả truyện
   */
  getComics(): Observable<Comic[]> {
    return of([
      ...this.getSamplePopularComics(),
      ...this.getSampleExclusiveComics(),
      ...this.getSampleNewComics()
    ]);
  }

  // ========== Sample Data Methods ==========

  private loadSampleData(): void {
    this.comicsCache = [
      ...this.getSamplePopularComics(),
      ...this.getSampleExclusiveComics(),
      ...this.getSampleNewComics()
    ];
  }

  private findSampleComic(id: string): Comic | undefined {
    return this.comicsCache.find(c => c.id === id);
  }

  private extractSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private getSamplePopularComics(): Comic[] {
    return [
      {
        id: 'vong-du-chi-can-chien-phap-su',
        title: 'Võng Du Chi Cận Chiến Pháp Sư',
        author: 'Tác giả A',
        coverImage: 'https://picsum.photos/seed/vong-du-cover/300/400?grayscale',
        summary: 'Câu chuyện về một pháp sư trong game thực tế ảo với kỹ năng cận chiến độc đáo.',
        lastUpdated: '7 Giờ Trước',
        latestChapter: 'Chương 507',
        category: 'popular',
        genres: ['Action', 'Fantasy', 'Adventure'],
        chapters: this.generateChapters('vong-du-chi-can-chien-phap-su', 507, 5)
      },
      {
        id: 'dau-pha-thuong-khung',
        title: 'Đấu Phá Thương Khung',
        author: 'Thiên Tàm Thổ Đậu',
        coverImage: 'https://picsum.photos/seed/dau-pha-cover/300/400?grayscale',
        summary: 'Câu chuyện về Tiêu Viêm trên con đường trở thành đấu đế mạnh nhất.',
        lastUpdated: '11 Giờ Trước',
        latestChapter: 'Chương 501',
        category: 'popular',
        genres: ['Action', 'Adventure', 'Fantasy'],
        chapters: this.generateChapters('dau-pha-thuong-khung', 501, 5)
      },
      {
        id: 'thien-tai-am-nhac-truong-trung-hoc',
        title: 'Thiên Tài Âm Nhạc Trường Trung Học',
        author: 'Tác giả B',
        coverImage: 'https://picsum.photos/seed/thien-tai-cover/300/400?grayscale',
        summary: 'Một thiên tài âm nhạc tại trường trung học.',
        lastUpdated: '11 Giờ Trước',
        latestChapter: 'Chương 74',
        category: 'popular',
        genres: ['Romance', 'Drama', 'Comedy'],
        chapters: this.generateChapters('thien-tai-am-nhac-truong-trung-hoc', 74, 5)
      },
      {
        id: 'gay-go-cap-99',
        title: 'Gậy Gỗ Cấp 99+',
        author: 'Tác giả C',
        coverImage: 'https://picsum.photos/seed/gay-go-cover/300/400?grayscale',
        summary: 'Nhân vật chính với cây gậy gỗ cấp 99+ vô địch thiên hạ.',
        lastUpdated: '12 Giờ Trước',
        latestChapter: 'Chương 175',
        category: 'popular',
        genres: ['Action', 'Comedy', 'Fantasy'],
        chapters: this.generateChapters('gay-go-cap-99', 175, 5)
      },
      {
        id: 'shark-ca-map',
        title: 'Shark - Cá Mập',
        author: 'Tác giả D',
        coverImage: 'https://picsum.photos/seed/shark-cover/300/400?grayscale',
        summary: 'Câu chuyện về một chiến binh với biệt danh Cá Mập.',
        lastUpdated: '16 Giờ Trước',
        latestChapter: 'Chương 390',
        category: 'popular',
        genres: ['Action', 'Drama'],
        chapters: this.generateChapters('shark-ca-map', 390, 5)
      },
      {
        id: 'one-piece-new',
        title: 'One Piece',
        author: 'Eiichiro Oda',
        coverImage: 'https://picsum.photos/seed/one-piece-cover/300/400?grayscale',
        summary: 'Câu chuyện về Monkey D. Luffy và nhóm hải tặc của anh ấy.',
        lastUpdated: '1 Ngày Trước',
        latestChapter: 'Chương 1170',
        category: 'popular',
        genres: ['Action', 'Adventure', 'Comedy'],
        chapters: this.generateChapters('one-piece-new', 1170, 5)
      },
      {
        id: 'naruto-shippuden',
        title: 'Naruto Shippuden',
        author: 'Masashi Kishimoto',
        coverImage: 'https://picsum.photos/seed/naruto-cover/300/400?grayscale',
        summary: 'Cuộc phiêu lưu của Naruto khi trở về làng sau 2 năm rèn luyện.',
        lastUpdated: '2 Ngày Trước',
        latestChapter: 'Chương 700',
        category: 'popular',
        genres: ['Action', 'Adventure', 'Drama'],
        chapters: this.generateChapters('naruto-shippuden', 700, 5)
      }
    ];
  }

  private getSampleExclusiveComics(): Comic[] {
    return [
      {
        id: 'con-thon-thien-ha',
        title: 'Côn Thôn Thiên Hạ',
        author: 'Tác giả H',
        coverImage: 'https://picsum.photos/seed/con-thon-cover/300/400?grayscale',
        summary: 'Câu chuyện về một ngôi làng nhỏ nhưng ẩn chứa sức mạnh có thể chấn động thiên hạ.',
        lastUpdated: '2 Giờ Trước',
        latestChapter: 'Chương 382',
        isExclusive: true,
        category: 'exclusive',
        genres: ['Action', 'Fantasy', 'Adventure'],
        chapters: this.generateChapters('con-thon-thien-ha', 382, 5)
      },
      {
        id: 'red-shirt',
        title: 'Red Shirt',
        author: 'Tác giả I',
        coverImage: 'https://picsum.photos/seed/red-shirt-cover/300/400?grayscale',
        summary: 'Câu chuyện về một chiến binh mặc áo đỏ.',
        lastUpdated: '2 Giờ Trước',
        latestChapter: 'Chương 40',
        isExclusive: true,
        category: 'exclusive',
        genres: ['Action', 'Drama'],
        chapters: this.generateChapters('red-shirt', 40, 5)
      },
      {
        id: 'vo-lam-dau-bep',
        title: 'Võ Lâm Đệ Nhất Đầu Bếp',
        author: 'Tác giả K',
        coverImage: 'https://picsum.photos/seed/vo-lam-cover/300/400?grayscale',
        summary: 'Một đầu bếp trong giang hồ võ lâm, sử dụng kỹ năng nấu ăn để đạt đến đỉnh cao võ đạo.',
        lastUpdated: '4 Giờ Trước',
        latestChapter: 'Chương 62',
        isExclusive: true,
        category: 'exclusive',
        genres: ['Action', 'Comedy', 'Adventure'],
        chapters: this.generateChapters('vo-lam-dau-bep', 62, 5)
      }
    ];
  }

  private getSampleNewComics(): Comic[] {
    return [
      {
        id: 'de-em-cho-co-muon-chut-lua-nhe',
        title: 'Để Em Cho Cô Mượn Chút Lửa Nhé?',
        author: 'Tác giả P',
        coverImage: 'https://picsum.photos/seed/de-em-cover/300/400?grayscale',
        summary: 'Câu chuyện tình cảm ngọt ngào.',
        lastUpdated: '1 Giờ Trước',
        latestChapter: 'Chương 73',
        category: 'new',
        genres: ['Romance', 'Comedy'],
        chapters: this.generateChapters('de-em-cho-co-muon-chut-lua-nhe', 73, 5)
      },
      {
        id: 'dap-vo-hoang-de-nu-nhi-than',
        title: 'Đập Vỡ Hoàng Đế Nữ Nhi Thân',
        author: 'Tác giả Q',
        coverImage: 'https://picsum.photos/seed/dap-vo-cover/300/400?grayscale',
        summary: 'Câu chuyện về một nữ nhi hoàng đế mạnh mẽ.',
        lastUpdated: '1 Giờ Trước',
        latestChapter: 'Chương 75',
        category: 'new',
        genres: ['Action', 'Romance', 'Drama'],
        chapters: this.generateChapters('dap-vo-hoang-de-nu-nhi-than', 75, 5)
      },
      {
        id: 'luyen-kim-thuat-si',
        title: 'Luyện Kim Thuật Sĩ Tà Ác',
        author: 'Tác giả R',
        coverImage: 'https://picsum.photos/seed/luyen-kim-cover/300/400?grayscale',
        summary: 'Một luyện kim thuật sư tà ác không thể kiểm soát được những thí nghiệm của chính mình.',
        lastUpdated: '1 Giờ Trước',
        latestChapter: 'Chương 68',
        category: 'new',
        genres: ['Action', 'Fantasy', 'Horror'],
        chapters: this.generateChapters('luyen-kim-thuat-si', 68, 5)
      },
      {
        id: 'khong-co-chien-binh-xau',
        title: 'Trên Thế Giới Không Có Chiến Binh Xấu',
        author: 'Tác giả S',
        coverImage: 'https://picsum.photos/seed/khong-co-cover/300/400?grayscale',
        summary: 'Câu chuyện chứng minh rằng trên thế giới không có chiến binh nào là xấu.',
        lastUpdated: '2 Giờ Trước',
        latestChapter: 'Chương 51',
        category: 'new',
        genres: ['Action', 'Drama'],
        chapters: this.generateChapters('khong-co-chien-binh-xau', 51, 5)
      },
      {
        id: 'anh-hung-gioi-moi-thu',
        title: 'Một Anh Hùng Giỏi Mọi Thứ',
        author: 'Tác giả T',
        coverImage: 'https://picsum.photos/seed/anh-hung-cover/300/400?grayscale',
        summary: 'Một anh hùng với khả năng giỏi mọi thứ, từ võ thuật đến học thuật.',
        lastUpdated: '2 Giờ Trước',
        latestChapter: 'Chương 45',
        category: 'new',
        genres: ['Action', 'Comedy', 'Adventure'],
        chapters: this.generateChapters('anh-hung-gioi-moi-thu', 45, 5)
      }
    ];
  }

  private generateChapters(slug: string, totalChapters: number, count: number): Chapter[] {
    const chapters: Chapter[] = [];
    const recentChapters = Math.min(count, totalChapters);
    
    // Seed để tạo ảnh khác nhau cho mỗi chương
    const seed = this.hashCode(slug);
    
    for (let i = 0; i < recentChapters; i++) {
      const chapterNum = totalChapters - i;
      const pages: string[] = [];
      
      // Tạo 15-25 trang ảnh cho mỗi chương
      const pageCount = 15 + Math.floor(Math.random() * 11);
      
      for (let page = 1; page <= pageCount; page++) {
        // Sử dụng ảnh manga với grayscale (đen trắng) từ Picsum Photos
        // Seed để đảm bảo ảnh nhất quán cho mỗi trang
        const imageSeed = `manga-${slug}-ch${chapterNum}-p${page}`;
        const mangaPageUrl = `https://picsum.photos/seed/${imageSeed}/800/1200?grayscale`;
        pages.push(mangaPageUrl);
      }
      
      chapters.push({
        id: `${slug}-${chapterNum}`,
        title: `Chương ${chapterNum}`,
        number: chapterNum,
        pages: pages
      });
    }
    
    return chapters.reverse();
  }

  /**
   * Hash string thành number để dùng làm seed
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
