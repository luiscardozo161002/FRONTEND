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
  

  /*async submit(event: Event) {
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
  }*/

  /*async submit(event: Event) {
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

          const responseUsers = await fetch('http://localhost:3001/api/v1/users', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },

          });
      
          if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
            console.error(`Error: ${errorData.message}`);
          } else {
            const data = await response.json();
            alert(`Bienvenido, ${data.email}`);
      
            // Guardar token y datos del usuario en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ email: data.email, role: data.role }));
      
            // Redirigir según el rol
            if (data.role === 'user') {
              this.router.navigateByUrl('/pro');
            } else {
              this.router.navigateByUrl('/dashboard');
            }
          }
        } catch (error) {
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
            // Llamada para autenticar al usuario
            const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: encryptedEmail, password: encryptedPassword }),
            });
        
            if (!loginResponse.ok) {
              const errorData = await loginResponse.json();
              alert(`Error al iniciar sesión: ${errorData.message}`);
              console.error(`Error: ${errorData.message}`);
              return;
            }
        
            // Guardar datos de la autenticación
            const loginData = await loginResponse.json();
            localStorage.setItem('token', loginData.token);
        
            // Llamada para obtener todos los usuarios
            const usersResponse = await fetch('http://localhost:3001/api/v1/users', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${loginData.token}`, // Autenticación con token
              },
            });
        
            if (!usersResponse.ok) {
              const errorData = await usersResponse.json();
              alert(`Error al obtener usuarios: ${errorData.message}`);
              console.error(`Error: ${errorData.message}`);
              return;
            }
        
            const users = await usersResponse.json();
        
            // Buscar el usuario por email
            const currentUser = users.find((user: any) => user.email === loginData.email);
        
            if (!currentUser) {
              alert('Usuario no encontrado en el sistema.');
              return;
            }
        
            // Guardar el rol del usuario y redirigir según el rol
            const userRole = currentUser.role;
            localStorage.setItem('user', JSON.stringify({ email: currentUser.email, role: userRole }));
        
            if (userRole === 'user') {
              this.router.navigateByUrl('/pro'); // Redirigir a la página de usuarios
            } else if (userRole === 'admin') {
              this.router.navigateByUrl('/dashboard'); // Redirigir a la página de administradores
            } else {
              alert('Rol desconocido. Contacte con el administrador.');
              console.error('Rol no definido:', userRole);
            }
          } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Hubo un problema al conectar con el servidor.');
          }
  }    

}
