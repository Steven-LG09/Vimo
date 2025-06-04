import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartOptions } from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-stats-info',
  imports: [HttpClientModule, NgChartsModule, CommonModule],
  templateUrl: './stats-info.component.html',
  styleUrl: './stats-info.component.css'
})
export class StatsInfoComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  tipo: string = '';
  datos: any[] = [];
  tablaDatos: { valor: string; cantidad: number }[] = [];

  traducciones: { [key: string]: string } = {
    age: 'Edad',
    genre: 'Género',
    nationality: 'Nacionalidad',
    'studies.type': 'Nivel educativo',
    'studies.institution': 'Instituciones',
    'experiences.time': 'Tiempo de Experiencia',
    'experiences.sector': 'Sectores',
    'experiences.role': 'Cargos',
    'languages.language': 'Idiomas'
  };

  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad',
        data: [],
        backgroundColor: [
          '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'
        ],
        borderRadius: 9,          // 🔵 Redondeo de bordes
        barPercentage: 0.9,       // 🔵 Ancho de la barra (0.0 - 1.0)
        categoryPercentage: 0.7,  // 🔵 Separación entre barras (menor = más juntas)
        hoverBackgroundColor: '#000000',
        hoverBorderColor: '#0D47A1'
      }
    ]
  };

  chartType: ChartType = 'bar';

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#000000',
          font: { size: 14, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: '#555',
        titleColor: '#fff',
        bodyColor: '#eee',
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#555555',
          font: { size: 12 }
        },
        grid: { color: '#eeeeee' }
      },
      y: {
        ticks: {
          color: '#555555',
          font: { size: 12 }
        },
        max: 'auto',
        grid: { color: '#eeeeee' }
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('type') || '';

    this.http.get<any[]>(`https://vimo.koyeb.app/stats/${this.tipo}`)
      .subscribe(data => {
        this.datos = data;
        this.generarGrafica(data);
      });
  }

  generarGrafica(datos: any[]) {
    const frecuencia: { [clave: string]: number } = {};

    for (const item of datos) {
      const valor = String(Object.values(item)[0]);

      if (valor !== 'undefined' && valor !== 'null') {
        frecuencia[valor] = (frecuencia[valor] || 0) + 1;
      }
    }

    this.chartData.labels = Object.keys(frecuencia);
    this.chartData.datasets[0].data = Object.values(frecuencia);

    this.tablaDatos = Object.entries(frecuencia).map(([valor, cantidad]) => ({
      valor,
      cantidad
    }));

    if (this.chart) {
      this.chart.update();
    }
  }
}
