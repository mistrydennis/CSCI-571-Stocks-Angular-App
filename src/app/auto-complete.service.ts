import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AutoCompleteService {

  constructor(private http: HttpClient) { }
  getAutocomplete(keyword)
  {
    var eventUrl="http://localhost:8080/autoComplete/"+keyword;
    return this.http.get(eventUrl);
  }
}


