import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MovieDBService} from '../movie-db.service';
import {DomSanitizer, SafeResourceUrl, Title} from '@angular/platform-browser';
import {ShowDetails} from '../../interfaces/show';

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.html',
  styleUrl: './player.css'
})
export class Player implements OnInit{

  private route = inject(ActivatedRoute);
  private movieDBService = inject(MovieDBService);
  private sanitizer = inject(DomSanitizer);
  private title = inject(Title);
  showInfo= signal({} as ShowDetails);
  videoUrl: WritableSignal<SafeResourceUrl> = signal('');

  async ngOnInit() {
    this.route.paramMap.subscribe(async params=>{
      const newID = params.get('id');
      const newShowInfo = await this.movieDBService.getInfoMovie(newID || '');
      this.showInfo.set(newShowInfo);
      this.title.setTitle('PintaStreaming - ' + newShowInfo.title);
      console.log(this.showInfo());
      const urlParams = new URLSearchParams();
      urlParams.append("primaryColor", "1E9CEF")
      urlParams.append("secondaryColor", "2b2d30")
      urlParams.append("lang", "it")
      this.videoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(`https://vixsrc.to/movie/${newID}?${urlParams}`));
    });
  }

}
