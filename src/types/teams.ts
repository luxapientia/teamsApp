import exp from "constants";

export type Member = {
  name: string;
  title: string;
  location: string;
  role: string;
}

export type TeamOwner = {
  _id?: string;
  MicrosoftId: string;
  name: string;
  email: string;
  role: string;
}

export type Team = {
  _id: string,
  name: string;
  members: Member[];
  owner?: TeamOwner | null;
}

export type CreateTeamPayload = {
  tenantId: string;
  teamName: string;
}

