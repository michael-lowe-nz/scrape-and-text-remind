export type Contacts = {
  Teams: Array<Team>;
};

export type Team = {
  Name: string;
  Players: Array<Player>;
  ScheduleURL: string;
};

export type Game = {
  dateString: string;
  time: string;
  court: string;
  teamAgainst: string;
};

export type Player = {
  Name: string;
  Number: string;
  IsAdmin?: boolean;
};
