﻿import { Patient, Study, Series, Image } from "../models/pssi";
import { ViewerGroupData } from "../models/viewer-group-data";
import { ViewerImageData } from "../models/viewer-image-data";
import { GroupHangingProtocol, ImageHangingProtocol } from "../models/hanging-protocol";
import { LayoutPosition, LayoutMatrix } from "../models/layout";
import { LogService } from "../services/log.service";
import { ImageOperationEnum } from "../models/image-operation";

export class ViewerShellData {
    static logService: LogService;
    hide: boolean;
    patientList = new Array<Patient>();

    groupCount = 0; // The count of groups that contain image, NOT including empty groups
    groupMatrix = new LayoutMatrix(1, 1);
    groupDataList = new Array<ViewerGroupData>(); // Must contains all group even if its an empty group

    groupHangingProtocol: GroupHangingProtocol;
    defaultGroupHangingProtocol: GroupHangingProtocol;
    defaultImageHangingProtocol: ImageHangingProtocol;

    constructor(defaultGroupHangingProtocol: GroupHangingProtocol, defaultImageHangingProtocol: ImageHangingProtocol) {
        this.defaultGroupHangingProtocol = defaultGroupHangingProtocol;
        this.defaultImageHangingProtocol = defaultImageHangingProtocol;
        this.hide = false;

        ViewerShellData.logService.debug("ViewerShellData " + this.getId() + " created!");
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    addStudy(studyInWorklist: Study) {


        const study = Study.clone(studyInWorklist, true);
        study.hide = false;
        // Set parent for all series and all images, since they are NOT set in JSON string returned from server
        for (let i = 0; i < study.seriesList.length; i++) {
            const series = study.seriesList[i];
            series.study = study;
            series.hide = false;
            for (let j = 0; j < series.imageList.length; j++) {
                series.imageList[j].hide = false;
                series.imageList[j].series = series;
            }

            // Sort the images in series by ImageNo. We already query the image by ImageNo order in backend,
            // but ImageNo is saved in DB with string format, so "10" is prior than "2" which is NOT desired,
            // Need to adjust it to sort by number type
            series.imageList.sort((n1, n2) => {
                return (Number(n1.imageNo) < Number(n2.imageNo)) ? -1 : 1;
            });
        }


        let index = -1;
        for (let i = 0; i < this.patientList.length; i++) {
            if (this.patientList[i].id === studyInWorklist.patient.id) {
                index = i;
                break;
            }
        }

        let patient = null;
        if (index === -1) {
            // Clone a patient and added to the list
            patient = Patient.clone(studyInWorklist.patient, false);
            this.patientList.push(patient);
        } else {
            patient = this.patientList[index];
        }

        study.patient = patient;
        patient.hide = false;
        patient.studyList.push(study);
    }

    getId(): string {
        let id = "";
        this.patientList.forEach(patient => id += this.getIdFromPatient(patient));
        return id;
    }

    getName(): string {
        let name = "";
        this.patientList.forEach(patient => name += patient.patientId + "_" + patient.patientName + " | ");
        return name.substr(0, name.length - 3);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Select functions
    isImageInFirstShownAndSelectedGroup(image: Image): boolean {
        const groupData = this.getFirstShownAndSelectedGroup();
        if (!groupData) {
            return false;
        }

        return groupData.getViewerImageDataByImage(image) !== undefined;
    }

    getFirstShownAndSelectedGroup(): ViewerGroupData {
        const len = this.groupDataList.length;
        for (let i = 0; i < len; i++) {
            if (!this.groupDataList[i].hide && this.groupDataList[i].isSelected()) {
                return this.groupDataList[i];
            }
        }

        return undefined;
    }

    getFirstShownGroup(): ViewerGroupData {
        const len = this.groupDataList.length;
        for (let i = 0; i < len; i++) {
            if (!this.groupDataList[i].hide) {
                return this.groupDataList[i];
            }
        }

        return undefined;
    }

    selectAllImages(selected: boolean) {
        this.groupDataList.forEach(groupData => {
            groupData.setSelected(selected);
        });
    }

    selectAllImagesInFirstShownAndSelectedGroup() {
        // There might be multiple selected and shown groups, choose the first one as the selected group
        // Other groups will all be set to unselected
        const firstShownAndSelectedGroup = this.getFirstShownAndSelectedGroup();
        this.groupDataList.forEach(groupData => {
            groupData.setSelected(groupData === firstShownAndSelectedGroup);
        });
    }

    selectAllVisibleImages() {
        // All shown groups will be selected and all hidden groups will be unselected
        // All shown images will be selected and all hidden images will be unselected
        this.groupDataList.forEach(groupData => {
            groupData.selected = !groupData.hide;
            this.syncHideAndSelectForGroup(groupData);
        });
    }

    selectAllVisibleImagesInFirstShownAndSelectedGroup() {
        // There might be multiple selected and shown groups, choose the first one as the selected group
        const firstShownAndSelectedGroup = this.getFirstShownAndSelectedGroup();
        this.selectAllVisibleImagesInGroup(firstShownAndSelectedGroup);
    }

    selectFirstShowImageInFirstShownGroup() {

        const firstShownGroup = this.getFirstShownGroup();
        const firstShownImage = firstShownGroup.getFirstShownImage();

        this.selectAllImages(false);

        firstShownGroup.selected = true;
        firstShownImage.selected = true;
    }

    clickImage(imageSelectType: ImageOperationEnum, clickedImageData: ViewerImageData) {
        
        if (imageSelectType === ImageOperationEnum.SelectAllImages || imageSelectType === ImageOperationEnum.SelectAllVisibleImages) {
            // In SelectAllImages or SelectAllVisibleImages mode, nothing need to do when click an image, since they all selected
            return;
        } else if (imageSelectType === ImageOperationEnum.SelectAllVisibleImagesInSelectedGroup) {
            // In SelectAllVisibleImagesInSelectedGroup mode
            this.selectAllVisibleImagesInGroup(clickedImageData.groupData);
        } else if (imageSelectType === ImageOperationEnum.SelectAllImagesInSelectedGroup) {
            // In SelectAllImagesInSelectedGroup
            this.selectAllImagesInGroup(clickedImageData.groupData);
        } else if (imageSelectType === ImageOperationEnum.SelectOneImageInSelectedGroup) {
            this.selectAllImages(false);
            clickedImageData.selected = true;
            clickedImageData.groupData.selected = true;
        } else {
            alert("Invalid para in ViewerShellData.clickImage()");
        }
    }

    // Select all visible images in the given group and unselect all other images
    private selectAllVisibleImagesInGroup(viewerGroupData: ViewerGroupData) {
        this.groupDataList.forEach(groupData => {
            groupData.selected = groupData === viewerGroupData;
            this.syncHideAndSelectForGroup(groupData);
        });
    }

    // Select all images in the given group and unselect all other images
    private selectAllImagesInGroup(viewerGroupData: ViewerGroupData) {
        this.groupDataList.forEach(groupData => {
            groupData.setSelected(groupData === viewerGroupData);
        });
    }

    private syncHideAndSelectForGroup(viewerGroupData: ViewerGroupData) {
        if (viewerGroupData.selected) {
            // Group is selected, set all shown images selected and all hidden images unselected
            viewerGroupData.imageDataList.forEach(imageData => imageData.selected = !imageData.hide);
        } else {
            // Group is unselected, set all images unselected
            viewerGroupData.imageDataList.forEach(imageData => imageData.selected = false);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Get count
    getTotalPatientCount(): number {
        return this.patientList.length;
    }

    getTotalStudyCount(): number {
        let count = 0;
        this.patientList.forEach(patient => count += patient.studyList.length);
        return count;
    }

    getTotalSeriesCount(): number {
        let count = 0;
        this.patientList.forEach(patient => {
            patient.studyList.forEach(study => count += study.seriesList.length);
        });
        return count;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Group Operation
    cleanGroup() {
        this.groupDataList.length = 0;
        this.groupCount = 0;
    }

    getGroup(pageIndex: number, rowIndex: number, colIndex: number): ViewerGroupData {
        const groupIndex = pageIndex * this.groupMatrix.rowCount * this.groupMatrix.colCount + rowIndex * this.groupMatrix.colCount + colIndex;
        if (groupIndex >= this.groupDataList.length) {
            alert(`Invalid group index : ${groupIndex}`);
            return null;
        }

        //ViewerShellData.logService.debug("ViewData: Get group for " + this.getId() + rowIndex + colIndex);
        return this.groupDataList[groupIndex];
    }

    addGroup(isEmpty: boolean) {
        const groupIndex = this.groupDataList.length;
        const groupData = new ViewerGroupData(this, this.defaultImageHangingProtocol,
            LayoutPosition.fromNumber(groupIndex, this.groupMatrix));

        if (isEmpty) {
            groupData.setEmpty();
        }

        this.groupDataList.push(groupData);
    }

    updateGroupPositionFromIndex(groupIndex: number) {
        if (groupIndex < 0 || groupIndex >= this.groupDataList.length) {
            alert(`updateGroupPositionFromIndex() => Invalid group index : ${groupIndex}`);
            return;
        }

        this.groupDataList[groupIndex].setPosition(LayoutPosition.fromNumber(groupIndex, this.groupMatrix));
    }

    getPageCount(): number {
        return Math.ceil(this.groupDataList.length / (this.groupMatrix.rowCount * this.groupMatrix.colCount));
    }

    removeAllEmptyGroup() {
        while (this.groupDataList[this.groupDataList.length - 1].isEmpty()) {
            this.groupDataList.pop();
        }
    }

    normalizeGroupList() {
        // Need to add some empty groups to make sure the total group (include empty group) is valid.
        // For example, if the group count is 5(not empty), and the layout matrix is 2x2, need to add
        // 3 empty groups to make sure total group number(8) is multiple of the matrix size(4)

        const matrixSize = this.groupMatrix.rowCount * this.groupMatrix.colCount;
        const totalSize = this.getPageCount() * matrixSize;
        for (let i = this.groupDataList.length; i < totalSize; i++) {
            this.addGroup(true);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Get image
    getAllImageOfPatient(patient: Patient): Array<Image> {
        let images = new Array<Image>();
        patient.studyList.forEach(study => {
            study.seriesList.forEach(series => images = images.concat(series.imageList));
        });

        return images;
    }

    getAllImageOfStudy(study: Study): Array<Image> {
        let images = new Array<Image>();
        study.seriesList.forEach(series => images = images.concat(series.imageList));
        return images;
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Get object by index
    getPatientByIndex(patientIndex: number): Patient {
        if (patientIndex >= this.patientList.length) {
            return null;
        }

        return this.patientList[patientIndex];
    }

    getStudyByIndex(studyIndex: number): Study {
        const studyList = this.getAllStudyList();
        if (studyIndex >= studyList.length) {
            //alert('Error get study by index : ' + studyIndex + ', total study count is ' + studyList.length);
            return null;
        }

        return studyList[studyIndex];
    }

    getSeriesByIndex(seriesIndex: number): Series {
        const seriesList = this.getAllSeriesList();
        if (seriesIndex >= seriesList.length) {
            //alert('Error get series by index : ' + seriesIndex + ', total series count is ' + seriesList.length);
            return null;
        }

        return seriesList[seriesIndex];
    }

    getViewerImageDataByImage(image: Image): ViewerImageData {
        for (let i = 0; i < this.groupDataList.length; i++) {
            const imageData = this.groupDataList[i].getViewerImageDataByImage(image);
            if (imageData) {
                return imageData;
            }
        }

        return undefined;
    }

    sameShell(image: Image): boolean {
        return this.getViewerImageDataByImage(image) !== undefined;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private getIdFromPatient(patient: Patient): string {
        let id = "";
        patient.studyList.forEach(value => id += `_${value.id}`);
        return id;
    }

    private getAllStudyList(): Array<Study> {
        let studies = new Array<Study>();
        this.patientList.forEach(patient => studies = studies.concat(patient.studyList));
        return studies;
    }

    private getAllSeriesList(): Array<Series> {
        const studyList = this.getAllStudyList();

        let series = new Array<Series>();
        studyList.forEach(study => series = series.concat(study.seriesList));
        return series;
    }
}
