import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import axios from 'axios';
import { NgFor } from '@angular/common';

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
  selector: 'app-libros-digitales',
  standalone: true,
  imports: [NgFor],
  templateUrl: './libros-digitales.component.html',
  styleUrl: './libros-digitales.component.css'
})
export class LibrosDigitalesComponent {

  
  libros: Libro[] = [];

  /////////////////////////////////////////////////////////////
  isSidebarVisible = false;

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
  /////////////////////////////////////////////////////////////
  abrirLibro(url: string): void {
    if (url && url.trim() !== '') {
        window.open(url, '_blank');
    } else {
        Swal.fire('Error', 'El enlace del libro no es válido.', 'error');
    }
  }

  /////////////////////////////////////////////////////////////
  
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
        title: 'Registrar Libros Digitales',
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
                    <label for="autor">URL</label>
                    <input type="url" id="pdfUrl" class="swal2-input">
                    
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
          const pdfUrl = (
            document.getElementById('pdfUrl') as HTMLSelectElement
          ).value;

          if (!isbn || !titulo || !tipo || !autor || !genero || !categoria || !pdfUrl) {
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
            pdfUrl
          });

          return { isbn, titulo, tipo, autor, genero, categoria, pdfUrl };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.registerBookDigital(
            result.value.isbn,
            result.value.titulo,
            result.value.tipo,
            result.value.autor,
            result.value.genero,
            result.value.categoria,
            result.value.pdfUrl,
          );
        }
      });
    } catch (error) {
      Swal.fire('Error', 'Error al cargar géneros y categorías.', 'error');
    }
  }

  async registerBookDigital(
    isbn: string,
    titulo: string,
    tipo: string,
    autor: string,
    genero: string,
    categoria: string,
    pdfUrl: string
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
        pdfUrl,
      });
      Swal.fire(
        'Libro digital registrado',
        'El libro digital se registró correctamente.',
        'success'
      );
    } catch (error) {
      Swal.fire('Error', `No se pudo registrar el libro: ${error}`, 'error');
    }
  }

  ////////////////////////////////////////////////////////////

  /*async fetchLibrosDigitales(): Promise<void> {
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
  
  async fetchLibrosDigitales(): Promise<void> {
        try {
            const response = await axios.get<Libro[]>(
                'http://localhost:3002/api/v1/books'
            );
    
            // Filtrar solo los libros con pdfUrl definido y con contenido
            this.libros = response.data
                .filter((libro) => libro.pdfUrl && libro.pdfUrl.trim() !== '')
                .map((libro) => ({
                    ...libro,
                    genero: typeof libro.genero === 'object' ? libro.genero : { name: '' },
                    categoria: typeof libro.categoria === 'object' ? libro.categoria : { nombre: '' }
                }));
    
            console.log('Libros digitales cargados correctamente:', this.libros);
        } catch (error: any) {
            Swal.fire('Error obteniendo libros:', error.message, 'error');
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
    this.fetchLibrosDigitales();
  }

}
