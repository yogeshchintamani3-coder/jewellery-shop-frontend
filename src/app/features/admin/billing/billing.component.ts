import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Invoice, Product } from '../../../core/models/product.model';

interface InvoiceItemForm {
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  hsnCode: string;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>Billing & Invoices</h1>

      <nav class="admin-nav">
        <a routerLink="/admin">Dashboard</a>
        <a routerLink="/admin/products">Products</a>
        <a routerLink="/admin/orders">Orders</a>
        <a routerLink="/admin/categories">Categories</a>
        <a routerLink="/admin/billing" class="active">Billing</a>
      </nav>

      <div class="toolbar">
        <button class="btn btn-primary" (click)="toggleForm()">
          {{ showForm() ? 'Cancel' : '+ Create Invoice' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h3>New Invoice</h3>

          <div class="section-title">Customer Details</div>
          <div class="form-grid">
            <div class="input-group"><label>Customer Name *</label><input [(ngModel)]="customerName" name="customerName" required /></div>
            <div class="input-group"><label>Email</label><input [(ngModel)]="customerEmail" name="customerEmail" type="email" /></div>
            <div class="input-group"><label>Phone</label><input [(ngModel)]="customerPhone" name="customerPhone" /></div>
            <div class="input-group"><label>Address</label><input [(ngModel)]="customerAddress" name="customerAddress" /></div>
          </div>

          <div class="section-title">Invoice Items</div>

          <div class="items-section">
            <div class="item-add-row">
              <select (change)="onProductSelect($event)" class="product-select">
                <option value="">-- Select Product --</option>
                @for (p of products(); track p.productId) {
                  <option [value]="p.productId">{{ p.name }} — {{ p.price | currency:'INR' }}</option>
                }
              </select>
              <button type="button" class="btn btn-secondary btn-sm" (click)="addEmptyItem()">+ Manual Item</button>
            </div>

            @for (item of items; track $index; let i = $index) {
              <div class="item-row">
                <input [(ngModel)]="item.productName" [name]="'itemName'+i" placeholder="Product Name" class="item-input name" required />
                <input [(ngModel)]="item.quantity" [name]="'itemQty'+i" placeholder="Qty" type="number" min="1" class="item-input qty" />
                <input [(ngModel)]="item.unitPrice" [name]="'itemPrice'+i" placeholder="Unit Price" type="number" class="item-input price" />
                <span class="item-total">{{ (item.quantity * item.unitPrice) | currency:'INR' }}</span>
                <button type="button" class="remove-item" (click)="removeItem(i)">&times;</button>
              </div>
            }

            @if (items.length === 0) {
              <p class="empty-items">No items added yet. Select a product or add manually.</p>
            }
          </div>

          <div class="totals-section">
            <div class="form-grid narrow">
              <div class="input-group"><label>Tax Rate (%)</label><input [(ngModel)]="taxRate" name="taxRate" type="number" min="0" step="0.1" /></div>
              <div class="input-group"><label>Discount (%)</label><input [(ngModel)]="discountPercent" name="discountPercent" type="number" min="0" step="0.1" /></div>
            </div>
            <div class="totals-display">
              <div class="total-row"><span>Subtotal</span><span>{{ computedSubtotal() | currency:'INR' }}</span></div>
              <div class="total-row"><span>Tax ({{ taxRate }}%)</span><span>{{ computedTax() | currency:'INR' }}</span></div>
              <div class="total-row"><span>Discount ({{ discountPercent }}%)</span><span>-{{ computedDiscount() | currency:'INR' }}</span></div>
              <div class="total-row grand"><span>Grand Total</span><span>{{ computedGrandTotal() | currency:'INR' }}</span></div>
            </div>
          </div>

          <div class="input-group"><label>Notes</label><textarea [(ngModel)]="notes" name="notes" rows="2" placeholder="Any additional notes..."></textarea></div>

          <button class="btn btn-primary" (click)="createInvoice()" [disabled]="isSaving()">
            {{ isSaving() ? 'Creating...' : 'Generate Invoice' }}
          </button>
        </div>
      }

      @if (selectedInvoice()) {
        <div class="invoice-preview" id="invoicePreview">
          <div class="invoice-paper">
            <div class="inv-header">
              <div>
                <h2 class="inv-brand">&#x1F48E; Prathamesh Jewellers</h2>
                <p class="inv-subtitle">Fine Jewellery</p>
              </div>
              <div class="inv-meta">
                <h3>INVOICE</h3>
                <p>{{ selectedInvoice()!.invoiceNumber }}</p>
                <p>{{ selectedInvoice()!.createdAt | date:'mediumDate' }}</p>
              </div>
            </div>

            <div class="inv-customer">
              <strong>Bill To:</strong>
              <p>{{ selectedInvoice()!.customerName }}</p>
              @if (selectedInvoice()!.customerEmail) { <p>{{ selectedInvoice()!.customerEmail }}</p> }
              @if (selectedInvoice()!.customerPhone) { <p>{{ selectedInvoice()!.customerPhone }}</p> }
              @if (selectedInvoice()!.customerAddress) { <p>{{ selectedInvoice()!.customerAddress }}</p> }
            </div>

            <table class="inv-table">
              <thead>
                <tr><th>#</th><th>Item</th><th>HSN</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                @for (item of selectedInvoice()!.items; track $index; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td>{{ item.productName }}</td>
                    <td>{{ item.hsnCode }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unitPrice | currency:'INR' }}</td>
                    <td>{{ item.lineTotal | currency:'INR' }}</td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="inv-totals">
              <div class="inv-total-row"><span>Subtotal</span><span>{{ selectedInvoice()!.subtotal | currency:'INR' }}</span></div>
              @if (selectedInvoice()!.taxAmount > 0) {
                <div class="inv-total-row"><span>Tax ({{ selectedInvoice()!.taxRate }}%)</span><span>{{ selectedInvoice()!.taxAmount | currency:'INR' }}</span></div>
              }
              @if (selectedInvoice()!.discountAmount > 0) {
                <div class="inv-total-row"><span>Discount ({{ selectedInvoice()!.discountPercent }}%)</span><span>-{{ selectedInvoice()!.discountAmount | currency:'INR' }}</span></div>
              }
              <div class="inv-total-row grand"><span>Total</span><span>{{ selectedInvoice()!.totalAmount | currency:'INR' }}</span></div>
            </div>

            @if (selectedInvoice()!.notes) {
              <div class="inv-notes"><strong>Notes:</strong> {{ selectedInvoice()!.notes }}</div>
            }

            <div class="inv-footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
          <button class="btn btn-primary" (click)="printInvoice()">Download / Print PDF</button>
          <button class="btn btn-secondary" (click)="selectedInvoice.set(null)">Close</button>
        </div>
      }

      <h3 class="section-heading">Recent Invoices</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (inv of invoices(); track inv.invoiceId) {
              <tr>
                <td class="inv-num">{{ inv.invoiceNumber }}</td>
                <td>{{ inv.customerName }}</td>
                <td>{{ inv.createdAt | date:'shortDate' }}</td>
                <td>{{ inv.totalAmount | currency:'INR' }}</td>
                <td><span class="badge badge-info">{{ inv.status }}</span></td>
                <td><button class="btn btn-secondary btn-sm" (click)="viewInvoice(inv.invoiceId)">View</button></td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="empty">No invoices created yet.</td></tr>
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
        &:hover, &.active { color: var(--color-primary); background: var(--color-bg-secondary); } }
    }
    .toolbar { margin-bottom: 1.5rem; }
    .form-card {
      background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2rem;
      animation: page-enter 0.3s ease-out;
      h3 { font-family: var(--font-primary); margin-bottom: 1rem; }
    }
    .section-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--color-primary); font-weight: 600; margin: 1.25rem 0 0.75rem; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 1rem; }
    .form-grid.narrow { max-width: 400px; }
    .section-heading { font-family: var(--font-primary); margin: 2rem 0 1rem; }

    .items-section { margin: 0.5rem 0 1.5rem; }
    .item-add-row { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .product-select {
      flex: 1; min-width: 200px; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      background: var(--color-bg); color: var(--color-text); font-size: 0.8rem;
    }
    .item-row {
      display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; padding: 0.5rem; background: var(--color-bg-secondary); border-radius: var(--radius-sm);
    }
    .item-input { padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.8rem; background: var(--color-bg); color: var(--color-text); }
    .item-input.name { flex: 2; }
    .item-input.qty { width: 60px; }
    .item-input.price { width: 100px; }
    .item-total { min-width: 90px; text-align: right; font-weight: 600; font-size: 0.8rem; }
    .remove-item { background: none; border: none; color: var(--color-error); font-size: 1.25rem; cursor: pointer; padding: 0 0.25rem; }
    .empty-items { color: var(--color-text-muted); font-size: 0.8rem; font-style: italic; padding: 1rem 0; }

    .totals-section { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .totals-display { min-width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 0.375rem 0; font-size: 0.875rem; border-bottom: 1px solid var(--color-border);
      &.grand { border-top: 2px solid var(--color-primary); border-bottom: none; padding-top: 0.75rem; margin-top: 0.5rem; font-weight: 700; font-size: 1.1rem; color: var(--color-primary); }
    }

    /* Invoice Preview */
    .invoice-preview { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
    .invoice-paper {
      width: 100%; max-width: 800px; background: #fff; color: #1a1a1a; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 2.5rem;
      box-shadow: var(--shadow-lg);
    }
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #B76E79; }
    .inv-brand { font-family: var(--font-primary); font-size: 1.5rem; color: #B76E79; }
    .inv-subtitle { font-size: 0.75rem; color: #666; letter-spacing: 2px; text-transform: uppercase; }
    .inv-meta { text-align: right; }
    .inv-meta h3 { font-size: 1.25rem; color: #B76E79; letter-spacing: 3px; }
    .inv-meta p { font-size: 0.8rem; color: #666; }
    .inv-customer { margin-bottom: 1.5rem; font-size: 0.85rem; line-height: 1.6; }
    .inv-customer strong { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #999; }
    .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    .inv-table th { text-align: left; padding: 0.6rem; border-bottom: 2px solid #eee; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; color: #999; }
    .inv-table td { padding: 0.6rem; border-bottom: 1px solid #f0f0f0; font-size: 0.8rem; }
    .inv-totals { max-width: 300px; margin-left: auto; }
    .inv-total-row { display: flex; justify-content: space-between; padding: 0.375rem 0; font-size: 0.85rem; border-bottom: 1px solid #f0f0f0;
      &.grand { font-weight: 700; font-size: 1.1rem; color: #B76E79; border-top: 2px solid #B76E79; border-bottom: none; padding-top: 0.75rem; margin-top: 0.5rem; }
    }
    .inv-notes { margin-top: 1.5rem; padding: 1rem; background: #f9f7f2; border-radius: 4px; font-size: 0.8rem; color: #666; }
    .inv-footer { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #999; font-style: italic; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-border); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); }
    td { padding: 0.75rem; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; }
    .inv-num { font-weight: 600; font-family: monospace; }
    .empty { text-align: center; color: var(--color-text-muted); padding: 2rem; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .item-row { flex-wrap: wrap; }
      .invoice-paper { padding: 1.5rem; }
    }

    @media print {
      .admin-nav, .toolbar, .table-wrap, .section-heading, h1, .invoice-preview > button { display: none !important; }
      .invoice-paper { box-shadow: none; border: none; max-width: 100%; }
    }
  `],
})
export class BillingComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly invoices = signal<Invoice[]>([]);
  readonly products = signal<Product[]>([]);
  readonly showForm = signal(false);
  readonly isSaving = signal(false);
  readonly selectedInvoice = signal<Invoice | null>(null);

  customerName = '';
  customerEmail = '';
  customerPhone = '';
  customerAddress = '';
  items: InvoiceItemForm[] = [];
  taxRate = 3;
  discountPercent = 0;
  notes = '';

  readonly computedSubtotal = computed(() => this.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0));
  readonly computedTax = computed(() => this.computedSubtotal() * (this.taxRate / 100));
  readonly computedDiscount = computed(() => this.computedSubtotal() * (this.discountPercent / 100));
  readonly computedGrandTotal = computed(() => this.computedSubtotal() + this.computedTax() - this.computedDiscount());

  ngOnInit(): void {
    this.loadInvoices();
    this.loadProducts();
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  loadInvoices(): void {
    this.api.get<Invoice[]>('/admin/invoices').subscribe({
      next: (data) => this.invoices.set(data),
      error: () => {},
    });
  }

  loadProducts(): void {
    this.api.get<Product[]>('/products').subscribe({
      next: (data) => this.products.set(data),
      error: () => {},
    });
  }

  onProductSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const productId = select.value;
    if (!productId) return;
    const product = this.products().find(p => p.productId === productId);
    if (product) {
      this.items = [...this.items, {
        productId: product.productId,
        productName: product.name,
        description: product.description,
        quantity: 1,
        unitPrice: product.discountPrice > 0 ? product.discountPrice : product.price,
        hsnCode: '7113',
      }];
    }
    select.value = '';
  }

  addEmptyItem(): void {
    this.items = [...this.items, {
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      hsnCode: '',
    }];
  }

  removeItem(index: number): void {
    this.items = this.items.filter((_, i) => i !== index);
  }

  createInvoice(): void {
    if (!this.customerName.trim() || this.items.length === 0) return;
    this.isSaving.set(true);

    const body = {
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      customerAddress: this.customerAddress,
      items: this.items,
      taxRate: this.taxRate,
      discountPercent: this.discountPercent,
      notes: this.notes,
    };

    this.api.post<Invoice>('/admin/invoices', body).subscribe({
      next: (inv) => {
        this.selectedInvoice.set(inv);
        this.isSaving.set(false);
        this.showForm.set(false);
        this.resetForm();
        this.loadInvoices();
      },
      error: () => this.isSaving.set(false),
    });
  }

  viewInvoice(id: string): void {
    this.api.get<Invoice>(`/admin/invoices/${id}`).subscribe({
      next: (inv) => this.selectedInvoice.set(inv),
      error: () => {},
    });
  }

  printInvoice(): void {
    window.print();
  }

  private resetForm(): void {
    this.customerName = '';
    this.customerEmail = '';
    this.customerPhone = '';
    this.customerAddress = '';
    this.items = [];
    this.taxRate = 3;
    this.discountPercent = 0;
    this.notes = '';
  }
}
