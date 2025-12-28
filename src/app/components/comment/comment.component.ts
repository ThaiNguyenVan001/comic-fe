import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comicId!: string;
  @Input() chapterId?: string;

  comments: Comment[] = [];
  newComment = '';
  replyingTo: string | null = null;
  replyContent = '';
  currentUser: any = null;
  loading = false;

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    if (this.chapterId) {
      this.commentService.getCommentsByChapterId(this.comicId, this.chapterId).subscribe({
        next: (comments) => {
          this.comments = this.buildCommentTree(comments);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.commentService.getCommentsByComicId(this.comicId).subscribe({
        next: (comments) => {
          this.comments = this.buildCommentTree(comments);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  buildCommentTree(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Tạo map cho tất cả comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Xây dựng cây comments
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.currentUser) {
      alert('Vui lòng đăng nhập và nhập nội dung bình luận!');
      return;
    }

    this.commentService.addComment({
      comicId: this.comicId,
      chapterId: this.chapterId,
      userId: this.currentUser.id || this.currentUser.email,
      username: this.currentUser.username || this.currentUser.email,
      avatar: this.currentUser.avatar,
      content: this.newComment.trim()
    });

    this.newComment = '';
    this.loadComments();
  }

  startReply(commentId: string): void {
    if (!this.currentUser) {
      alert('Vui lòng đăng nhập để trả lời!');
      return;
    }
    this.replyingTo = commentId;
    this.replyContent = '';
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
  }

  submitReply(parentId: string): void {
    if (!this.replyContent.trim() || !this.currentUser) {
      return;
    }

    this.commentService.replyToComment(parentId, {
      comicId: this.comicId,
      chapterId: this.chapterId,
      userId: this.currentUser.id || this.currentUser.email,
      username: this.currentUser.username || this.currentUser.email,
      avatar: this.currentUser.avatar,
      content: this.replyContent.trim()
    });

    this.replyContent = '';
    this.replyingTo = null;
    this.loadComments();
  }

  toggleLike(commentId: string): void {
    if (!this.currentUser) {
      alert('Vui lòng đăng nhập để thích bình luận!');
      return;
    }
    this.commentService.toggleLike(commentId);
    this.loadComments();
  }

  deleteComment(commentId: string): void {
    if (!this.currentUser) {
      return;
    }

    const comment = this.findCommentById(this.comments, commentId);
    if (comment && (comment.userId === this.currentUser.id || comment.userId === this.currentUser.email)) {
      if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
        this.commentService.deleteComment(commentId);
        this.loadComments();
      }
    } else {
      alert('Bạn không có quyền xóa bình luận này!');
    }
  }

  private findCommentById(comments: Comment[], id: string): Comment | null {
    for (const comment of comments) {
      if (comment.id === id) {
        return comment;
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = this.findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    } else {
      return commentDate.toLocaleDateString('vi-VN');
    }
  }
}

