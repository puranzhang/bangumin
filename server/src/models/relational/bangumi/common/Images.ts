export class Images {

  /** example: http://lain.bgm.tv/pic/cover/l/c2/0a/12_24O6L.jpg */
  large?: string;
  /** example: http://lain.bgm.tv/pic/cover/c/c2/0a/12_24O6L.jpg */
  common?: string;
  /** example: http://lain.bgm.tv/pic/cover/m/c2/0a/12_24O6L.jpg */
  medium?: string;
  /** example: http://lain.bgm.tv/pic/cover/s/c2/0a/12_24O6L.jpg */
  small?: string;
  /** example: http://lain.bgm.tv/pic/cover/g/c2/0a/12_24O6L.jpg */
  grid?: string;

  constructor(defaultImage = 'https://bgm.tv/img/no_icon_subject.png') {
    this.large = defaultImage;
    this.common = defaultImage;
    this.medium = defaultImage;
    this.small = defaultImage;
    this.grid = defaultImage;
  }

}
