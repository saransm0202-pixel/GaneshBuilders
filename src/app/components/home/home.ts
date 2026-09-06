import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero';
import { StatsComponent } from '../stats/stats';
import { AboutComponent } from '../about/about';
import { PackagesComponent } from '../packages/packages';
import { HomeProjectComponent } from '../home-project/home-project';
import { ServicesComponent } from '../services/services';
import { WhyChooseUsComponent } from '../why-choose-us/why-choose-us';
import { ProcessComponent } from '../process/process';
// import { CtaComponent } from '../cta/cta';
import { EnquiryComponent } from '../enquiry/enquiry';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    StatsComponent,
    AboutComponent,
    PackagesComponent,
    HomeProjectComponent,
    ServicesComponent,
    WhyChooseUsComponent,
    ProcessComponent,
    // CtaComponent,
    EnquiryComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}
