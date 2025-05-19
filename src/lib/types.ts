export interface Feedback {
  _id?: string; 
  rating: number;
  text: string;
  createdAt: string | Date;
}

export interface Topic {
  _id: string;
  userId: string;
  name: string;
  slug: string;
  feedback: Feedback[];
  createdAt: string | Date;
}