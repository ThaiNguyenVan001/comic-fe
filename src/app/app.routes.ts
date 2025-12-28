import { Routes } from '@angular/router';
import { ComicListComponent } from './components/comic-list/comic-list.component';
import { ComicDetailComponent } from './components/comic-detail/comic-detail.component';
import { ChapterReaderComponent } from './components/chapter-reader/chapter-reader.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: ComicListComponent
  },
  {
    path: 'comic/:id',
    component: ComicDetailComponent
  },
  {
    path: 'comic/:comicId/chapter/:chapterId',
    component: ChapterReaderComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  }
];

