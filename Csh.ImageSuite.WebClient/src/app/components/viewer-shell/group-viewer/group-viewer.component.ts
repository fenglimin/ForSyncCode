import { Component, OnInit, Input, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { ImageSelectorService } from '../../../services/image-selector.service';
import { HangingProtocalService } from '../../../services/hanging-protocal.service';
import { Subscription }   from 'rxjs';
import { ViewerShellData } from '../../../models/viewer-shell-data';
import { LayoutPosition, LayoutMatrix } from '../../../models/layout';
import { ImageHangingProtocal } from '../../../models/hanging-protocal';
import { ViewerGroupData } from '../../../models/viewer-group-data';

@Component({
  selector: 'app-group-viewer',
  templateUrl: './group-viewer.component.html',
  styleUrls: ['./group-viewer.component.css']
})
export class GroupViewerComponent implements OnInit, AfterViewInit {
  Arr = Array; //Array type captured in a variable

  _groupData: ViewerGroupData;
  @Input()
  set groupData(groupData: ViewerGroupData) {
    this._groupData = groupData;
    this.setImageLayout(this.groupData.imageHangingProtocal);
  }
  get groupData() {
    return this._groupData;
  }

  @ViewChildren(ImageViewerComponent) imageComponents: QueryList<ImageViewerComponent>;

  selected = false;
  
  subscriptionImageSelection: Subscription;
  subscriptionImageLayoutChange: Subscription;
  
  constructor(private imageSelectorService: ImageSelectorService, private hangingProtocalService: HangingProtocalService) {
    this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
      imageViewerId => {
        this.doSelectByImageViewerId(imageViewerId);
      });

    this.subscriptionImageLayoutChange = imageSelectorService.imageLayoutChanged$.subscribe(
      imageLayoutStyle => {
        this.onChangeImageLayout(imageLayoutStyle);
      });
  }

  ngOnInit() {
   }

  ngAfterViewInit() {
    this.imageComponents.forEach((imageComp,index) => imageComp.imageData = this.groupData.getImage(
      Math.trunc(index/this.groupData.imageMatrix.colCount), index % this.groupData.imageMatrix.colCount));
  }

  onSelected() {
  }

  doSelectById(id: string, selected: boolean): void {
    const o = document.getElementById(id);
    if (o !== undefined && o !== null) {
      o.style.border = selected ? '1px solid yellow' : '1px solid #555555';
    }
  }

  doSelectByImageViewerId(imageViewerId: string): void {
    const id = this.groupData.getId();
    this.selected = imageViewerId.startsWith(id);
    var divId = 'DivLayoutViewer' + id;

    this.doSelectById(divId, this.selected);
  }

  onChangeImageLayout(imageLayoutStyle: number): void {
    if (this.selected) {
      this.setImageLayout(imageLayoutStyle);
    }
  }

  setImageLayout(imageLayoutStyle: number): void {
    this.hangingProtocalService.applyImageHangingProtocal(this.groupData, imageLayoutStyle);
  }

  getId(): string {
    return 'DivLayoutViewer' + this.groupData.getId();
  }
}
