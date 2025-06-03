import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ResumeMainComponent } from './pages/admin/resume-main/resume-main.component';
import { CreateUserComponent } from './pages/admin/create-user/create-user.component';
import { StadisticsComponent } from './pages/admin/stadistics/stadistics.component';
import { ResumeInfoComponent } from './pages/reusable/resume-info/resume-info.component';
import { StatsInfoComponent } from './pages/reusable/stats-info/stats-info.component';
import { CreateComponent } from './pages/employee/create/create.component';
import { ThanksComponent } from './pages/reusable/thanks/thanks.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'resumeMain', component: ResumeMainComponent },
  { path: 'createUser', component: CreateUserComponent },
  { path: 'stadistics', component: StadisticsComponent },
  { path: 'resumeInfo/:name', component: ResumeInfoComponent },
  { path: 'statsInfo/:type', component: StatsInfoComponent },
  { path: 'create', component: CreateComponent },
  { path: 'thanks', component: ThanksComponent },
];
