import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-create',
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {
  // Referencias a los inputs del HTML
  @ViewChild('name') nameRef!: ElementRef<HTMLInputElement>;
  @ViewChild('phone') phoneRef!: ElementRef<HTMLInputElement>;
  @ViewChild('age') ageRef!: ElementRef<HTMLInputElement>;
  @ViewChild('email') emailRef!: ElementRef<HTMLInputElement>;
  @ViewChild('ide') ideRef!: ElementRef<HTMLInputElement>;
  @ViewChild('genre') genreRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('nationality') nationalityRef!: ElementRef<HTMLInputElement>;
  @ViewChild('linkedin') linkedinRef!: ElementRef<HTMLInputElement>;

  files: { [key: string]: File } = {};

  // Variable para mostrar u ocultar el mensaje de carga
  loadingMessage = false;

  constructor(private http: HttpClient, private router: Router) { }

  onFileSelected(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.files[fieldName] = input.files[0];
    }
  }

  // Función que se ejecuta al hacer clic en el botón "Enviar"
  saveData(): void {
    const uploadData = new FormData();

    // Obtenemos los valores de los inputs directamente desde el DOM
    const name = this.nameRef.nativeElement.value;
    const phone = this.phoneRef.nativeElement.value;
    const age = this.ageRef.nativeElement.value;
    const email = this.emailRef.nativeElement.value;
    const ide = this.ideRef.nativeElement.value;
    const genre = this.genreRef.nativeElement.value;
    const nationality = this.nationalityRef.nativeElement.value;
    const linkedin = this.linkedinRef.nativeElement.value;

    // Validamos que los campos no estén vacíos
    if (!name || !phone || !age || !email || !ide || !genre || !nationality) {
      alert('Debes ingresar los campos obligatorios.');
      return;
    }

    uploadData.append('name', name);
    uploadData.append('phone', phone);
    uploadData.append('age', age);
    uploadData.append('email', email);
    uploadData.append('ide', ide);
    uploadData.append('genre', genre);
    uploadData.append('nationality', nationality);
    uploadData.append('linkedin', linkedin);

    // Append each file by field name
    Object.keys(this.files).forEach(key => {
      uploadData.append(key, this.files[key]);
    });

    // Mostramos el mensaje de carga
    this.loadingMessage = true;

    // Enviamos una petición POST al backend con los datos
    this.http.post<any>('http://localhost:4000/create', uploadData).subscribe({
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
