﻿import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';
import { AnnSerialize } from "../ann-serialize";

export class AnnBaseLine extends AnnBaseObject {

    constructor(parentObj: AnnObject, startPoint: Point, endPoint: Point, imageViewer: IImageViewer, annSerialize: AnnSerialize = undefined) {

        super(parentObj, imageViewer);

        if (annSerialize) {
            const config = annSerialize.loadBaseLine();
            startPoint = config.startPoint;
            endPoint = config.endPoint;
        } 

        this.jcObj = jCanvaScript.line([[startPoint.x, startPoint.y], [endPoint.x, endPoint.y]], this.selectedColor).layer(this.layerId);
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnLine");
        annSerialize.writeInteger(1, 4);
        annSerialize.writeInteger(0, 4);
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);

        annSerialize.writeIntegerPoint(this.getStartPosition());
        annSerialize.writeIntegerPoint(this.getEndPosition());
    }

    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcObj._y0 = this.image.height() - this.jcObj._y0;
            this.jcObj._y1 = this.image.height() - this.jcObj._y1;
        } else {
            this.jcObj._x0 = this.image.width() - this.jcObj._x0;
            this.jcObj._x1 = this.image.width() - this.jcObj._x1;
        }

    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcObj._x0 += deltaX;
        this.jcObj._y0 += deltaY;

        this.jcObj._x1 += deltaX;
        this.jcObj._y1 += deltaY;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    onMoveStartPoint(point: Point) {
        this.jcObj._x0 = point.x;
        this.jcObj._y0 = point.y;
    }

    onMoveEndPoint(point: Point) {
        this.jcObj._x1 = point.x;
        this.jcObj._y1 = point.y;
    }

    getStartPosition(): Point {
        return { x: this.jcObj._x0, y: this.jcObj._y0 }
    }

    getEndPosition(): Point {
        return { x: this.jcObj._x1, y: this.jcObj._y1 }
    }

    getLengthInPixel(): number {
        return AnnTool.countDistance(this.getStartPosition(), this.getEndPosition());
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}
