export type teamsColumn = {
  field: string;
  headeName: string;
  width: number;
}

export type Member = {
  name: string;
  title: string;
  location: string;
  role: string;
}

export type Team = {
  id: string,
  name: string;
  members: Member[];
}

