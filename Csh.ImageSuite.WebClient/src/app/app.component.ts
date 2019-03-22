import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from "@angular/core";

import { WorklistShellComponent } from "./components/worklist-shell/worklist-shell.component"
import { ViewerShellComponent } from "./components/viewer-shell/viewer-shell.component"

import { ShellNavigatorService } from "./services/shell-navigator.service";
import { Subscription } from "rxjs";

import { ViewerShellData } from "./models/viewer-shell-data";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
    title = "AngularPacsDemo";
    @ViewChild("shellContainer", { read: ViewContainerRef })
    container;
    createComponents: Array<any> = [];

    subscriptionShellCreated: Subscription;
    subscriptionShellDeleted: Subscription;

    constructor(private resolver: ComponentFactoryResolver, private shellNavigatorService: ShellNavigatorService) {
        this.subscriptionShellCreated = shellNavigatorService.shellCreated$.subscribe(
            viewerShellData => {
                this.createViewerShell(viewerShellData);
            });


        this.subscriptionShellDeleted = shellNavigatorService.shellDeleted$.subscribe(
            viewerShellData => {
                this.deleteViewerShell(viewerShellData);
            }
        );
    }

    ngOnInit() {
        this.createWorklistShell();
        this.initConerstone();
    }

    createWorklistShell() {
        const componentFactory = this.resolver.resolveComponentFactory(WorklistShellComponent);
        const componentRef = this.container.createComponent(componentFactory);
        componentRef.instance.hideMe = false;
    }

    createViewerShell(viewerShellData: ViewerShellData) {
        const componentFactory = this.resolver.resolveComponentFactory(ViewerShellComponent);
        const componentRef = this.container.createComponent(componentFactory);
        componentRef.instance.hideMe = false;
        componentRef.instance.viewerShellData = viewerShellData;

        this.createComponents.push(componentRef);
    }

    deleteViewerShell(viewerShellData: ViewerShellData) {
        const studyCom =
            this.createComponents.filter(
                (value, index, array) => value.instance.viewerShellData.getId() === viewerShellData.getId());
        if (studyCom.length !== 0) {
            studyCom[0].destroy();
        }

        this.createComponents =
            this.createComponents.filter(
                (value, index, array) => value.instance.viewerShellData.getId() !== viewerShellData.getId());
    }

    private initConerstone() {
        cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
        cornerstoneTools.external.cornerstone = cornerstone;

        //var baseUrl = dicom.baseUrl;
        const config = {
            webWorkerPath: "./assets/script/cornerstoneWADOImageLoaderWebWorker.js",
            taskConfiguration: {
                'decodeTask': {
                    codecsPath: "./cornerstoneWADOImageLoaderCodecs.js"
                }
            }
        };
        cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
    }
}
