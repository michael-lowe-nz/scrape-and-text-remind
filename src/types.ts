export type Contacts = {
  Teams: Array<Team>;
};

export type Team = {
  Name: string;
  Players: Array<{ Name: string; Number: string }>;
};
