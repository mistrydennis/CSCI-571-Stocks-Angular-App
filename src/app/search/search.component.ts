import { Component, OnInit } from '@angular/core';
import {AutoCompleteService} from '../auto-complete.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';




@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  private results;
  private keyword;
  options;
  auto_flag = false;
  private elementpairs;
  private count = 0;
  loading = false;
  autoCompleteWidth = 250;
  inputWidth : any;
  searchField: FormControl = new FormControl();
  constructor(private AutocompleteService: AutoCompleteService,
    private router: Router) {
      
     }

  ngOnInit() {
    this.results = this.searchField.valueChanges.pipe(
      debounceTime(400)).subscribe(v=>{
        this.options = [];
        this.elementpairs = {};
        this.auto_flag = false;

        this.AutocompleteService.getAutocomplete(v)
        .subscribe(key=>{
          var text=JSON.stringify(key);
          var json = JSON.parse(text);
          var data = (json['data']);
          if( data && data.length > 0)
          {
            data.forEach(element => {
              this.elementpairs.ticker = element.ticker;
              this.elementpairs.name = element.name;
              console.log(this.elementpairs);
              if(this.elementpairs.name && this.options.length<=11)
                this.options.push(this.elementpairs);
              this.elementpairs={}
              this.auto_flag=true;
            
            });
          }
          
      });
      });
    
    
  }
  divClick(ticker:string) {
    this.router.navigate(['details',ticker]);
  }
  
}
