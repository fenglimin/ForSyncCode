import { Injectable } from '@angular/core';
import { Subject, Subscription } from "rxjs";
import { ImageInteractionData, ImageInteractionEnum } from "../models/image-operation";
import { ViewerImageData } from "../models/viewer-image-data";
import { ViewerGroupData } from "../models/viewer-group-data";
import { ViewerShellData } from "../models/viewer-shell-data";
import { Image } from "../models/pssi";
import { ImageOperationData, ImageOperationEnum, ImageContextEnum } from "../models/image-operation";
import { ImageOperationService } from "../services/image-operation.service";

@Injectable({
    providedIn: 'root'
})
export class ImageInteractionService {

    // Observable ImageInteractionData source
    private imageInteractionSource = new Subject<ImageInteractionData>();

    // Observable ImageInteractionData sources
    imageInteraction$ = this.imageInteractionSource.asObservable();

    private subscriptionImageOperation: Subscription;

    constructor(private imageOperationService: ImageOperationService) {

    }

    private doImageInteraction(imageInteractionData: ImageInteractionData) {
        if (!imageInteractionData.getShellData()) {
            alert("ImageInteractionService.doImageInteraction() => Internal error, viewShellData must be set.");
            return;
        }

        this.imageInteractionSource.next(imageInteractionData);
    }

    onNavigationImageInGroup(viewerImageData: ViewerImageData, up: boolean) {
        //const imageInteractionData = new ImageInteractionData(ImageInteractionEnum.NavigationImageInGroup, up);
        //imageInteractionData.setImageData(viewerImageData);
        //this.doImageInteraction(imageInteractionData);
    }

    onSelectThumbnailInNavigator(viewerShellData: ViewerShellData, image: Image) {
        const imageSelectType = this.imageOperationService.getShellImageSelectType(viewerShellData.getId());
        if (imageSelectType === ImageOperationEnum.SelectAllImages || imageSelectType === ImageOperationEnum.SelectAllVisibleImages)
            return;

        const imageInteractionData = new ImageInteractionData(ImageInteractionEnum.SelectThumbnailInNavigator, undefined);
        imageInteractionData.setPssiImage(image);
        imageInteractionData.setShellData(viewerShellData);
        this.doImageInteraction(imageInteractionData);
    }

    onChangeImageLayoutForSelectedGroup(viewShellData: ViewerShellData, imageLayoutStyle: number) {
        const imageInteractionData = new ImageInteractionData(ImageInteractionEnum.ChangeImageLayoutForSelectedGroup, imageLayoutStyle);
        imageInteractionData.setShellData(viewShellData);
        this.doImageInteraction(imageInteractionData);
    }

    onAddSelectImage(viewerImageData: ViewerImageData) {
        const imageInteractionData = new ImageInteractionData(ImageInteractionEnum.AddSelectImage, undefined);
        imageInteractionData.setImageData(viewerImageData);
        this.doImageInteraction(imageInteractionData);
    }
}
