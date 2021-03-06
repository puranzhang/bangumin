import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SidenavService} from '../../shared/services/sidenav.service';
import {AuthenticationService} from '../../shared/services/auth.service';
import {filter, switchMap, take, tap} from 'rxjs/operators';
import {StorageService} from '../../shared/services/storage.service';
import {BangumiUser} from '../../shared/models/BangumiUser';
import {concat, Subject} from 'rxjs';
import {BangumiUserService} from '../../shared/services/bangumi/bangumi-user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceWidth} from '../../shared/enums/device-width.enum';
import {LayoutService} from '../../shared/services/layout/layout.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  bangumiUser: BangumiUser;
  isAuthenticated = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input()
  currentDeviceWidth: DeviceWidth;


  constructor(private sidenavService: SidenavService,
              private storageService: StorageService,
              private bangumiUserService: BangumiUserService,
              private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    // initialize a dummy user
    this.bangumiUser = new BangumiUser();
    this.updateUserInfo();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   ** we retrieve relevant user info here, we'll subscribe to first two user info service, and they must be non-null
   ** why two? because
   ** 1. the first value is from localStorage (to ensure speed)
   ** 2. the second value is from http service (slower, and user might change their avatar on computer A, after
   ** that they expect to see new avatar on computer B after refreshing)
   ** in more complicated cases, takeUntil should be used
   */

  updateUserInfo() {
    const userInfoServiceArray = [this.storageService.getBangumiUser(), this.bangumiUserService.getUserSettings()];


    concat.apply(this, userInfoServiceArray)
      .pipe(
        take(userInfoServiceArray.length),
        filter(bangumiUser => !!bangumiUser),
      )
      .subscribe(bangumiUser => {
        this.authenticationService.userSubject.next(bangumiUser);
      });


    // subscribe to change in userSubject
    this.authenticationService.userSubject
      .pipe(
        filter(bangumiUser => !!bangumiUser),
        tap(
          bangumiUser => {
            this.bangumiUser = bangumiUser;
          }
        ),
        switchMap(
          bangumiUser => this.authenticationService.isAuthenticated()
        ),
      ).subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  toggleSidenav() {
    this.sidenavService
      .toggle()
      .then(() => {
      });

  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authenticationService.logout();
  }

  get LayoutService() {
    return LayoutService;
  }
}
