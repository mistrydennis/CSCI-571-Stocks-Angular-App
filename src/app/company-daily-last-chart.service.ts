import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompanyDailyLastChartService {

  constructor(private http: HttpClient) { }

  getDailyOrLastWorkingChart(keyword,startDate)
  {
    console.log(startDate);
    var eventUrl="http://localhost:8080/company_daily/"+keyword+"/"+startDate;
    console.log(eventUrl);
    return this.http.get(eventUrl);
  }
}
