import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComicService } from '../../services/comic.service';
import { DownloadService } from '../../services/download.service';
import { Chapter, Comic } from '../../models/comic.model';

@Component({
  selector: 'app-chapter-reader',
  templateUrl: './chapter-reader.component.html',
  styleUrls: ['./chapter-reader.component.scss']
})
export class ChapterReaderComponent implements OnInit {
  chapter: Chapter | undefined;
  comic: Comic | undefined;
  comicTitle = '';
  loading = true;
  currentChapterIndex = 0;
  hasPreviousChapter = false;
  hasNextChapter = false;
  isDownloading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comicService: ComicService,
    private downloadService: DownloadService
  ) {}

  ngOnInit(): void {
    const comicId = this.route.snapshot.paramMap.get('comicId');
    const chapterId = this.route.snapshot.paramMap.get('chapterId');

    if (comicId && chapterId) {
      this.loadChapter(comicId, chapterId);
    } else {
      this.loading = false;
    }
  }

  loadChapter(comicId: string, chapterId: string): void {
    this.comicService.getComicById(comicId).subscribe({
      next: (comic) => {
        if (comic) {
          this.comic = comic;
          this.comicTitle = comic.title;
          const chapter = comic.chapters.find(ch => ch.id === chapterId);
          this.chapter = chapter;
          
          if (chapter) {
            this.currentChapterIndex = comic.chapters.findIndex(ch => ch.id === chapterId);
            this.hasPreviousChapter = this.currentChapterIndex > 0;
            this.hasNextChapter = this.currentChapterIndex < comic.chapters.length - 1;
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  previousChapter(): void {
    if (this.comic && this.hasPreviousChapter) {
      const prevChapter = this.comic.chapters[this.currentChapterIndex - 1];
      this.loadChapter(this.comic.id, prevChapter.id);
      window.scrollTo(0, 0);
    }
  }

  nextChapter(): void {
    if (this.comic && this.hasNextChapter) {
      const nextChapter = this.comic.chapters[this.currentChapterIndex + 1];
      this.loadChapter(this.comic.id, nextChapter.id);
      window.scrollTo(0, 0);
    }
  }

  goBack(): void {
    window.history.back();
  }

  goToComicDetail(): void {
    if (this.comic) {
      this.router.navigate(['/comic', this.comic.id]);
    }
  }

  downloadChapter(): void {
    if (!this.comic || !this.chapter || this.isDownloading) {
      return;
    }

    this.isDownloading = true;
    this.downloadService.downloadChapter(this.comic, this.chapter)
      .then(() => {
        this.isDownloading = false;
      })
      .catch((error) => {
        console.error('Download error:', error);
        this.isDownloading = false;
      });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onImageLoad(): void {
    // Image loaded successfully
  }

  onImageError(): void {
    // Handle image load error
    console.error('Failed to load image');
  }
}

