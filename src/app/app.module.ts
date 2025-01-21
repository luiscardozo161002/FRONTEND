import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component'; 
import { SignInComponent} from './login/sign-in/sign-in.component'; // Importar LoginComponent
import { DashboardComponent } from './dashboard/dashboard.component'; // Importar DashboardComponent
import { LandingComponent } from './landing/landing.component'; // Importar LandingComponent
import { AdministracionComponent } from './administracion/administracion.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { LibrosComponent } from './libros/libros.component';
import { LibrosDigitalesComponent } from './libros-digitales/libros-digitales.component';
import { PrestamosComponent } from './prestamos/prestamos.component';
import { ExtravioComponent } from './extravio/extravio.component';
import { PerfilComponent } from './perfil/perfil.component'; // Import PerfilComponent
import { ProComponent } from './pro/pro.component'; // Import ProComponent
import { AyudaComponent } from './ayuda/ayuda.component'; // Import AyudaComponent

@NgModule({
  declarations: [
   
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    DashboardComponent, // Importar DashboardComponent aquí
    SignInComponent, // Importar LoginComponent aquí
    LandingComponent, // Importar LandingComponent aquí
    AdministracionComponent,
    UsuariosComponent,
    LibrosComponent,
    LibrosDigitalesComponent,
    PrestamosComponent,
    ExtravioComponent,
    PerfilComponent, // Importar PerfilComponent aquí
    ProComponent, // Importar ProComponent aquí
    AyudaComponent, // Importar AyudaComponent aquí
  ],
  providers: [],
})
export class AppModule {}
