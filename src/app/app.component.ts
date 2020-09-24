import { Component, enableProdMode } from '@angular/core';
import { Router } from '@angular/router';
declare var particlesJS: any;

enableProdMode();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  selected = -1;
  selectors = [
    {desc: 'Computer or Mobile', link: '/computer-or-mobile', img: 'assets/img/preview/computer-or-mobile.JPG'},
    {desc: 'Global Temperature', link: '/temperature-contour', img: 'assets/img/preview/global-temperature.jpg'},
    {desc: 'Bookshelf Dataset', link: '/bookshelf-dataset', img: 'assets/img/preview/bookshelf.jpg'}
  ];

  constructor(private router: Router) { }
  
  ngOnInit() {
    // let particlePath = '../assets/json/particles.json';
    // particlesJS.load('particles-js', particlePath, null);
  }
}
