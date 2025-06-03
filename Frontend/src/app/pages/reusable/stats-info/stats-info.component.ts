import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-stats-info',
  imports: [HttpClientModule, NgChartsModule, CommonModule],
  templateUrl: './stats-info.component.html',
  styleUrl: './stats-info.component.css'
})
export class StatsInfoComponent implements OnInit {
  tipo: string = '';
  datos: any[] = [];

  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad',
        data: [],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC']
      }
    ]
  };
  chartType: ChartType = 'bar';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('type') || '';

    this.http.get<any[]>(`http://localhost:4000/stats/${this.tipo}`)
      .subscribe(data => {
        this.datos = data;
        this.generarGrafica(data);
      });
  }

  generarGrafica(datos: any[]) {
    const frecuencia: { [clave: string]: number } = {};

    for (const item of datos) {
      const valor = item[this.tipo];
      if (valor !== undefined && valor !== null) {
        frecuencia[valor] = (frecuencia[valor] || 0) + 1;
      }
    }

    this.chartData.labels = Object.keys(frecuencia);
    this.chartData.datasets[0].data = Object.values(frecuencia);
  }
}