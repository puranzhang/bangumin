import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {SidenavService} from '../../shared/services/sidenav.service';
import {AuthenticationService} from '../../shared/services/auth.service';
import {filter, first} from 'rxjs/operators';
import {DeviceWidth} from '../../shared/enums/device-width.enum';
import {environment} from '../../../environments/environment';
import {BuildVersion} from '../../../environments/build-version';
import {BangumiUser} from '../../shared/models/BangumiUser';

@Component({
  selector: 'app-side-nav-content',
  templateUrl: './side-nav-content.component.html',
  styleUrls: ['./side-nav-content.component.scss']
})
export class SideNavContentComponent implements OnInit {

  bangumiUser: BangumiUser;
  userId: number;

  @Input()
  currentDeviceWidth: DeviceWidth;

  @ViewChild('sidenav') public sidenav: MatSidenav;

  constructor(private sidenavService: SidenavService,
              private authenticationService: AuthenticationService) {


  }


  ngOnInit() {

    this.sidenavService
      .setSidenav(this.sidenav);
    this.authenticationService.userSubject.pipe(
      filter(res => res !== null),
      first()
    ).subscribe(res => {
      // TODO: fix digest cycle error
      Promise.resolve(null).then(() => {
        this.bangumiUser = res;
        this.userId = res.id;
      });
    });


  }

  get Environment() {
    return environment;
  }

  get DeviceWidth() {
    return DeviceWidth;
  }

  // display git build version on the page
  displayBuildVersion(): string {
    if (environment.displayBuildVersion) {
      return BuildVersion.version + '/' + BuildVersion.branch + '/' + BuildVersion.revision;
    } else {
      return '';
    }

  }

  logout() {
    this.sidenav.close();
    this.authenticationService.logout();
  }

}
