import { Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { MessageBoxComponent } from "../components/common/message-box/message-box.component";
import { Observable } from "rxjs";
import { MessageBoxType, MessageBoxContent } from "../models/messageBox";

@Injectable({
    providedIn: "root"
})
export class DialogService {

    constructor(private dialog: MatDialog) {}

    showMessageBox(messageBoxContent: MessageBoxContent): Observable<any> {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = messageBoxContent.messageType === MessageBoxType.Input;
        dialogConfig.data = messageBoxContent;

        const dialogRef = this.dialog.open(MessageBoxComponent, dialogConfig);
        return dialogRef.afterClosed();
    }

    showDialog(dialogComponent: any, dialogData: any): Observable<any> {
        const dialogRef = this.dialog.open(dialogComponent,
            {
                autoFocus: true,
                data: dialogData
            });

        return dialogRef.afterClosed();
    }
}
