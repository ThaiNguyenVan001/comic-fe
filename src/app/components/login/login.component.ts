import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    this.isLoading = true;
    
    if (this.authService.login(this.email, this.password)) {
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/profile']);
      }, 500);
    } else {
      this.isLoading = false;
      alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}


