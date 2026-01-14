// src/app/pages/admin-feedbacks.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Interface pour typer les feedbacks
interface Feedback {
  id: number;
  content: string;
  category: 'positive' | 'neutral' | 'negative';
  createdAt: string;
  student?: {
    id: number;
    fullName: string;
  };
  course?: {
    id: number;
    title: string;
  };
  teacher?: {
    id: number;
    fullName: string;
  };
}

@Component({
  selector: 'app-admin-feedbacks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-feedbacks.component.html',
  styleUrls: ['./admin-feedbacks.component.scss']
})
export class AdminFeedbacksComponent implements OnInit, OnDestroy {
  // Données
  allFeedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];
  totalFeedbacks = 0;
  
  // Filtres
  searchTerm = '';
  filterCategory: '' | 'positive' | 'neutral' | 'negative' = '';
  
  // Modal
  selectedFeedback: Feedback | null = null;
  
  // Loading state
  isLoading = false;
  
  // Subject pour gérer la recherche avec debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // API URL (à externaliser dans un environment file)
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configure le debounce pour la recherche (évite trop de requêtes)
   */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Attend 300ms après la dernière frappe
        distinctUntilChanged(), // Ne déclenche que si la valeur change
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  /**
   * Retourne les headers avec le token d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Charge tous les feedbacks depuis l'API
   */
  loadFeedbacks(): void {
    this.isLoading = true;
    
    this.http.get<Feedback[]>(
      `${this.API_URL}/feedbacks?sort=createdAt,desc`, 
      { headers: this.getAuthHeaders() }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (feedbacks) => {
        this.allFeedbacks = feedbacks;
        this.totalFeedbacks = feedbacks.length;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des feedbacks', error);
        this.isLoading = false;
        this.showErrorMessage('Impossible de charger les feedbacks');
      }
    });
  }

  /**
   * Déclenché lors de la saisie dans la barre de recherche
   */
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Déclenché lors du changement de filtre de catégorie
   */
  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Applique les filtres de recherche et de catégorie
   */
  applyFilters(): void {
    this.filteredFeedbacks = this.allFeedbacks.filter(fb => {
      // Filtre de recherche textuelle
      const matchesSearch = !this.searchTerm || 
        fb.content?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fb.course?.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fb.teacher?.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fb.student?.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre de catégorie
      const matchesCategory = !this.filterCategory || fb.category === this.filterCategory;

      return matchesSearch && matchesCategory;
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.filterCategory = '';
    this.applyFilters();
  }

  /**
   * Retourne le label traduit pour une catégorie
   */
  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      positive: 'Positif',
      neutral: 'Neutre',
      negative: 'Négatif'
    };
    return labels[category] || 'Neutre';
  }

  /**
   * Retourne la couleur associée à une catégorie
   */
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      positive: '#10b981',
      neutral: '#f59e0b',
      negative: '#ef4444'
    };
    return colors[category] || '#6b7280';
  }

  /**
   * Ouvre le modal avec les détails du feedback
   */
  viewDetails(feedback: Feedback): void {
    this.selectedFeedback = feedback;
  }

  /**
   * Ferme le modal de détails
   */
  closeModal(): void {
    this.selectedFeedback = null;
  }

  /**
   * Supprime un feedback
   */
  deleteFeedback(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ? Cette action est irréversible.')) {
      return;
    }

    this.http.delete<void>(
      `${this.API_URL}/feedbacks/${id}`, 
      { headers: this.getAuthHeaders() }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        // Retire le feedback de la liste
        this.allFeedbacks = this.allFeedbacks.filter(fb => fb.id !== id);
        this.totalFeedbacks--;
        this.applyFilters();
        
        // Ferme le modal si c'était le feedback sélectionné
        if (this.selectedFeedback?.id === id) {
          this.closeModal();
        }
        
        this.showSuccessMessage('Feedback supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression', error);
        this.showErrorMessage('Impossible de supprimer ce feedback');
      }
    });
  }

  /**
   * Affiche un message de succès
   */
  private showSuccessMessage(message: string): void {
    // Ici vous pouvez intégrer un service de notification (Toastr, etc.)
    alert(message);
  }

  /**
   * Affiche un message d'erreur
   */
  private showErrorMessage(message: string): void {
    // Ici vous pouvez intégrer un service de notification (Toastr, etc.)
    alert(message);
  }

  /**
   * Exporte les feedbacks filtrés en CSV
   */
  exportToCSV(): void {
    if (this.filteredFeedbacks.length === 0) {
      this.showErrorMessage('Aucun feedback à exporter');
      return;
    }

    const headers = ['ID', 'Date', 'Étudiant', 'Cours', 'Enseignant', 'Catégorie', 'Contenu'];
    const rows = this.filteredFeedbacks.map(fb => [
      fb.id,
      new Date(fb.createdAt).toLocaleDateString('fr-FR'),
      fb.student?.fullName || 'Anonyme',
      fb.course?.title || 'N/A',
      fb.teacher?.fullName || 'N/A',
      this.getCategoryLabel(fb.category),
      `"${fb.content.replace(/"/g, '""')}"` // Échappe les guillemets
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `feedbacks_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Obtient les statistiques des feedbacks filtrés
   */
  getFilteredStats(): { positive: number; neutral: number; negative: number } {
    return {
      positive: this.filteredFeedbacks.filter(fb => fb.category === 'positive').length,
      neutral: this.filteredFeedbacks.filter(fb => fb.category === 'neutral').length,
      negative: this.filteredFeedbacks.filter(fb => fb.category === 'negative').length
    };
  }
}