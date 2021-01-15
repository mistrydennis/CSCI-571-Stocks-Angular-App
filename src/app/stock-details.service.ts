import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StockDetailsService {

  constructor(private http: HttpClient) { }

  getStockDetails(keyword)
  {
    var eventUrl="http://localhost:8080/company/"+keyword;
    return this.http.get(eventUrl);
  }
}
