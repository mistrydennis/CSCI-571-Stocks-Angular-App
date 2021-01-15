import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class NewsDetailsService {

  constructor(private http: HttpClient) { }

  getNewsDetails(keyword)
  {
    var eventUrl="http://localhost:8080/news_data/"+keyword;
    return this.http.get(eventUrl);
  }
}
