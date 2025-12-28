import { Injectable } from '@angular/core';
import { Chapter, Comic } from '../models/comic.model';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  /**
   * Tải một chương truyện (tải từng ảnh riêng lẻ)
   */
  async downloadChapter(comic: Comic, chapter: Chapter): Promise<void> {
    if (!chapter.pages || chapter.pages.length === 0) {
      alert('Chương này chưa có ảnh để tải!');
      return;
    }

    // Tải từng ảnh riêng lẻ
    for (let i = 0; i < chapter.pages.length; i++) {
      try {
        const imageUrl = chapter.pages[i];
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${comic.title} - ${chapter.title} - Trang ${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Delay giữa các lần tải
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error downloading image ${i + 1}:`, error);
      }
    }
  }

  /**
   * Tải ảnh bìa truyện
   */
  async downloadCover(comic: Comic): Promise<void> {
    try {
      const response = await fetch(comic.coverImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${comic.title} - Bìa.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading cover:', error);
    }
  }

  /**
   * Lấy extension của ảnh từ URL
   */
  private getImageExtension(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
    return match ? match[1] : 'jpg';
  }
}

