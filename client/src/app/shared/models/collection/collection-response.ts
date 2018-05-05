import {Serializable} from '../Serializable';
import {CollectionStatus} from './collection-status';
import {BangumiUser} from '../BangumiUser';

export class CollectionResponse  implements Serializable<CollectionResponse> {

  status?: CollectionStatus;
  /**
   * 评分
   * format: int32
   */
  rating?: number;
  /** 评论 */
  comment?: string;
  private?: number;
  /** 标签 */
  tag?: string[];
  /**
   * 完成话数
   * format: int32
   */
  epStatus?: number;
  /**
   * 上次更新时间
   * format: int32
   */
  lassTouch?: number;

  user?: BangumiUser;

  constructor() {
    this.status = new CollectionStatus();
    this.rating = 0;
    this.comment = '';
    this.private = 0;
    this.tag = [''];
    this.epStatus = 0;
    this.lassTouch = 0;
    this.user = new BangumiUser();
  }

  deserialize(input): CollectionResponse {
    this.status = input.status === undefined ? new CollectionStatus() : new CollectionStatus().deserialize(input.status);
    this.rating = input.rating === undefined ? 0 : input.rating;
    this.comment = input.comment === undefined ? '' : input.comment;
    this.private = input.private === undefined ? 0 : input.private;
    this.tag = input.tag === undefined ? [''] : input.tag;
    this.epStatus = input.ep_status === undefined ? 0 : input.ep_status;
    this.lassTouch = input.lasttouch === undefined ? 0 : input.lasttouch;
    this.user = input.user === undefined ? new BangumiUser() : input.user;
    return this;
  }

  isUntouched(id) {
    return []
  }
}
