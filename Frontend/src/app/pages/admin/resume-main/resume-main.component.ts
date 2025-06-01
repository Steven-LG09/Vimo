import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-resume-main',
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './resume-main.component.html',
  styleUrl: './resume-main.component.css'
})
export class ResumeMainComponent implements OnInit {
  employees: any[] = [];
  cargando = true;
  error = '';
  totalEmployees = 0; // Nueva propiedad para almacenar el total

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.obtenerEmployees();
    this.obtenerConteoEmployees(); // Llama la función para contar
  }

  obtenerEmployees() {
    this.http.get<any[]>('http://localhost:4000/employee')
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al obtener los empleados:', err);
          this.error = 'No se encontraron empleados.';
          this.cargando = false;
        }
      });
  }

  obtenerConteoEmployees() {
    this.http.get<{ total: number }>('http://localhost:4000/count')
      .subscribe({
        next: (data) => {
          this.totalEmployees = data.total;
        },
        error: (err) => {
          console.error('Error al contar los empleados:', err);
        }
      });
  }
}
