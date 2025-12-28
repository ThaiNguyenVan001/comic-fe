import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComicService } from '../../services/comic.service';
import { SearchService } from '../../services/search.service';
import { Comic } from '../../models/comic.model';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.scss']
})
export class ComicListComponent implements OnInit {
  popularComics: Comic[] = [];
  exclusiveComics: Comic[] = [];
  newComics: Comic[] = [];
  loading = true;
  bookmarkedComics: Set<string> = new Set();
  searchResults: Comic[] = [];
  isSearchMode = false;
  searchQuery = '';

  constructor(
    private comicService: ComicService,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lắng nghe query params
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.performSearch(this.searchQuery);
      } else if (params['genre']) {
        this.filterByGenre(params['genre']);
      } else if (params['ranking']) {
        this.filterByRanking(params['ranking']);
      } else {
        this.loadComics();
      }
    });
  }

  loadComics(): void {
    this.comicService.getPopularComics().subscribe({
      next: (comics: Comic[]) => {
        this.popularComics = comics;
        this.checkLoadingComplete();
      },
      error: () => {
        this.checkLoadingComplete();
      }
    });

    this.comicService.getExclusiveComics().subscribe({
      next: (comics: Comic[]) => {
        this.exclusiveComics = comics;
        this.checkLoadingComplete();
      },
      error: () => {
        this.checkLoadingComplete();
      }
    });

    this.comicService.getNewComics().subscribe({
      next: (comics: Comic[]) => {
        this.newComics = comics;
        this.checkLoadingComplete();
      },
      error: () => {
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete(): void {
    if (this.popularComics.length > 0 || this.exclusiveComics.length > 0 || this.newComics.length > 0) {
      this.loading = false;
    }
  }

  toggleBookmark(event: Event, comicId: string): void {
    event.stopPropagation();
    if (this.bookmarkedComics.has(comicId)) {
      this.bookmarkedComics.delete(comicId);
    } else {
      this.bookmarkedComics.add(comicId);
    }
  }

  isBookmarked(comicId: string): boolean {
    return this.bookmarkedComics.has(comicId);
  }

  performSearch(query: string): void {
    if (!query || query.trim().length === 0) {
      this.isSearchMode = false;
      this.loadComics();
      return;
    }

    this.loading = true;
    this.isSearchMode = true;
    this.searchService.searchComics(query).subscribe({
      next: (results: Comic[]) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterByGenre(genre: string): void {
    this.loading = true;
    this.isSearchMode = true;
    this.searchService.searchByGenre(genre).subscribe({
      next: (results: Comic[]) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterByRanking(ranking: string): void {
    // Tạm thời load tất cả, có thể mở rộng sau
    this.loadComics();
  }
}
