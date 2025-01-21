import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
//import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdministracionComponent } from './administracion/administracion.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { LibrosComponent } from './libros/libros.component';
import { LibrosDigitalesComponent } from './libros-digitales/libros-digitales.component';
import { PrestamosComponent } from './prestamos/prestamos.component';
import { ExtravioComponent } from './extravio/extravio.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ProComponent } from './pro/pro.component';
import { AyudaComponent } from './ayuda/ayuda.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: SignInComponent },
  { path: 'register', component: SignUpComponent},
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'dashboard', component: DashboardComponent },
  { path: 'administracion', component: AdministracionComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'pro', component: ProComponent },
  { path: 'ayuda', component: AyudaComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'libros', component: LibrosComponent },
  { path: 'libros-digitales', component: LibrosDigitalesComponent },
  { path: 'prestamos', component: PrestamosComponent },
  { path: 'extravio', component: ExtravioComponent },
  { path: '**', redirectTo: '' }
];