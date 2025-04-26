export enum Comprehension {
  /** Not opened yet */
  Unread = 0,
  /** Skimmed / browsed */
  Browsed = 1,
  /** Partially understood */
  Partial = 2,
  /** Fully understood */
  Mastered = 3,
}

export enum ActionType {
  Skip = 0,
  Partial = 1,
  Done = 2,
  Extract = 3,
}

export interface ActionSkip {
  type: ActionType.Skip;
}
export interface ActionPartial {
  type: ActionType.Partial;
  comp: Comprehension;
}
export interface ActionDone {
  type: ActionType.Done;
}

export type ReadingAction = ActionSkip | ActionPartial | ActionDone;
