import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { Shortcut } from '../../../models/shortcut';
import { Subscription }   from 'rxjs';
import { Study } from '../../../models/pssi';
import { WorklistService } from '../../../services/worklist.service';
import {
    MatDatepickerModule,
    MatInputModule,
    MatDatepickerInputEvent
} from '@angular/material';
import { FormControl } from '@angular/forms';

// Import DatePicker format
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as moment from 'moment';

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'LL',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
    styleUrls: ['./worklist.component.css'],
    providers: [
        // i18n
        { provide: MAT_DATE_LOCALE, useValue: 'zh-CN' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})

export class WorklistComponent implements OnInit {
  
  color = '#primary';
  mode = 'indeterminate';
  value = 50;

    shortcutSelected: Subscription;

    events: string[] = [];

    //dateFrom = new FormControl(moment());
    //dateTo = new FormControl(moment());

    fromMinDate = new Date(1900, 1, 1);
    fromMaxDate = new Date();

    toMinDate = new Date();
    toMaxDate = new Date();

    fromDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.toMinDate = event.value;
    }

    toDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
        this.fromMaxDate = event.value;
    }

  constructor(public worklistService: WorklistService) {
    this.shortcutSelected = this.worklistService.shortcutSelected$.subscribe(
      shortcut => this.onShortcutSelected(shortcut));

  }

  onShortcutSelected(shortcut: Shortcut) {
    this.worklistService.shortcut = shortcut;
  }

  worklistColumns: string[] = [
    "",
    "Patient ID",
    "Patient Name",
    "Gender",
    "BirthDate",
    "AccessionNo",
    "Modality",
    "StudyDate",
    "StudyTime",
    "SeriesCount",
    "ImageCount",
    "StudyID"
  ];

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    //alert('aa');
  }



  ngOnInit() {
      this.worklistService.onQueryStudies();
      this.worklistService.onQueryShortcuts();
  }

  onStudyChecked(study: Study) {
    study.checked = !study.checked;
  }

  onAllStudyChecked(event) {
    this.worklistService.studies.forEach(study => study.checked = event.target.checked);
  }

  doShowStudy(study: Study) {
    study.checked = true;
    this.worklistService.onShowSingleStudy(study);
  }
}
