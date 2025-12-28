import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserKey = 'current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  /**
   * Đăng nhập
   */
  login(usernameOrEmail: string, password: string): boolean {
    // Lấy users từ localStorage
    const users = this.getUsersFromStorage();
    const user = users.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
      u.password === password
    );

    if (user) {
      const userInfo: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
      this.setCurrentUser(userInfo);
      return true;
    }
    return false;
  }

  /**
   * Đăng ký
   */
  register(username: string, email: string, password: string): boolean {
    const users = this.getUsersFromStorage();
    
    if (users.find(u => u.username === username || u.email === email)) {
      return false;
    }

    const newUser = {
      id: this.generateId(),
      username,
      email,
      password,
      avatar: '',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Lấy user hiện tại
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Kiểm tra đã đăng nhập
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Cập nhật thông tin user
   */
  updateUser(updates: Partial<User>): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const updatedUser = { ...currentUser, ...updates };
    this.setCurrentUser(updatedUser);

    // Cập nhật trong danh sách users
    const users = this.getUsersFromStorage();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index > -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
    }

    return true;
  }

  // ========== Private Methods ==========

  private setCurrentUser(user: User): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getCurrentUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.currentUserKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getUsersFromStorage(): any[] {
    try {
      const stored = localStorage.getItem('users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: any[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

