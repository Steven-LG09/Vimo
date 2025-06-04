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
  Estudios: string = 'studies.type';
  Institucion: string = 'studies.institution';
  Experiencia: string = 'experiences.time';
  Sector: string = 'experiences.sector';
  Cargo: string = 'experiences.role';
  Idioma: string = 'languages.language';
}
