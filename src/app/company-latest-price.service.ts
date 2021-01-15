import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CompanyLatestPriceService {

  constructor(private http: HttpClient) { }
  getLatestPrice(keyword)
  {
    var eventUrl="http://localhost:8080/company_latest_price/"+keyword;
    return this.http.get(eventUrl);
  }
}

