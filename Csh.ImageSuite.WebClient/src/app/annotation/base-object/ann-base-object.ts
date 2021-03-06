﻿import { Point, MouseEventType, Rectangle, AnnotationDefinitionData } from '../../models/annotation';
import { AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnSerialize } from "../ann-serialize";

export abstract class AnnBaseObject extends AnnObject {

    jcObj: any;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);
        if (parentObj) {
            parentObj.onChildCreated(this);
        }
    }

    setJcObj() {
        if (this.jcObj) {
            this.jcObj._lineWidth = this.lineWidth;
            this.jcObj.mouseStyle = "move";
            this.jcObj.parentObj = this;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onSelect(selected: boolean, focused: boolean) {

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.jcObj;
        }

        this.jcObj.color(color);
    }

    onDrawEnded() {
        if (this.mouseResponsible) {
            this.setChildDraggable(this, this.jcObj, true);
            this.setChildMouseEvent(this, this.jcObj);
        }
    }


    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {
        if (mouseEventType === MouseEventType.MouseDown) {
            this.onChildSelected(mouseObj);
        }
    }

    onScale() {
        this.jcObj._lineWidth = this.parentObj.getLineWidth();
    }

    onFlip(vertical: boolean) {
        if (vertical) {
            this.jcObj._y = this.image.height() - this.jcObj._y;
        } else {
            this.jcObj._x = this.image.width() - this.jcObj._x;
        }
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcObj._x += deltaX;
        this.jcObj._y += deltaY;
    }

    onMove(point: Point) {
        this.jcObj._x = point.x;
        this.jcObj._y = point.y;
    }

    onRotate(angle: number) {
        // For annotation drawn on the ann layer, nothing need to do for rotating,
        // because the ann layer and the image layer are binded.
    }

    onDeleteChildren() {
        this.deleteObject(this.jcObj);
    }

    getPosition(): Point {
        return { x: this.jcObj._x, y: this.jcObj._y }
    }

    getRadius(): number {
        return this.jcObj._radius;
    }

    setRadius(radius: number) {
        this.jcObj._radius = radius;
    }

    getWidth(): number {
        return this.jcObj._width;
    }

    setWidth(width: number) {
        this.jcObj._width = width;
    }

    getHeight(): number {
        return this.jcObj._height;
    }

    setHeight(height: number) {
        this.jcObj._height = height;
    }

    setColor(color: string) {
        this.jcObj.color(color);
    }

    setVisible(visible: boolean) {
        this.jcObj.visible(visible);
    }

    setTransparent(transparent: boolean) {
        this.defaultColor = transparent ? "rgba(0,0,0,0)" : "#FFF";
    }

    onLevelUp(level: any = 1) {
        if (this.jcObj) {
            this.jcObj.up(level);
        }
    }

    onLevelDown(level: any = 1) {
        if (this.jcObj) {
            this.jcObj.down(level);
        }
    }

    getSurroundPointList(): Point[] {
        return [];
    }

    getRect(): Rectangle {
        return this.jcObj.getRect("poor");
    }

    onChildCreated(annChildObj: AnnObject) {
        alert("Internal error : AnnBaseObject.onChildCreated() should never be called.");
    }

    onDeleteChild(annChildObj: AnnObject) {
        alert("Internal error : AnnBaseObject.onDeleteChild() should never be called.");
    }

    onLoad(annSerialize: AnnSerialize): any {
        alert("Internal error : AnnBaseObject.onLoad() should never be called.");
        return undefined;
    }

    onSave(annSerialize: AnnSerialize) {
        alert("Internal error : AnnBaseObject.onSave() should never be called.");
    }

    onDragStarted(pos: Point) {

    }

    onDragEnded(pos: Point) {

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    saveBasicInfo(annSerialize: AnnSerialize, annotationDefinitionData: AnnotationDefinitionData) {
        annSerialize.writeString(annotationDefinitionData.imageSuiteAnnName);
        annSerialize.writeInteger(annotationDefinitionData.imageSuiteAnnType, 4);     // AnnType
        annSerialize.writeInteger(1, 4);     // created
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);     // selected
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Protected functions
}