// src/app/pages/home.component.ts
import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule]
})
export class HomeComponent implements AfterViewInit {
  showOptions = false; // ✅ Contrôle l'affichage des options

  // ✅ Affiche les options au clic sur "Se connecter"
  toggleOptions(): void {
    this.showOptions = true;
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.feature-card').forEach(card => {
      observer.observe(card);
    });
  }
}