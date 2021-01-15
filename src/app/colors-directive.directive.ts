import { Directive, Renderer2, ElementRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appColorsDirective]'
})
export class ColorsDirectiveDirective implements OnInit {

  @Input() colors: number;
  constructor(private renderer: Renderer2, private el: ElementRef) {}
  ngOnInit() {
    const current = this._getStyles(this.colors);
    this.renderer.setStyle(
      this.el.nativeElement,
      'color',
      current
    );
  }
  _getStyles(key: number) {
    let color = '';
    if (key < 60) {
      color = 'green';
    }
    
    else  {
      color = 'red';
    }
    return  color;
  }

}
