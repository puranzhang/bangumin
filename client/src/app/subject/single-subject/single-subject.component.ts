import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BangumiSubjectService} from '../../shared/services/bangumi/bangumi-subject.service';
import {catchError, filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {SubjectLarge} from '../../shared/models/subject/subject-large';
import {BangumiCollectionService} from '../../shared/services/bangumi/bangumi-collection.service';
import {CollectionResponse} from '../../shared/models/collection/collection-response';
import {TitleService} from '../../shared/services/page/title.service';
import {ReviewDialogData} from '../../shared/models/review/reviewDialogData';
import {DialogConfig, ResponsiveDialogService} from '../../shared/services/dialog/responsive-dialog.service';
import {SubjectType} from '../../shared/enums/subject-type.enum';
import {Subject} from 'rxjs/index';
import {LayoutService} from '../../shared/services/layout/layout.service';
import {SnackBarService} from '../../shared/services/snackBar/snack-bar.service';
import {CollectionRequest} from '../../shared/models/collection/collection-request';

import {DeviceWidth} from '../../shared/enums/device-width.enum';
import {ReviewDialogComponent} from '../review-dialog/review-dialog.component';

@Component({
  selector: 'app-single-subject',
  templateUrl: './single-subject.component.html',
  styleUrls: ['./single-subject.component.scss']
})
export class SingleSubjectComponent implements OnInit, OnDestroy {

  @Input()
  subject: SubjectLarge;

  @Input()
  collectionResponse: CollectionResponse;

  @Input()
  currentRating = 0;

  currentDeviceWidth: DeviceWidth;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private bangumiSubjectService: BangumiSubjectService,
              private bangumiCollectionService: BangumiCollectionService,
              private titleService: TitleService,
              private reviewDialogService: ResponsiveDialogService,
              private layoutService: LayoutService,
              private snackBarService: SnackBarService
  ) {
  }

  get SubjectType() {
    return SubjectType;
  }

  get LayoutService() {
    return LayoutService;
  }


  ngOnInit() {
    this.getDeviceWidth();

  }

  onRatingChanged(rating) {
    const collectionRequest = new CollectionRequest(this.collectionResponse.status.type,
      undefined, undefined, rating, this.collectionResponse.privacy);

    this.bangumiCollectionService.upsertSubjectCollectionStatus(this.subject.id.toString(), collectionRequest).pipe(
      catchError(error => {
        this.snackBarService.openSimpleSnackBar('common.snakBar.error.submit.general')
          .pipe(take(1)).subscribe(() => {
        });
        return error;
      }),
      takeUntil(this.ngUnsubscribe),
    ).subscribe(res => {
      this.currentRating = rating;
    });
  }

  /*
  Note on autoFocus: It is an accessibility feature.
  The dialog automatically focuses the first focus-able element.
  This can be set as a configurable option if needed
  */
  openDialog(): void {

    // construct review dialog data
    const reviewDialogData: ReviewDialogData = {
      subjectId: this.subject.id,
      rating: this.currentRating,
      tags: this.collectionResponse.tags,
      statusType: this.collectionResponse.status.type,
      comment: this.collectionResponse.comment,
      privacy: this.collectionResponse.privacy,
      type: this.subject.type,
      name: this.subject.name
    };

    const dialogConfig: DialogConfig<ReviewDialogData> = {
      matDialogConfig: {
        data: reviewDialogData,
      },
      sizeConfig: {
        onLtSmScreen: null
      }
    };


    // open the dialog
    const dialogRefObservable = this.reviewDialogService.openDialog(ReviewDialogComponent, dialogConfig);

    dialogRefObservable
      .pipe(
        switchMap(dialogRef => dialogRef.afterClosed()),
        filter(result => result !== undefined && result['rating'] !== undefined),
      )
      .subscribe(result => {
        this.currentRating = result['rating'];
        this.collectionResponse = new CollectionResponse().deserialize(result);
      });


  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceWidth() {
    this.layoutService.deviceWidth
      .pipe(
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe(deviceWidth => {
        this.currentDeviceWidth = deviceWidth;
      });
  }


}
