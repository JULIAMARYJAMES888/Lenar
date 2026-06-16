import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="brand-logo">L</div>
        <div class="brand-text">
          <span class="brand-name">Lenar</span>
          
        </div>
      </div>
      <div class="navbar-links">
        <a routerLink="/customers" routerLinkActive="active" class="nav-link">
          Customer Directory
        </a>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {}