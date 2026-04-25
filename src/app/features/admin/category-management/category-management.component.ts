import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../core/models/product.model';

interface CategoryForm {
  name: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>Category Management</h1>

      <nav class="admin-nav">
        <a routerLink="/admin">Dashboard</a>
        <a routerLink="/admin/products">Products</a>
        <a routerLink="/admin/orders">Orders</a>
        <a routerLink="/admin/categories" class="active">Categories</a>
        <a routerLink="/admin/billing">Billing</a>
      </nav>

      <div class="toolbar">
        <button class="btn btn-primary" (click)="toggleForm()">
          {{ showForm() ? 'Cancel' : '+ Add Category' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h3>{{ editing() ? 'Edit Category' : 'New Category' }}</h3>
          <form (ngSubmit)="saveCategory()">
            <div class="form-grid">
              <div class="input-group"><label>Name</label><input [(ngModel)]="form.name" name="name" required /></div>
              <div class="input-group"><label>Display Order</label><input [(ngModel)]="form.displayOrder" name="displayOrder" type="number" /></div>
              <div class="input-group"><label>Image URL</label><input [(ngModel)]="form.imageUrl" name="imageUrl" /></div>
              <div class="input-group">
                <label>Active</label>
                <select [(ngModel)]="form.active" name="active">
                  <option [ngValue]="true">Yes</option>
                  <option [ngValue]="false">No</option>
                </select>
              </div>
            </div>
            <div class="input-group"><label>Description</label><textarea [(ngModel)]="form.description" name="description" rows="2"></textarea></div>
            <button type="submit" class="btn btn-primary">{{ editing() ? 'Update' : 'Create' }}</button>
          </form>
        </div>
      }

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Order</th><th>Name</th><th>Description</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (cat of categories(); track cat.categoryId) {
              <tr>
                <td>{{ cat.displayOrder }}</td>
                <td class="name-cell">{{ cat.name }}</td>
                <td class="desc-cell">{{ cat.description }}</td>
                <td>
                  <span class="badge" [class.badge-success]="cat.active" [class.badge-danger]="!cat.active">
                    {{ cat.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" (click)="editCategory(cat)">Edit</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty">No categories found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; animation: page-enter 0.5s ease-out; }
    h1 { font-family: var(--font-primary); margin-bottom: 1rem; }
    .admin-nav {
      display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; flex-wrap: wrap;
      a { color: var(--color-text-secondary); font-weight: 500; font-size: 0.8rem; text-decoration: none; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); transition: all 0.3s;
        &:hover, &.active { color: var(--color-primary); background: var(--color-bg-secondary); }
      }
    }
    .toolbar { margin-bottom: 1.5rem; }
    .form-card {
      background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2rem;
      animation: page-enter 0.3s ease-out;
      h3 { font-family: var(--font-primary); margin-bottom: 1rem; }
    }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 1rem; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-border); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); }
    td { padding: 0.75rem; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; }
    .name-cell { font-weight: 600; }
    .desc-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-secondary); }
    .empty { text-align: center; color: var(--color-text-muted); padding: 2rem; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class CategoryManagementComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly categories = signal<Category[]>([]);
  readonly showForm = signal(false);
  readonly editing = signal(false);

  form: CategoryForm = { name: '', description: '', imageUrl: '', displayOrder: 0, active: true };
  private editId = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.resetForm();
    } else {
      this.showForm.set(true);
    }
  }

  loadCategories(): void {
    this.api.get<Category[]>('/categories').subscribe({
      next: (data) => this.categories.set(data),
      error: () => {},
    });
  }

  editCategory(cat: Category): void {
    this.editId = cat.categoryId;
    this.form = { name: cat.name, description: cat.description, imageUrl: cat.imageUrl, displayOrder: cat.displayOrder, active: cat.active };
    this.editing.set(true);
    this.showForm.set(true);
  }

  saveCategory(): void {
    const body = { ...this.form };
    if (this.editing()) {
      this.api.put<Category>(`/admin/categories/${this.editId}`, body).subscribe({
        next: () => { this.resetForm(); this.loadCategories(); },
        error: () => {},
      });
    } else {
      this.api.post<Category>('/admin/categories', body).subscribe({
        next: () => { this.resetForm(); this.loadCategories(); },
        error: () => {},
      });
    }
  }

  private resetForm(): void {
    this.form = { name: '', description: '', imageUrl: '', displayOrder: 0, active: true };
    this.editing.set(false);
    this.showForm.set(false);
    this.editId = '';
  }
}
