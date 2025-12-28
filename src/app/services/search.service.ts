import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comic } from '../models/comic.model';
import { ComicService } from './comic.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private comicService: ComicService) {}

  searchComics(query: string): Observable<Comic[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.comicService.getComics().pipe(
      map(comics => {
        return comics.filter(comic => 
          comic.title.toLowerCase().includes(searchTerm) ||
          comic.author.toLowerCase().includes(searchTerm) ||
          comic.summary.toLowerCase().includes(searchTerm)
        );
      })
    );
  }

  searchByGenre(genre: string): Observable<Comic[]> {
    return this.comicService.getComics().pipe(
      map(comics => {
        // Map genre từ tiếng Việt sang tiếng Anh
        const genreMap: { [key: string]: string } = {
          'action': 'Action',
          'romance': 'Romance',
          'comedy': 'Comedy',
          'fantasy': 'Fantasy',
          'drama': 'Drama',
          'adventure': 'Adventure',
          'supernatural': 'Supernatural',
          'horror': 'Horror'
        };

        const genreName = genreMap[genre.toLowerCase()] || genre;
        
        return comics.filter(comic => {
          if (!comic.genres || comic.genres.length === 0) {
            return false;
          }
          return comic.genres.some(g => 
            g.toLowerCase().includes(genreName.toLowerCase()) ||
            genreName.toLowerCase().includes(g.toLowerCase())
          );
        });
      })
    );
  }
}

