import { Component, OnInit, Input } from "@angular/core";
import { Subscription } from "rxjs";
import { Image } from "../../../../models/pssi";
import { ViewerShellData } from "../../../../models/viewer-shell-data";
import { ViewerImageData } from "../../../../models/viewer-image-data";
import { WorklistService } from "../../../../services/worklist.service";
import { DicomImageService } from "../../../../services/dicom-image.service";
import { ImageInteractionService } from "../../../../services/image-interaction.service";
import { ImageInteractionData, ImageInteractionEnum } from "../../../../models/image-operation";
import { ImageOperationData, ImageOperationEnum, ImageContextEnum } from "../../../../models/image-operation";
import { ImageOperationService } from "../../../../services/image-operation.service";

@Component({
    selector: "app-thumbnail",
    templateUrl: "./thumbnail.component.html",
    styleUrls: ["./thumbnail.component.css"]
})
export class ThumbnailComponent implements OnInit {
    @Input()
    viewerShellData: ViewerShellData;

    thumbnailToShow: any;
    isImageLoading: boolean;
    //selected = false;

    private subscriptionImageInteraction: Subscription;
    private subscriptionImageOperation: Subscription;

    borderStyle = "1px solid #555";

    private _image: Image;
    @Input()
    set image(image: Image) {
        if (this._image !== image) {
            this._image = image;
            this.refreshImage();
        }
    }

    get image() {
        return this._image;
    }

    private viewerImageData: ViewerImageData;

    constructor(private imageInteractionService: ImageInteractionService,
        private imageOperationService: ImageOperationService,
        private dicomImageService: DicomImageService,
        private worklistService: WorklistService) {

        this.subscriptionImageInteraction = imageInteractionService.imageInteraction$.subscribe(
            imageInteractionData => {
                this.onImageInteraction(imageInteractionData);
            }
        );

        this.subscriptionImageOperation = imageOperationService.imageOperation$.subscribe(
            imageOperationData => {
                this.onImageOperation(imageOperationData);
            }
        );
    }


    ngOnInit() {
        this.viewerImageData = this.viewerShellData.getViewerImageDataByImage(this.image);
    }

    getBorderStyle(): string {
        return this.viewerImageData.selected ? "2px solid #F90" : "1px solid #555";
    }

    onSelected() {
        this.imageInteractionService.onSelectThumbnailInNavigator(this.viewerShellData, this.image);
    }

    onMouseOver(event) {
        //this.borderStyle = "1px solid #F90";
    }

    onMouseOut(event) {
        //this.borderStyle = this.selected ? "2px solid #F90" : "1px solid #555";
    }

    private refreshImage() {
        if (this._image !== null) {
            if (this.worklistService.isUsingLocalTestData()) {
                this.thumbnailToShow =
                    "data:image/jpeg;base64,Qk02RAAAAAAAADYEAAAoAAAAgAAAAIAAAAABAAgAAAAAAABAAAA5FwAAORcAAAAAAAAAAAAAAAAAAAEBAQACAgIAAwMDAAQEBAAFBQUABgYGAAcHBwAICAgACQkJAAoKCgALCwsADAwMAA0NDQAODg4ADw8PABAQEAAREREAEhISABMTEwAUFBQAFRUVABYWFgAXFxcAGBgYABkZGQAaGhoAGxsbABwcHAAdHR0AHh4eAB8fHwAgICAAISEhACIiIgAjIyMAJCQkACUlJQAmJiYAJycnACgoKAApKSkAKioqACsrKwAsLCwALS0tAC4uLgAvLy8AMDAwADExMQAyMjIAMzMzADQ0NAA1NTUANjY2ADc3NwA4ODgAOTk5ADo6OgA7OzsAPDw8AD09PQA+Pj4APz8/AEBAQABBQUEAQkJCAENDQwBEREQARUVFAEZGRgBHR0cASEhIAElJSQBKSkoAS0tLAExMTABNTU0ATk5OAE9PTwBQUFAAUVFRAFJSUgBTU1MAVFRUAFVVVQBWVlYAV1dXAFhYWABZWVkAWlpaAFtbWwBcXFwAXV1dAF5eXgBfX18AYGBgAGFhYQBiYmIAY2NjAGRkZABlZWUAZmZmAGdnZwBoaGgAaWlpAGpqagBra2sAbGxsAG1tbQBubm4Ab29vAHBwcABxcXEAcnJyAHNzcwB0dHQAdXV1AHZ2dgB3d3cAeHh4AHl5eQB6enoAe3t7AHx8fAB9fX0Afn5+AH9/fwCAgIAAgYGBAIKCggCDg4MAhISEAIWFhQCGhoYAh4eHAIiIiACJiYkAioqKAIuLiwCMjIwAjY2NAI6OjgCPj48AkJCQAJGRkQCSkpIAk5OTAJSUlACVlZUAlpaWAJeXlwCYmJgAmZmZAJqamgCbm5sAnJycAJ2dnQCenp4An5+fAKCgoAChoaEAoqKiAKOjowCkpKQApaWlAKampgCnp6cAqKioAKmpqQCqqqoAq6urAKysrACtra0Arq6uAK+vrwCwsLAAsbGxALKysgCzs7MAtLS0ALW1tQC2trYAt7e3ALi4uAC5ubkAurq6ALu7uwC8vLwAvb29AL6+vgC/v78AwMDAAMHBwQDCwsIAw8PDAMTExADFxcUAxsbGAMfHxwDIyMgAycnJAMrKygDLy8sAzMzMAM3NzQDOzs4Az8/PANDQ0ADR0dEA0tLSANPT0wDU1NQA1dXVANbW1gDX19cA2NjYANnZ2QDa2toA29vbANzc3ADd3d0A3t7eAN/f3wDg4OAA4eHhAOLi4gDj4+MA5OTkAOXl5QDm5uYA5+fnAOjo6ADp6ekA6urqAOvr6wDs7OwA7e3tAO7u7gDv7+8A8PDwAPHx8QDy8vIA8/PzAPT09AD19fUA9vb2APf39wD4+PgA+fn5APr6+gD7+/sA/Pz8AP39/QD+/v4A////AAgICAcHBwYGCQcSKDtLXWp6goydp7a4tba5vMDEx8rLysvMzc7Q0dTV1dXU09PU1tjZ2tra29vb29zb29vb297e3t/c3Nvb29zd397e393c3N3c3Nzb29vb2tnZ2dnVz87NzMvO0NDQzsvHw8G+urSys7KiloZ7bV9TSTomFwUECQkJCAgIBwgJCB0yR1lqdoeOm6u2xMXBw8fLzs/W2NrZ19Xb3uHi4uTk4+Hg4eDi5ufo6Onp6unp6ejo6enr7u7v7uzs7Ozs6+3u7e3u6+vr7Ovr6urq6urp6Ojo5+bi3tzc3eDg4N7c2NXSz8zIwr+8wbOklYZ7bGBURDEgDAUJCQgICAgHCQkQJzxPX257iJGfrbjFxcLEyMvOztXZ2tvY19zh5OPj4uTk4uDi4uPm5+fn6enp6ejo6Onp6evu7u7u7O7t7e3t7e7t7u3q6urr6urq6enq6ejo6Ojn5uXj4eLi4uHg3tvY1dLQzMnEwLrCt6eajIFzZlpKNyYVBggJCAgICAcKChwwQ1VkdH6NlaSwucXGxMXIzNDQ09na29zc3+Hj5OTi5OXj4+Pj5ebn5+fo6Onp6enp6uvq6+3t7ezs7ezt7u3t7e7v7Onp6urr6unp6urp6ejo5+fl5ePj4+Pi4eDe29nW1NHNysXBvMS4qqCQhnpwY1A/LRoLCAkICAgHCAoRKDhJWWp4go6bqrK5xMbIyMvO0NLU2Nna3N3f4eLj4+bl5OTl5eXm5+fn6Ofo6Onp6urq6uvr7O7t7Ozt7Ozt7Ozt7uzr6enp6urq6unq6eno6Ofn5ubl5OTk5OPi4N7b2djV0s/MyMLAxbqtpZaLf3ZoVkQ0IA8ICQkICAcJCRovO0xcbHmEj5+ss7jCx8rLzM7Q0tTW2Nna3d7g4eHi5OXj4ePl5ufn5+fn6Ojp6unp6urq6uvr6+zt7O3s7e3r7Ozt6+vp6erq6enq6erp6ejo5+fm5uXl5eXk4+Hf3dvZ19XTz83JxcTFuq+omo2BeWpaSTknEwgJCQgIBwkLIjNAT11veYWSo62zt8HIy83NztHT1NbY2Nrc3t/g4ODh5OPi4+Xl5ubn5+jo6erp6enq6unq6urr7Ozr7Ovs6+vq6uvr6urp6enp6urq6unp6Ojo5+fm5ebm5eTj4d/c29nY1dLQzsrGx8W5r6mekIR+bl1LPCoXCAkJCAgICQ8nNUJSX3F8h5WmrrO7wMjMzs7P0NLU1djX19ve3t/f3eDh4+Tk5eXk5efn5+jp6enp6urp6evq6urs7Ovs7Ozr6+vq6+vq6enp6enq6urq6uno6Ojn5+bm5ubl5OLg3tza2djV09DOysnKxrivrKCThn1xYE48KhgICQgIBwgJFyk4RlVhcnuJl6eutr6+x8zOz8/Q0dPV19fW2Nze39vd4OLk5OPk5OPk5ufo6Onp6Ojp6unp6urr6uzr7Ovs6+rr6+rr6+vq6uno6urp6urp6ejo6Ofn5ubm5uXj4d/e3NvZ19XTz83LysrGua+soZSFfHFhTzwqGQgJCAgICQocLDpLWGNyfYqZqK+7vr3Fy87Oz9DQ0tTW19fW2drZ2dvg4eHj5OTi4+Xn5+jn6Ono6Onp6enp7O3t7Ozr7Ovq6uvs6+vr6+nq6erp6erq6unp6Ojn5+bn5ubm5OLh393c2tnX1NLPzczMysW7sKmilIZ6bmBPOykYCAgICAgKChwtPExYZXN/jpyntL29usLKzc7P0NDR0tXW19jX1tfX2dzd3uLj4uLj5eXm5+fo6Ofn6Ojo6ens7O3s7Ozs7Ovr7O3u7uzq6erq6urq6urq6uno6Ofn5+fn5uTj4eDf3dzb2dfV0tDOzcvJwrqyp6CUhXVqXE04JxgICQgICAoKGyw6S1hnc32Pnai5vrm6v8bLzs/Q0NDR09PW19XU1dfZ2tze4OHi4+Tk5eXm5+fn5+fm5ufn6ezr6+3r6urp6uvs7ezt7Onp6urq6urr6unp6efn5+fn5+bl4+Lh4N7d3NrZ19XS0M/Oy8a+ubSmm4+CcGZXRzQjFggICAgICgkWJzdHVWNve5Cerbq7ubm6wMfLz9DQ0NHS09bX1tXV1tfZ297g4+Pk5OPk5OXm5+fm5+bl5ebo7Ovr7Ovp6enq6+zt6+vs6erq6urq6urq6eno5+fn5+fm5eTi4eDf3t3b2tnX1dPS0M7LxLu4sqeWjoNvX089LB4QCAgICAkKCQsgMD9NXmt8k56yu7e2t7i7w8rNz9DR0NDS09TU1tnb3N7f39/h4uLh4eLj4+Tl5ebm5eXl5Ons6+zr6unq6+rr7O3r7Ovp6erp6urp6enp6Ofn5+fn5ubk4+Lh4d/e3dzb2djX1NPSz8rCu7m1r52QgXFjTTwqGwoICAgICwoICRovPk1fa32UnbK6srCytbi/xsvMzc7P0tfX2NjX19ra297g5Obl4+Pj4+Pk5OXl5eTk4+Lk6uvs7Ovq6uvr6+vs7Ovs6ufo6enp6enp6Ojn5+fn5+jo5+fm5eTj4N7d3NrY2NbV09LOyMC7trWxo5GCcGJRPioZBwgICAgLCggJGTFBUF5qfpKbsbesrK6xtrq/xcnM0trYzcbEyMzR1NXS1Njc3+Tn6Ofk4+Tj5OTk4+Lh4uXq7Ozs7Ovr7Ovt6+zs7Ozp6Onp6enp6Ojo5+fo6uvr6ujm5eXk5OTk5OLf2tjX19XT0c3Fv7qzsrClkoRyZlNALRwICAgICgsKBwkYMkJRYGqCkJevtaKnqa+0tri/ytfXz8bDwL7BxMjQ0tPV297f4OLj5ujm4+Pj5OPk5OLi5urr7ezs6+zq6+3r7Ozs7ero6enp6enp6Ofp7Ovp5+bl5OPj4uDf3t3c3d/h3tnW1NLPysW/ubKvsqSThXVrV0MvIAsICAgLCwkHCBkyRFRhbYaRlrC4nKKnrbG0ucnUz8/Mx8PCwMC/wcrP0tbb3d/f3+Lj5Obp5OLj4+bm5eXn6evt7uzs7Ozt7e3t7e3q6+jo6enp6ejp7Ovo5+bm5eTi4uLg397d3Nva2tnc4N3V0czIxcC4sa6xpZKGdm1aRjIgEAgICQsKCAcHIDdJWWZziZKZsLyXn6qxucHRzsfN08/MysfHyMrN0tTW2dvd3t/f4OLj5OTn5+Pi4eHi4+fn6err6uvr6+vq6uvw8O3s6Ojo6Onp6+vo6Ofm5eTj4uLh4N/e3t7e3t7d3Nzb3N7Vz8zHwbmxrrGlkoZ2bVtJNSQVCAgKCwkIBwsnPU1caHeJlJquvJ+ltb3D08rIy87S0M3Ly8vMztTa29zc3N3e3t/g4eLj5OTl6OLk5eTj5+jo6+zs6+rr6+zs7Ozr6evo5+bm6ezo6Ofn5uTj4+Ph4eDg4OHh4eDf39/e3dzZ1tvWz83IwLOxrqCPhXVrWkc3JRcICQsLCQgHDSxBUFxreYiTmavCu6+6wNLIyMvNz9DSzs3NztHV2dvc3d7f3dzd3d7f4OLj4+Pj6OLi4eHn6Ojr6+rq6urq6+vp6enq6ufl5Ojq5+jn5+bk4+Pi4uDf4OHh4eHh4OHh4N/d3NrW09fWzcrIwb2xm42EdGpcRzcnGAgJCwoICAcOL0NSXWx6h5Oht8nIrrXOx8jKzM3P0NLT0tHT19va2tvb2trZ1dDNz9HW19rc3+Lh6OXg4ubo6uzs6urr6+rs7Orq6uro5OLn6OXn5+fm5OPj4uHh4OHh4eDg4eHh4eHg397b2dfV0dXTycjGx7+mkoN0ZlxGOCkaCAoLCQgHBxE1SFZgcHmPqba+zM23ucDDycvMzs/R0dPW2Nna2tnW0s/OzMrHx8K9vL7Ey9Pa39/h5+Lj5unq7Ozr7Orr6+vs6+zs6eji5ubk5ubm5ePj4+Lh4eHh4OHg4ODg4OHh4eDe3NrZ2NXTztTNxcfKwbCnmYBrYks+LR4ICgoICAcIHERTYG5/la62u8HL0MK9pLzIy8vP0NPS0dPW19ja2NTQzMvJycbCvrm4trvGy9rf3+Pm6Obm5+nr7Ozs6uvr6+rq7u/s5+bn4+Xl5eXj4uLh4ODh4ODg4N/g4ODg4ODf393c2tjX1dLPyNLFy8rBtKqlm4h1Xko8KwkKCQgIBxE/XWx4i5uosbi8wsvT0LSnq73Jys/P0dLR0NLT1tjZ1dHNy8nHw767ubm7wMXN3N7e4uPk5eTn6ezr6+rq6uvr6+rp6ebo6eHh4+Pj4+Hh4eDg4eDg39/f39/f4N/f397c3Nva2NbU0c7JxtLPy8G4r6ukm4t5YE46CQkICAgNNVJpfo2Zoq21vL7EzNjKvbapqrzMzs/Q0NDNz9DU19fV087NyMTAvr28vsXDytTa3N3e39/n5efo6urr6+vq6urp6Ojo6Ovi4eDg4OHg4ODf3+Dg39/e39/f39/f39/e29vb2trY1tLQzcrI0tbPwby0sKmgk4RwWkIJCAgICSVJYnWKmJynr7i9wMXQ28vEv7WursLMzc3NzMvM0NHV19XTzszIwL6+u7vDxsnP2tnb2trb3eDn5ujq6urq6+rq6eno5+fq5eDg3t7e3t3d3t/g39/g3t7e397e397e3dvZ2dra2tnW09DNzMzR3NDCv7ezraSZinlmTQgICAgSOFVvg5Kan6myub7Bx9fX0cjEv7i1tb/LysjKycjO0NHU1tLPy8bEv767v8fHy9ba2trZ2Nnc3eXl5+nr6urr6urp6Ojn5+ng393b3N7d3Nze3t7e39/d3t7e3t3e3dzb2tnZ2NnZ2NbU0c/P0NTZ1MTAuLawqJ6PgHBWCAgIByBHY3iMlp2jq7S7wMLK2tbSzMrGw767tLnBw8TEx8nPz9LT0M3MysjEw8TGycrQ2NvZ19jY2Nja4ejn6+vr6urp6ejo6Obp5N7d2trb3Nra3N3d3t7d3d3d3d7d3Nza2dnZ2dnY19fW1tXU0dHP1NfYx8K6t7OroZSGeF8HCAcKL1ZugZGaoKeut7zAxNLX2dPPzMvJxb2zqai3vb3BxcrNztDNzc3OysjKxsrO09XW2NfV1dfX19rd6Ojq6uvq6uro6Ojo6Orh3Nra2dvb2dvc29vc3N7d3dzc3Nva2tjY2NfY1tbV1dXV1dTSzc3U2NTOw7y5ta6jmIt8aAcIBhA+YniGkZ2lq7G5vsHG19Xb1c/OzczJwbWsopyntLm+xcvLzc7Oz9HQz83N0dPT09PV1tTT0tLT1dri6Ojp6enp6Ofm5uXo5d7b2NjY2dna2dra2tnb3Nvb3Nza2djX19jX1tbU1NTS1NPU1M7LztTY1NXEvLu3r6WbkINvCAcGF0trfoyVn6iutLq/wcvU1tzY0s7OzMrEubCooJaVoa+5wsjJyMrM0tTU09TU1NLR0dPU0NDNy83Q1d/p6Onp6Ojn5uXl5Onj3tnX19bW19jZ2djY2tza29ra29jW1tbW19bV1NPS0tHQ0NLOysvO09nW08m+vLixqJ6ViHMHBgUfV3CDkZqjqbC1u8DC0dDY3NrU0s7OyMS9s6uhmZCOiZqsusPCxMbIzdHR0tLR0MzHxsnExsS/wcXP2+fo6enp6ejn5uXm6uTf2NbV1dbW1dfW1tjZ2tnZ2NbW1NTV1dbW1dLS0NHQz87NyMXJy87T29jQz7+7ubKroJmPeAcGBSpedImVnaWqsbe8wcTVz9jc3dbW0MzHv7y5r6Wbk5CLiJqdqa2usrG5vsbJx8TCw8LAxcPGxsXDydDc4+fn6Ono6Obl5efn5ODa1tbW1dPT1dTW19jY19bV1NPT09TU1NPS0M7Nzs7PyLy+w8bKztbc2c7Tv7y6tK2jm5GABgUGM2F3jJeepauwuL3CydPR19ze2djSy8G9vLiyqqCYlpWKlZ6mqK2tqa+4uL7CxcbGyMnJx8jHycvK0drj6Ojo6Onn5uTk6OXj3dfU1dTT0tLW1dXW1tTT0tHR0dDQ0tHRz83LysvLysKysbrBxMrR2dzZz9LBvLu1rqWdk4AFBQg4YXqPmJ+lq7K3vcLP0NLX3d/c2tTMwbi4trGvqaGcl5OSmqepqrCwsrm8u73EycjMzdHPzMrNz8/R2ePp6Ojo6ejm4+To4eDa1tXV09XW1dTV1NPSzs7Nzs7OzM3PzMzKycfIyMa6qquwt73CytPb3NnQz8a+u7awpp6VggUFCzphfZCYoKatsri9w9XO0tfc3+Hd1c3BtaywsbS0qKGblpWdoa2qr7W0uL+8v8LGy87Q0tTV1NTU19jb4+rn6Ojp5uXj5Ojg393c2dnX19XT09TQzs/Ly8vKy8jIysnHxcXFxcbAsaCepayxu8PL1t3b2NDMy768tq+mn5eGBQUOO2J/kJmgp62yuL7F0szT19vf4t/WzMG1ra2usLGtpJyVl6Wlp6qvuLm6vsC/wsXHztDU1dTV19nb3d7k6+fo5+jm5OLk5uDf3dnV09PT0tDQ0MvLy8fHx8bHw8fHwcDBwcC/u6qcnJ2hp6+7xM3Y3tzX0crQv7y2sKegmYcFBRM6Y3+RmaCnrrK5v8bKzNPX2t/i4tnNwLaysK6ur66om5mXpqmqqK66vLq8wsHDxcbLztTV09TW1tna3uTq6Ojo5+bk4+Tl4N/d2NPR0M/PzMzPycjIw8LAvr/Cv7i3uLW3tK6goqGcnaGjrbrGzdve3NbSytXBvLaxqaCahwUFFzlif5CZoaevtLvAx8vN09fa3uLk3M7Du7azrqypoqeclZWlrK6vr7S+vrzBwsXFxsrM0NPS1dXV19rf5efp6Ojn5uTj5OPj49zX09DNysjHycvDwMK/urm3urexrK2pqqeel5mbmaCjo6atucXP397b1tPLzMG7uLOropuIBQUbOmF/kJqhqK+1u8LIzc7T19rd4uThzsS/urOspqCYl6GWlp6utre3ubzBvsHExcbHy8zQ0c/R09XY2d7m6eno6Ojn5eTk5eXk3dfUzcnFu7vBwLSzs7e3sbSspqCdmZaWkZKSi5CboKGnq6+4x9Th39nW08zEwby5tKyinIkFBx46YH6PmaGosLa9xMrOz9TX2t3i5OTTxsC7ta6hmpqRmJmYlai0tbe7vcHCwMTGxsnMzdDQ0NHS1NfZ3uXn5+bm5+Xj4eHi4uLe1dLNx7qmkaCln5+hp6GjnZSOgn6CiImQlo6Rj5aeoqits7nK2eDf2dbTzMXBvru2rqOciQQLIDpde46Zoaivt77Hy87P09fa3eHk5dfKwbq1qKKemJKPio6Ro6yxtLm+wcXDxcfGyczN0dLR0tPT1dji5ufn5+fo5+Xj4uPk497U0s3Gt6OMl4l3f4+ZjYuBdnp5iYKLkIuEhoyTkp+mqq+0vs7b4N7Y1tLNxsPAvLewpJ2KBBAiO1t5jJihqa+3v8fMz9DT1trd4OPl2s/Euq+spaCblpGNg4SgqrC0ur3BxcjHycfL0c3R0tTU09XW2OHl5+fn5+no5ePi4+Pk3tTTzMGzq5ePh29ufYeDgoB8hoJ+d35+fYWDipGXm6Sqs7vFztzf3dnW0s7IxsG9ubGlnYoEFCQ7WXaKmKGpsLi/x83Oz9LW2d3f4ubc0Me5saqloZiZlpCAfZGlr7S8wMLGy8vNy8vR0dLR09TW1tja4OXn5+fn6Ofk4uHh4+Lc1dDLwLCll4d/eIWMjYeSgoaFe3Z4eHF9gYmIjZKWpLG5wcfO3t7d2dbTzsjGw7+6s6adigcXJTpWc4eVn6mwuL/Gzc/P0tbZ3N7j5d3Qx72xq6SfnZKUmIJ2iayvsrq/wsXKzc7Ozs3R09HT09bX2Nrf5efn5ufo5+Ti4uPj39rSzMnCsqSdio+UkJKHk5N9fH14hoNucX6Ah4WHj5qmtb3EyM/d3N3Y1dPOx8bFwLu1p56KCxooOlRvhJSfqLC4wMbMz9DS1dnb3eLk4NLEvrWso52ZjomMiH17ma60tbvAxMjKz8zNz9LT0M/S1dTX2d/l5ubm5ujn5OPi4eHe2dLLyMG4r6iWmJ2Uk5GPhnN1gH9+cG56gH1/iYqSnqmzvsTJz93c3NfV0czIx8TAvLWnnYsQHCo7U2uBkZ2nrrjAxsrOz9LV2Nvd4uPg0sK5trGlnpmPh4OGh4KIpLK2uLvAxsjOzs7N0dbT0dPT1Njb4OXm5ufn5+bj4+Lh4N7Z1M/NyL6xqKChnpyRkol8fYSBfnR1doCEfICHkJujprG9xMfO3tzb1tTRzMfFw8G9tqidixMfLDxSaH6PnKavuMDFyc7P0tbY2tzh4+HOwrmzsaujmpSQi4qGgYSarrW5ubvCxszQz87S1NLU1tjY2tvh5ebm5+bn5uPi4uHh3tfSy8nIw7SrpZyaiYyJjJOTj3h2eYCAgnl7hoqVnKKor7vAx9De3NrV09HMxsXEwb21qZ2KFSEuPFBle4yapK63v8XJzc3R1dfa3ODk4c++t7Suramln5yTkoZ9e4+lsbm8u77BxszMzdHT0tPT1tbW2N7k5ufn5ufn5eTk5OPe1M/KycrJwbGkiYJ8gXh1hZiFc3V+foGAgImUlpWaoaWpr77H097d2NbT0MvFxMPBvbarnIgXIzA+UGJ3iZikrbe/xcnLzc/T1tnb4OTg07uyrq6tq6qkoZKPjIWBhpSgsbu8wMHFys3Lz9PV09TV1dXY3+Pn5+bl5ubj5OTj4NzVz8rIx8O/r6OGhId9d3d8fX15bn2CjIWFjJSXmpiZm56ovcnY3d3Y1dPPy8XEwsG9tqychxglMkBQYXSFlqKst7/FycvNz9PW2dzg4t7WvrGrqaqrp6CcmJKNjX1xhJyktLfAxsXKzMzO0dPR0tTU1dff5Obm5eXm5ePi4+Lh39bRzMXDvrWqnpeTjoB+foBxdYGChYSMkZOWlZSUlJSWnKa6zNzd29fV0c7JxMTBwb23rZ2HGiYzQU9fcIKToKu3vsXJy8zO0tbZ3ODi3tHIsaulpKGfnpuXl4+IgnRxk5+us7vCzMzLy83O0M7Q0tLV2N/k5ubm5+fn5eTj4eDd2NHKxcK7squklJSXgXx6dn5/hIWNi4iOioqMjo2RmJidpLXT297Z1tTRzcjCw8HBvbatnYccKDNCUV9uf5Ceqra+xcjKy87R1dnc3+Ddz868rqagnJiRlpGMj4mBgHaHnaixvL3ByMrKzMvOzs/Q0tTX3uPk5eXm5+bj4eLg393Y0czHwbmtqqSOlJF/eHuBhoV+iYJ/gIKFgYCEjZOXm5+jtdba3dfV1NDMx8LDwcC9tq2ehh4qNEJSX218jZuqtr7Ex8nKzNDV2Nrf39nOy8m1p5+TiYWJj46NjX6BgoCWrbe7vL2/xsfKyczOzs/Q0tbc4uTk5OXm5eLh4N/e3tjSzMa/tKijnpCRk4qIi4Z9gIuIfn5+fHV5goCKkZecoK3D1Nvb19XT0cvGw8PBwLy2raCFICs2QlFgbXuLmqm1vMPHx8nMz9TX2d3e18vJx8KrmYuGhISAhYWIi4iHioqksLq8urvAxMbGy83P0NDS19zi5eXl5ubl4uHg4N/b1tDKw7uypKChl5CfkpCGhISAhoOEeXR0dnmBgYqTl5yqvcXQ29nX1NPRysXEw8HAvLWsoYchLDdDUmFteomYqbS8wsXIycvP1NbY3N7Zx8fCvrSXj4ODfHl7eHJ3goiMhouitLq+wMDDxcTJzNDPz9DW3OHl5eXl5eXi4ODf3trWzsXBu7SuqaOYmqGVmY+Gf355eHdyeXd4eoGEgImZpri+xs3Z2dfU0tDKxcXCwcC7tayhiCMsN0VTYW16iZmps7rAxMbIys/T1tfa3tvGwr26r6qTjIZ7dXZ8cWlyfoaFfJKmtbi7v8PFycrMzs3O0dfc4eTk5OXl4+Hf393d29bQycTBurKnn5mkmYeWkH5xaG1vdHiAdXV7g3+EjZ6wt77EytjZ19PSz8zGxcPBv7u0q6CIJC02Q1NhbnqJm6qyusDDxMfJztTV19je28a8u7GuqaiThHpya3F0bm1tbXV5eZOqtre+v8LFy87Q0dLS1tvg4+Tk5OPi4N7e3d3b083FwL22tqedm6KbjYV4ZGpwbWpubnNydn6Bh5Cdpq20u8DD2dnX09HPzcfFwsC+u7SroIokLjdBUWFteoqeqrK6v8LDx8jP09XW197aybmtrqmmoaOSfHdvaWpudXBpZ3BvcZGot727xsXJzc3Ozs/V2t/j4+Pj4+Hf3t3c2tfSzMbBu7azpZyboKOUd3hoZmhjZWhoa3J4fIWQmZ2jqa+4tcHY2dbS0c/MycTCv766tKyhiyQuN0BPX256jqCrs7m/wMLGyM/S1NbW3dnPtaWjqKSemZmQe3JybXBub2xnaWRgaJWmtbi1usPKysrKy9LY3uDi4uHh39zc29vZ1c7MxcO/tKqZj5STm5F4c2llaGdrbGtxb3qHj5OWm6Snpamxwdja1NLQzsvLxMK+vLm0rKKNJy42P0xdbn+Uoauzur6/wsXKztHU1dbc19Ozpp2doZyWkZCPgnRzcmplZmVnZWNZZo+ksa6ut8LGxsbJ0dff4eLj4+Ph4N7c29rWzcrFw8CvoZmDjJaWjn5vZWhzb2tqb3R7gIqLkJacnpiYpLDC19vU0c/Ny8vGwb67ubOto44tMzU/SVlthZejrLS6vb/CxMzO0NPV1trX0rqonZmUlpOPkZKOgHd4b2ZjYVxWYGRfdZ6qrq2wub3Aw8bP193f4eDh4d/c29nY19bNxr++wquZiHZ/iIyBZmVnZ2ltbHJ4gIaIjoyMkpGNj5ehrcfW2tTRz8zLysbAvbq4tK6lkTI6Pj5JVG6HmKWutbm9vsHEzc7Q0tPX2dbMxK2emJCMjZGJioyKhH95bmtoYFlcYm9yhKKtrq6zt72+w8zU297f39/g3tvZ2NfX1MrDwLu7oYiCgIGFhnJnYF9dYWx1dnqCg4qLi4p/fYWMlqCszNLY1dHOzMvJyMC9ure0rqiVNz9DQkdWbYqapq60uby/wMfMzs/Q0tfY08rFtKCWjYyKh4mIgn2Af3t4enZxamhtc3p6kayxrK2zuL3AydHY3d7e39/d29nX1tbTysPBvK6cgYOGhoB0amBdY2hmcHV6en6AiImDe3l6goiWorPN0tfV0s7Ny8rJwby5t7SuqZY7Q0hIS1ptipynr7W6vb7Ayc3OztDR2NjQyMG/pZWNi4WBgYB9end3dXJycXFsXGFsdnBvkK+1sbK1usHJz9Xc3dzd3d3a19fX19HJwLu4rZqFj5KSf3ZzbGtobHJwbXFydXR2cnR7enx/iJWmwMbR1tTSz8zMysnEvLi2s6+pmD5GS0xVXm2Fnqmwtbq8vcDMzM7OztHY2c/CwL2zlo+LiIWAdHh6dW9tcHRxcXtzY15caG57lae1t7W5vsjQ1dzd293d3NrY19jV08rEvbeynYqXoaWMfWtqa3FuaWhmaGtjYWZucnV6foKGmLS+ws3V1NPOzc3Kyca8ubazr6qZQEdNV19haoKhq7K2uby9xMzMzs3N0dnYzry+uremj4uKgntwa2Zqa2hpamdtbmxsZ158iH+DnLi3tri/ydDW29zc3d7d2tjX19fVzsvCvLennJiWnX9nY2lvaWZiXV1XWVpdYmdudHqAiZKrtLe/xNXU1M7NzcvJyL66trOwq5pDS1RdY2VqgKStsre5u73HzMzOzMzR2dnPvLe2sa6ejoh+dmpiX2FgY2NlYGFgWWJtanmUjoqasry8vcHIz9Tb2tvc3dzY2NfX1tPOyb65sqycloyNfWFeY2NdWE5NTlFWWVpgaG50eoOTpa+xs7m/1NPUzMzMy8nIwbq1srCrmkpUWWBmZ2t+p66zt7i7vsnMzc7MzNHZ2NG8sbCxqqqfiHxxbGVhWFdSVFZfZGFdZ2hyeImLiY+ls7a4v8fM0dja2trb2tfW1dXT0crFurSupo19fnhpV1lgV1BRSkxOUltZWl1gY25/kqKprq6vsb3U09PLy8zLycnEu7ezsKybUltfYmdrbH6rrrO3ubzAy8zNzszN0djY1Lyxq6+qpaSYfHFuY1tXUlBRUFFcVlpjXm90eYSTkJWutLa+wsfN1tjZ2tvZ19fV1dPRysG3sKydgnZzclJFRU5PUFdMTU9WWV1fYWNsd46coKisrKivvtTS0srKy8rJyce8uLOvq5xXYWNkam1vh62xtLa5vcPMzc/PzM3Q1tnXvbKsqqyloJaNeGtjX15eXlZRUVdQT1dgbWZgdI6SkKmwtr/ExczT1dfZ2tjV1NPT0tHIvrOvqJN1bmVqXUdGUEtPT0dKTVJUV1pkcHyCjZadpaikqrC/1NPQycnLysnJyL65tK+rnFxlaGhrbnGYrrK1uLu+x83Nz8/Nzc/T2djCta6ppZ+TjY6KeWRcWlVTU1VQUVVKVmliVlBmdnqElqOuu8PGytDT1dfZ19TT09LUz8S7sKmjjHhxYlxkUVVcUlBKS1JUUlFgbHR5hoeHjJmanKOttMPT08zHycvKycjJwbu2sqycX2lqaWxye6avs7W5vL/Jzc7Qz83NztHX1s24r6mhjoyNjIqFfGpZUU9UUFFYVlNZbGZcXWyDfHyIlai2wMTKz9HT1NfY09LS0tTOv7Wsp6OKfHVlYWJUYGFRTU1RVFJaY2hwd4CFgISFgJOapK65y9LSysfIycrJycnCvLizrp1ia21sbnSOq6+ztbm8wMvOz9DPzc3N0NPV0cCxp52Hf4OEgHp0c3FjWVNTXVRLS05WXWqPkoN1c4SUp7O9wsjO0dHS1djU0dLT0c++sKqkmIR5a2VlbXdyW1dTV2NwcHJtcXNxcnR5dW93jpqksMPM087KxsfKysjIyca8ubSwnmhucG9wfJ2tr7O2urzCzc3P0M/NzczO0NXPzLWml4mAeXR6enF0e3RuaFtZT0xITkxGS2V1dnJweo6ms7vFyM/S0dLV19TS0tTU0Mazq6icfXFxZWp9emleZGVkZWNob3FzcGxvbGVmbHWKlqW3yMzTy8nFxsnKycfIx724tbGgcXNzcnKJpKyvs7e7v8XOzc7PzszMzM3P1M/LwqeVioB5cmpueXt8dG5lYVxQSkhKSUNMUFxmZmlwiaa1vcTIz9PR0dTX09LS0tDMxLespZF8dnFscoRvaWFmaV5gXmFmamxlYFhaYGZteIyXrMDGz9HKyMTEx8rIxsfHv7m2saF6e3d2eZinq7CzuL2/yM3Nz8/OzMvLy8/TzsnCtpuNfXdxbm1ubHBvamReYGFhW11gXWBgYWlobHiEqLW7wsjO09LR1NbT0tHQ0MrDuLCpkoV2cHZ1f3dwaWVnY2piYWFcWVxgXFteYWh5jJ+zvsbPz8rGxMPFycfGxcfAuLSwooGDfHuJo6itr7O5vsHMzMzOz83LysnKztPNyMCzqpiAd3BtaGZeX2JoY2ZmZWRdZWdnbHBubnJjZH+hs7vCyM/V09HS1NPRz87NysG7tqWMh3Z6h3dyZ2VnaWNiY1RQT05QWWJhZmRkaICZqK+6xs/PysXDwsTIyMXExsO4s6+ih4yHjJmiqa2vtbq+w83Mzc7PzMrJx8jN08/EvLCppJF6dXRuaWJcUFNbYWJdVFdiW15ufH15aFxqeZizvMPJz9TT0dLU0tHPzMfDurywkICCfXd0Xl5XUFZYVVVIREdMTVBTWF5ia2p3k52iqLbC0NDJxMPBwsbIxMTExbi0rp+MkZKan6aqrLC2u7/GzcvMz8/LyMfGx83S0cSyrKejoJSAdm5nYVhUUFJOSEpOWVpfXW99d3BiWWqGn7O8wsfM0dXS0tPR0NHNxMC+uKV8cXZ4cGZbUlNKSkRFQ0JHREhJTFZWXGNpeouXl5uiqsTQ0MjDwsDBxsjFwsLFu7SvoJCZmp6lqquusbi8vsrLy8zPzcnHxsbHy9LSxbGkoaGfk5CBcGVfWFRSTkhDQkJMR1dhaG9jVUtNX4Kbr7e9wsrR0tPU09HPzsvEv7mxmWlda4Z0W1RTTkVJRUNFQUNDRU1QUFlkc32FjJSVlJWpyNDQxcLBwMHGyMXBwcK+tLGilaChpaaorLCzuLzBy8nJy8/Mx8bFxsbI0tPIsKKbn52SkI+CcmRZVVFKRUNDRUVGTV5jXVZOQ0RXfZensLW/yc7Q0tTTzszJxsO9saN+U1RdfHFUU1tIRkZIR0ZBQURDRk5ZY219f4GNlJCNlavLz87DwsHAwMTJxsHAwL+4sqKXpKiqqqqssLO4vMbJyMnMzsrFxcTFxsfP0c6xoZ2Xlo+JgHx7dmxZTUlERUpKREVFSlJTVk5GSFd/laOstsLGztDS1NHNy8nGwr6wj29TUFBha1xOU0hERkVIRklJSk9TXWRtbnFzfYmKi5GardDNysLAv7++w8jGwb++vruypJimqaqura+xsri+x8jHyszNysXFys/Y09DR07WnnJeVhnh6eHx9cGxiW09SSkhGSUZJT0pSVU1HVH6VpbK+xMbO0NLU0c3LycfFu7aad1tZU1lZY0lKQ0VIRUVLSlBWX2BjZmZobGhmg4iNlKC8zs3EwMC+vr7Cx8bCwL29vLOkmKaprK2vsbO2ucDGxsfKzc7JxMXNxMTFz9LTxKqdmZeJcm50c3Jra2hpZl1WTk1ISUtGR0pOTE9biJyrtr/DxMvP0tPQy8nIxsG6sKSGaWthXVdjTElBRkpOU1pXV11fXVxiYVtZXGJ6ho2ZsMXLysC/v76+vMDGxsPBvr28taSXp6msrrCytbm8wsTExsvOzcjExMzCwcLK0NDQtaCakIZzb2liaWhna2deYFpdZ2JjYVZUX2pmZ22Inam0vb/DytDT08/MysfGwrmroot8fG5paG1sYVhSUFJVXFtXWlxcVFJPU1Zfa3iHk6m7xMvEvr69vb27vsbHw8G+vby3o5ilqKutsLK2ub3DxMPGy83Nx8TCzcrOxs/H0M7CsJuLhnlsa2JeXF5iZWJjW1pbXltaVlZebmpkaHiNoKu3vcPIzNDQy8TExcbAu6eeiXqFd29tbXRrX1dTUFBUYltWT05NS0xTWV9vgZSlsLjExsG8w83Qx7q+xsfEwL++vLaklKGkp6yws7W3vcLExcjLzc3GwsLBx8zIxMbMzsK3q5aHfW9oYmBfWFVSV1tXVFJaVlJXV11pZmh1c3SUoK+yvcXJztDLwcDCwr6yn5iLfoWEc2NiX15eXFpWU01JSUdJSkxNU1ZaZoGToqWtt8PFvsHBvL66xb3GycXCwL68uKiUoKOnq66ws7e9wcPGx8rOzsXCwMHAwL/CxMrLw7eoppeDb2VoZ19ZVUxJRkZKTlJRT1paZHN2a2BiYG6JnK2+xMnOz8rCwcLBv6yZjoZ4dnR4bmRbVFhQR0RBQEBDRUpLTU9WW2l/kJWeo6q1xMS8xLm3t7fFvsXIx8K9u7q4qqCioqaqra+yur/CxcfJy83OxcC/v7+/v8HDycrBtaiknJeDdXBoYFlUTURAQ0hDRUNCRVBcaF9TVFtjZHqTrr3DyM3PysPBwMC+o5aJd25dXGBlY1lOSkpBOz5AQERFRUxSWmlzeoKLk5ifo7nFxLu8wsDCv7+/xcfEvru/wL6ws7yuqK2vsri7vL/CxszLy83Fv728vb2+wMHIycSup6Sak4+LgW9eV05NSURGREFHQ0NHWmh4X1VVWWtqf56wvsbJzczGwb/AwbugmY5/c19aWVxmZV1QS0dAOz0/QktNV2VrcXF3fYSJjJiqwcXEure6wsO7uMLFxr+9wb67uqumtsLFwLy4u7u9v7/Ex8vLy8a/vLu8u7y9v8bIybGnnpaTk4qCenZoWFBJRURFQkNBQEZYYmVfXl9ieX6arbTDyMnLycPAv8HGuqumlYh/Y15ZYmRnZmdaU0VDRktQWFtbXmRlbnZ7eoKNmqvHx8O6tre3uLi7w8XEv8O9uri4qaGys7S4ubq+vsHEw8DDx8rKxr67u7y7u7q9w8jKuaqbkZCPiH5xaWlmYlxUUlNJSUhMWmJhYmZvc3+IjJ2qsr/FycrGwb28wMO4r6yqmJB3b2JdYWZrcG9dVU5SUlFTVVdWWGFlb3l+gpCgtMTEwb+7ubm7u8HIxsTCxLy5t7SopqiprrKys7e7vcHGxMLGycvGwLq7vLu7uru+yMfFrZ6XjoZ+dGlkZF5cWVVZWFNZZWpvcnVvbW53g46VnqmvvsjKzcjDwr/Aw7WsqKqflYl8cWxqdXh0cl5VTExPUU9QTElNUV9seoSNlqrDwcG6uL3Av76+xsfDw8bHura0sKifp6apsLGxtri7vsPHxcXIzMvBu7q6urm5ub3CyMe3pZ2RhXprW1ZWV1lZWF9UUVRbamxxbWppYXeFiIeQpbO9w8bGv7m7vb7DsqqjoqCflH5wamlzdGxsXFdRTElGRENFSEtUXGyAipejv8LCvr/Av8HExsjLyMbFycu3srGyppmkqKmsr7C0uLm9wMPNx8jJzMi+u7i4t7i7vbu/wsSyoJKIemRcVlFPTE5PVVFSV19kZ3BpaGBmen9/g4uXobjAxcK6tbW3uruspZqXlpmci3xsamx0bmFZUVBFRENFRUZKTFNYcIaRprvBwLu5ubq9xMfL0dDMyMfHybyusKyimKGkpqutrLO0trm9v9DLy8fHyMG8ubq9vLe0tLa/wcGwmIt2ZVxVUE9PTExNTUlOVVddYl1gaHFveH+DiJSkt7/GxMO9uLq7uqOXl4+KhIV+fndoaGVhV09KTElFRUdIS01RVlxxk6W3wL23srGwrqyptcS+vMHGxMPFwbOpp5qTn6KjpamrsLKztbjDzsrJyczO0czJxsG6trW1tbS+wLqqlnNjXVhVUk5MTVBPTk9QVVlYYGtqcWtscniCmai4vcPCwcC5t7m4oZiRjIJ6cm1qZmZubWhhVlFNSkdGSEtOU1Vdb4eer769trGuqqimn562trOytL3CwMDCu6yilJKcn6CkpKaurrCxt8jKw8DBwsTKzr+7vcG8ure2tLG8vbOfh3BhWFhUUldTUlJPUFVWZnBnYmRiZGVsdH+gsrzAw8C/v7a2ubumoJqKeXZwaWFfXmFyeXdsYFZPTUVITVVeaHN6iaS7vLewraqnoZqcsrm3sa+usrnBv7y7tbCkjZmcn6Gip6amrbK+xsO9u7y+w8fIxLCpoqKjpauurLO3uauMdnFqYVlUVVdVVVNXanl9bGBgYWJkaGt0ka25vcHCvb+/tLW8v66rqI17dW5oYVxeXmZzfYB6cmhaU1VeZm1udHuSrrq2s6qpppyUlqaurauzr62tsbnBurTBsZaJk5aZnqKipKOnuMC/vbm4uMDBvbm+rpuVmZqboKWprbCwt5p+cWhpamVkW1hjc4CCfHFiXl1eZWx2fIycrLi7wcG8vb6zsrq4rq6rn457bWhkW1tdYG56g4WEhod+bmZobHJ3gpm3tLKrpKGZj42Sqqyxra6wqaqtsLi5ssG/roOPkpecnJ2goa65u725tbW5vb+5uLSmn42Nj5KZn6Kmrq+wqol5bWhkZWx8jI+Oh4KCdG5ub292eYaOkZqsuLnBwb6+vLi2u7esqaminpmPhoR7dnZzeH+FjYyLjY+NgndubniNrLGwraCalJCKiIqhqa+0sK2fmZ+lqbezu6+qfIiOk5SXmZuqtbS2ubGysra3vr23rKaeiYmKiouUmpyirKyumHxxbHCAjpGNioaDgXxycW5xd3uEj4+Mlqq1trm6raqrqa6zt7GknJuUi3lubmBhaHJ7hYyNjIqMjY+SlJCFh6SurauclY2MhoSDhIyepK+klJCQkZuhprK+uaF3fIGKlJuirK+vsLawrKqrqKant6+qooqDgoKChYmPl5mirKeklICIkpOPioeKiYuIfXl2c3FqY2NiaXGLnai3ubmwrrCur7K0sKGSjIN9cmZhWFNSUlZld4WPj46Mj4+Vn6m2s66ml5KMiYd/fn1/g4iJi4iIiomJiZWcnKGknHKAh5CYoKSnqauvsaioqKWilpKUmJSLgX17e3yAhoiMk5ekqqq0sKOXko6Li4qGgnRgWFROUFRQUWBmd5Weq7y6urO8t7Cwsbavo52OfXFmamRYUEpISElVX2d1h5abmJiktrm9u6+jlYqFfXp4enl9gIKCgICDg4KCgIuWl5SGX32IkJqbnqSoqayjo6GhnJGOi4qKiYR8d3Z2d3p/hIaNm6u5vLi2qJuanJeLfG1eSkhFRUNERUdPXWuBnqSvvru8uLu6s7KxubCkoJSEa2FZVk9JSElIS1RnaGpqcX+VqrS2tK6xr7CxsauimI+Oh356ent6eXt7eXZ1cnmNjoJebnyKk5idoaKfm5qanJOMiYaDhISCf3l2dXRzeIaWpq+xsLGws7S2rZuOfnFuaVpJRkRGRkVJUFlkdZGfqbW+vbm7trqwsLa/t6ygl4NzaF5WUE5QT09OWGxqanB8gYyapaeoqaqopaKfoJ+go6KfnI+Ce3Zyc3R1dHNxa26CfF9ocnmBhoqMj5GVlop+fn59fHx8fXt8hY6XoaWqqaano6Kmq6erraSeloyCeXN0X1BOTU1RUFNYYnmQnKSrs7q+uLWytayuury2s6ynmoR0ZFlRUFFXWFhkd3R6hoaNmZaLhYWKkpujoZ6al5OTmZmZnJyXkYyKhYB5cWtlYGZvW2NscHd8f4WOioB3c3VycnF1dXd/jJifo6CamJeWl5uho6CXjIWIlZWVm5uMf3xrVlVWW1pda32LkJafoKeyvb+5trmxrrC6wLetr6mlnpN+alpaXGFobISJhYuUk5SKgX57enl1bWdweYWPlpOPkJCSlJGPioaDe3NtZWJfXVZDWV9kbXR3e3hjaW93go2TlpiXmp2ZlZORkJCPkZaVkIJ6c3Z7e32BjZCQmZuYlIxxbG9yenh3gZCVlZmmq7S1trGmr6WkrbO9vbStqKmloJOHgoB+enWAk5GVnp2MgHx7eHZ1b2ZdWFZVVVZbZ3J6gYiPkZGOh3luaWRhW1ZUTC0/UFNWXGFiYV1nbG51eHuAhoqMkI+Ki42Qko+EcmJYV1xianB0dnl6goyPmpiZmYNubXFzb3GAi4aQoKutsbO2rJ2VlJujrLW6urevqamnlIB8fYGDip6gnpyWgX55eHRwamVeW1lWVFRSUVFRUE9NS01PUVZcaXRyXVdTSURAIisyQUtTW21fVV5mZ2pyf4ySkpOSjod/dGdbU1FSUVJTVVhdYGVrb3FzdoGQmJecn4l3enp2eHt9jpylqrG2tratpJ2do6asuby5tbKxrKummpKVmp+moZeUlYF4dHJvZ2BdW1tcWVRTUU9NTEpIR0VBPz4+PTw9PkJJQkE2MSwcISYrMTY/e2NudWtncnZvbGNdV1BNTExMTEtMTE5PUVFTVlhYWl5jZmlscHeLjpCTmJGBgH52hZGepKaqsbe1tLGnqqSlqKy3vbixrrGysKWgo6OhoJqWlZWCd3NuaGFeXVpZWVlVU09MSUdEQj89Ojc1NDEwLy0wMSwqKCUjHxQaHiImKCtdWVpgbGBFQkRBQEFAP0BBQkNEREZHSkxQUVFRVVhYXF5hZGVobXiKi4uNlZaQjJCYnqKipKu0u7i3tLCrq62usbvAvLWurq2qo6Kgn52alZaVhXZva2ljXFhZWlpbV1BMSENAPjs4NjMxLSonJCMiIiQkIBwaGhoXBw0UGx4gIiM/S1BTYDQ4NjAxMTEzNjg5Ozw8PkFERkpNUVJSU1VWWFpeYmdrbnWIi4uRlZeXm52foKeqrLC3vLy2ubK3sa+0wL62s7Csq6mmo5+dnZiUk4J2cG5pYl9ZVlZaWVNOSUM+OjY0MC0rJyQiIB4aGBcVDQkMEBESEhAGBwcJDhUZGxwbGykvICQhISIjJCcrLS8wMzU2OTw+QUVITFBSUVJTU1ZfY2hnanCFi4yRlZaYm6Kjo6WnrLjCwLzBtruztbnEwraxsK2ooqCgn56cl5KCenFsZmBbVVZWVlJPTEVBOzUwLCklIR8dHBoZFxURCwYGBgYGBwcHBgcHBwcHBwgKDA0MDAsJCQ4UFxocHiAiIyUpKiwvMzU4PEBDR0tOTk5OUldcYWRlaG6GjZGTl5ycmJygo6ewuLy7uMC/wraztb2+urKvraeioKCcm5iYiIF4cGdeWFNQUVBOSkVBOjYwKiUhHhwaGBcVFBENCgcGBgYGBgYGBgYFBgcHBwcHBwcHCAcHBwcHBwgNEhUYGRocHR4gISQoKy8zNjs/QkVHSk1OUFVZX2JmbHeJkpKVmpmanKGnq6uzuLWvqLetpKqyu7u3tbOuqKSkpZqZlY2IgXdvZFlRTUxIR0VBPDUvKiQfHBoYFhQSDgsIBwcGBgcGBgYHBgcGBwYGBwcHBwcHBwgICAgICAgICAgICAsPExYXGBkaHB4gIygsMDQ3Oj9DRkdJTVNYX2Zqc3yHjo6cm5udpKSkq7K2uLOooJ+nrrO7vrixrq+sqqilmZWPjIl/c2xhVkxIRD87OjUvKCMgHBkXFRIOCgcHBwcHBwcHBwcHBwcHBgYGBgYHBwcHBwcHBwgHBwcHBwcICAgHBwcHCQwPEhUWGBkcHSElKS0xNjs9QURHTlVcY2tye4CGipebnZyZnaWptLW1tK2tq6mrsbu8vrauqKOjoZ6XlZCOiH1xaFxQSUE7NS8rKSYgHBoXExAMCAcHBwcHBwYGBgYGBgYGBgYGBgYFBwcHBwcHBwcHBwcHBwcHBwcHBwgICAcHBwgICgwQExYYGhwfIigtMDU5PUJFTVZeZ295f4OHjJKTlJihpq+1tLW0s7Gura6zvL2/s62no6CdnJeUkIyGem9lV0tBODAnIyEhHhoXEw4KCAcHBwcGBgYGBgYGBgYGBgYGBgYGBgUHBwcHBwcICAcICAgHBwcHBwcHBwgICAgICAcHCAcJDBAUFxkcHyIlKzA2Oj9FT1hja3d+g4aLkJOTlp6ip7W5tbW5srGvrLW+wbqup6Ojn52alZGNiYJ3bWJTQzcqJCAbGhkXEwwJCAgIBwcHBwcHBgcHBwcHBgYGBgYGBgYGBQcICAgICAgICAgICAgHBwcICAcHBwcHCAgICAgICAgICAkOExYYGh0fJiwxNj5HU11pcnp/g4eNkJKWmp6krbS4uLy3trCsub27tK2mpKGempaTj4yHfnVrXUo2KSEdGBUTDwwJCAgICAcHBwcHBwcHBwcHBwcHBgYGBgYGBgYGBwgICAgICAgICAgICAgICAcICAcIBwcHBwcHBwcHBwgHBwgJCw0QExgdICYrMzxLV2VsdHmBg4mLj5SYnaWrrbK2vsC9sqy1ube2s6uln5qYlZGNiIF5cWdXPSkhGhMOCggICAkICAcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwYHCAgICAgICAgICAgICAgICAgICAgICAgICAcHBwcHBwcHCAgICAcIDBMYHB8mM0BSXWVudXuBhoqLjpeiqK6wrrC5u7Snp7O5vbm0sKmempWSjomDeXFoXk41IBILCAcHCAkICAcHBwcHBwgIBwcHBwcHBwcHBwcHBwcHBwcHBgcICAgICAgICAgICAgICAgICAgICAcICAgIBwcHBwcHBwcHCAgICAcICAsRFRomNUpSXmNudX2BiIqOlKSmrbSysrWyqKast7q9wLmxp52YkoyJg3xxZ11TRScMCQkIBwcHCAcHBwcHBwcHCAgHBwcHBwcHBwcHBwcHBwcHBwcGBgcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwYGBgYGBwcHBwgHBwgKERksPklTWmNrcXd9goeKm6WsqqeoqrCupKuvr7G1rKSakYyHgX12bWJYTj4yEQgJCQcGBQYGBgYHBwcHBwc9SwsHBwYGBwcGBgYGBgYGBgYGBgU=";
            } else {
                this.getImageFromService(this._image);
            }
        }
    }

    private createImageFromBlob(image: Blob) {
        const reader = new FileReader();
        reader.addEventListener("load",
            () => {
                this.thumbnailToShow = reader.result;
            }, false);

        if (image) {
            reader.readAsDataURL(image);
        }
    }

    private getImageFromService(image: Image) {
        if (image === null) {
            return;
        }

        this.isImageLoading = true;
        this.dicomImageService.getThumbnailFile(image).subscribe(data => {
                this.createImageFromBlob(data);
                this.isImageLoading = false;
            },
            error => {
                this.isImageLoading = false;
                console.log(error);
            }
        );
    }

    private doMutexSelectImage(image: Image) {
        //this.selected = (this.image === image);
        //this.borderStyle = this.selected ? "2px solid #F90" : "1px solid #555";
    }

    private doAddSelectImage(image: Image) {
        //if (this.image === image) {
        //    this.selected = true;
        //}

        //this.borderStyle = this.selected ? "2px solid #F90" : "1px solid #555";
    }

    private doSelectAllImagesInSelectedGroup() {
        //this.selected = this.viewerShellData.isImageInFirstShownAndSelectedGroup(this.image);
        //this.borderStyle = this.selected ? "2px solid #F90" : "1px solid #555";
    }

    private onImageInteraction(imageInteractionData: ImageInteractionData) {
        if (!imageInteractionData.sameShellData(this.viewerShellData)) {
            return;
        }

        //switch (imageInteractionData.getType()) {
        //    case ImageInteractionEnum.SelectThumbnailInNavigator:
        //    case ImageInteractionEnum.SelectImageInGroup:
        //        this.doMutexSelectImage(imageInteractionData.getPssiImage());
        //        break;

        //    case ImageInteractionEnum.AddSelectImage:
        //        this.doAddSelectImage(imageInteractionData.getPssiImage());
        //        break;
        //}
    }

    private onImageOperation(imageOperationData: ImageOperationData) {
        //if (!imageOperationData.needResponse(this.viewerShellData.getId(), this.selected))
        //    return;

        //switch (imageOperationData.operationType) {
        //    case ImageOperationEnum.SelectAllImages:
        //        this.doAddSelectImage(this.image);
        //        break;

        //    case ImageOperationEnum.SelectAllImagesInSelectedGroup:
        //        this.doSelectAllImagesInSelectedGroup();
        //        break;
        //}
    }
}
