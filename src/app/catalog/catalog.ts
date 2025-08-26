import {Component, inject, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-catalog',
  imports: [],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit{

  private route = inject(ActivatedRoute);
  private title = inject(Title);

  async ngOnInit() {
    this.route.paramMap.subscribe(async params=>{
      const category = params.get('category');
      switch (category) {
        case 'movies':
          this.title.setTitle('PintaStreaming - Film');
          break;
        case 'tv-series':
          this.title.setTitle('PintaStreaming - Serie TV');
          break;
        default:
          this.title.setTitle('PintaStreaming');
         break;
      }
    });
  }

}
