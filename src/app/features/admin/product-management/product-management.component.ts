import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';

interface ImagePreview {
  readonly file: File;
  readonly previewUrl: string;
  readonly uploading: boolean;
  readonly uploaded: boolean;
  readonly remoteUrl: string;
  readonly error: string;
}

interface ProductForm {
  name: string;
  category: string;
  description: string;
  price: number;
  discountPrice: number;
  stock: number;
  material: string;
  weight: string;
  featured: boolean;
  active: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>Product Management</h1>

      <nav class="admin-nav">
        <a routerLink="/admin">Dashboard</a>
        <a routerLink="/admin/products" class="active">Products</a>
        <a routerLink="/admin/orders">Orders</a>
        <a routerLink="/admin/categories">Categories</a>
        <a routerLink="/admin/billing">Billing</a>
      </nav>

      <div class="toolbar">
        <button class="btn btn-primary" (click)="toggleForm()">
          {{ showForm() ? 'Cancel' : '+ Add Product' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h3>{{ editing() ? 'Edit Product' : 'New Product' }}</h3>
          <form (ngSubmit)="saveProduct()">
            <div class="form-grid">
              <div class="input-group"><label>Name</label><input [(ngModel)]="form.name" name="name" required /></div>
              <div class="input-group"><label>Category</label><input [(ngModel)]="form.category" name="category" required /></div>
              <div class="input-group"><label>Price</label><input [(ngModel)]="form.price" name="price" type="number" required /></div>
              <div class="input-group"><label>Discount Price</label><input [(ngModel)]="form.discountPrice" name="discountPrice" type="number" /></div>
              <div class="input-group"><label>Stock</label><input [(ngModel)]="form.stock" name="stock" type="number" /></div>
              <div class="input-group"><label>Material</label><input [(ngModel)]="form.material" name="material" /></div>
              <div class="input-group"><label>Weight</label><input [(ngModel)]="form.weight" name="weight" /></div>
              <div class="input-group">
                <label>Featured</label>
                <select [(ngModel)]="form.featured" name="featured">
                  <option [ngValue]="true">Yes</option>
                  <option [ngValue]="false">No</option>
                </select>
              </div>
            </div>
            <div class="input-group"><label>Description</label><textarea [(ngModel)]="form.description" name="description" rows="3"></textarea></div>

            <!-- Image Upload Section -->
            <div class="image-upload-section">
              <label class="section-label">Product Images</label>

              @if (existingImageUrls().length > 0) {
                <div class="existing-images">
                  <span class="sub-label">Current Images</span>
                  <div class="image-preview-grid">
                    @for (url of existingImageUrls(); track url; let i = $index) {
                      <div class="preview-item existing">
                        <img [src]="url" alt="Product image" />
                        <button type="button" class="remove-btn" (click)="removeExistingImage(i)" title="Remove image">&times;</button>
                      </div>
                    }
                  </div>
                </div>
              }

              <div class="drop-zone"
                   [class.drag-over]="isDragOver()"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave()"
                   (drop)="onDrop($event)"
                   (click)="fileInput.click()">
                <input #fileInput type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                       multiple [hidden]="true" (change)="onFilesSelected($event)" />
                <div class="drop-zone-content">
                  <span class="drop-icon">&#x1F4F7;</span>
                  <span class="drop-text">Drag & drop images here or click to browse</span>
                  <span class="drop-hint">JPEG, PNG, WebP, GIF — Max 10MB each</span>
                </div>
              </div>

              @if (validationError()) {
                <div class="upload-error">{{ validationError() }}</div>
              }

              @if (imagePreviews().length > 0) {
                <div class="image-preview-grid">
                  @for (preview of imagePreviews(); track preview.previewUrl; let i = $index) {
                    <div class="preview-item" [class.uploading]="preview.uploading" [class.error]="preview.error">
                      <img [src]="preview.previewUrl" alt="Preview" />
                      <div class="preview-overlay">
                        @if (preview.uploading) {
                          <div class="upload-progress">
                            <div class="progress-spinner"></div>
                          </div>
                        } @else if (preview.uploaded) {
                          <span class="upload-check">&#x2713;</span>
                        } @else if (preview.error) {
                          <span class="upload-fail">&#x2717;</span>
                        }
                      </div>
                      <button type="button" class="remove-btn" (click)="removePreview(i)" title="Remove">&times;</button>
                      @if (preview.error) {
                        <span class="error-tooltip">{{ preview.error }}</span>
                      }
                    </div>
                  }
                </div>

                <div class="upload-actions">
                  @if (hasUnuploadedImages()) {
                    <button type="button" class="btn btn-secondary btn-sm"
                            (click)="uploadAllImages()"
                            [disabled]="isUploading()">
                      {{ isUploading() ? 'Uploading...' : 'Upload All Images' }}
                    </button>
                  }
                  <span class="upload-summary">
                    {{ uploadedCount() }}/{{ imagePreviews().length }} uploaded
                  </span>
                </div>
              }
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
              {{ isSaving() ? 'Saving...' : editing() ? 'Update' : 'Create' }}
            </button>
          </form>
        </div>
      }

      <div class="products-table">
        <table>
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (p of products(); track p.productId) {
              <tr>
                <td class="img-cell">
                  @if (p.imageUrls?.length) {
                    <img [src]="p.imageUrls[0]" [alt]="p.name" class="table-thumb" />
                  } @else {
                    <span class="table-thumb-placeholder">&#x1F48E;</span>
                  }
                </td>
                <td>{{ p.name }}</td>
                <td>{{ p.category }}</td>
                <td>{{ p.price | currency:'INR' }}</td>
                <td>{{ p.stock }}</td>
                <td>{{ p.featured ? 'Yes' : 'No' }}</td>
                <td class="actions">
                  <button class="btn btn-secondary btn-sm" (click)="editProduct(p)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteProduct(p.productId)">Delete</button>
                </td>
              </tr>
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
      display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;
      a {
        color: var(--color-text-secondary); font-weight: 500; font-size: 0.875rem; text-decoration: none; padding: 0.5rem 1rem; border-radius: var(--radius-sm);
        transition: all 0.3s;
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

    /* Image Upload Styles */
    .image-upload-section {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    .section-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 1rem;
    }
    .sub-label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
    }
    .existing-images { margin-bottom: 1rem; }

    .drop-zone {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      background: var(--color-bg);

      &:hover, &.drag-over {
        border-color: var(--color-primary);
        background: rgba(183, 110, 121, 0.04);
        transform: scale(1.005);
      }
      &.drag-over {
        box-shadow: 0 0 0 4px rgba(183, 110, 121, 0.1);
      }
    }
    .drop-zone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .drop-icon { font-size: 2rem; opacity: 0.6; }
    .drop-text { font-size: 0.875rem; color: var(--color-text-secondary); font-weight: 500; }
    .drop-hint { font-size: 0.7rem; color: var(--color-text-muted); letter-spacing: 0.5px; }

    .upload-error {
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: #FFEBEE;
      color: #C62828;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 500;
    }

    .image-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .preview-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid var(--color-border);
      transition: border-color 0.3s, box-shadow 0.3s;

      img { width: 100%; height: 100%; object-fit: cover; display: block; }

      &.uploading { border-color: var(--color-primary); }
      &.existing { border-color: var(--color-success); }
      &.error { border-color: var(--color-error); }

      &:hover { box-shadow: var(--shadow-md); }
    }
    .preview-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .upload-check {
      background: var(--color-success);
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .upload-fail {
      background: var(--color-error);
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
    }
    .progress-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      line-height: 1;
      z-index: 2;
    }
    .preview-item:hover .remove-btn { opacity: 1; }
    .error-tooltip {
      position: absolute;
      bottom: 4px;
      left: 4px;
      right: 4px;
      font-size: 0.6rem;
      background: rgba(198, 40, 40, 0.85);
      color: #fff;
      padding: 2px 4px;
      border-radius: 2px;
      text-align: center;
    }

    .upload-actions {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .upload-summary {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    /* Products Table */
    .products-table { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-border);
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted);
    }
    td { padding: 0.75rem; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; }
    .actions { display: flex; gap: 0.5rem; }
    .img-cell { width: 60px; }
    .table-thumb {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }
    .table-thumb-placeholder {
      display: inline-flex;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-sm);
      font-size: 1.25rem;
    }

    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class ProductManagementComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly products = signal<Product[]>([]);
  readonly showForm = signal(false);
  readonly editing = signal(false);
  readonly isSaving = signal(false);

  readonly imagePreviews = signal<ImagePreview[]>([]);
  readonly existingImageUrls = signal<string[]>([]);
  readonly isDragOver = signal(false);
  readonly validationError = signal('');

  readonly isUploading = computed(() => this.imagePreviews().some(p => p.uploading));
  readonly hasUnuploadedImages = computed(() => this.imagePreviews().some(p => !p.uploaded && !p.uploading));
  readonly uploadedCount = computed(() => this.imagePreviews().filter(p => p.uploaded).length);

  form: ProductForm = {
    name: '', category: '', description: '', price: 0, discountPrice: 0,
    stock: 0, material: '', weight: '', featured: false, active: true,
  };
  private editId = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.resetForm();
    } else {
      this.showForm.set(true);
    }
  }

  loadProducts(): void {
    this.api.get<Product[]>('/products').subscribe({
      next: (data) => this.products.set(data),
      error: () => {},
    });
  }

  editProduct(p: Product): void {
    this.editId = p.productId;
    this.form = {
      name: p.name, category: p.category, description: p.description, price: p.price,
      discountPrice: p.discountPrice, stock: p.stock, material: p.material,
      weight: p.weight, featured: p.featured, active: p.active,
    };
    this.existingImageUrls.set([...(p.imageUrls || [])]);
    this.imagePreviews.set([]);
    this.validationError.set('');
    this.editing.set(true);
    this.showForm.set(true);
  }

  saveProduct(): void {
    const allImageUrls = [
      ...this.existingImageUrls(),
      ...this.imagePreviews().filter(p => p.uploaded).map(p => p.remoteUrl),
    ];

    const body = { ...this.form, imageUrls: allImageUrls };
    this.isSaving.set(true);

    if (this.editing()) {
      this.api.put<Product>(`/admin/products/${this.editId}`, body).subscribe({
        next: () => { this.resetForm(); this.loadProducts(); this.isSaving.set(false); },
        error: () => { this.isSaving.set(false); },
      });
    } else {
      this.api.post<Product>('/admin/products', body).subscribe({
        next: () => { this.resetForm(); this.loadProducts(); this.isSaving.set(false); },
        error: () => { this.isSaving.set(false); },
      });
    }
  }

  deleteProduct(id: string): void {
    this.api.delete(`/admin/products/${id}`).subscribe({
      next: () => this.loadProducts(),
      error: () => {},
    });
  }

  /* Image upload handlers */

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
      input.value = '';
    }
  }

  removePreview(index: number): void {
    this.imagePreviews.update(list => {
      const updated = [...list];
      const removed = updated.splice(index, 1);
      if (removed[0]) {
        URL.revokeObjectURL(removed[0].previewUrl);
      }
      return updated;
    });
  }

  removeExistingImage(index: number): void {
    this.existingImageUrls.update(list => {
      const updated = [...list];
      updated.splice(index, 1);
      return updated;
    });
  }

  uploadAllImages(): void {
    const previews = this.imagePreviews();
    previews.forEach((preview, index) => {
      if (!preview.uploaded && !preview.uploading && !preview.error) {
        this.uploadSingleImage(index);
      }
    });
  }

  private processFiles(fileList: FileList): void {
    this.validationError.set('');
    const newPreviews: ImagePreview[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        this.validationError.set(`"${file.name}" is not a supported format. Use JPEG, PNG, WebP, or GIF.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.validationError.set(`"${file.name}" exceeds the 10MB size limit.`);
        continue;
      }

      newPreviews.push({
        file,
        previewUrl: URL.createObjectURL(file),
        uploading: false,
        uploaded: false,
        remoteUrl: '',
        error: '',
      });
    }

    if (newPreviews.length > 0) {
      this.imagePreviews.update(list => [...list, ...newPreviews]);
    }
  }

  private uploadSingleImage(index: number): void {
    const preview = this.imagePreviews()[index];
    if (!preview) return;

    this.updatePreviewAt(index, { uploading: true, error: '' });

    const formData = new FormData();
    formData.append('file', preview.file);

    this.api.upload<{ url: string }>('/images/upload', formData).subscribe({
      next: (response) => {
        this.updatePreviewAt(index, { uploading: false, uploaded: true, remoteUrl: response.url });
      },
      error: (err) => {
        const message = (err as { error?: { message?: string } })?.error?.message || 'Upload failed';
        this.updatePreviewAt(index, { uploading: false, error: message });
      },
    });
  }

  private updatePreviewAt(index: number, changes: Partial<ImagePreview>): void {
    this.imagePreviews.update(list => {
      const updated = [...list];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...changes } as ImagePreview;
      }
      return updated;
    });
  }

  private resetForm(): void {
    this.imagePreviews().forEach(p => URL.revokeObjectURL(p.previewUrl));
    this.form = {
      name: '', category: '', description: '', price: 0, discountPrice: 0,
      stock: 0, material: '', weight: '', featured: false, active: true,
    } as ProductForm;
    this.imagePreviews.set([]);
    this.existingImageUrls.set([]);
    this.validationError.set('');
    this.editing.set(false);
    this.showForm.set(false);
    this.editId = '';
  }
}
