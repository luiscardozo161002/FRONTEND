import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {

  //Estado para mostrar/ocultar la contraseña
  showPassword = false;

  //Método para alternar el estado
  togglePasswordVisibility(){
    this.showPassword = !this.showPassword
  }

  // Maneja el envío del formulario de registro
  async submit(event: Event) {
    event.preventDefault();

    const secretKey = 'mySecretKey123';
    
    // Obtener los valores de los campos
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;

    // Validar que los campos no estén vacíos
    if (!usernameInput?.value || !emailInput?.value || !passwordInput?.value) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const username = CryptoJS.AES.encrypt(usernameInput.value, secretKey).toString();
    const email = CryptoJS.AES.encrypt(emailInput.value, secretKey).toString();
    const password = CryptoJS.AES.encrypt(passwordInput.value, secretKey).toString();

    try {
      // Enviar los datos al backend, por medio de la petición POST al backend al endpoint register
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      // Manejo simple de la respuesta por parte del backend 
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        console.log(`Error: ${errorData.message}`);
      } else {
        const data = await response.json();
        alert(`Registro exitoso, ${data.username}`);
        console.log(`Registro exitoso, ${data.username}`);
      }

    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  }

}
