import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
