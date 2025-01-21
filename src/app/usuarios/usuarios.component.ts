import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import axios from 'axios';
import { NgFor } from '@angular/common';
import * as CryptoJS from 'crypto-js';

interface Usuario {
  id: string;
  username: string;
  email: string;
  role: string;
  //password: string;
  firebaseUid: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  imports: [NgFor]
})

export class UsuariosComponent {

  isSidebarVisible = false;

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  usuarios: Usuario[] = [];  

  ////////////////////////////////////////////////////////////////////////

  // Cargar usuarios desde la API al iniciar
  async fetchUsuarios(): Promise<void> {
      try {
          const response = await axios.get<Usuario[]>('http://localhost:3001/api/v1/users');
          this.usuarios = response.data;  
          console.log("Datos cargados correctamente:", this.usuarios);
      } catch (error: any) {
          Swal.fire("Error al obtener datos", error.message, "error");
      }
  }

  ////////////////////////////////////////////////////////////////////////

  // Método para eliminar un usuario con Axios usando DELETE
  async deleteUsuario(id: string): Promise<void> {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro de eliminar este usuario?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3001/api/v1/users/${id}`);
        Swal.fire("Usuario eliminado!", "", "success");
        this.fetchUsuarios(); // Recargar la lista de usuarios después de eliminar
      }
    } catch (error: any) {
      Swal.fire("Error al eliminar usuario", error.message, "error");
    }
  }

  ////////////////////////////////////////////////////////////////////////
  
  // Función para abrir el modal con SweetAlert2
  openEditModal(id: string, username: string, email: string): void {
    Swal.fire({
        title: 'Editar Usuario',
        html: `
          <label for="username">Usuario</label>
          <input type="text" id="username" class="swal2-input" size=30 placeholder="Username" value="${username}">
          <label for="email">Email</label>
          <input type="text" id="email" class="swal2-input" size=30 placeholder="Email" value="${email}">
        `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Actualizar',
        preConfirm: () => {
            const updatedUsername = (document.getElementById('username') as HTMLInputElement).value;
            const updatedEmail = (document.getElementById('email') as HTMLInputElement).value;

            if (!updatedUsername || !updatedEmail) {
                Swal.showValidationMessage('Todos los campos son requeridos');
                return false;
            }

            return { updatedUsername, updatedEmail };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            this.updateUsuario(id, result.value.updatedUsername, result.value.updatedEmail);
        }
    });
  }

  // Función para actualizar el usuario con Axios
  async updateUsuario(id: string, username: string, email: string): Promise<void> {
    try {
      await axios.put(`http://localhost:3001/api/v1/users/${id}`, {
        username: username,
        email: email 
      });
      Swal.fire('Usuario actualizado', 'El usuario se actualizó correctamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
    }
  }

  ////////////////////////////////////////////////////////////////////////

  // Función para abrir el modal con comparación de contraseñas
  openRegisterModal(): void {
      Swal.fire({
          title: 'Registrar Nuevo Usuario',
          html: `
            <div class="flex flex-col justify-center items-center">
              <div class="flex flex-col">
                <label for="username" class="swal2-label">Usuario</label>
                <input type="text" id="username" class="swal2-input w-[400px]" placeholder="Ingrese el nombre de usuario">
              </div>

              <div class="flex flex-col">
                <label for="email" class="swal2-label">Email</label>
                <input type="email" id="email" class="swal2-input w-[400px]" placeholder="Ingrese el correo electrónico">
              </div>

              <div class="flex flex-col"> 
                <label for="password" class="swal2-label">Contraseña</label>
                <input type="password" id="password" class="swal2-input w-[400px]" placeholder="Ingrese la contraseña caracteres y numeros">
              </div>

              <div class="flex flex-col"> 
                <label for="confirmPassword" class="swal2-label">Confirmar Contraseña</label>
                <input type="password" id="confirmPassword" class="swal2-input w-[400px]" placeholder="Confirme la contraseña caracteres y numeros">
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Registrar',
          cancelButtonText: 'Cancelar',
          preConfirm: () => {
              const username = (document.getElementById('username') as HTMLInputElement).value;
              const email = (document.getElementById('email') as HTMLInputElement).value;
              const password = (document.getElementById('password') as HTMLInputElement).value;
              const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;

              // Validación: Campos vacíos
              if (!username || !email || !password || !confirmPassword) {
                  Swal.showValidationMessage('Todos los campos son requeridos');
                  return false;
              }

              if(password.length < 6 && confirmPassword.length < 6){
                Swal.showValidationMessage('Las contraseñas deben tener al menos 6 caracteres');
                return false;
              }

              // Validación: Comparar contraseñas
              if (password !== confirmPassword) {
                  Swal.showValidationMessage('Las contraseñas no coinciden');
                  return false;
              }

              return { username, email, password };
          }
      }).then((result) => {
          if (result.isConfirmed) {
              this.registerUsuario(result.value.username, result.value.email, result.value.password);
          }
      });
  }
  // Función para registrar el usuario con Axios (POST)
  async registerUsuario(username: string, email: string, password: string): Promise<void> {
    //http://localhost:3001/api/v1/auth/register, http://localhost:3001/api/v1/users/
      // Clave secreta compartida entre frontend y backend
      const secretKey = 'mySecretKey123';
          
      // Cifrar los datos
      const encryptedUsername = CryptoJS.AES.encrypt(username, secretKey).toString();
      const encryptedEmail = CryptoJS.AES.encrypt(email, secretKey).toString();
      const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

      try {
          await axios.post('http://localhost:3001/api/v1/auth/register', {
              username: encryptedUsername,
              email: encryptedEmail,
              password: encryptedPassword,
          });
          Swal.fire('Usuario registrado', 'El usuario se registró correctamente.', 'success');
      } catch (error) {
          Swal.fire('Error', 'No se pudo registrar el usuario.', 'error');
      }
  }

  ////////////////////////////////////////////////////////////////////////

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