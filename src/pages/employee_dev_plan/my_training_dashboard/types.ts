export interface Training {
  id: string;
  name: string;
  description: string;
  date: string;
}

export interface TrainingBoardProps {
  title: string;
  trainings: Training[];
  backgroundColor: string;
  chipColor: string;
}

export interface TrainingCardProps {
  training: Training;
  chipColor: string;
} 