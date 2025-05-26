import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ResumeMainComponent } from './pages/resume-main/resume-main.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'resumeMain', component: ResumeMainComponent },
  
];
