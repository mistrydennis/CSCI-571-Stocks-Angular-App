import { Component, OnInit ,Input,OnChanges,SimpleChanges} from '@angular/core';
import {Event,NavigationCancel,NavigationEnd,NavigationError,NavigationStart,ActivatedRoute,Router} from '@angular/router';
import {StockDetailsService} from '../stock-details.service'
import {CompanyLatestPriceService} from '../company-latest-price.service';
import {NewsDetailsService} from '../news-details.service';

import * as Highcharts from "highcharts/highstock";
import { Options } from "highcharts/highstock";
import IndicatorZigzag from "highcharts/indicators/zigzag";
import IndicatorsCore from "highcharts/indicators/indicators";
import {CompanyHistoricChartService} from '../company-historic-chart.service';
import {CompanyDailyLastChartService} from '../company-daily-last-chart.service';
import { FaIconLibrary} from '@fortawesome/angular-fontawesome';
import { faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';

IndicatorsCore(Highcharts);
IndicatorZigzag(Highcharts);
var vbp = require('highcharts/indicators/volume-by-price');
vbp(Highcharts);

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  //ID for refresh interval and destroy
  refreshFunc;
  // private ticker_val;
  stock_result;
  startDateOfDescription;

  latest_price;
  arr;
  //Used for change and change percent
  change;
  change_percent;
  //These are used to determine the market status
  market_status;
  //Diff <60 market is open else market is closed.
  diff;
  //Depending on whether the status is +ve or -ve.
  change_status;
  // current date for timestamp display on top right
  date;

  startDate;
  //market close timestamp;
  marketclosedDate;

  colorBlack;
  // Arrays for highcharts
  news_data=[];
  ohlc = [];
  volume = [] ;
  ohlc_daily = [];
  //Watchlist and modal variables
  
  isWatchListed = false;
  noValidResult = false;
  watchListObj = {
    status: false,
    msg:'',
    type:''
  }
  watchListRemove = {
    status: false,
    msg:'',
    type:''
  }
  stockBoughtToast = {
    status: false,
    msg:'',
    type:''
  }
  month = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
  modalOptions={
    modalTitle: '',
    secondaryTitle:'',
    modalContent: ``,
    hideFooter: true,
    InputOptions: {},
  };
  watchList;
  showLoader;

  //PortFolio List Variables
  portfolioStocks;
  isPortFolioPresent = false;

  //Buying and updating local_storage variables.
  stockQuantity = 0;
  total_costPrice = 0.0;
  total_sellingPrice = 0;
  currBalance; //after selling
  
  //Getting the routing parameter
  ticker_val = this.route.snapshot.paramMap.get('ticker');
  

  //HighCharts configurations.
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Options ;
  cOptions : Options;
  updateFromInput;

  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  constructor(private router: Router,
    private StockdetailsService: StockDetailsService,
    private CompanylatestPriceService:CompanyLatestPriceService,
    private NewsdetailsService:NewsDetailsService,
    private route:ActivatedRoute,
    private CompanyhistoricChartService:CompanyHistoricChartService,
    private CompanydailyLastChartService : CompanyDailyLastChartService,
    private library: FaIconLibrary) {
    library.addIcons(faTwitter,faFacebook);
   }


  ngOnInit(): void {
    this.showLoader = true;
    this.colorBlack = false;
    this.market_status = false;
    this.updateFromInput = false;
    this.getDetails();
    // this.getCompanyLatestPrice();
    this.getNewsDetails();
    // this.getDailyLastChartData();
    this.getHistorical();
    this.dependentFunction();
    
    this.refreshInterval();
    this.watchList = localStorage.getItem('watchList');
    this.watchList = this.watchList ? JSON.parse(this.watchList):[];
    this.currBalance = localStorage.getItem('currentBal');
    this.currBalance = this.currBalance == null ? 10000000 : Number(this.currBalance);
    this.portfolioStocks = localStorage.getItem('portFolio');
    this.portfolioStocks = this.portfolioStocks ? JSON.parse(this.portfolioStocks):[];
    this.stopLoader();
  }

  ngAfterContentChecked() : void {
    console.log(this.market_status);
  }

  private dependentFunction(){
    this.getCompanyLatestPrice({
      cb: ()=>{
        this.getDailyLastChartData();
      }
    });
  }


  private refreshInterval()
  {
    this.refreshFunc =setInterval(()=>{
      this.dependentFunction();
    },15*1000);
  }
  private stopLoader(){
    setTimeout(()=>{
      this.showLoader = false;
    },1000);
  }


  private checkWatchList(listToCheck){
    var match = false;
    if(listToCheck && listToCheck.length > 0){
      listToCheck.map((stock)=>{
          if(stock.name == this.stock_result.data.name){
            match = true;
          }
      })
    }
    return match;
  }

  ngOnDestroy() {
    if(this.refreshFunc){
      clearInterval(this.refreshFunc);
    }
  }

  getDetails() {
    this.StockdetailsService.getStockDetails(this.ticker_val)
    .subscribe(stock=>{
      var text = JSON.stringify(stock);
      
      var data = JSON.parse(text);
      this.stock_result = data;
      this.isWatchListed = this.checkWatchList(this.watchList);
      this.isPortFolioPresent = this.checkWatchList(this.portfolioStocks);
      if(data.data && data.data.detail == 'Not found.'){
        this.noValidResult = true;
        this.showLoader =false;
      }
      this.startDateOfDescription = this.stock_result.data.startDate;
      
    });
  }

  getCompanyLatestPrice(options:any) {
    this.CompanylatestPriceService.getLatestPrice(this.ticker_val)
    .subscribe(stock=>{
      var text = JSON.stringify(stock);
      
      var data = JSON.parse(text);
      this.latest_price = data;
      
      if(this.latest_price && this.latest_price['data']!=[])
      {
        this.arr = this.latest_price['data'];
        
        if(this.arr && this.arr.length>0)
        {
          this.change = (this.arr[0].last - this.arr[0].prevClose).toFixed(2);
          this.change_percent = (this.change*100/this.arr[0].prevClose).toFixed(2);
          
          let date = new Date();
          console.log(this.arr[0].timestamp);
          let ticker_date = new Date(this.arr[0].timestamp);
          this.diff = Math.floor((date.getTime()-ticker_date.getTime())/1000);
          this.startDate = this.arr[0].timestamp;
          
          if(this.diff<60)
            this.market_status = true; //open
          
          if(this.change>0)
            this.change_status = true;
          else if(this.change==0.00)
            this.colorBlack = true;
          else
            this.change_status=false;
          }
          
          var d = new Date();
          this.date = this.getDateInCorrectFormat(d);
          var d1 = new Date(this.arr[0].timestamp);
          this.marketclosedDate = this.getDateInCorrectFormat(d1);
          

      }
      else
      {
        this.change =0;
        this.change_percent=0;
        this.market_status=false;
      }
      options.cb && options.cb();
    });
  }

  getDateInCorrectFormat(d)
  {
    d= d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2)+ " "
          + ("00" + d.getHours()).slice(-2) + ":" 
          + ("00" + d.getMinutes()).slice(-2) 
          + ":" + ("00" + d.getSeconds()).slice(-2); 
          return d;
  }

  //watchList Function
  watchListToggle(){
    this.isWatchListed = !this.isWatchListed;
    if(this.isWatchListed){
      var isMatchFound = this.checkWatchList(this.watchList);
      if(!isMatchFound){
        this.watchList.push(this.stock_result.data);
      }
    }else{
      this.watchList = this.watchList.filter((stock)=>{
        if(stock.name != this.stock_result.data.name)
          return stock;
      })      
    }
    if(this.isWatchListed){
      this.watchListObj.status = true;
      this.watchListObj.type = 'success' ;
      this.watchListObj.msg = this.ticker_val+" added to Watchlist."; 
    }else{
      this.watchListRemove.status = true;
      this.watchListRemove.type = 'danger';
      this.watchListRemove.msg =  this.ticker_val +" removed from Watchlist."; 
    }
   
    
    localStorage.setItem('watchList',JSON.stringify(this.watchList));
    setTimeout(()=>{
      if(this.isWatchListed){
        this.watchListObj.status = false;
        this.watchListObj.msg = '';
        this.watchListObj.type = '';
      }else{
        this.watchListRemove.status = false;
        this.watchListRemove.msg = '';
        this.watchListRemove.type = '';     
      }
    },5000);
  }



  //Open buying modal
  openBuyModal(modal){
    this.modalOptions.modalTitle = this.stock_result.data.name;
    this.modalOptions.secondaryTitle = '';
    this.modalOptions.hideFooter = false;          
    this.modalOptions.modalContent = '';
    this.modalOptions.InputOptions = {
      latestPriceKey: this.latest_price['data'][0].last,
      totalPrice: Number(this.total_costPrice.toFixed(2)),
      value: this.stockQuantity,
      btnText: 'Buy',
      isDisabled: true,
      onChangeCB: (value)=>{
          this.stockQuantity = Number(value);
          this.stockQuantity = this.stockQuantity < 0 ? 0 : this.stockQuantity; 
          if(this.latest_price && this.latest_price['data'])
            this.total_costPrice = this.stockQuantity * this.latest_price['data'][0].last;
        return {
          totalPrice : this.total_costPrice.toFixed(2),
          value: this.stockQuantity,
          isDisabled : this.total_costPrice > this.currBalance ? true: false,
        }         
      },
      onBtnClickCB: ()=>{
        var presentIndex;
        if(this.isPortFolioPresent){
          this.portfolioStocks.map((stock,index) => {
            if(stock.name == this.stock_result.data.name){
              presentIndex = index;
            }
          })
          this.portfolioStocks[presentIndex].latest_price = this.latest_price;
          this.portfolioStocks[presentIndex].totalPrice = Number(this.portfolioStocks[presentIndex].totalPrice) + Number(this.total_costPrice.toFixed(2));
          this.portfolioStocks[presentIndex].quantity += this.stockQuantity;
          this.portfolioStocks[presentIndex].average_cost_per_share = this.portfolioStocks[presentIndex].totalPrice/this.portfolioStocks[presentIndex].quantity;
          this.portfolioStocks[presentIndex].marketValue = this.portfolioStocks[presentIndex].quantity *  this.latest_price['data'][0].last;
          this.portfolioStocks[presentIndex].change = this.portfolioStocks[presentIndex].latest_price['data'][0].last - this.portfolioStocks[presentIndex].average_cost_per_share;
          this.portfolioStocks[presentIndex].change_status = this.portfolioStocks[presentIndex].change > 0 ? true : false;
        }else{
          var newStockData = this.stock_result.data;
          newStockData.latest_price = this.latest_price;
          newStockData.totalPrice = Number(this.total_costPrice.toFixed(2));
          newStockData.quantity = this.stockQuantity;
          newStockData.marketValue = this.stockQuantity *  this.latest_price['data'][0].last;
          newStockData.average_cost_per_share = newStockData.totalPrice/newStockData.quantity;
          newStockData.change = newStockData.latest_price['data'][0].last - newStockData.average_cost_per_share;
          newStockData.change_status = newStockData.change > 0 ? true : false;
          this.portfolioStocks.push(newStockData);
        }
        this.isPortFolioPresent = true;
        var update_balance = this.currBalance - this.total_costPrice;
        localStorage.setItem('portFolio',JSON.stringify(this.portfolioStocks));
        localStorage.setItem('currentBal',update_balance+"");
        this.stockBoughtToast.status = true;
        this.stockBoughtToast.type = 'success';
        this.stockBoughtToast.msg =  this.ticker_val+" bought successfully!";
        setTimeout(()=>{
          this.stockBoughtToast.status = false;
          this.stockBoughtToast.msg = '';
          this.stockBoughtToast.type = '';
        },5000); 
      }
    }
    modal.open();
  }

  //Open News tab
  openNewsModal(modal,option){
      this.modalOptions.InputOptions = '';
      this.modalOptions.hideFooter = true;
      this.modalOptions.modalTitle = option.source.name;
      var publishedDate = new Date(option.publishedAt);
      var month = this.month[publishedDate.getMonth()];
      var date = publishedDate.getDate();
      var year = publishedDate.getFullYear();
      this.modalOptions.secondaryTitle = month + ' ' +date+', '+year; 
      var twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(option.title)  + '%20' + encodeURIComponent(option.url);
      var facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u='+ encodeURIComponent(option.url);
      var  newsTemplate =
       `<div>
          <div class="news-title">
            ${option.title}
          </div> 
          <div class="news-body">
            ${option.description}
          </div>
          <div>
            <span class="text-muted">For more details click <a href="${option.url}" target="_blank">here</a></span>
            <div></div>
          </div>
          <div class="social-media">   
            <div class="title">Share </div>   
            
            <div class="social-media-icons">
              <div class="twitter-share-button media-icon">
                <a class="twitter-share-button" target="_blank"
                  href="${twitterUrl}">
                  <i class="fa fa-twitter"></i>
                </a>
              </div>  
                  
              <div class="fb-share-button media-icon" data-href="${option.url}" data-layout="button" data-size="large">
                  <a target="_blank" href="${facebookUrl}" class="fb-xfbml-parse-ignore">
                  <i class="fa fa-facebook-official"></i></a>
              </div>
            </div>
            
          </div>
        </div>`
      this.modalOptions.modalContent = newsTemplate;
      modal.open();
  }

  //For the news tab

  getNewsDetails()
  {
    this.NewsdetailsService.getNewsDetails(this.ticker_val)
    .subscribe(news=>{
      var text = JSON.stringify(news);
      var data = JSON.parse(text);
      var arr = (data['data']).articles;
      
      for (let index = 0; index < arr.length; index++) {
        let element = arr[index];
        if(element.urlToImage && element.urlToImage!=null && element.urlToImage!='' && element.title && element.title!=null && element.title.length!=0 && element.title!='')
        {
          this.news_data.push(element);
        }
        if(this.news_data.length==20)
          break;
        
      }
    });
  }

  getHistorical()
  {
    this.CompanyhistoricChartService.getHistoricalData(this.ticker_val)
    .subscribe(historic=>{
      var text = JSON.stringify(historic);
      var data = JSON.parse(text);
      var local_arr = data['data'];
      if(local_arr && local_arr.length>0)
      {
        for(let i= 0 ;i<local_arr.length;i++)
        {

          var element = local_arr[i];
          this.ohlc[i] = new Array(5);
          
          var x1 = new Date(element.date);
          var utcDate =  Date.UTC(x1.getFullYear(),x1.getMonth(),x1.getDate());
          this.ohlc[i][0] = utcDate;
          this.ohlc[i][1] = element.open;
          this.ohlc[i][2] = element.high;
          this.ohlc[i][3] = element.low;
          this.ohlc[i][4] = element.close;

          this.volume[i] = new Array(2);
          this.volume[i][0] = utcDate;
          this.volume[i][1] = element.volume;

          this.update_data(this.ohlc,this.volume);
        }
      }        
    });
  }

  update_data(ohlc,volume) {
    this.cOptions = {
      series: [
        {
          type: 'candlestick',
          name: this.ticker_val,
          id: this.ticker_val,
          data: ohlc,
          zIndex:2,      
        },
        {
          type: 'column',
          data: volume,
          name: 'Volume',
          id: 'volume',
          yAxis: 1,
        },
        {
          type: 'vbp',
          linkedTo: this.ticker_val,
          params: {
              volumeSeriesID: 'volume'
          },
          dataLabels: {
              enabled: false
          },
          zoneLines: {
              enabled: false
          },
        },
        {
          type: 'sma',
          linkedTo: this.ticker_val,
          zIndex: 1,
          marker: {
              enabled: false
          }
        }
       
      ],
     rangeSelector: {
        selected :1 
     },
     tooltip: {
      split: true
     },

      yAxis: [{
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
       
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
    }],
      title :
      {
        text: this.ticker_val +" " + "Historical"
      },
      subtitle: {
        text:"<div style='text-align:center'> With SMA and Volume by Price technical indicators <div>",
        useHTML: true
    },
    };
  }

  getDailyLastChartData()
  {
    this.CompanydailyLastChartService.getDailyOrLastWorkingChart(this.ticker_val,this.startDate)
    .subscribe(daily=>{
      var text = JSON.stringify(daily);
      var data = JSON.parse(text);
      var local_arr = data['data'];
      if(local_arr && local_arr.length>0)
      {
        for(let i= 0 ;i<local_arr.length;i++)
        {
          var element = local_arr[i];
          this.ohlc_daily[i] = new Array(2);
          var x1 = new Date(element.date);
          var utcDate = x1.getTime();
          this.ohlc_daily[i][0] = utcDate;
          this.ohlc_daily[i][1] = element.close;
          this.update_daily_chart(this.ohlc_daily);
        } 
      }
    });
    
  }

  update_daily_chart(ohlc_daily)
  {
    this.chartOptions= {
      series: [
        {
          type: 'zigzag',
          data: ohlc_daily,
          name: this.ticker_val,
          tooltip: {
            valueDecimals: 2
          },
        },
      ],
      xAxis: {
        maxRange : 3600*1000*7*1
      },
      time : {
        timezoneOffset : new Date(Date.now()).getTimezoneOffset()
      },
      rangeSelector: 
      {
        enabled : false
      },
      title :
      {
        text: this.ticker_val
      },
      plotOptions:
      {
        series :{
          marker: {
            enabled: false
          },
            color : this.change_status && this.change!=0 ? (this.change_status? "green":"red"):(this.change==0? "black": this.change_status? "green":"red")
          
        }
      },
    };
  }

}



