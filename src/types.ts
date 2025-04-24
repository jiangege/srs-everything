import { Card as FsrsCard } from "./fsrs/types.js";
import { Card as IrCard } from "./ir/types.js";

export enum CardType {
  FSRS = "fsrs",
  IR = "ir",
}

export type CardTypeValue = (typeof CardType)[keyof typeof CardType];

export type Card = (FsrsCard | IrCard) & {
  type: CardType;
};
