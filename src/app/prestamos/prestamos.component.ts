import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgFor, NgIf } from '@angular/common';
import axios from 'axios';

interface Ejemplares {
  copyNumber: number;
  id: number;
  book:{
    titulo:string;
  }
}

interface Usuario {
  id: string;
  username: string;
}

interface Prestamo {
  id: string;
  copyId: number;
  loandate: string;
  returndate: string;
  borrowerId: string;
  copy:{
    id: number;
    copyNumber: number;
  }
  status: boolean;
  available: boolean;
  bookTitle: string;
  borrowerUsername: string;
}


@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './prestamos.component.html',
  styleUrl: './prestamos.component.css'
})

export class PrestamosComponent {
  ejemplares: Ejemplares[] = [];
  usuarios: Usuario[] = [];
  prestamos: Prestamo[] = [];

  ///////////////////////////////////////////////////////////////////////////////
  isSidebarVisible = false;
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
  
  /*get ejemplaresDisponibles(): Ejemplares[] {
    return this.ejemplares.filter(ejemplar => 
      !this.prestamos.some(prestamo => prestamo.copy?.copyNumber === ejemplar.copyNumber)
    );
  }*/
  get ejemplaresDisponibles(): Ejemplares[] {
      return this.ejemplares.filter(ejemplar => 
        !this.prestamos.some(prestamo => prestamo.copy?.id === ejemplar.id)
      );
  }
  

  getPrestamoAlias(prestamo: Prestamo): string {
    return prestamo.available ? 'Prestado' : 'Devuelto';
  }
  
  /////////////////////////////////////////////////////////////////////

  async fetchEjemplares(): Promise<void> {
    try {
      const response = await axios.get<Ejemplares[]>(
        'http://localhost:3002/api/v1/copies'
      );
      this.ejemplares = response.data; 
      console.log('Datos cargados correctamente:', this.ejemplares);
    } catch (error: any) {
      Swal.fire('Error obteniendo libros:', error.message, 'error');
    }
  }
  
  /////////////////////////////////////////////////////////////////////

  async deleteEjemplares(id: number): Promise<void> {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro de eliminar este ejemplar?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3002/api/v1/copies/${id}`);
        Swal.fire('Ejemplar eliminado!', '', 'success');
        this.fetchEjemplares(); // Recargar la lista de libros después de eliminar
      }
    } catch (error: any) {
      Swal.fire(
        'Error al eliminar el ejemplar',
        error.response?.data?.message || error.message,
        'error'
      );
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  async openRegisterModal(): Promise<void> {
    try {
        // Obtener la lista de libros desde la API
        const response = await axios.get<{ titulo: string }[]>('http://localhost:3002/api/v1/books');
        const librosDisponibles = response.data.map(book => book.titulo);

        // Abrir el modal con un select dinámico para elegir el título del libro
        Swal.fire({
            title: 'Registrar Ejemplar',
            html: `
                <div class="flex flex-col">
                    <label for="titulo">Seleccionar Título del Libro</label>
                    <select id="titulo" class="swal2-input">
                        <option value="">--Selecciona un libro--</option>
                        ${librosDisponibles.map(titulo => `<option value="${titulo}">${titulo}</option>`).join('')}
                    </select>
                    <label for="copy">Número de Ejemplares</label>
                    <input type="number" id="copy" class="swal2-input" min="1">
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Registrar',
            preConfirm: () => {
                const titulo = (document.getElementById('titulo') as HTMLSelectElement).value;
                const copy = (document.getElementById('copy') as HTMLInputElement).value.trim();

                if (!titulo || !copy) {
                    Swal.showValidationMessage('Todos los campos son requeridos');
                    return false;
                }

                return { titulo, copy };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.registerEjemplar(result.value.titulo, parseInt(result.value.copy));
            }
        });
    } catch (error) {
        Swal.fire('Error', 'Error al cargar los libros disponibles.', 'error');
    }
  }

  async registerEjemplar(
    titulo: string,
    numberOfCopies: number
): Promise<void> {
    try {
        await axios.post('http://localhost:3002/api/v1/copies', {
            titulo,
            numberOfCopies
        });
        Swal.fire('Éxito', 'El ejemplar fue registrado exitosamente.', 'success');
        this.fetchEjemplares(); // Recargar la lista de ejemplares después de registrar
    } catch (error) {
        Swal.fire('Error', `No se pudo registrar el ejemplar: ${error}`, 'error');
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  async fetchUsuarios(): Promise<void> {
    try {
        const response = await axios.get<Usuario[]>('http://localhost:3001/api/v1/users');
        this.usuarios = response.data.map(user => ({
            id: user.id,  // id es un string en tu API
            username: user.username
        })); 
        console.log('Usuarios cargados correctamente:', this.usuarios);
    } catch (error: any) {
        Swal.fire('Error obteniendo usuarios:', error.message, 'error');
    }
  }

  ////////////////////////////////////////////////////////////////////////////

  async openRegisterModalLoan(): Promise<void> {
    try {
        // Obtener usuarios y ejemplares desde la API antes de abrir el modal
        const usuariosResponse = await axios.get<{ id: string, username: string }[]>('http://localhost:3001/api/v1/users');
        const ejemplaresResponse = await axios.get<Ejemplares[]>('http://localhost:3002/api/v1/copies');

        // Asignar los datos a las propiedades
        this.usuarios = usuariosResponse.data;
        this.ejemplares = ejemplaresResponse.data;

        // Filtrar ejemplares disponibles usando el método definido
        const ejemplaresDisponibles = this.ejemplaresDisponibles.map(e => 
            `<option value="${e.id}">${e.book.titulo} - ${e.copyNumber}</option>`).join('');

        const usuariosDisponibles = this.usuarios.map(u => 
            `<option value="${u.id}">${u.username}</option>`).join('');

        // Abrir el modal con los datos cargados
        Swal.fire({
            title: 'Registrar Préstamo',
            html: `
                <div class="flex flex-col">
                    <!-- Select de usuario -->
                    <label for="usuario">Usuario que solicitó el libro</label>
                    <select id="usuario" class="swal2-input">
                        <option value="">--Selecciona un usuario--</option>
                        ${usuariosDisponibles}
                    </select>

                    <!-- Select de ejemplar disponible -->
                    <label for="libro">Ejemplar solicitado</label>
                    <select id="libro" class="swal2-input">
                        <option value="">--Selecciona un ejemplar disponible--</option>
                        ${ejemplaresDisponibles}
                    </select>
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Registrar Préstamo',
            preConfirm: () => {
                const usuario = (document.getElementById('usuario') as HTMLSelectElement).value;
                const libro = (document.getElementById('libro') as HTMLSelectElement).value;

                if (!usuario || !libro) {
                    Swal.showValidationMessage('Todos los campos son requeridos');
                    return false;
                }

                return { usuario, libro };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.registerLoan(result.value.usuario, result.value.libro);
            }
        });
    } catch (error) {
        Swal.fire('Error', 'Error al cargar los datos.', 'error');
    }
  }

  async registerLoan(usuarioId: string, copyNumber: number): Promise<void> {
    try {
        console.log('Datos enviados:', { copyId: copyNumber, Id: usuarioId });
        await axios.post('http://localhost:3002/api/v1/loans', {
            copyId: Number(copyNumber),
            Id: usuarioId
        });
        Swal.fire('Préstamo registrado', 'El préstamo se registró correctamente.', 'success');
    } catch (error: any) {
      console.error('Error en la petición:', error.response?.data || error.message);
      Swal.fire('Error', `No se pudo registrar el préstamo: ${error.response?.data?.message || error.message}`, 'error');
    }
  }

  /////////////////////////////////////////////////////////////////////////

  async fetchLoans(): Promise<void> {
    try {
      const response = await axios.get<Prestamo[]>(
        'http://localhost:3002/api/v1/loans'
      );
      this.prestamos = response.data; 
      console.log('Datos cargados correctamente:', this.prestamos);
    } catch (error: any) {
      Swal.fire('Error obteniendo libros:', error.message, 'error');
    }
  }

  /////////////////////////////////////////////////////////////////////////

  async openUpdateLoanStatusModal(loanId: string): Promise<void> {
    try {
        const result = await Swal.fire({
            title: 'Actualizar estado del préstamo',
            text: '¿Estás seguro de marcar este préstamo como devuelto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            await this.updateLoanStatus(loanId);
        }
    } catch (error) {
        Swal.fire('Error', 'Error al abrir el modal.', 'error');
    }
  } 

  async updateLoanStatus(loanId: string): Promise<void> {
        try {
            await axios.put(`http://localhost:3002/api/v1/loans/${loanId}/return`, {
              available: false // Cambiando de prestado (true) a devuelto (false)
            });
            Swal.fire('Éxito', 'El préstamo ha sido actualizado a Devuelto.', 'success');
            this.fetchLoans(); // Recargar la lista actualizada de préstamos
        } catch (error: any) {
            Swal.fire('Error', `No se pudo actualizar el préstamo: ${error.response?.data?.message || error.message}`, 'error');
        }
  }

  /////////////////////////////////////////////////////////////////////////

  async deleteLoan(loanId: string): Promise<void> {
    try {
        await axios.delete(`http://localhost:3002/api/v1/loans/${loanId}`);
        Swal.fire('Éxito', 'El préstamo ha sido eliminado.', 'success');
        this.fetchLoans(); // Recargar la lista actualizada de préstamos
    } catch (error: any) {
        Swal.fire('Error', `No se pudo eliminar el préstamo: ${error.response?.data?.message || error.message}`, 'error');
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
 
  ngOnInit() {
    this.fetchEjemplares();
    this.fetchUsuarios();
    this.fetchLoans();
  }

}