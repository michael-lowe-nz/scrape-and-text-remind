export type Contacts = {
  Teams: Array<Team>;
};

export type Team = {
  Name: string;
  Players: Array<{ Name: string; Number: string }>;
};

export type Game = {
  dateString: string;
  time: string;
  court: string;
  teamAgainst: string;
};
