import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Toolbar} from './toolbar/toolbar';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {Sidenav} from './sidenav/sidenav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, Sidenav, MatSidenavContainer, MatSidenav, MatSidenavContent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isSidenavOpen = signal(false);
}
