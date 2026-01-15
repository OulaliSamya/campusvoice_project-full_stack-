// src/app/pages/admin-users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  department?: string;
  classe?: string | null;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  
  newUser: User = {
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT',
    classe: ''
  };
  
  searchTerm: string = '';
  filterRole: string = '';
  showAddModal: boolean = false;
  selectedUser: User | null = null;
  
  userError: string | null = null;
  userSuccess: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:8080/api/users').subscribe(users => {
      this.users = users.map(u => ({
        ...u,
        id: u.id ? Number(u.id) : undefined,
        classe: u.classe || ''
      }));
      this.filteredUsers = [...this.users];
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.filterRole || user.role === this.filterRole;
      
      return matchesSearch && matchesRole;
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.resetNewUser();
    this.userError = null;
    this.userSuccess = null;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetNewUser();
  }

  resetNewUser(): void {
    this.newUser = {
      fullName: '',
      email: '',
      password: '',
      role: 'STUDENT',
      classe: ''
    };
  }

  createUser(): void {
    const payload = {
      ...this.newUser,
      classe: this.newUser.role === 'STUDENT' ? this.newUser.classe : null,
      department: this.newUser.role !== 'STUDENT' ? this.newUser.department : null
    };

    this.http.post<User>('http://localhost:8080/api/auth/register', payload).subscribe({
      next: (user) => {
        this.users.push({
          ...user,
          id: user.id ? Number(user.id) : undefined,
          classe: user.classe || ''
        });
        this.applyFilters();
        this.userSuccess = 'Utilisateur créé avec succès !';
        this.userError = null;
        setTimeout(() => this.closeAddModal(), 1500);
      },
      error: (err) => {
        console.error('Erreur création utilisateur :', err);
        this.userError = err.error?.message || 'Échec de la création de l\'utilisateur.';
        this.userSuccess = null;
      }
    });
  }

  viewDetails(user: User): void {
    this.selectedUser = user;
  }

  closeModal(): void {
    this.selectedUser = null;
  }

  deleteUser(id: number | undefined): void {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.http.delete(`http://localhost:8080/api/users/${id}`).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.applyFilters();
          if (this.selectedUser?.id === id) {
            this.closeModal();
          }
        },
        error: (err) => {
          console.error('Erreur suppression :', err);
          alert('Échec de la suppression de l\'utilisateur.');
        }
      });
    }
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'STUDENT': 'Étudiant',
      'TEACHER': 'Enseignant',
      'ADMIN': 'Administrateur'
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'STUDENT': 'student',
      'TEACHER': 'teacher',
      'ADMIN': 'admin'
    };
    return classes[role] || '';
  }

  get totalUsers(): number {
    return this.users.length;
  }
}