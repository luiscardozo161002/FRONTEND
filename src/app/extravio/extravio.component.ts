import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import axios from 'axios';
import { NgFor } from '@angular/common';

interface Usuario {
  id: string;
  username: string;
}

interface Libro {
  id: string;
  isbn: string;
  titulo: string;
  tipo: string;
  autor: string;
  pdfUrl: string;
  genero?: {
    name: string;
  } | null;
  categoria?: {
    nombre: string;
  } | null;
  status: boolean;
}

interface Extravio {
  id: number;
  username: string;
  tituloEjemplar: string;
  estadoExtravio: boolean;
}

interface Multas{

}

@Component({
  selector: 'app-extravio',
  standalone: true,
  imports: [NgFor],
  templateUrl: './extravio.component.html',
  styleUrls: ['./extravio.component.css']
})
export class ExtravioComponent {

  extravios: Extravio[] = [];

  libros: Libro[] = [];
  selectedBookId: string = '';

  usuarios: Usuario[] = [];
  selectedUserId: string = '';

  
  ///////////////////////////////////////////////////////////////////////////////

  isSidebarVisible = false;
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
  
  ///////////////////////////////////////////////////////////////////
  
  async fetchUsuarios(): Promise<void> {
    try {
        const response = await axios.get<Usuario[]>('http://localhost:3001/api/v1/users');
        this.usuarios = response.data; 
        console.log('Usuarios cargados correctamente:', this.usuarios);
    } catch (error: any) {
        Swal.fire('Error obteniendo usuarios:', error.message, 'error');
    }
  }
  
  ///////////////////////////////////////////////////////////////////

  async fetchLibros(): Promise<void> {
    try {
        const response = await axios.get<Libro[]>(
            'http://localhost:3002/api/v1/books'
        );

        // Filtrar los libros que no tienen un valor null en pdfUrl
        this.libros = response.data
            .filter((libro) => libro.pdfUrl === null) // Filtra los que NO tienen null en pdfUrl
            .map((libro) => ({
                ...libro,
                genero: typeof libro.genero === 'object' ? libro.genero : { name: '' },
                categoria: typeof libro.categoria === 'object' ? libro.categoria : { nombre: '' }
            }));

        console.log('Libros cargados correctamente (sin pdfUrl nulo):', this.libros);
    } catch (error: any) {
        Swal.fire('Error obteniendo libros:', error.message, 'error');
    }
  }
  
  //////////////////////////////////////////////////////////////////

  async openRegisterExtravioModal(): Promise<void> {
    try {
        // Realizar las peticiones y especificar los tipos de datos con afirmación explícita
        const [usuariosResponse, librosResponse] = await Promise.all([
            axios.get<Usuario[]>('http://localhost:3001/api/v1/users'),
            axios.get<Libro[]>('http://localhost:3002/api/v1/books')
        ]);

        // Asignar los datos con afirmación explícita para evitar errores de tipo
        const usuariosDisponibles: string = usuariosResponse.data
            .map((user: Usuario) => `<option value="${user.username}">${user.username}</option>`)
            .join('');

        const librosDisponibles: string = librosResponse.data
            .map((libro: Libro) => `<option value="${libro.titulo}">${libro.titulo}</option>`)
            .join('');  

        // Abrir el modal SweetAlert con los datos cargados
        Swal.fire({
            title: 'Registrar Extravío',
            html: `
                <div class="flex flex-col text-left">
                    <!-- Selector de Usuario -->
                    <label for="usuario" class="block text-gray-400">Usuario:</label>
                    <select id="usuario" class="swal2-input">
                        <option value="" disabled selected>--Seleccione un usuario--</option>
                        ${usuariosDisponibles}
                    </select>

                    <!-- Selector de Libro -->
                    <label for="libro" class="block text-gray-400 mt-2">Libro:</label>
                    <select id="libro" class="swal2-input">
                        <option value="" disabled selected>--Seleccione un libro--</option>
                        ${librosDisponibles}
                    </select>

                    <!-- Selector de Estado (ahora como string directamente) -->
                    <label for="estado" class="block text-gray-400 mt-2">Estado del Extravío:</label>
                    <select id="estado" class="swal2-input">
                        <option value="">--Seleccione un estado--</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Resuelto">Resuelto</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Registrar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const usuario = (document.getElementById('usuario') as HTMLSelectElement).value;
                const libro = (document.getElementById('libro') as HTMLSelectElement).value;
                const estado = (document.getElementById('estado') as HTMLSelectElement).value; // Estado como string

                // ✅ Validación corregida
                if (!usuario || !libro || estado === '') {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                    return false;
                }              

                return { usuario, libro, estado };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.registerExtravio(result.value.usuario, result.value.libro, result.value.estado);
            }
        });
    } catch (error) {
        Swal.fire('Error', 'Error al cargar datos.', 'error');
    }
  }

  async registerExtravio(username: string, titulo: string, estado: string): Promise<void> {
    try {
        // Envío de valores de texto al backend
        await axios.post('http://localhost:3002/api/v1/lost', {
            username,           
            tituloEjemplar: titulo,       
            estadoExtravio: estado       // ✅ Ahora se envía como string directamente
        });

        // Confirmación de registro exitoso con SweetAlert
        Swal.fire('Éxito', `El extravío del libro "${titulo}" ha sido registrado exitosamente con estado "${estado}".`, 'success');
    } catch (error: any) {
        console.error('Error al registrar el extravío:', error);
        Swal.fire('Error', `No se pudo registrar el extravío: ${error.response?.data?.message || error.message}`, 'error');
    }
  }

  //////////////////////////////////////////////////////////////////
  
  async openUpdateExtravioModal(extravioId: number): Promise<void> {
    try {
        // Obtener detalles del extravío específico
        const response = await axios.get<{ id: string; tituloEjemplar: string; estadoExtravio: string }>(
            `http://localhost:3002/api/v1/lost/${extravioId}`
        );

        const extravio = response.data;

        // Mostrar un modal para actualizar el estado del extravío
        Swal.fire({
            title: 'Actualizar Estado del Extravío',
            html: `
                <p>Libro: <strong>${extravio.tituloEjemplar}</strong></p>
                <label for="estado" class="block text-gray-400 mt-2">Estado del Extravío:</label>
                <select id="estado" class="swal2-input">
                    <option value="Pendiente" ${extravio.estadoExtravio === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Resuelto" ${extravio.estadoExtravio === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const estado = (document.getElementById('estado') as HTMLSelectElement).value;
                return { extravioId, estado };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.updateExtravioState(result.value.extravioId, result.value.estado);
            }
        });
    } catch (error) {
        console.error('Error al cargar el extravío:', error);
        Swal.fire('Error', 'Error al cargar el extravío.', 'error');
    }
  }

  async updateExtravioState(extravioId: string, estado: string): Promise<void> {
    try {
        // Petición PATCH al backend para actualizar el estado del extravío
        await axios.put(`http://localhost:3002/api/v1/lost/${extravioId}`, {
            estadoExtravio: estado
        });

        // Mostrar confirmación de éxito
        Swal.fire('Éxito', `El extravío ha sido actualizado a "${estado}".`, 'success');
        
        // Recargar la lista de extravíos (opcional)
        await this.fetchLibros();
    } catch (error: any) {
        console.error('Error al actualizar el extravío:', error);
        Swal.fire('Error', `No se pudo actualizar el estado: ${error.response?.data?.message || error.message}`, 'error');
    }
  }

  //////////////////////////////////////////////////////////////////
  
  async deleteExtravio(extravioId: number): Promise<void> {
    try {
        // Confirmación antes de eliminar
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            // Petición DELETE al backend para eliminar el extravío
            await axios.delete(`http://localhost:3002/api/v1/lost/${extravioId}`);

            // Mostrar confirmación de éxito
            Swal.fire('Eliminado', 'El extravío ha sido eliminado con éxito.', 'success');

            // Recargar la lista de extravíos
            await this.fetchExtravios();
        }
    } catch (error: any) {
        console.error('Error al eliminar el extravío:', error);
        Swal.fire('Error', `No se pudo eliminar el extravío: ${error.response?.data?.message || error.message}`, 'error');
    }
  }

  //////////////////////////////////////////////////////////////////
  async fetchExtravios(): Promise<void> {
    try {
        const response = await axios.get<Extravio[]>('http://localhost:3002/api/v1/lost');
        this.extravios = response.data; 
        console.log('Extravios cargados correctamente:', this.extravios);
    } catch (error: any) {
        Swal.fire('Error obteniendo extravios:', error.message, 'error');
    }
  }

  //////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////
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
    this.fetchUsuarios();
    this.fetchLibros();
    this.fetchExtravios();
  }
}
