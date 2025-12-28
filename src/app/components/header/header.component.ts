import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  showGenreDropdown = false;
  showRankingDropdown = false;
  searchQuery = '';
  isDarkTheme = true;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private searchService: SearchService,
    private authService: AuthService
  ) {
    // Đóng dropdown khi chuyển trang
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeDropdowns();
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = user !== null;
    });
  }

  toggleGenreDropdown(): void {
    this.showGenreDropdown = !this.showGenreDropdown;
    this.showRankingDropdown = false;
  }

  toggleRankingDropdown(): void {
    this.showRankingDropdown = !this.showRankingDropdown;
    this.showGenreDropdown = false;
  }

  closeDropdowns(): void {
    this.showGenreDropdown = false;
    this.showRankingDropdown = false;
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/'], { 
        queryParams: { search: this.searchQuery.trim() } 
      });
    }
  }

  onSearchInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch(event);
    }
  }

  selectGenre(genre: string): void {
    this.router.navigate(['/'], { 
      queryParams: { genre: genre } 
    });
    this.closeDropdowns();
  }

  selectRanking(type: string): void {
    this.router.navigate(['/'], { 
      queryParams: { ranking: type } 
    });
    this.closeDropdowns();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('light-theme', !this.isDarkTheme);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  focusSearch(event: Event): void {
    event.preventDefault();
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  goToHome(): void {
    this.router.navigate(['/'], { queryParams: {} });
    window.scrollTo(0, 0);
  }
}

