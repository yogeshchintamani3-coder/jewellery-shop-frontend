import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar">
      <input
        type="text"
        [ngModel]="searchTerm()"
        (ngModelChange)="searchTerm.set($event)"
        (keyup.enter)="onSearch()"
        placeholder="Search jewellery..." />
      <button class="btn btn-primary" (click)="onSearch()">Search</button>
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      gap: 0.5rem;
      max-width: 500px;
      width: 100%;

      input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: 0.875rem;
        background: var(--color-bg);
        color: var(--color-text);
        &:focus { outline: none; border-color: var(--color-primary); }
      }
    }
  `],
})
export class SearchBarComponent {
  searchEvent = output<string>();
  searchTerm = signal('');

  onSearch(): void {
    this.searchEvent.emit(this.searchTerm());
  }
}
