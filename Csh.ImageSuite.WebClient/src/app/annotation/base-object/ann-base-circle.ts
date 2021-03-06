﻿import { Point, MouseEventType } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';

export class AnnBaseCircle extends AnnBaseObject {

    private fill: boolean;

    constructor(parentObj: AnnObject, center: Point, radius: number, imageViewer: IImageViewer, fill: boolean = false) {

        super(parentObj, imageViewer);

        this.fill = fill;
        this.jcObj = jCanvaScript.circle(center.x, center.y, radius, this.selectedColor, fill).layer(this.layerId);
        super.setJcObj();
        this.jcObj.mouseStyle = "crosshair";
        
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}