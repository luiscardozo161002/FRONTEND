import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent {
  constructor(private router: Router){}

  //Estado para mostrar/ocultar la contraseña
  showPassword = false;
  
  //Método para alternar el estado
  togglePasswordVisibility(){
    this.showPassword = !this.showPassword
  }
  
  // Este método será llamado cuando el formulario se envíe
  /*async submit(event: Event) {
    event.preventDefault(); // Evita que el formulario se envíe de la forma tradicional

    // Obtiene los valores de los campos del formulario
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    // Validación de los datos que serán enviados
    if (!email || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Enviar los datos al backend por medio de la petición POST al endpoint login
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Manejo de errores en la respuesta
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        console.log(`Error: ${errorData.message}`);
      } else {
        // Si el inicio de sesión es exitoso
        const data = await response.json();
        alert(`Bienvenido, ${data.email}`);
        this.router.navigateByUrl('/dashboard');
        console.log(`Bienvenido, ${data.email}`);
        // Guarda el token en el almacenamiento local
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          email: data.email,
      }));
      
      }

    } catch (error) {
      // Manejo de errores de red o backend
      console.error('Error al iniciar sesión:', error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  }*/

  async submit(event: Event) {
      event.preventDefault();
    
      const email = (document.getElementById('email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('password') as HTMLInputElement).value.trim();
    
      // Validación inicial
      if (!email || !password) {
        alert('Por favor, completa todos los campos');
        return;
      }
    
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Por favor, introduce un correo electrónico válido');
        return;
      }
    
      if (password.length < 6 || password.length > 20) {
        alert('La contraseña debe tener entre 6 y 20 caracteres');
        return;
      }
    
      // Clave secreta compartida entre frontend y backend
      const secretKey = 'mySecretKey123';
    
      // Cifrar los datos
      const encryptedEmail = CryptoJS.AES.encrypt(email, secretKey).toString();
      const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();
    
      try {
        const response = await fetch('http://localhost:3001/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: encryptedEmail, password: encryptedPassword }),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
          console.error(`Error: ${errorData.message}`);
        } else {
          const data = await response.json();
          alert(`Bienvenido, ${data.email}`);
          this.router.navigateByUrl('/dashboard');
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({ email: data.email }));
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Hubo un problema al conectar con el servidor.');
      }
  }
    

}
