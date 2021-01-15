import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompanyHistoricChartService {

  constructor(private http: HttpClient) {
   }

   getHistoricalData(keyword)
  {
    var eventUrl="http://localhost:8080/company_historical/"+keyword;
    return this.http.get(eventUrl);
  }
}
