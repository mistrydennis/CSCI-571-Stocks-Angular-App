import { Component, OnInit } from '@angular/core';
import {CompanyLatestPriceService} from '../company-latest-price.service';


@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  portfolioStocks;
  diff;
  stockQuantity;
  modalOptions={
    modalTitle: '',
    secondaryTitle:'',
    modalContent: '',
    hideFooter: false,
    InputOptions: {},
  };
  currentBalance;
  profilePresent = false
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  showLoader=false;
  colorBlack;
  constructor(private CompanylatestPriceService: CompanyLatestPriceService) { }

  ngOnInit(): void {
    this.portfolioStocks = localStorage.getItem('portFolio');
    this.currentBalance = localStorage.getItem('currentBal');
    this.currentBalance = this.currentBalance != null ? Number(this.currentBalance):10000000;
    this.portfolioStocks = this.portfolioStocks ? JSON.parse(this.portfolioStocks):[];
    this.profilePresent = this.portfolioStocks.length > 0 ? true:false;
    this.portfolioStocks.map(stock =>{
      this.getCompanyLatestPrice(stock.ticker,stock);    
    })
    // if(this.isMobile){
      this.showLoader = true;
      setTimeout(()=>{
        this.showLoader = false;
      },1000);
    // }
    this.portfolioStocks = this.portfolioStocks.sort(function(a,b){
      if(a.ticker < b.ticker){return -1};
      if(a.ticker > b.ticker){return 1};
      return 0;
    })
  }

  getCompanyLatestPrice(ticker,stockObj) {
    this.CompanylatestPriceService.getLatestPrice(ticker)
    .subscribe(stock=>{
      var text = JSON.stringify(stock);
      var data = JSON.parse(text);
      var latest_price = data;
      if(latest_price && latest_price['data']!=[])
      {
        var arr = latest_price['data'];
        if(arr && arr.length>0)
        {
          let date = new Date();
          let ticker_date = new Date(arr[0].timestamp);
          this.diff = Math.floor((date.getTime()-ticker_date.getTime())/1000);
          stockObj.latest_price = latest_price;
          stockObj.currentPrice = Number(latest_price['data'][0].last.toFixed(3));
          stockObj.average_cost_per_share = stockObj.totalPrice/stockObj.quantity;
          stockObj.change = stockObj.currentPrice - stockObj.average_cost_per_share;

          stockObj.marketValue = stockObj.quantity * stockObj.currentPrice;
          stockObj.colorBlack = false;
          if(stockObj.change>0)
            stockObj.change_status = true;
          else if(stockObj.change==0)
          {
            stockObj.colorBlack = true;
          }
          else
            stockObj.change_status=false;
          }
      }
    }); 
  }

  buyStock(modal,index){
    var currentStock = this.portfolioStocks[index];
    var total_costPrice;
    var presentIndex = index;
    this.stockQuantity = currentStock.quantity;
    var latest_price = currentStock.latest_price;
    this.modalOptions.modalTitle = currentStock.name;
    this.modalOptions.secondaryTitle = '';          
    this.modalOptions.modalContent = '';
    this.modalOptions.InputOptions = {
      latestPriceKey: currentStock.currentPrice,
      totalPrice: 0,
      value: 0,
      btnText: 'Buy',
      isDisabled: true,
      onChangeCB: (value)=>{
          this.stockQuantity = Number(value);
          this.stockQuantity = this.stockQuantity < 0 ? 0 : this.stockQuantity; 
          if(latest_price && latest_price['data'])
            total_costPrice = this.stockQuantity * latest_price['data'][0].last;        
        return {
          totalPrice : Number(total_costPrice.toFixed(2)),
          value: this.stockQuantity,
          isDisabled : total_costPrice > this.currentBalance? true: false,
        }         
      },
      onBtnClickCB: ()=>{
        currentStock.totalPrice = Number(currentStock.totalPrice) + Number(total_costPrice.toFixed(2));
        currentStock.quantity += this.stockQuantity;
        currentStock.average_cost_per_share = currentStock.totalPrice/currentStock.quantity;
        currentStock.marketValue = currentStock.quantity *  currentStock.latest_price['data'][0].last;
        currentStock.change = currentStock.latest_price['data'][0].last - currentStock.average_cost_per_share;
        currentStock.change_status = currentStock.change > 0 ? true : false;
        var update_balance = this.currentBalance - currentStock.totalPrice;
        this.portfolioStocks[presentIndex] = currentStock;
        localStorage.setItem('portFolio',JSON.stringify(this.portfolioStocks));
        localStorage.setItem('currentBal',update_balance+"");
      }
    }
    modal.open();
  }

  sellStock(modal,index){
    var currentStock = this.portfolioStocks[index];
    var total_costPrice;
    var presentIndex = index;
    this.stockQuantity = currentStock.quantity;
    var latest_price = currentStock.latest_price;
    this.modalOptions.modalTitle = currentStock.name;
    this.modalOptions.secondaryTitle = '';          
    this.modalOptions.modalContent = '';
    this.modalOptions.InputOptions = {
      latestPriceKey: currentStock.currentPrice,
      totalPrice: 0,
      value: 0,
      btnText: 'Sell',
      isDisabled: true,
      onChangeCB: (value)=>{
          this.stockQuantity = Number(value);
          this.stockQuantity = this.stockQuantity < 0 ? 0 : this.stockQuantity; 
          if(latest_price && latest_price['data'])
            total_costPrice = this.stockQuantity * latest_price['data'][0].last;        
        return {
          totalPrice : Number(total_costPrice.toFixed(2)),
          value: this.stockQuantity,
          isDisabled : (this.stockQuantity == 0 || this.stockQuantity > currentStock.quantity)? true: false,
        }         
      },
      onBtnClickCB: ()=>{
        currentStock.totalPrice = Number(currentStock.totalPrice) - Number(total_costPrice.toFixed(2));
        currentStock.quantity -= this.stockQuantity;
        currentStock.average_cost_per_share = (currentStock.totalPrice/currentStock.quantity);
        currentStock.marketValue = currentStock.quantity *  currentStock.latest_price['data'][0].last;
        currentStock.change = (currentStock.latest_price['data'][0].last - currentStock.average_cost_per_share);
        currentStock.change_status = currentStock.change > 0 ? true : false;
        var update_balance = this.currentBalance + currentStock.totalPrice;
        this.portfolioStocks[presentIndex] = currentStock;
        if(currentStock.quantity == 0){
          this.portfolioStocks.splice(presentIndex,1);
        }
        this.profilePresent = this.portfolioStocks.length > 0 ? true : false;
        localStorage.setItem('portFolio',JSON.stringify(this.portfolioStocks));
        localStorage.setItem('currentBal',update_balance+"");
      }
    }
    modal.open();
  }
}
