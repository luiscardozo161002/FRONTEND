import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import axios from "axios";
import { NgFor } from '@angular/common';

interface Usuario {
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
  templateUrl: './perfil.component.html',
  imports: [NgFor],
})
export class PerfilComponent {

  public imagenDCG: string = 'assets/user.jpg';

  usuarios: Usuario[] = [];

  ///////////////////////////////////////////////////////////////////////////////
  
  isSidebarVisible = false;
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  ///////////////////////////////////////////////////////////////////////////////

  async fetchUsuarios(): Promise<void> {
      try {
          // Obtén el email del usuario logueado desde el localStorage
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
              throw new Error('No se encontró información del usuario logueado en localStorage.');
          }
  
          const { email } = JSON.parse(storedUser);
  
          // Haz la solicitud a la API para obtener todos los usuarios
          const response = await axios.get<Usuario[]>('http://localhost:3001/api/v1/users');
  
          // Filtra los datos para obtener solo el usuario logueado
          this.usuarios = response.data.filter((user) => user.email === email);
  
          // Opcional: Manejo de casos donde no se encuentra el usuario
          if (this.usuarios.length === 0) {
              Swal.fire('Advertencia', 'No se encontraron datos para el usuario logueado.', 'warning');
          }
  
          console.log('Datos cargados correctamente:', this.usuarios);
      } catch (error: any) {
          Swal.fire('Error al obtener datos', error.message || 'Error desconocido.', 'error');
      }
  }
  
  
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

  ngOnInit(): void {
    this.fetchUsuarios();
  }
}