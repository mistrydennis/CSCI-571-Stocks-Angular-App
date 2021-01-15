import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { SearchComponent } from './search/search.component';
import {DetailsComponent} from './details/details.component'

const routes: Routes = [
{path: '', component: SearchComponent},
{path: 'watchlist',pathMatch:'full', component: WatchlistComponent},
{path: 'portfolio', component: PortfolioComponent},
{path: 'details/:ticker', component:DetailsComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
// export const routingComponents = [SearchComponent,WatchlistComponent,PortfolioComponent]
