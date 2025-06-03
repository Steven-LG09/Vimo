import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-stadistics',
  imports: [RouterModule],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.css'
})
export class StadisticsComponent {
  Edad: string = 'age';
  Genero: string = 'genre';
  Nacionalidad: string = 'nationality';
  Estudios: string = 'type';
  Institucion: string = 'institution';
  Experiencia: string = 'time';
  Sector: string = 'sector';
  Cargo: string = 'role';
  Idioma: string = 'language';
}
