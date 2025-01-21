import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import axios from 'axios';
import { NgFor } from '@angular/common';

interface Usuario {
  id: string;
  username: string;
  email: string;
  role: string;
  //password: string;
  firebaseUid: string;
}

interface UsuariosPro{
  id: string;
  name: string;
  email: string;
  description: string;
}

interface Customers{
 id: string;
 name: string;
 email: string;
 description: string; 
}

interface Products{
  id: string;
  name: string;
  description: string;
  price:number;
  currency: string; 
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './pro.component.html',
  imports: [NgFor]
})
export class ProComponent {

  public imagenDCG: string = 'assets/user.jpg';

  ///////////////////////////////////////////////////////////////////////////////
  isSidebarVisible = false;

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  usuarios: Usuario[] = [];  
  customers: Customers[] = [];  
  usuariosPro: UsuariosPro[] = [];
  productos: Products[] = [];

  ////////////////////////////////////////////////////////////////////////

  async fetchUsuarios(): Promise<void> {
      try {
          const response = await axios.get<Usuario[]>('http://localhost:3001/api/v1/users');
          this.usuarios = response.data;  
          console.log("Datos cargados correctamente:", this.usuarios);
      } catch (error: any) {
          Swal.fire("Error al obtener datos", error.message, "error");
      }
  }

  ////////////////////////////////////////////////////////////////////////
  
  async openRegisterModal(): Promise<void> {
    try {
        const usuariosResponse = await axios.get<{ username: string; email: string }[]>(
            'http://localhost:3001/api/v1/users'
        );

        const usuariosDisponibles = usuariosResponse.data.map((u) => u.username);
        const emailsDisponibles = usuariosResponse.data.map((u) => u.email);

        Swal.fire({
          title: 'Registrar Usuarios PRO',
          html: `
            <div class="flex flex-col">
              <label for="username">Usuario</label>
              <select id="username" class="swal2-input">
                <option value="">--Selecciona el usuario PRO--</option>
                ${usuariosDisponibles
                  .map((username) => `<option value="${username}">${username}</option>`)
                  .join('')}
              </select>
        
              <label for="email">Correo</label>
              <select id="email" class="swal2-input">
                <option value="">--Selecciona el correo del usuario--</option>
                ${emailsDisponibles
                  .map((email) => `<option value="${email}">${email}</option>`)
                  .join('')}
              </select>
            </div>
          `,
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Registrar a PRO',
          preConfirm: () => {
            const name = (document.getElementById('username') as HTMLSelectElement).value.trim();
            const email = (document.getElementById('email') as HTMLSelectElement).value.trim();
        
            if (!name || !email) {
              Swal.showValidationMessage('Todos los campos son requeridos');
              return false;
            }
        
            return { name, email };
          },
        }).then((result) => {
          if (result.isConfirmed) {
            // Registrar el usuario seleccionado
            this.registerUsuario(result.value.name, result.value.email);
          }
        });
        
    } catch (error) {
        Swal.fire('Error', 'No se pudo cargar los usuarios.', 'error');
    }
  }

  // Función para registrar el usuario con Axios (POST)
  async registerUsuario(name: string, email: string): Promise<void> {
    try {
      console.log('Enviando datos:', { name, email });
  
      // Solicitud POST al backend
      const response = await axios.post('http:/localhost:3003/customers/create-customer', {
        name,
        email,
      });
  
      console.log('Respuesta del servidor:', response.data);
  
      Swal.fire('Usuario registrado', 'El usuario PRO se registró correctamente.', 'success');
    } catch (error: any) {
      console.error('Error al registrar el usuario:', error.response?.data || error.message);
  
      // Mostrar mensaje de error detallado
      Swal.fire(
        'Error',
        error.response?.data?.message?.join(', ') || 'No se pudo registrar el usuario PRO.',
        'error'
      );
    }
  }
  
  ////////////////////////////////////////////////////////////////////////
  async openUpdateModal(id: string, currentName: string): Promise<void> {
    try {
      // Abrir el modal con SweetAlert2
      Swal.fire({
        title: 'Actualizar Usuario PRO',
        html: `
          <div class="flex flex-col">
            <!-- Campo para el nuevo nombre -->
            <label for="newName">Nuevo Nombre</label>
            <input id="newName" class="swal2-input" placeholder="Nuevo nombre" value="${currentName}">
          </div>
        `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Actualizar usuario',
        preConfirm: () => {
          const newName = (document.getElementById('newName') as HTMLInputElement).value.trim();
  
          if (!newName) {
            Swal.showValidationMessage('El nuevo nombre es requerido');
            return false;
          }
  
          return { id, newName };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Llamar a la función para actualizar el usuario
          this.updateUsuario(result.value.newName, result.value.id);
        }
      });
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un problema al abrir el modal.', 'error');
    }
  }  
  
  // Función para actualizar el usuario con Axios (PATCH)
  async updateUsuario(name: string, id: string): Promise<void> {
    try {
      console.log('Enviando datos:', { name, id });
  
      // Solicitud PATCH al backend
      const response = await axios.patch(`http://localhost:3003/customers/update-customer/${id}`, {
        name,
      });
  
      console.log('Respuesta del servidor:', response.data);
  
      Swal.fire('Usuario actualizado', 'El usuario PRO se actualizó correctamente.', 'success');
    } catch (error: any) {
      console.error('Error al actualizar el usuario:', error.response?.data || error.message);
  
      // Mostrar mensaje de error detallado
      Swal.fire(
        'Error',
        error.response?.data?.message?.join(', ') || 'No se pudo actualizar el usuario PRO.',
        'error'
      );
    }
  }
  
  //////////////////////////////////////////////////////////////////////
  async deleteUsuario(id: string): Promise<void> {
    try {
      console.log('Enviando datos:', { id });
  
      // Solicitud PATCH al backend
      const response = await axios.delete(`http://localhost:3003/customers/delete-customer/${id}`);
  
      console.log('Respuesta del servidor:', response.data);
  
      Swal.fire('Usuario eliminado', 'El usuario PRO se eliminó correctamente.', 'success');
    } catch (error: any) {
      console.error('Error al eliminar el usuario:', error.response?.data || error.message);
  
      // Mostrar mensaje de error detallado
      Swal.fire(
        'Error',
        error.response?.data?.message?.join(', ') || 'No se pudo eliminar el usuario PRO.',
        'error'
      );
    }
  }
  
  ////////////////////////////////////////////////////////////////////////
  async fetchUsuariosPro(): Promise<void> {
    try {
        const response = await axios.get<UsuariosPro[]>('http://localhost:3003/customers/show-all-customers');
        this.usuariosPro = response.data;  
        console.log("Datos cargados correctamente usuarios PRO:", this.usuariosPro);
    } catch (error: any) {
        Swal.fire("Error al obtener datos", error.message, "error");
    }
  }

  /////////////////////////////////////////////////////////////////////////
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

  ////////////////////////////////////////////////////////////////////////
  async openRegisterSubscripcionModal(): Promise<void> {
    try {
      // Abrir el modal SweetAlert2 para registrar la subscripción
      Swal.fire({
        title: 'Registrar Subscripción',
        html: `
          <div class="flex flex-col text-left">
            <!-- Campo de Subscripción -->
            <label for="subscripcion" class="block text-gray-400">Subscripción:</label>
            <input type="text" id="subscripcion" class="swal2-input" value="Subscripción" readonly required>
  
            <!-- Campo de Descripción -->
            <label for="descripcion" class="block text-gray-400 mt-2">Descripción:</label>
            <input type="text" id="descripcion" class="swal2-input" value="Pago de subscripción" readonly required>
  
            <!-- Campo de Cantidad -->
            <label for="cantidad" class="block text-gray-400 mt-2">Cantidad a pagar:</label>
            <input type="number" id="cantidad" class="swal2-input" min="1" value="100" required readonly>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          // Leer los valores directamente del atributo `value`
          const subscripcion = (document.getElementById('subscripcion') as HTMLInputElement).value.trim();
          const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value.trim();
          const cantidad = (document.getElementById('cantidad') as HTMLInputElement).value.trim();
  
          // Validación
          if (!subscripcion || !descripcion || !cantidad || parseInt(cantidad) <= 0) {
            Swal.showValidationMessage('Todos los campos son obligatorios y la cantidad debe ser mayor a 0');
            return false;
          }
  
          return { subscripcion, descripcion, cantidad: parseInt(cantidad) };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Llamar al método para registrar la subscripción, pasando el customerId
          this.registerSubscripcion(result.value.subscripcion, result.value.descripcion, result.value.cantidad);
        }
      });
    } catch (error) {
      Swal.fire('Error', 'Error al abrir el modal para registrar la subscripción.', 'error');
    }
  }
  
  async registerSubscripcion(name: string, description: string, price: number): Promise<void> {
    try {
      // Enviar los datos al backend
      const response = await axios.post('http://localhost:3003/products/create-product', {
        name,
        description,
        price,
      });
  
      Swal.fire('Éxito', 'La subscripción ha sido registrada exitosamente.', 'success');
      console.log('Respuesta del servidor:', response.data);
    } catch (error: any) {
      console.error('Error al registrar la subscripción:', error.response?.data || error.message);
      Swal.fire(
        'Error',
        `No se pudo registrar la subscripción: ${error.response?.data?.message || error.message}`,
        'error'
      );
    }
  }
  
  ////////////////////////////////////////////////////////////////////////
  async openRegisterPaymentModal(customerId: string): Promise<void> {
    try {
      // Obtener consumidores y productos desde la API
      const [customersResponse, productsResponse] = await Promise.all([
        axios.get<Customers[]>('http://localhost:3003/customers/show-all-customers'),
        axios.get<Products[]>('http://localhost:3003/products/show-all-products'),
      ]);
  
      // Generar las opciones para el selector de consumidores
      const customersDisponibles = customersResponse.data
        .map(
          (customer: Customers) =>
            `<option value="${customer.id}" ${customer.id === customerId ? 'selected' : ''}>${customer.name}</option>`
        )
        .join('');
  
      // Obtener solo el último producto registrado
      const ultimoProducto = productsResponse.data[productsResponse.data.length - 1];
  
      // Crear una opción para el último producto registrado
      const productoDisponible = ultimoProducto
        ? `<option value="${ultimoProducto.id}" selected>${ultimoProducto.name} - ${ultimoProducto.price} ${ultimoProducto.currency}</option>`
        : '<option value="" disabled>No hay productos disponibles</option>';
  
      // Abrir el modal con SweetAlert2
      Swal.fire({
        title: 'Registrar Pago PRO',
        html: `
          <div class="flex flex-col text-left">
            <!-- Selector de Consumidor -->
            <label for="customer" class="block text-gray-400">Consumidor PRO:</label>
            <select id="customer" class="swal2-input">
              <option value="" disabled>--Seleccione el consumidor PRO--</option>
              ${customersDisponibles}
            </select>
    
            <!-- Selector de Producto -->
            <label for="membresia" class="block text-gray-400 mt-2">Membresía:</label>
            <select id="membresia" class="swal2-input">
              ${productoDisponible}
            </select>
    
            <!-- Campo de Cantidad -->
            <label for="cantidad" class="block text-gray-400 mt-2">Cantidad:</label>
            <input type="number" id="cantidad" class="swal2-input outline-none border-transparent" min="1" value="1" readonly>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          // Obtener los valores de los campos
          const customer = (document.getElementById('customer') as HTMLSelectElement).value;
          const membresia = (document.getElementById('membresia') as HTMLSelectElement).value;
          const cantidad = (document.getElementById('cantidad') as HTMLInputElement).value.trim();
  
          // Validación de campos
          if (!customer || !membresia || !cantidad || parseInt(cantidad) <= 0) {
            Swal.showValidationMessage('Todos los campos son obligatorios y la cantidad debe ser mayor a 0');
            return false;
          }
  
          return { customer, membresia, cantidad: parseInt(cantidad) };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Llamar a la función para registrar el pago
          this.registerPayment(result.value.customer, result.value.membresia, result.value.cantidad);
        }
      });
    } catch (error) {
      Swal.fire('Error', 'Error al cargar los datos.', 'error');
    }
  }
  
  async registerPayment(customerId: string, productId: string, quantity: number): Promise<void> {
    try {
      // Realizar el POST al backend
      const response = await axios.post('http://localhost:3003/payments/create-payment-session', {
        customerId,
        items: [
          {
            productId,
            quantity,
          },
        ],
      });
  
      // Confirmar éxito
      Swal.fire('Éxito', 'El pago de la membresía ha sido registrado exitosamente.', 'success');
      console.log('Respuesta del servidor:', response.data);
    } catch (error: any) {
      console.error('Error al registrar la membresía:', error.response?.data || error.message);
      Swal.fire(
        'Error',
        `No se pudo registrar la membresía: ${error.response?.data?.message || error.message}`,
        'error'
      );
    }
  }
  
  /////////////////////////////////////////////////////////////////////////

  
  ngOnInit(): void {
    this.fetchUsuarios();
    this.fetchUsuariosPro();
  }

}