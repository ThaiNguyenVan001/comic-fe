import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private commentsKey = 'comic_comments';
  private commentsSubject = new BehaviorSubject<Comment[]>(this.loadCommentsFromStorage());
  public comments$ = this.commentsSubject.asObservable();

  constructor() {
    this.loadComments();
  }

  /**
   * Lấy tất cả comments của một truyện
   */
  getCommentsByComicId(comicId: string): Observable<Comment[]> {
    return this.comments$.pipe(
      map(comments => comments.filter(c => c.comicId === comicId && !c.parentId))
    );
  }

  /**
   * Lấy comments của một chapter cụ thể
   */
  getCommentsByChapterId(comicId: string, chapterId: string): Observable<Comment[]> {
    return this.comments$.pipe(
      map(comments => comments.filter(c => c.comicId === comicId && c.chapterId === chapterId && !c.parentId))
    );
  }

  /**
   * Thêm comment mới
   */
  addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'replies'>): void {
    const newComment: Comment = {
      ...comment,
      id: this.generateId(),
      createdAt: new Date(),
      replies: [],
      likes: 0,
      isLiked: false
    };

    const comments = [...this.commentsSubject.value, newComment];
    this.saveComments(comments);
    this.commentsSubject.next(comments);
  }

  /**
   * Reply một comment
   */
  replyToComment(parentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'replies'>): void {
    const newReply: Comment = {
      ...reply,
      id: this.generateId(),
      parentId: parentId,
      createdAt: new Date(),
      replies: [],
      likes: 0,
      isLiked: false
    };

    const comments = [...this.commentsSubject.value, newReply];
    this.saveComments(comments);
    this.commentsSubject.next(comments);
  }

  /**
   * Xóa comment
   */
  deleteComment(commentId: string): void {
    const comments = this.commentsSubject.value.filter(c => c.id !== commentId && c.parentId !== commentId);
    this.saveComments(comments);
    this.commentsSubject.next(comments);
  }

  /**
   * Like/Unlike comment
   */
  toggleLike(commentId: string): void {
    const comments = this.commentsSubject.value.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: (comment.likes || 0) + (comment.isLiked ? -1 : 1),
          isLiked: !comment.isLiked
        };
      }
      return comment;
    });

    this.saveComments(comments);
    this.commentsSubject.next(comments);
  }

  private loadCommentsFromStorage(): Comment[] {
    const stored = localStorage.getItem(this.commentsKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }));
    }
    return [];
  }

  private saveComments(comments: Comment[]): void {
    localStorage.setItem(this.commentsKey, JSON.stringify(comments));
  }

  private loadComments(): void {
    const comments = this.loadCommentsFromStorage();
    this.commentsSubject.next(comments);
  }

  private generateId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

