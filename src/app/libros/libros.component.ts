import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { NgFor } from '@angular/common';
import axios from 'axios';

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
}

@Component({
  selector: 'app-libros',
  standalone: true,
  templateUrl: './libros.component.html',
  styleUrl: './libros.component.css',
  imports: [NgFor],
})
export class LibrosComponent {
  libros: Libro[] = [];

  ///////////////////////////////////////////////////////////////////////////////
  isSidebarVisible = false;

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
  //////////////////////////////////////////////////////////////////////////////
  //Método para obtener los libros
  /*async fetchLibros(): Promise<void> {
    try {
      const response = await axios.get<Libro[]>(
        'http://localhost:3002/api/v1/books'
      );

      this.libros = response.data.map((libro) => ({
        ...libro,
        genero: typeof libro.genero === 'object' ? libro.genero : { name: '' },
        categoria:
          typeof libro.categoria === 'object'
            ? libro.categoria
            : { nombre: '' },
      }));

      console.log('Datos cargados correctamente:', this.libros);
    } catch (error: any) {
      Swal.fire('Error obteniendo libros:', error.message, 'error');
    }
  }*/

  // Método para obtener los libros y filtrar los que tienen pdfUrl en null
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

  //////////////////////////////////////////////////////////////////////////////

  async deleteLibros(id: string): Promise<void> {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro de eliminar este libro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        // ✅ Puerto corregido y URL actualizada
        await axios.delete(`http://localhost:3002/api/v1/books/${id}`);
        Swal.fire('Libro eliminado!', '', 'success');
        this.fetchLibros(); // Recargar la lista de libros después de eliminar
      }
    } catch (error: any) {
      Swal.fire(
        'Error al eliminar el libro',
        error.response?.data?.message || error.message,
        'error'
      );
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  async openEditModal(
    id: string,
    titulo: string,
    isbn: string,
    autor: string,
    tipo: string,
    genero: string,
    categoria: string
  ): Promise<void> {
    try {
      // Obtener géneros y categorías desde la API antes de abrir el modal
      const generosResponse = await axios.get<{ name: string }[]>(
        'http://localhost:3002/api/v1/genres'
      );
      const categoriasResponse = await axios.get<{ nombre: string }[]>(
        'http://localhost:3002/api/v1/categories'
      );

      const generosDisponibles = generosResponse.data.map((g) => g.name);
      const categoriasDisponibles = categoriasResponse.data.map(
        (c) => c.nombre
      );

      // Abrir el modal con SweetAlert2 usando los datos cargados
      Swal.fire({
        title: 'Editar Libro',
        html: `
                <div class="flex flex-col">
                  <label for="titulo">Titulo</label>
                  <input type="text" id="titulo" class="swal2-input" value="${titulo}">
                  <label for="isbn">ISBN</label>
                  <input type="text" id="isbn" class="swal2-input" value="${isbn}">
                  <label for="autor">Autor</label>
                  <input type="text" id="autor" class="swal2-input" value="${autor}">
                  <label for="tipo">Tipo</label>
                  <input type="text" id="tipo" class="swal2-input" value="${tipo}">

                  <!-- Select de Género -->
                  <label for="genero">Género</label>
                  <select id="genero" class="swal2-input">
                    <option value="">--Selecciona un género--</option>
                      ${generosDisponibles
                        .map(
                          (g) =>
                            `<option value="${g}" ${
                              g === genero ? 'selected' : ''
                            }>${g}</option>`
                        )
                        .join('')}
                  </select>

                  <!-- Select de Categoría -->
                  <label for="categoria">Categoría</label>
                  <select id="categoria" class="swal2-input">
                    <option value="">--Selecciona una categoría--</option>
                      ${categoriasDisponibles
                        .map(
                          (c) =>
                            `<option value="${c}" ${
                              c === categoria ? 'selected' : ''
                            }>${c}</option>`
                        )
                        .join('')}
                  </select>
                </div>
            `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Actualizar',
        preConfirm: () => {
          const updatedTitulo = (
            document.getElementById('titulo') as HTMLInputElement
          ).value.trim();
          const updatedIsbn = (
            document.getElementById('isbn') as HTMLInputElement
          ).value.trim();
          const updatedAutor = (
            document.getElementById('autor') as HTMLInputElement
          ).value.trim();
          const updatedTipo = (
            document.getElementById('tipo') as HTMLInputElement
          ).value.trim();
          const updatedGenero = (
            document.getElementById('genero') as HTMLSelectElement
          ).value;
          const updatedCategoria = (
            document.getElementById('categoria') as HTMLSelectElement
          ).value;

          if (
            !updatedTitulo ||
            !updatedIsbn ||
            !updatedAutor ||
            !updatedTipo ||
            !updatedGenero ||
            !updatedCategoria
          ) {
            Swal.showValidationMessage('Todos los campos son requeridos');
            return false;
          }

          return {
            updatedTitulo,
            updatedIsbn,
            updatedAutor,
            updatedTipo,
            updatedGenero,
            updatedCategoria,
          };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Aquí estaba el error: se pasaban en orden incorrecto
          this.updateBook(
            id,
            result.value.updatedTitulo,
            result.value.updatedIsbn,
            result.value.updatedAutor,
            result.value.updatedTipo,
            result.value.updatedGenero,
            result.value.updatedCategoria
          );
        }
      });
    } catch (error) {
      Swal.fire(
        'Error',
        'No se pudo cargar los géneros y categorías.',
        'error'
      );
    }
  }

  async updateBook(
    id: string,
    titulo: string,
    isbn: string,
    autor: string,
    tipo: string,
    genero: string,
    categoria: string
  ): Promise<void> {
    try {
      await axios.put(`http://localhost:3002/api/v1/books/${id}`, {
        titulo,
        isbn,
        autor,
        tipo,
        generoNombre: genero,
        categoriaNombre: categoria,
      });
      Swal.fire(
        'Libro Actualizado',
        'El libro se actualizó correctamente.',
        'success'
      );
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire('Error', `No se pudo actualizar el libro: ${error}`, 'error');
    }
  }
  
  //////////////////////////////////////////////////////////////////////////////

  async openRegisterModal(): Promise<void> {
    try {
      // Obtener géneros y categorías desde la API antes de abrir el modal
      const generosResponse = await axios.get<{ name: string }[]>(
        'http://localhost:3002/api/v1/genres'
      );
      const categoriasResponse = await axios.get<{ nombre: string }[]>(
        'http://localhost:3002/api/v1/categories'
      );

      const generosDisponibles = generosResponse.data.map((g) => g.name);
      const categoriasDisponibles = categoriasResponse.data.map(
        (c) => c.nombre
      );

      // Abrir el modal con los datos cargados
      Swal.fire({
        title: 'Registrar Libros Nuevos',
        html: `
                <div class="flex flex-col">
                    <label for="isbn">ISBN</label>
                    <input type="text" id="isbn" class="swal2-input">
                    <label for="titulo">Titulo</label>
                    <input type="text" id="titulo" class="swal2-input">
                    <label for="tipo">Tipo</label>
                    <input type="text" id="tipo" class="swal2-input">
                    <label for="autor">Autor</label>
                    <input type="text" id="autor" class="swal2-input">
                    
                    <!-- Select de género -->
                    <label for="genero">Género</label>
                    <select id="genero" class="swal2-input">
                        <option value="">--Selecciona un género--</option>
                        ${generosDisponibles
                          .map((g) => `<option value="${g}">${g}</option>`)
                          .join('')}
                    </select>

                    <!-- Select de categoría -->
                    <label for="categoria">Categoría</label>
                    <select id="categoria" class="swal2-input">
                        <option value="">--Selecciona una categoría--</option>
                        ${categoriasDisponibles
                          .map((c) => `<option value="${c}">${c}</option>`)
                          .join('')}
                    </select>
                </div>
            `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Registrar',
        preConfirm: () => {
          const isbn = (
            document.getElementById('isbn') as HTMLInputElement
          ).value.trim();
          const titulo = (
            document.getElementById('titulo') as HTMLInputElement
          ).value.trim();
          const tipo = (
            document.getElementById('tipo') as HTMLInputElement
          ).value.trim();
          const autor = (
            document.getElementById('autor') as HTMLInputElement
          ).value.trim();
          const genero = (
            document.getElementById('genero') as HTMLSelectElement
          ).value;
          const categoria = (
            document.getElementById('categoria') as HTMLSelectElement
          ).value;

          if (!isbn || !titulo || !tipo || !autor || !genero || !categoria) {
            Swal.showValidationMessage('Todos los campos son requeridos');
            return false;
          }

          // Agregar un console.log para depurar antes de enviar
          console.log('Datos enviados al servidor:', {
            isbn,
            titulo,
            tipo,
            autor,
            genero,
            categoria,
          });

          return { isbn, titulo, tipo, autor, genero, categoria };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.registerBook(
            result.value.isbn,
            result.value.titulo,
            result.value.tipo,
            result.value.autor,
            result.value.genero,
            result.value.categoria
          );
        }
      });
    } catch (error) {
      Swal.fire('Error', 'Error al cargar géneros y categorías.', 'error');
    }
  }

  async registerBook(
    isbn: string,
    titulo: string,
    tipo: string,
    autor: string,
    genero: string,
    categoria: string
  ): Promise<void> {
    try {
      await axios.post('http://localhost:3002/api/v1/books', {
        // ✅ Ahora el orden coincide con la tabla
        isbn,
        titulo,
        tipo,
        autor,
        generoNombre: genero,
        categoriaNombre: categoria,
      });
      Swal.fire(
        'Libro registrado',
        'El libro se registró correctamente.',
        'success'
      );
    } catch (error) {
      Swal.fire('Error', `No se pudo registrar el libro: ${error}`, 'error');
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  onSignOut(): void {
    Swal.fire({
      title: '¿Estás seguro de cerrar sesión?',
      text: 'Se le regresará a la página de inicio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Cerrando sesión...', '', 'success').then(() => {
          window.location.href = '#';
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelado', 'Tu sesión sigue activa.', 'info');
      }
    });
  }

  ngOnInit() {
    this.fetchLibros();
  }
}
