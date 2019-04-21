import { Point, Rectangle, PositionInRectangle } from '../models/annotation';
import { Image } from "../models/pssi";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { ViewContext, ViewContextEnum } from "../services/view-context.service"

export enum MouseEventType {
    Click= 1,
    MouseDown= 2,
    MouseMove= 3,
    MouseUp= 4,
    MouseOver= 5,
    MouseOut= 6,
    RightClick= 7,
    DblClick= 8,
    MouseWheel= 9
}

export enum StepEnum {
    Step1= 1,
    Step2= 2,
    Step3= 3,
    Step4= 4,
    Step5= 5
}

export class Colors {
    static white = "#ffffff";
    static red = "#ff0000";
    static yellow = "#ffff00";
    static green = "#00FF00";
    static blue = "#0000FF";
};

export abstract class AnnObject {
    protected created: boolean;
    protected selected: boolean;
    protected dragging: boolean;
    protected mouseResponsible: boolean;

    protected selectedColor = "#F90";
    protected defaultColor = "#FFF";

    protected image: Image;
    protected layerId: string; 
    protected labelLayerId: string;
    protected canvas: string;

    protected minLineWidth = 0.3;
    protected minPointRadius = 2;
    protected minArrowLineLength = 10;
    protected minFontSize = 14;

    protected lineWidth: number;
    protected pointRadius: number;

    protected oldCursor: any;

    protected imageViewer: IImageViewer;

    protected parentObj: AnnObject;
    protected focusedObj: AnnObject;

    static minDelta = 0.0000000001;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {

        this.parentObj = parentObj;
        this.imageViewer = imageViewer;
        this.image = imageViewer.getImage();
        this.layerId = imageViewer.getAnnotationLayerId();
        this.labelLayerId = imageViewer.getAnnLabelLayerId();

        this.canvas = imageViewer.getCanvas();

        this.created = false;
        this.selected = false;
        this.dragging = false;
        this.mouseResponsible = true;

        this.lineWidth = this.getLineWidth();
        this.pointRadius = this.getPointRadius();
    }

    isCreated() {
        return this.created;
    }

    isSelected(): boolean {
        return this.selected;
    }

    setMouseResponsible(mouseResponsible: boolean) {
        this.mouseResponsible = mouseResponsible;
    }

    onChildSelected(selectedObj: AnnObject) {

        this.focusedObj = selectedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the select status
            this.parentObj.onChildSelected(this);
        } else {
            this.onSelect(true, true);
        }
    }

    onChildDragged(draggedObj: any, deltaX: number, deltaY: number) {

        this.focusedObj = draggedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the drag status
            this.parentObj.onChildDragged(this, deltaX, deltaY);
        } else {
            this.onDrag(deltaX, deltaY);
        }
    }

    deleteObject(obj: any) {
        if (AnnObject.isJcanvasObject(obj)) {
            obj.del();
            obj = undefined;
        } else if (obj instanceof AnnObject) {
            let annObj = obj as AnnObject;
            annObj.onDeleteChildren();
            annObj = undefined;
        }
    }

    //onDeleteChildren() {
    //    const properties = Object.getOwnPropertyNames(this);
    //    properties.forEach(prop => {
    //        let obj = this[prop];
    //        if (obj instanceof AnnObject && obj !== this.parentObj) {
    //            const annObj = obj as AnnObject;
    //            annObj.onDeleteChildren();
    //            this[prop] = undefined;
    //        } else if (obj instanceof Array) {
    //            obj.forEach(item => {

    //                if (item instanceof AnnObject && item !== this.parentObj) {
    //                    const annObj = item as AnnObject;
    //                    annObj.onDeleteChildren();
    //                }

    //                obj = [];
    //            });
    //        }else if ( AnnObject.isJcanvasObject(obj) ) {
    //            obj.del();
    //            this[prop] = undefined;
    //        }
    //    });
    //}

    onKeyDown(keyEvent: any): void {

        if (!this.focusedObj) return;

        let focusedBottomObj = this.focusedObj;
        while (focusedBottomObj.focusedObj) {
            focusedBottomObj = focusedBottomObj.focusedObj;
        }

        // Move 5 screen point by default, or move 1 screen point if ctrl key is pressed
        const step = keyEvent.ctrlKey ? 1 : 5;

        const posImageOld = this.focusedObj.getPosition();
        let posScreen = AnnObject.imageToScreen(posImageOld, focusedBottomObj.getTransformMatrix());

        if (keyEvent.code === "ArrowUp") {
            posScreen.y -= step;
        } else if (keyEvent.code === "ArrowDown") {
            posScreen.y += step;
        } else if (keyEvent.code === "ArrowLeft") {
            posScreen.x -= step;
        } else if (keyEvent.code === "ArrowRight") {
            posScreen.x += step;
        }

        const posImageNew = AnnObject.screenToImage(posScreen, focusedBottomObj.getTransformMatrix());

        focusedBottomObj.parentObj.onChildDragged(focusedBottomObj, posImageNew.x - posImageOld.x, posImageNew.y - posImageOld.y);
    }

    static screenToImage(point: Point, transform: any): Point {
        const x = point.x;
        const y = point.y;
        const imgPt = [0, 0, 1];

        const a = x;
        const b = y;
        const n1 = transform[0][0];
        const n2 = transform[0][1];
        const n3 = transform[0][2];
        const n4 = transform[1][0];
        const n5 = transform[1][1];
        const n6 = transform[1][2];

        let t = a * n4 - n3 * n4 - b * n1 + n1 * n6;
        const t2 = n2 * n4 - n1 * n5;

        imgPt[1] = t / t2;

        t = b * n2 - n2 * n6 - a * n5 + n3 * n5;
        imgPt[0] = t / t2;

        return {
            x: imgPt[0],
            y: imgPt[1]
        };
    }

    static imageToScreen(point: Point, transform: any): Point {
        const x = point.x;
        const y = point.y;
        const imgPt = [x, y, 1];
        const screenPt = [0, 0, 1];

        screenPt[0] = transform[0][0] * imgPt[0] + transform[0][1] * imgPt[1] + transform[0][2] * imgPt[2];
        screenPt[1] = transform[1][0] * imgPt[0] + transform[1][1] * imgPt[1] + transform[1][2] * imgPt[2];

        return {
            x: screenPt[0],
            y: screenPt[1]
        };
    }

    static imageToImage(sourcePoint: Point, sourceTransform: any, destTransform: any): Point {
        const screenPoint = AnnObject.imageToScreen(sourcePoint, sourceTransform);
        return AnnObject.screenToImage(screenPoint, destTransform);
    }

    static imageListToImageList(pointList: Point[], sourceTransform: any, destTransform: any): Point[] {
        const retList = [];

        for (let i = 0; i < pointList.length; i++) {
            retList.push(AnnObject.imageToImage(pointList[i], sourceTransform, destTransform));
        }

        return retList;
    }

    static annLabelLayerToAnnLayer(point: Point, imageViewer: IImageViewer): Point {
        return AnnObject.imageToImage(point, imageViewer.getAnnLabelLayer().transform(), imageViewer.getImageLayer().transform());
    }

    static annLayerToAnnLabelLayer(point: Point, imageViewer: IImageViewer): Point {
        return AnnObject.imageToImage(point, imageViewer.getImageLayer().transform(), imageViewer.getAnnLabelLayer().transform());
    }

    static isJcanvasObject(obj:any):boolean {
        if (!obj) {
            return false;
        }

        if (obj.optns) {
            return true;
        }

        return false;
    }

    static countDistance(point1: Point, point2: Point): number {
        let value = Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2);
        value = Math.sqrt(value);

        return value;
    }

    
    static getSineTheta(pt1: Point, pt2: Point) {
        const distance = AnnObject.countDistance(pt1, pt2);
        if (Math.abs(distance) < AnnObject.minDelta) {
            return 0.0;
        } else {
            const sineTheta = -(Math.abs(pt1.y - pt2.y)) / distance;
            return (pt1.y > pt2.y)? sineTheta : -sineTheta;
        }
    }

    static getCosineTheta(pt1: Point, pt2: Point) {
        const distance = AnnObject.countDistance(pt1, pt2);
        if (Math.abs(distance) < AnnObject.minDelta) {
            return 0.0;
        } else {
            const cosineTheta = (Math.abs(pt1.x - pt2.x)) / distance;
            return (pt1.x < pt2.x)? cosineTheta : -cosineTheta;
        }
    }

    static multiplyPointM(x, y, m) {
        return {
            x: (x * m[0][0] + y * m[0][1] + m[0][2]),
            y: (x * m[1][0] + y * m[1][1] + m[1][2])
        }
    }

    static equalPoint(p1: Point, p2: Point): boolean {
        return Math.abs(p1.x - p2.x) < 0.0001 && Math.abs(p1.y - p2.y) < 0.0001;
    }

    static pointListFromRect(rect: Rectangle): Point[] {
        const retPointList = [];

        retPointList.push({ x: rect.x, y: rect.y });
        retPointList.push({ x: rect.x + rect.width, y: rect.y });
        retPointList.push({ x: rect.x + rect.width, y: rect.y + rect.height });
        retPointList.push({ x: rect.x, y: rect.y + rect.height });

        return retPointList;
    }

    static pointListFrom(point: Point, posInRect: PositionInRectangle, width: number, height: number): Point[] {
        const retPointList = [];

        if (posInRect === PositionInRectangle.TopLeft) {
            retPointList.push({ x: point.x, y: point.y });
            retPointList.push({ x: point.x + width, y: point.y });
            retPointList.push({ x: point.x + width, y: point.y + height });
            retPointList.push({ x: point.x, y: point.y + height });
        }else if (posInRect === PositionInRectangle.TopRight) {
            retPointList.push({ x: point.x - width, y: point.y });
            retPointList.push({ x: point.x, y: point.y });
            retPointList.push({ x: point.x, y: point.y + height });
            retPointList.push({ x: point.x - width, y: point.y + height });
        } else if (posInRect === PositionInRectangle.BottomRight) {
            retPointList.push({ x: point.x - width, y: point.y - height});
            retPointList.push({ x: point.x, y: point.y - height});
            retPointList.push({ x: point.x, y: point.y });
            retPointList.push({ x: point.x - width, y: point.y });
        } else if (posInRect === PositionInRectangle.BottomLeft) {
            retPointList.push({ x: point.x, y: point.y - height});
            retPointList.push({ x: point.x + width, y: point.y - height});
            retPointList.push({ x: point.x + width, y: point.y });
            retPointList.push({ x: point.x, y: point.y });
        }
        

        return retPointList;
    }

    getLineWidth(): number {
        let lineWidth = 1 / this.image.getScaleValue();
        if (lineWidth < this.minLineWidth) {
            lineWidth = this.minLineWidth;
        }

        return lineWidth;
    }

    getPointRadius(): number {
        let pointRadius = 3 / this.image.getScaleValue();
        if (pointRadius < this.minPointRadius) {
            pointRadius = this.minPointRadius;
        }

        return pointRadius;
    }

    getArrowLineLength(): number {
        let lineLength = 10 / this.image.getScaleValue();
        if (lineLength < this.minArrowLineLength) {
            lineLength = this.minArrowLineLength;
        }

        return lineLength;
    }

     getFontSize(): number {
        let fontSize = 14 / this.image.getScaleValue();
        if (fontSize < this.minFontSize) {
            fontSize = this.minFontSize;
        }

        return fontSize;
    }

    protected getTransformMatrix(): any {
        return this.image.transformMatrix;
    }


    protected setChildDraggable(parentObj: any, child: any, draggable: boolean) {

        child.draggable({
            disabled: !draggable,
            start: arg => {
                child._lastPos = {};

            },
            stop: arg => {
                child._lastPos = {};
                if (this.imageViewer.getContext().action === ViewContextEnum.SelectAnn) {
                    parentObj.dragging = false;
                    parentObj.canvas.style.cursor = parentObj.oldCursor;
                }
            },
            drag: arg => {

                if (this.imageViewer.getContext().action === ViewContextEnum.SelectAnn) {
                    const point = AnnObject.screenToImage({ x: arg.x, y: arg.y }, parentObj.getTransformMatrix());

                    parentObj.dragging = true;

                    if (typeof (child._lastPos.x) != "undefined") {
                        const deltaX = point.x - child._lastPos.x;
                        const deltaY = point.y - child._lastPos.y;

                        //child._x += deltaX;
                        //child._y += deltaY;

                        //if (onDrag) {
                        //    onDrag.call(parentObj, child, deltaX, deltaY);
                        //}

                        if (parentObj.onChildDragged) {
                            parentObj.onChildDragged(child, deltaX, deltaY);
                        }
                    }

                    child._lastPos = point;
                }
                return true;
            }
        });
    }

    protected setChildMouseEvent(parentObj: any, child: any) {

        child._onmouseover = arg => {
            if (parentObj.needResponseToChildMouseEvent()) {
                parentObj.onMouseEvent(MouseEventType.MouseOver, arg);
                parentObj.oldCursor = parentObj.canvas.style.cursor;
                parentObj.canvas.style.cursor = child.mouseStyle;
            }

            return false;
        };

        child._onmouseout = arg => {
            if (parentObj.needResponseToChildMouseEvent()) {
                parentObj.onMouseEvent(MouseEventType.MouseOut, arg);
                parentObj.canvas.style.cursor = parentObj.oldCursor;
            }

            return false;
        };

        child._onmousedown = arg => {
            if (parentObj.needResponseToChildMouseEvent()) {
                parentObj.onMouseEvent(MouseEventType.MouseDown, arg, child);
            }

            arg.event.cancelBubble = true;
            arg.event.stopPropagation();
            arg.event.stopImmediatePropagation();
            arg.event.preventDefault();

            // return false to make sure no other jc object's mouse event will be called
            return false;
        };
    }

    protected needResponseToChildMouseEvent(): boolean {
        return !this.dragging && this.imageViewer.getContext().action === ViewContextEnum.SelectAnn;
    }

    protected getPosition(): Point {
        return { x: 0, y: 0 }
    }

    onSelect(selected: boolean, focused: boolean) {
    }

    onDrag(deltaX: number, deltaY: number) {
    }


    onDrawEnded() {
    }

    onTranslate(deltaX: number, deltaY: number) {
    }

    onDeleteChildren() {
    }

    getSurroundPointList(): Point[] {

        return [];
    }

    onRotate(angle: number) {

    }

    onLevelUp() {

    }

    onLevelDown() {

    }
    
    onScale() {

    }

    onFlip(vertical: boolean) {
    }

    onMove(point: Point) {
    }
}

/*
export abstract class AnnObject {

    protected viewer: any; //the parentObj compoent which hold this object
    protected created: boolean;
    protected isInEdit: boolean; //is current object selected and in edit status
    protected parentObj: AnnObject;

    protected defaultpointRadius = 5;
    protected minpointRadius = 2;
    protected minLineWidth = 0.3;

    protected selectedLevel = 100;
    protected defaultLevel = 1;
    protected selectedColor = Colors.red;
    protected defaultColor = Colors.white;

    constructor(protected viewContext: ViewContextService) {
    }

    



    static countAngle(point1: any, point2: any): number {
        const dPixSpacingX = 1.0;
        const dPixSpacingY = 1.0;

        const dx = (point2.x - point1.x) * dPixSpacingX;
        const dy = (point1.y - point2.y) * dPixSpacingY;

        return (180.0 / Math.PI) * Math.atan2(dy, dx);
    }

    abstract startCreate(viewer: any, callback: any, param: any): void;

    hasToolTip(): boolean {
        return false;
    }

    del() {
    }

    select(select: boolean) {
    }

    //set child jcObject's common mouse event hander, etc.
    protected setChildMouseEvent(jcObj) {
        var dv = this.viewer;
        var annObj = this;
        var curContext = this.viewContext.curContext;

        jcObj.mouseover(function(arg) {
            if (curContext.action == ViewContextEnum.Select) {
                if (!this.mouseStyle) {
                    this.mouseStyle = "pointer";
                }
                dv.canvas.style.cursor = this.mouseStyle;
            }
        });

        jcObj.mouseout(function() {
            if (curContext.action == ViewContextEnum.Select)
                dv.canvas.style.cursor = "auto";
        });

        jcObj.mousedown(function(arg) {
            //console.log('jcObj mousedown');
            if (curContext.action == ViewContextEnum.Select) {
                const curObj = annObj.parentObj || annObj;
                if (dv.curSelectObj !== curObj) {
                    dv.selectObject(curObj);
                }
                arg.event.cancelBubble = true;
            }
        });

        jcObj.mouseup(function(arg) {
            //console.log('jcObj mouseup');
        });

        jcObj.click(function(arg) {
            //console.log('jcObj onClick');
        });
    }

    protected setChildDraggable(jcObj, draggable, onDrag) {
        if (!jcObj) {
            return;
        }

        var dv = this.viewer;
        const canvas = dv.canvas;
        var annObj = this;

        jcObj.draggable({
            disabled: !draggable,
            start: function(arg) {
                this._lastPos = {};
                if (this.mouseStyle) {
                    dv.canvas.style.cursor = this.mouseStyle;
                }
            },
            stop: function(arg) {
                this._lastPos = {};
                if (this.mouseStyle) {
                    dv.canvas.style.cursor = "auto";
                }
            },
            drag: function(arg) {
                //ptImg is mouse position, not the object's start position
                //don't translate any annObject, always keep annObject's transform as clear.
                const transTmp = dv.imgLayer.transform();
                const ptImg = AnnObject.screenToImage(arg, transTmp);

                if (typeof (this._lastPos.x) != "undefined") {
                    const deltaX = ptImg.x - this._lastPos.x;
                    const deltaY = ptImg.y - this._lastPos.y;

                    this._x += deltaX;
                    this._y += deltaY;

                    if (onDrag) {
                        onDrag.call(annObj, deltaX, deltaY);
                    }
                }

                this._lastPos = {
                    x: ptImg.x,
                    y: ptImg.y
                };
                return true;
            }
        });
    }

    protected isChildJCObject(obj) {
        if (!obj) {
            return false;
        }

        if (obj.optns) {
            return true;
        }

        return false;
    }

    protected translateChild(child, deltaX, deltaY) {
        if (child) {
            child._x += deltaX;
            child._y += deltaY;
        }
    }

    protected deleteChild() {
        var thisObj = this;
        const propertys = Object.getOwnPropertyNames(this);
        propertys.forEach(function(prop) {
            const obj = thisObj[prop];
            if ((obj instanceof AnnObject && obj != thisObj.parentObj) || thisObj.isChildJCObject(obj)) {
                obj.del();
                thisObj[prop] = undefined;
            }
        });
    }

    protected selectChild(select: boolean) {
        var thisObj = this;
        const propertys = Object.getOwnPropertyNames(this);
        propertys.forEach(function(prop) {
            const obj = thisObj[prop];
            if (obj instanceof AnnObject && obj != thisObj.parentObj) {
                obj.select(select);
            } else if (thisObj.isChildJCObject(obj)) {
                obj.color(select ? thisObj.selectedColor : thisObj.defaultColor);
                obj.level(select ? thisObj.selectedLevel : thisObj.defaultLevel);
            }
        });
    }
}
*/