import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import {CompanyLatestPriceService} from '../company-latest-price.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  showLoader = false;
  watchList:any = localStorage.getItem('watchList');
  
  watchListPresent = false;
  change;latest_price;arr;diff;change_percent;change_status;
  colorBlack;
  constructor(private CompanylatestPriceService: CompanyLatestPriceService,private router: Router) { }

  ngOnInit(): void {
    
    this.watchList = this.watchList ? JSON.parse(this.watchList):[];
    this.watchListPresent = this.watchList.length > 0 ? true : false;
    console.log("This is the watchlist data",this.watchList);
    // if(this.isMobile){
      this.showLoader = true;
      setTimeout(()=>{
        this.showLoader = false;
      },1000);
    // }
    if(this.watchListPresent){
      this.watchList.map((stock)=>{
        this.getCompanyLatestPrice(stock.ticker,stock);
      })
      this.watchList = this.watchList.sort(function(a,b){
        if(a.ticker < b.ticker){return -1};
        if(a.ticker > b.ticker){return 1};
        return 0;
      })
    }
  }

    //watchList Remove
    watchListRemove(option){
      this.watchList = this.watchList.filter((stock)=>{
          if(stock.name != option.name)
            return stock;
        })
      this.watchListPresent = this.watchList.length > 0 ? true : false;
      localStorage.setItem('watchList',JSON.stringify(this.watchList));
    }


    getCompanyLatestPrice(ticker,stockObj) {
      this.CompanylatestPriceService.getLatestPrice(ticker)
      .subscribe(stock=>{
        var text = JSON.stringify(stock);
        var data = JSON.parse(text);
        this.latest_price = data;
        if(this.latest_price && this.latest_price['data']!=[])
        {
          this.arr = this.latest_price['data'];
          if(this.arr.length>0)
          {
            this.change = (this.arr[0].last - this.arr[0].prevClose).toFixed(2);
            this.change_percent = (this.change*100/this.arr[0].prevClose).toFixed(2);
            let date = new Date();
            let ticker_date = new Date(this.arr[0].timestamp);
            this.diff = Math.floor((date.getTime()-ticker_date.getTime())/1000);

            stockObj.colorBlack = false;
            if(this.change>0)
              this.change_status = true;
            else if(this.change==0)
            {
              stockObj.colorBlack = true;
            }
            else
              this.change_status=false;
            }
        }
        else
        {
          this.change =0;
          this.change_percent=0;          
        }
        
        stockObj.latest_price = this.latest_price;
        stockObj.change_status = this.change_status;
        stockObj.change = this.change;
        stockObj.change_percent =this.change_percent;
      });
      
    }
    openStock(stock){
      // var path ='/details/'+stock.ticker;
      // var protocol = window.location.protocol;
      // var hostname = window.location.host;
      // window.location.href = protocol+'//'+hostname+path;
      this.router.navigate(['details',stock.ticker]);
    }
}
