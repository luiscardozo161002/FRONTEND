import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, NgIf, HttpClientModule],
  templateUrl: './reset-password.component.html',
})

export class ResetPasswordComponent {
  // Estado para mostrar/ocultar la contraseña
  showNewPassword = false;
  showCheckPassword = false;

  // Inyección de HttpClient
  constructor(private http: HttpClient) {}

  // Método para alternar el estado de visibilidad de la contraseña
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleCheckPasswordVisibility() {
    this.showCheckPassword = !this.showCheckPassword;
  }

  // Método para enviar el formulario usando subscribe
  submit(event: Event) {
    event.preventDefault();

    const newPasswordElement = document.getElementById('newPassword') as HTMLInputElement;
    const checkPasswordElement = document.getElementById('checkPassword') as HTMLInputElement;

    const newPassword = newPasswordElement.value;
    const checkPassword = checkPasswordElement.value;

    if (!newPassword || !checkPassword) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (newPassword !== checkPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const oobCode = urlParams.get('oobCode');

      if (!oobCode) {
        throw new Error('El enlace ingresado no contiene un oobCode válido.');
      }

      // 👉 Aquí imprimes en consola lo que se va a enviar al backend
      console.log('Datos enviados al servidor:', {
        oobCode,
        newPassword
      });

      this.http.post('http://localhost:3001/api/v1/auth/reset-password', {
        oobCode,
        newPassword
      }).subscribe({
        next: (response) => {
          console.log('Respuesta recibida:', response);
          alert('Contraseña restablecida correctamente. ¡Ahora puedes iniciar sesión!');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error recibido:', error);
          if (error.status === 201) {
            alert('Contraseña restablecida correctamente. ¡Ahora puedes iniciar sesión!');
          } else {
            alert('Ocurrió un error al procesar la solicitud.');
          }
        }
      });

    } catch (error) {
      console.error('Error capturado:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Ocurrió un error al procesar la solicitud.');
      }
    }

  }
}
