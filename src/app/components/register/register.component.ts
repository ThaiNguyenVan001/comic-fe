import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeToTerms = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onRegister(): void {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (!this.agreeToTerms) {
      alert('Vui lòng đồng ý với điều khoản sử dụng!');
      return;
    }

    this.isLoading = true;

    if (this.authService.register(this.username, this.email, this.password)) {
      setTimeout(() => {
        this.isLoading = false;
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        this.router.navigate(['/login']);
      }, 500);
    } else {
      this.isLoading = false;
      alert('Tên đăng nhập hoặc email đã tồn tại!');
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}


