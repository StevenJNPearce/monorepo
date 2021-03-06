export enum HighRollerStage {
  PRE_GAME,
  COMMITTING_HASH,
  COMMITTING_NUM,
  REVEALING,
  DONE
}

export type HighRollerAppState = {
  stage: HighRollerStage;
  salt: string;
  commitHash: string;
  playerFirstNumber: number;
  playerSecondNumber: number;
};

export enum ActionType {
  START_GAME,
  COMMIT_TO_HASH,
  COMMIT_TO_NUM,
  REVEAL
}

export type Action = {
  actionType: ActionType;
  number: number;
  actionHash: string;
};

export enum GameState {
  Play,
  Lost,
  Won,
  Tie
}

export enum PlayerType {
  Black = "black",
  White = "white"
}
