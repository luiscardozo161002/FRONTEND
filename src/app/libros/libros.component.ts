import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { NgFor } from '@angular/common';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';

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

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Genero {
  id: number;
  name: string;
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
  categorias: Categoria[] = [];
  generos: Genero[] = [];

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

    const secretKey = 'mySecretKey123';
              
    // Cifrar los datos
    const encryptedIsbn = CryptoJS.AES.encrypt(isbn, secretKey).toString();
    const encryptedTitulo = CryptoJS.AES.encrypt(titulo, secretKey).toString();
    const encryptedTipo = CryptoJS.AES.encrypt(tipo, secretKey).toString();
    const encryptedAutor = CryptoJS.AES.encrypt(autor, secretKey).toString();
    const encryptedGenero = CryptoJS.AES.encrypt(genero, secretKey).toString();
    const encryptedCategoria = CryptoJS.AES.encrypt(categoria, secretKey).toString();

    try {
      await axios.post('http://localhost:3002/api/v1/books', {
        // ✅ Ahora el orden coincide con la tabla
        isbn: encryptedIsbn,
        titulo: encryptedTitulo,
        tipo: encryptedTipo,
        autor: encryptedAutor,
        generoNombre: encryptedGenero,
        categoriaNombre: encryptedCategoria,
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

  async fetchCategorias(): Promise<void> {
    try {
      // Solicitud a la API para obtener las categorías
      const response = await axios.get<Categoria[]>('http://localhost:3002/api/v1/categories');
      this.categorias = response.data;
  
      if (this.categorias.length === 0) {
        Swal.fire('Advertencia', 'No se encontraron categorías.', 'warning');
      }
  
      console.log('Categorías cargadas correctamente:', this.categorias);
    } catch (error: any) {
      Swal.fire('Error al obtener las categorías', error.message || 'Error desconocido.', 'error');
    }
  }
  
  /////////////////////////////////////////////////////////////////////////////

  async deleteCategoria(id: number): Promise<void> {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro de eliminar esta categoría?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3002/api/v1/categories/${id}`);
        Swal.fire('Categoría eliminada', '', 'success');
        this.fetchCategorias(); // Recargar la lista después de eliminar
      }
    } catch (error: any) {
      Swal.fire('Error al eliminar la categoría', error.response?.data?.message || error.message, 'error');
    }
  }
  
  /////////////////////////////////////////////////////////////////////////////

  async openEditCategoriaModal(id: number, nombre: string, descripcion: string): Promise<void> {
    try {
      const result = await Swal.fire({
        title: 'Editar Categoría',
        html: `
          <div class="flex flex-col">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombre" class="swal2-input" value="${nombre}">
            <label for="descripcion">Descripción</label>
            <input type="text" id="descripcion" class="swal2-input" value="${descripcion}">
          </div>
        `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Actualizar',
        preConfirm: () => {
          const updatedNombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
          const updatedDescripcion = (document.getElementById('descripcion') as HTMLInputElement).value.trim();
  
          if (!updatedNombre || !updatedDescripcion) {
            Swal.showValidationMessage('Todos los campos son requeridos');
            return false;
          }
  
          return { updatedNombre, updatedDescripcion };
        },
      });
  
      if (result.isConfirmed) {
        await axios.put(`http://localhost:3002/api/v1/categories/${id}`, {
          nombre: result.value.updatedNombre,
          descripcion: result.value.updatedDescripcion,
        });
        Swal.fire('Categoría actualizada', 'La categoría se actualizó correctamente.', 'success');
        this.fetchCategorias();
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar la categoría.', 'error');
    }
  }

  /////////////////////////////////////////////////////////////////////////////

  async openRegisterCategoriaModal(): Promise<void> {
    try {
      const result = await Swal.fire({
        title: 'Registrar Categoría',
        html: `
          <div class="flex flex-col">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombreInput" class="swal2-input">
            <label for="descripcion">Descripción</label>
            <input type="text" id="descripcionInput" class="swal2-input">
          </div>
        `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Registrar',
        preConfirm: () => {
          const secretKey = 'mySecretKey123';

          const nombreInput = (document.getElementById('nombreInput') as HTMLInputElement).value.trim();
          const descripcionInput = (document.getElementById('descripcionInput') as HTMLInputElement).value.trim();
          
          const nombre = CryptoJS.AES.encrypt(nombreInput, secretKey).toString();
          const descripcion = CryptoJS.AES.encrypt(descripcionInput, secretKey).toString();

          if (!nombre || !descripcion) {
            Swal.showValidationMessage('Todos los campos son requeridos');
            return false;
          }
  
          return { nombre, descripcion };
        },
      });
  
      if (result.isConfirmed) {
        await axios.post('http://localhost:3002/api/v1/categories', {
          nombre: result.value.nombre,
          descripcion: result.value.descripcion,
        });
        Swal.fire('Categoría registrada', 'La categoría se registró correctamente.', 'success');
        this.fetchCategorias();
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo registrar la categoría.', 'error');
    }
  }

  /////////////////////////////////////////////////////////////////////////////

  async fetchGeneros(): Promise<void> {
    try {
      // Solicitud a la API para obtener los géneros
      const response = await axios.get<Genero[]>('http://localhost:3002/api/v1/genres');
      this.generos = response.data;
  
      if (this.generos.length === 0) {
        Swal.fire('Advertencia', 'No se encontraron géneros.', 'warning');
      }
  
      console.log('Géneros cargados correctamente:', this.generos);
    } catch (error: any) {
      Swal.fire(
        'Error al obtener los géneros',
        error.response?.data?.message || 'Error desconocido.',
        'error'
      );
    }
  }
  
  ////////////////////////////////////////////////////////////////////////////

  async deleteGenero(id: number): Promise<void> {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro de eliminar este género?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3002/api/v1/genres/${id}`);
        Swal.fire('Género eliminado', '', 'success');
        this.fetchGeneros(); // Recargar la lista después de eliminar
      }
    } catch (error: any) {
      Swal.fire(
        'Error al eliminar el género',
        error.response?.data?.message || error.message,
        'error'
      );
    }
  }

  ///////////////////////////////////////////////////////////////////////////

  async openEditGeneroModal(id: number, name: string): Promise<void> {
    try {
      const result = await Swal.fire({
        title: 'Editar Género',
        html: `
          <div class="flex flex-col">
            <label for="name">Nombre</label>
            <input type="text" id="name" class="swal2-input" value="${name}">
          </div>
        `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Actualizar',
        preConfirm: () => {
          const updatedName = (document.getElementById('name') as HTMLInputElement).value.trim();
  
          if (!updatedName) {
            Swal.showValidationMessage('El nombre es requerido');
            return false;
          }
  
          return { updatedName };
        },
      });
  
      if (result.isConfirmed) {
        await axios.put(`http://localhost:3002/api/v1/genres/${id}`, {
          name: result.value.updatedName,
        });
        Swal.fire('Género actualizado', 'El género se actualizó correctamente.', 'success');
        this.fetchGeneros(); // Recargar la lista después de actualizar
      }
    } catch (error: any) {
      Swal.fire('Error', 'No se pudo actualizar el género.', 'error');
    }
  }
  
  //////////////////////////////////////////////////////////////////////////

  /*async openRegisterGeneroModal(): Promise<void> {
    try {
      const result = await Swal.fire({
        title: 'Registrar Género',
        html: `
          <div class="flex flex-col">
            <label for="nameInput">Nombre</label>
            <input type="text" id="nameInput" class="swal2-input">
          </div>
        `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Registrar',
        preConfirm: () => {
          const secretKey = 'mySecretKey123';
  
          const nameInput = (document.getElementById('nameInput') as HTMLInputElement).value.trim();
  
          if (!nameInput) {
            Swal.showValidationMessage('El nombre es requerido');
            return false;
          }
  
          const name = CryptoJS.AES.encrypt(nameInput, secretKey).toString();
          return { name };
        },
      });
  
      if (result.isConfirmed) {
        await axios.post('http://localhost:3002/api/v1/genres', {
          nombre: result.value.name, // Cambiar a 'nombre'
        });        
        Swal.fire('Género registrado', 'El género se registró correctamente.', 'success');
        this.fetchGeneros(); // Recargar la lista después de registrar
      }
    } catch (error: any) {
      Swal.fire('Error', 'No se pudo registrar el género.', 'error');
    }
  }*/
  
  async openRegisterGeneroModal(): Promise<void> {
      try {
        const result = await Swal.fire({
          title: 'Registrar Género',
          html: `
            <div class="flex flex-col">
              <label for="nameInput">Nombre</label>
              <input type="text" id="nameInput" class="swal2-input">
            </div>
          `,
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Registrar',
          preConfirm: () => {
            const secretKey = 'mySecretKey123';
            const nameInput = (document.getElementById('nameInput') as HTMLInputElement).value.trim();
    
            if (!nameInput) {
              Swal.showValidationMessage('El nombre es requerido');
              return false;
            }
    
            const name = CryptoJS.AES.encrypt(nameInput, secretKey).toString();
            console.log('Cifrado (name):', name); // Debug
            return { name };
          },
        });
    
        if (result.isConfirmed) {
          console.log('Enviando al backend:', { nombre: result.value.name }); // Debug
          await axios.post('http://localhost:3002/api/v1/genres', {
            nombre: result.value.name,
          });
          Swal.fire('Género registrado', 'El género se registró correctamente.', 'success');
          this.fetchGeneros();
        }
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar el género.', 'error');
      }
  }
      
  ////////////////////////////////////////////////////////////////////////////
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
    this.fetchCategorias();
    this.fetchGeneros();
  }

}
