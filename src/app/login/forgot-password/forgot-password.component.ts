import { Component } from '@angular/core';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { initializeFirebaseConfig } from '../firebase/firebase.config'; // Ajusta la ruta al archivo firebase.config.ts
import { RouterModule } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {

  async submit(event: Event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario

    const secretKey = 'mySecretKey123';

    // Obtener el valor del campo email
    const emailInput = document.getElementById('email') as HTMLInputElement;

    if(!emailInput?.value){
      alert('Por favor, completa todos los campos.');
      return;
    }

    const email = CryptoJS.AES.encrypt(emailInput.value, secretKey).toString();

    // Validar si el correo electrónico está vacío
    if (!email) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    try {
       // Inicializa Firebase Auth
       const auth = getAuth(initializeFirebaseConfig);

       // Envía el correo de restablecimiento de contraseña
       await sendPasswordResetEmail(auth, email);
       alert(`¡Revisa tu correo! El enlace para restablecer la contraseña ha sido enviado a ${email}`);
       console.log(`Enlace enviado a: ${email}`);

     } catch (error: any) {
       console.error('Error al enviar el enlace:', error);
 
       // Maneja errores comunes de Firebase
       let errorMessage = 'Hubo un problema al procesar tu solicitud.';
       if (error.code === 'auth/user-not-found') {
         errorMessage = 'No se encontró una cuenta asociada con este correo.';
       } else if (error.code === 'auth/invalid-email') {
         errorMessage = 'El correo ingresado no es válido.';
       }

    } 
  }
}
