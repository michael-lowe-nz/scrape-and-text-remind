export type Contacts = {
  Teams: Array<Team>;
};

export type Team = {
  Name: string;
  Players: Array<{ Name: string; Number: string }>;
  ScheduleURL: string;
};

export type Game = {
  dateString: string;
  time: string;
  court: string;
  teamAgainst: string;
};
