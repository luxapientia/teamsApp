import exp from "constants";

export type Member = {
  name: string;
  title: string;
  location: string;
  role: string;
}

export type Team = {
  _id: string,
  name: string;
  members: Member[];
}

export type CreateTeamPayload = {
  tenantId: string;
  teamName: string;
}

