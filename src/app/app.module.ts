import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

// Modules
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { SsComputerOrMobileComponent } from './ss-computer-or-mobile/ss-computer-or-mobile.component';
import { SsTemperatureComponent } from './ss-temperature/ss-temperature.component';
import { SsBookshelfDatasetComponent } from './ss-bookshelf-dataset/ss-bookshelf-dataset.component';


@NgModule({
  declarations: [
    AppComponent,
    SsComputerOrMobileComponent,
    SsTemperatureComponent,
    SsBookshelfDatasetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
