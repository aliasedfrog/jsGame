import { Component } from '@angular/core';
import { GameComponent } from './components/game.component';

@Component({
  selector: 'app-root',
  imports: [GameComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'Factory Builder Game';
}
