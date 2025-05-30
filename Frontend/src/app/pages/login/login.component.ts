import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Referencias a los inputs del HTML
  @ViewChild('user') userRef!: ElementRef<HTMLInputElement>;
  @ViewChild('password') passwordRef!: ElementRef<HTMLInputElement>;

  // Variable para mostrar u ocultar el mensaje de carga
  loadingMessage = false;

  constructor(private http: HttpClient, private router: Router) { }

  // Función que se ejecuta al hacer clic en el botón "Enviar"
  login(): void {
    // Obtenemos los valores de los inputs directamente desde el DOM
    const User = this.userRef.nativeElement.value;
    const Password = this.passwordRef.nativeElement.value;

    // Validamos que los campos no estén vacíos
    if (!User || !Password) {
      alert('Debes ingresar los campos necesarios.');
      return;
    }

    // Mostramos el mensaje de carga
    this.loadingMessage = true;

    // Enviamos una petición POST al backend con los datos
    this.http.post<any>('http://localhost:4000/login', {
      user: User,
      password: Password,
    }).subscribe({
      next: (result) => {
        // Ocultamos el mensaje de carga
        this.loadingMessage = false;

        // Si el login falla, mostramos el mensaje de error
        if (!result.success) {
          const message = result.message
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          alert(message);
        }
        // Si el login es exitoso y hay una URL de redirección
        else if (result.redirectUrl) {
          this.router.navigate([result.redirectUrl]); // Redirigimos
        }
      },
      error: (err) => {
        // En caso de error de red o del servidor
        console.error('Error durante el proceso:', err);
        this.loadingMessage = false;
        alert('Ocurrió un error en el proceso.');
      }
    });
  }
}
