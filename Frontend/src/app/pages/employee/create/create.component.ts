import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';


interface Study {
  title: string;
  type: string;
  institution: string;
  certificate: File;
}

interface Experience {
  company: string;
  sector: string;
  city: string;
  telephone: number;
  time: number;
  role: string;
  contract: string
}

interface Language {
  language: string;
  languageLevel: string;
}

interface Skill {
  skill: string;
  skillLevel: string;
}

@Component({
  standalone: true,
  selector: 'app-create',
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})

export class CreateComponent {
  studies: Study[] = [];
  experiences: Experience[] = [];
  languages: Language[] = [];
  skills: Skill[] = [];

  // Referencias a los inputs del HTML
  @ViewChild('name') nameRef!: ElementRef<HTMLInputElement>;
  @ViewChild('phone') phoneRef!: ElementRef<HTMLInputElement>;
  @ViewChild('age') ageRef!: ElementRef<HTMLInputElement>;
  @ViewChild('email') emailRef!: ElementRef<HTMLInputElement>;
  @ViewChild('ide') ideRef!: ElementRef<HTMLInputElement>;
  @ViewChild('genre') genreRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('nationality') nationalityRef!: ElementRef<HTMLInputElement>;
  @ViewChild('linkedin') linkedinRef!: ElementRef<HTMLInputElement>;
  @ViewChild('area') areaRef!: ElementRef<HTMLSelectElement>;

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

  addStudy(): void {
    const title = (document.getElementById('studies') as HTMLInputElement).value;
    const type = (document.getElementById('studyType') as HTMLSelectElement).value;
    const place = (document.getElementById('place') as HTMLInputElement).value;
    const certInput = document.getElementById('certificate') as HTMLInputElement;

    if (!title || !type || !place || !certInput.files?.length) {
      alert('Debes completar todos los campos del estudio.');
      return;
    }

    const newStudy: Study = {
      title,
      type,
      institution: place,
      certificate: certInput.files[0]
    };

    this.studies.push(newStudy);

    //Limpiar los inputs después de añadir
    (document.getElementById('studies') as HTMLInputElement).value = '';
    (document.getElementById('studyType') as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById('place') as HTMLInputElement).value = '';
    certInput.value = '';

    this.updateStudyListUI(); // Para mostrar los estudios añadidos en pantalla
  }

  updateStudyListUI(): void {
    const list = document.getElementById('study-list')!;
    list.innerHTML = ''; // Clear previous list

    this.studies.forEach((study, index) => {
      const div = document.createElement('div');
      div.classList.add('study-item'); // Optional class for styling

      div.innerHTML = `
      <div class="dinamicLists">
        <p><strong>${index + 1}.</strong> Título como ${study.title}, de tipo ${study.type} y fue realizado en ${study.institution}.</p> 
        <em>Archivo:</em> <span>${study.certificate.name}</span><br>
        <button class="delete-btn" data-index="${index}">Eliminar</button>
      </div>
    `;

      list.appendChild(div);
    });

    // Attach click listener to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = +((btn as HTMLButtonElement).dataset['index']!);
        this.deleteStudy(index);
      });
    });
  }

  deleteStudy(index: number): void {
    this.studies.splice(index, 1); // Remove from array
    this.updateStudyListUI();      // Refresh list
  }

  addExperience(): void {
    const company = (document.getElementById('entity') as HTMLInputElement).value;
    const sector = (document.getElementById('sector') as HTMLSelectElement).value;
    const city = (document.getElementById('city') as HTMLInputElement).value;
    const telephone = (document.getElementById('telephone') as HTMLInputElement).value;
    const time = (document.getElementById('time') as HTMLInputElement).value;
    const role = (document.getElementById('role') as HTMLInputElement).value;
    const contract = (document.getElementById('contract') as HTMLInputElement).value;

    if (!company || !sector || !city || !telephone || !time || !role || !contract) {
      alert('Debes completar todos los campos de la experiencia.');
      return;
    }

    const newExperience: Experience = {
      company,
      sector,
      city,
      telephone: Number(telephone),
      time: Number(time),
      role,
      contract
    };

    this.experiences.push(newExperience);

    //Limpiar los inputs después de añadir
    (document.getElementById('entity') as HTMLInputElement).value = '';
    (document.getElementById('sector') as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById('city') as HTMLInputElement).value = '';
    (document.getElementById('telephone') as HTMLInputElement).value = '';
    (document.getElementById('time') as HTMLInputElement).value = '';
    (document.getElementById('role') as HTMLInputElement).value = '';
    (document.getElementById('contract') as HTMLInputElement).value = '';

    this.updateExperienceListUI(); // Para mostrar las experiencias añadidas en pantalla
  }

  updateExperienceListUI(): void {
    const list = document.getElementById('job-list')!;
    list.innerHTML = ''; // Clear previous list

    this.experiences.forEach((experience, index) => {
      const div = document.createElement('div');
      div.classList.add('job-item'); // Optional class for styling

      div.innerHTML = `
      <div class="dinamicLists">
        <p><strong>${index + 1}.</strong> He trabajado en ${experience.company}, del sector ${experience.sector}, 
        ubicado en ${experience.city}, con teléfono ${experience.telephone}, durante ${experience.time} meses, con el cargo 
        ${experience.role} y con este contrato: ${experience.contract}.</p>
        <button class="delete-btn" data-index="${index}">Eliminar</button>
      </div>
    `;

      list.appendChild(div);
    });

    // Attach click listener to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = +((btn as HTMLButtonElement).dataset['index']!);
        this.deleteExperience(index);
      });
    });
  }

  deleteExperience(index: number): void {
    this.experiences.splice(index, 1); // Remove from array
    this.updateExperienceListUI();      // Refresh list
  }

  addLanguage(): void {
    const language = (document.getElementById('language') as HTMLInputElement).value;
    const languageLevel = (document.getElementById('languageLevel') as HTMLSelectElement).value;

    if (!language || !languageLevel) {
      alert('Debes completar todos los campos del idioma.');
      return;
    }

    const newLanguage: Language = {
      language,
      languageLevel
    };

    this.languages.push(newLanguage);

    //Limpiar los inputs después de añadir
    (document.getElementById('language') as HTMLInputElement).value = '';
    (document.getElementById('languageLevel') as HTMLSelectElement).selectedIndex = 0;

    this.updateLanguageListUI(); // Para mostrar los idiomas añadidos en pantalla
  }

  updateLanguageListUI(): void {
    const list = document.getElementById('language-list')!;
    list.innerHTML = ''; // Clear previous list

    this.languages.forEach((language, index) => {
      const div = document.createElement('div');
      div.classList.add('language-item'); // Optional class for styling

      div.innerHTML = `
      <div class="dinamicLists">
        <p><strong>${index + 1}.</strong> Se hablar ${language.language} en el nivel ${language.languageLevel}.</p> 
        <button class="delete-btn" data-index="${index}">Eliminar</button>
      </div>
    `;

      list.appendChild(div);
    });

    // Attach click listener to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = +((btn as HTMLButtonElement).dataset['index']!);
        this.deleteLanguage(index);
      });
    });
  }

  deleteLanguage(index: number): void {
    this.languages.splice(index, 1); // Remove from array
    this.updateLanguageListUI();      // Refresh list
  }

  addSkill(): void {
    const skill = (document.getElementById('skill') as HTMLInputElement).value;
    const skillLevel = (document.getElementById('skillLevel') as HTMLSelectElement).value;

    if (!skill || !skillLevel) {
      alert('Debes completar todos los campos de la habilidad.');
      return;
    }

    const newSkill: Skill = {
      skill,
      skillLevel
    };

    this.skills.push(newSkill);

    //Limpiar los inputs después de añadir
    (document.getElementById('skill') as HTMLInputElement).value = '';
    (document.getElementById('skillLevel') as HTMLSelectElement).selectedIndex = 0;

    this.updateSkillListUI(); // Para mostrar las habilidades añadidas en pantalla
  }

  updateSkillListUI(): void {
    const list = document.getElementById('skill-list')!;
    list.innerHTML = ''; // Clear previous list

    this.skills.forEach((skill, index) => {
      const div = document.createElement('div');
      div.classList.add('skill-item'); // Optional class for styling

      div.innerHTML = `
      <div class="dinamicLists">
        <p><strong>${index + 1}.</strong> ${skill.skill} en el nivel ${skill.skillLevel}.</p> 
        <button class="delete-btn" data-index="${index}">Eliminar</button>
      </div>
    `;

      list.appendChild(div);
    });

    // Attach click listener to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = +((btn as HTMLButtonElement).dataset['index']!);
        this.deleteSkill(index);
      });
    });
  }

  deleteSkill(index: number): void {
    this.skills.splice(index, 1); // Remove from array
    this.updateSkillListUI();      // Refresh list
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
    const area = this.areaRef.nativeElement.value;

    // Validamos que los campos no estén vacíos
    if (!name || !phone || !age || !email || !ide || !genre || !nationality || !area) {
      alert('Debes ingresar los campos obligatorios.');
      return;
    }

    if (this.studies.length === 0) {
      alert('Debes agregar al menos un estudio antes de enviar el formulario.');
      return;
    }

    if (this.experiences.length === 0) {
      alert('Debes agregar al menos una experiencia antes de enviar el formulario.');
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
    uploadData.append('area', area);

    // Append each file by field name
    Object.keys(this.files).forEach(key => {
      uploadData.append(key, this.files[key]);
    });

    this.studies.forEach((study, index) => {
      if (study.certificate instanceof File) {
        uploadData.append(`studies[${index}][certificate]`, study.certificate);
      }
    });


    // Agregar arrays al uploadData
    uploadData.append('studies', JSON.stringify(this.studies));
    uploadData.append('experiences', JSON.stringify(this.experiences));
    uploadData.append('languages', JSON.stringify(this.languages));
    uploadData.append('skills', JSON.stringify(this.skills));


    // Mostramos el mensaje de carga
    this.loadingMessage = true;

    // Enviamos una petición POST al backend con los datos
    this.http.post<any>('https://vimo.koyeb.app/create', uploadData).subscribe({
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
