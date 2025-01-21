import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import axios from 'axios';
import { NgFor } from '@angular/common';

interface UsuarioAdmin {
  id: string;
  username: string;
  email: string;
  role: string;
  //password: string;
  firebaseUid: string;
}


@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './ayuda.component.html',
  imports: [NgFor],
})
export class AyudaComponent {

  public correo = "hector@gmail.com";
  public correoDCG = "diegoCG@gmail.com";
  public imagenHect: string = 'assets/user.jpg';
  public imagenDCG: string = 'assets/user_standard.png';

  usuariosAdmin: UsuarioAdmin[] = []; 

  ///////////////////////////////////////////////////////////////////////////////

  isSidebarVisible = false;
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }


  ///////////////////////////////////////////////////////////////////////////////

  async fetchUsuarioAdmin(): Promise<void> {
    try {
        const response = await axios.get<UsuarioAdmin[]>('http://localhost:3001/api/v1/users');
        // Filtrar usuarios con rol 'admin'
        this.usuariosAdmin = response.data.filter(usuario => usuario.role === 'admin');
        console.log("Usuarios con rol admin cargados correctamente:", this.usuariosAdmin);
    } catch (error: any) {
        Swal.fire("Error al obtener datos", error.message, "error");
    }
}


  ///////////////////////////////////////////////////////////////////////////////

  onSignOut(): void {
    Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Se le regresará a la página de inicio.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Cerrando sesión...", "", "success").then(() => {
          window.location.href = "#";
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Cancelado", "Tu sesión sigue activa.", "info");
      }
    });
  }
  
  ///////////////////////////////////////////////////////////////////////////////

  ngOnInit(): void {
    this.fetchUsuarioAdmin();
  }
}