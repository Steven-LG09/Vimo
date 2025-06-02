import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
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
  totalEmployees = 0;
  selectedArea = 'Todos los Empleados';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.obtenerEmployees();
    this.obtenerConteoEmployees();
  }

  obtenerEmployees(area: string = 'Todos los Empleados') {
    const params = area !== 'Todos los Empleados' ? new HttpParams().set('area', area) : undefined;

    this.http.get<any[]>('http://localhost:4000/employee', {
      params,
      responseType: 'json' as const
    }).subscribe({
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

  obtenerConteoEmployees(area: string = 'Todos los Empleados') {
    const params = area !== 'Todos los Empleados' ? new HttpParams().set('area', area) : undefined;

    this.http.get<{ total: number }>('http://localhost:4000/count', {
      params,
      responseType: 'json' as const
    }).subscribe({
      next: (data) => {
        this.totalEmployees = data.total;
      },
      error: (err) => {
        console.error('Error al contar los empleados:', err);
      }
    });
  }

  filtrarPorPrograma(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedArea = selectedValue;
    this.cargando = true;

    this.obtenerEmployees(selectedValue);
    this.obtenerConteoEmployees(selectedValue);
  }
}

