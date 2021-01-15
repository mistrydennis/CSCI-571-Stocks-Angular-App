import { Component, OnInit, ViewChild, ElementRef, Input, ViewEncapsulation} from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-component.component.html',
  styleUrls: ['./modal-component.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponentComponent implements OnInit {
  @ViewChild('mymodal', { static: true }) defaultModal: ElementRef;
  @Input() options: any;
  qty = 1;
  closeResult: string;
  constructor(private modalService: NgbModal,public sanitise : DomSanitizer) {
    
  }

  ngOnInit(): void {}
    
  open(content) {
    content = content || this.defaultModal;
    this.options.modalContent = this.sanitise.bypassSecurityTrustHtml(this.options.modalContent);
    if(this.options && this.options.InputOptions){
      this.options.InputOptions.value = 0;
      this.options.InputOptions.totalPrice = 0.00;
    }
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  handleChange(e){
    var returnValues = this.options.InputOptions.onChangeCB && this.options.InputOptions.onChangeCB(e.target.value); 
    this.options.InputOptions.value = returnValues.value;
    this.options.InputOptions.totalPrice = returnValues.totalPrice;
    this.options.InputOptions.isDisabled = returnValues.isDisabled? true : (this.options.InputOptions.value <= 0 || (this.options.InputOptions.value%1)!=0? true : false);
  }

  handleBtnClick(modal){
    this.options.InputOptions.onBtnClickCB && this.options.InputOptions.onBtnClickCB();
    modal.close('Save click');
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}
