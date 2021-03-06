﻿import { Point } from '../models/annotation';
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./extend-object/ann-extend-object";
import { AnnotationService } from "../services/annotation.service";

export class AnnSerialize {
    annData: Uint8Array;
    imageViewer: IImageViewer;
    annString = "";
    version = 1023;
    annotationService: AnnotationService;

    constructor(annData: Uint8Array, imageViewer: IImageViewer) {
        this.annData = annData;
        this.imageViewer = imageViewer;
        this.annotationService = imageViewer.getAnnotationService();
    }

    createAnn(): boolean {
        if (!this.annData) return false;

        if (this.annData[this.annData.length - 1] === 0X20) {
            // Remove the last 0X20
            this.readInteger(1);
        }

        this.version = this.readInteger(4);
        const annCount = this.readInteger(4);

        for (let i = 0; i < annCount; i++) {
            const annIsName = this.readString();
            const annDefData = this.annotationService.getAnnDefDataByIsName(annIsName);
            if (!annDefData) {
                return false;
            }

            const annObj = new annDefData.classType(undefined, this.imageViewer);
            annObj.onLoad(this);
        }

        return annCount > 0;
    }

    getAnnString(annList: AnnExtendObject[]): string {
        this.annData = new Uint8Array(0);
        this.annString = "";
        this.writeInteger(this.version, 4);
        this.writeInteger(annList.length, 4);
        annList.forEach(annObj => annObj.onSave(this));
        return this.annString;
    }

    readInteger(bytes: number): number {
        const length = this.annData.length;
        let value = 0;
        for (let i = 0; i < bytes; i++) {
            value += this.annData[length - i - 1] << (i * 8);
        }

        this.annData = this.annData.slice(0, length - bytes);
        return value;
    }

    readString(): string {
        const strLen = this.readInteger(4) / 2;
        let str = "";

        for (let index = 0; index < strLen; index++) {
            const ch = this.readInteger(2);
            str += String.fromCharCode(ch);
        }

        return str;
    }

    readIntegerPoint(): Point {
        return { x: this.readInteger(4), y: this.readInteger(4) };
    }

    readDouble(): number {
        const ebits = 11;
        const fbits = 52;

        const bytes = this.readBytes(8);

        // Bytes to bits
        var bits = [];
        for (var i = bytes.length; i; i -= 1) {
            var byte = bytes[i - 1];
            for (var j = 8; j; j -= 1) {
                bits.push(byte % 2 ? 1 : 0); byte = byte >> 1;
            }
        }
        bits.reverse();
        var str = bits.join('');

        // Unpack sign, exponent, fraction
        var bias = (1 << (ebits - 1)) - 1;
        var s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
        var e = parseInt(str.substring(1, 1 + ebits), 2);
        var f = parseInt(str.substring(1 + ebits), 2);

        // Produce number
        if (e === (1 << ebits) - 1) {
            return f !== 0 ? NaN : s * Infinity;
        }
        else if (e > 0) {
            return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
        }
        else if (f !== 0) {
            return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
        }
        else {
            return s * 0;
        }
    }

    readDoublePoint(): Point {
        return { x: this.readDouble(), y: this.readDouble() };
    }

    readBytes(count: number = -1) {
        if (count === -1) {
            count = this.readInteger(4);
        }
        
        const bytes = [];
        const length = this.annData.length;
        for (let j = 0; j < count; j++) {
            bytes.push(this.annData[length + j - count]);
        }
        this.annData = this.annData.slice(0, length - count);
        return bytes;
    }

    writeBytes(bytes) {
        const length = bytes.length;
        this.writeInteger(length, 4);

        this.addToAnnDataHead(bytes);
        this.annString = this.byteArrayToHexString(bytes) + this.annString;
    }

    writeDouble(value: number) {
        const ebits = 11;
        const fbits = 52;

        var bias = (1 << (ebits - 1)) - 1;

        // Compute sign, exponent, fraction
        var s, e, f;
        if (isNaN(value)) {
            e = (1 << bias) - 1; f = 1; s = 0;
        }
        else if (value === Infinity || value === -Infinity) {
            e = (1 << bias) - 1; f = 0; s = (value < 0) ? 1 : 0;
        }
        else if (value === 0) {
            e = 0; f = 0; s = (1 / value === -Infinity) ? 1 : 0;
        }
        else {
            s = value < 0;
            value = Math.abs(value);

            if (value >= Math.pow(2, 1 - bias)) {
                var ln = Math.min(Math.floor(Math.log(value) / Math.LN2), bias);
                e = ln + bias;
                f = value * Math.pow(2, fbits - ln) - Math.pow(2, fbits);
            }
            else {
                e = 0;
                f = value / Math.pow(2, 1 - bias - fbits);
            }
        }

        // Pack sign, exponent, fraction
        var i, bits = [];
        for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = Math.floor(f / 2); }
        for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = Math.floor(e / 2); }
        bits.push(s ? 1 : 0);
        bits.reverse();
        var str = bits.join('');

        // Bits to bytes
        var bytes = [];
        while (str.length) {
            bytes.push(parseInt(str.substring(0, 8), 2));
            str = str.substring(8);
        }

        this.addToAnnDataHead(bytes);
        this.annString = this.byteArrayToHexString(bytes) + this.annString;
    }

    writeIntegerPoint(point: Point) {
        this.writeInteger(point.x, 4);
        this.writeInteger(point.y, 4);
    }

    writeDoublePoint(point: Point) {
        this.writeDouble(point.x);
        this.writeDouble(point.y);
    }

    writeInteger(value: number, bytes: number) {
        // Old image suite annotation save the number in integer. Need to round it.
        value = Math.round(value);
        const byteArray = [];
        for (let index = 0; index < bytes; index++) {
            const byte = value & 0xff;
            byteArray.unshift(byte);
            value = (value - byte) / 256;
        }

        this.addToAnnDataHead(byteArray);
        this.annString = this.byteArrayToHexString(byteArray) + this.annString;
    }

    writeString(str: string) {
        const length = str.length;
        this.writeInteger(length * 2, 4);
        for (let index = 0; index < length; index ++) {
            this.writeInteger(str.charCodeAt(index), 2);
        }
    }

    byteArrayToHexString(byteArray): string {
        let s = "";
        byteArray.forEach(byte => {
            s += ("0" + (byte & 0xFF).toString(16)).slice(-2);
        });

        return s;
    }

    addToAnnDataHead(byteArray) {
        const annData = new Uint8Array(this.annData.length + byteArray.length);
        annData.set(byteArray);
        annData.set(this.annData, byteArray.length);
        this.annData = annData;
    }

    loadBaseLine(): any {
        const annName = this.readString(); // CGXAnnLine
        const created = this.readInteger(4);
        const moving = this.readInteger(4);
        const selected = this.readInteger(1);

        const startPoint = this.readIntegerPoint();
        const endPoint = this.readIntegerPoint();

        return { startPoint: startPoint, endPoint: endPoint, selected: selected };
    }

    loadLine(): any {
        const annType = this.readInteger(4); // 33
        const created = this.readInteger(4);
        const selected = this.readInteger(1);
        const config = this.loadBaseLine();

        return config;
    }

    loadArrow(loadArrowMark: boolean = true): any {
        // CGXAnnArrowMark
        if (loadArrowMark) {
            const annType = this.readInteger(4); // 10
            const created = this.readInteger(4);
            const selected = this.readInteger(1);
        }

        // CGXAnnArrow
        const annName1 = this.readString();
        const created1 = this.readInteger(4);
        const selected1 = this.readInteger(1);

        const config = this.loadBaseLine();

        // The two small lines of the arrow will be created dynamically, read but ignore it
        this.loadBaseLine();
        this.loadBaseLine();

        return config;
    }

    loadBaseText(): any {
        const annName = this.readString(); // CGXAnnText
        const created = this.readInteger(4);
        const moving = this.readInteger(4);
        const selected = this.readInteger(1);

        const bottomRightPoint = this.readIntegerPoint();
        const topLeftPoint = this.readIntegerPoint();
        const text = this.readString();
        const isRotateCreated = this.readInteger(4);
        const rotateCreated = this.readInteger(4);
        const fontHeight = this.readInteger(4);

        return { topLeftPoint: topLeftPoint, bottomRightPoint: bottomRightPoint, text: text };
    }

    loadTextIndicator(): any {
        const annName = this.readString(); // CGXAnnLabel
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const arrow = this.loadArrow(false);
        const baseText = this.loadBaseText();

        return arrow;
    }

    loadBaseRectangle(): any {
        const annName = this.readString(); // CGXAnnRectangle
        const created = this.readInteger(4);
        const moving = this.readInteger(4);
        const selected = this.readInteger(1);

        const topLeftPoint = this.readIntegerPoint();
        const bottomRightPoint = this.readIntegerPoint();
        const topRightPoint = this.readIntegerPoint();
        const bottomLeftPoint = this.readIntegerPoint();

        return { topLeftPoint: topLeftPoint, width: bottomRightPoint.x - topLeftPoint.x, height: bottomRightPoint.y - topLeftPoint.y };
    }

    loadRectangle(): any {
        const annType = this.readInteger(4); // 2
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const baseRect = this.loadBaseRectangle();
        const textIndicator = this.loadTextIndicator();

        return { baseRect: baseRect, textIndicator: textIndicator, selected: selected }
    }

    loadPolygon(): any {
        const annType = this.readInteger(4); // 24
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const pointCount = this.readInteger(4);
        const lineCount = this.readInteger(4);

        const pointList = [];
        for (let i = 0; i < pointCount; i++) {
            pointList.push(this.readIntegerPoint());
        }

        for (let i = 0; i < lineCount; i++) {
            this.loadBaseLine();
        }

        const textIndicator = this.loadTextIndicator();

        return { pointList: pointList, textIndicator: textIndicator, selected: selected }
    }

    loadAngle(): any {
        const annType = this.readInteger(4); // 8
        const created = this.readInteger(4);
        const moving = this.readInteger(4);
        const selected = this.readInteger(1);
        const arcAndTextOnly = this.readInteger(1);
        const createState = this.readInteger(4);
        const angle = this.readDouble();

        for (let i = 0; i < 4; i++) {
            this.readIntegerPoint();
        }

        const lineList = [];
        for (let i = 0; i < 2; i++) {
            lineList.push(this.loadBaseLine());
        }

        const textIndicator = this.loadTextIndicator();
        return { lineList: lineList, textIndicator: textIndicator, selected: selected }
    }

    loadCurve() {
        const annType = this.readInteger(4); // 30
        const created = this.readInteger(4);
        const selected = this.readInteger(1);


        const pointList = [];
        for (let i = 0; i < 3; i++) {
            pointList.push(this.readDoublePoint());
        }

        const textIndicator = this.loadTextIndicator();
        return { pointList: pointList, textIndicator: textIndicator, selected: selected }
    }

    loadImage() {
        const imageFileName = this.readString();
        const bytes = this.readBytes();
        const annType = this.readInteger(4); // 10
        const created = this.readInteger(4);
        const moving = this.readInteger(4);
        const selected = this.readInteger(1);

        const topLeftPoint = this.readIntegerPoint();
        const bottomRightPoint = this.readIntegerPoint();
        const isRotateCreated = this.readInteger(1);
        const rotateCreated = this.readInteger(4);

        return { imageFileName: imageFileName, topLeftPoint: topLeftPoint, bottomRightPoint: bottomRightPoint, selected: selected }
    }

    loadEllipse() {
        const width = this.readInteger(4);
        const height = this.readInteger(4);
        const selected = this.readInteger(1);
        const centerPoint = this.readIntegerPoint();

        const textIndicator = this.loadTextIndicator();
        const isRotateCreated = this.readInteger(1);
        const rotateCreated = this.readDouble();

        return { centerPoint: centerPoint, width: width, height: height, textIndicator: textIndicator, selected: selected }
    }

    loadRuler() {
        const annType = this.readInteger(4); // 7
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const line = this.loadBaseLine();
        this.loadBaseLine();
        this.loadBaseLine();

        const textIndicator = this.loadTextIndicator();

        return { startPoint: line.startPoint, endPoint: line.endPoint, textIndicator: textIndicator, selected: selected }
    }

    loadVerticalAxis() {
        const annType = this.readInteger(4); // 27
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const initRotateCount = this.readInteger(4);
        const line = this.loadBaseLine();

        return { startPoint: line.startPoint, endPoint: line.endPoint, selected: selected }
    }

    loadMarkSpot() {
        const annType = this.readInteger(4); // 36
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const count = this.readInteger(4);

        const pointList = [];
        for (let i = 0; i < count; i++) {
            pointList.push(this.readIntegerPoint());
        }

        return { pointList: pointList, selected: selected }
    }

    loadCardiothoracicRatio() {
        const annType = this.readInteger(4); // 12
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const lineList = [];
        for (let i = 0; i < 5; i++) {
            lineList.push(this.loadBaseLine());
        }

        const textIndicator = this.loadTextIndicator();
        return { lineList: lineList, textIndicator: textIndicator, selected: selected }
    }

    loadFreeArea() {
        const annType = this.readInteger(4); // 23
        const created = this.readInteger(4);
        const selected = this.readInteger(1);

        const pointCount = this.readInteger(4);
        const lineCount = this.readInteger(4);

        const pointList = [];
        for (let i = 0; i < pointCount; i++) {
            pointList.push(this.readIntegerPoint());
        }

        for (let i = 0; i < lineCount; i++) {
            this.loadBaseLine();
        }

        return { pointList: pointList, selected: selected }
    }

    loadTextMark() {
        const annType = this.readInteger(4); // 6
        const created = this.readInteger(4);
        const isActive = this.readInteger(4);
        const editCreated = this.readInteger(4);
        const state = this.readInteger(4);
        const selected = this.readInteger(1);

        const fontSize = this.readInteger(4);
        const basicText = this.loadBaseText();

        const position = { x: basicText.topLeftPoint.x, y: basicText.bottomRightPoint.y };
        return { position: position, text: basicText.text, fontSize: fontSize, selected: selected };
    }
}