import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ResumeMainComponent } from './pages/admin/resume-main/resume-main.component';
import { CreateUserComponent } from './pages/admin/create-user/create-user.component';
import { StadisticsComponent } from './pages/admin/stadistics/stadistics.component';
import { ResumeInfoComponent } from './pages/admin/resume-info/resume-info.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'resumeMain', component: ResumeMainComponent },
  { path: 'createUser', component: CreateUserComponent },
  { path: 'stadistics', component: StadisticsComponent },
  { path: 'resumeInfo', component: ResumeInfoComponent },
];
