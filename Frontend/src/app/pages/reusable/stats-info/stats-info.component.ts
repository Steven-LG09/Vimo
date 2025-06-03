import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-stats-info',
  imports: [HttpClientModule],
  templateUrl: './stats-info.component.html',
  styleUrl: './stats-info.component.css'
})
export class StatsInfoComponent implements OnInit {
  tipo: string = '';
  datos: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('type') || '';
    this.http.get<any[]>(`http://localhost:3000/api/stats/${this.tipo}`).subscribe(data => {
      this.datos = data;
      console.log('Datos recibidos:', data);
      // Aquí puedes preparar datos para la tabla y la gráfica
    });
  }
}
