﻿import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";


export abstract class AnnExtendObject extends AnnObject {

    private annObjList: Array<AnnObject> = [];

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);
        if (parentObj) {
            parentObj.onChildCreated(this);
        }
    }

    onChildCreated(annChildObj: AnnObject) {
        this.addChildObj(annChildObj);
    }

    onDrawEnded() {
        this.annObjList.forEach(annObj => annObj.onDrawEnded());
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onScale() {
        this.annObjList.forEach(annObj => annObj.onScale());
    }

    onFlip(vertical: boolean) {
        this.annObjList.forEach(annObj => annObj.onFlip(vertical));
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annObjList.forEach(annObj => annObj.onTranslate(deltaX, deltaY));
    }

    onMove(point: Point) {
        this.annObjList.forEach(annObj => annObj.onMove(point));
    }

    onDeleteChildren() {
        this.annObjList.forEach(annObj => annObj.onDeleteChildren());
    }

    onLevelUp() {
        this.annObjList.forEach(annObj => annObj.onLevelUp());
    }

    onLevelDown() {
        this.annObjList.forEach(annObj => annObj.onLevelDown());
    }

    private addChildObj(annObj: AnnObject) {
        this.annObjList.push(annObj);
    }

}