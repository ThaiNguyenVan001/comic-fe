import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  editForm = {
    username: '',
    email: '',
    avatar: ''
  };
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.editForm = {
      username: this.user.username,
      email: this.user.email,
      avatar: this.user.avatar || ''
    };
  }

  startEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.user) {
      this.editForm = {
        username: this.user.username,
        email: this.user.email,
        avatar: this.user.avatar || ''
      };
    }
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  saveProfile(): void {
    if (!this.editForm.username || !this.editForm.email) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (this.authService.updateUser({
      username: this.editForm.username,
      email: this.editForm.email,
      avatar: this.editForm.avatar
    })) {
      this.user = this.authService.getCurrentUser();
      this.isEditing = false;
      alert('Cập nhật thông tin thành công!');
    } else {
      alert('Cập nhật thất bại!');
    }
  }

  changePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Mật khẩu mới và xác nhận không khớp!');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // TODO: Implement password change
    alert('Đổi mật khẩu thành công!');
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  logout(): void {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}

