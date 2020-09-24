import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { SsComputerOrMobileComponent } from './ss-computer-or-mobile/ss-computer-or-mobile.component';
import { SsTemperatureComponent } from './ss-temperature/ss-temperature.component';
import { SsBookshelfDatasetComponent } from './ss-bookshelf-dataset/ss-bookshelf-dataset.component';

const appRoutes: Routes = [
  { path: 'computer-or-mobile', component: SsComputerOrMobileComponent },
  { path: 'temperature-contour', component: SsTemperatureComponent },
  { path: 'bookshelf-dataset', component: SsBookshelfDatasetComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
