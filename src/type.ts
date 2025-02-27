export interface Question {
  id: string;
  question: string;
  created_at: string;
}

export interface Chat extends Question {
  answer: string;
}

export interface Conversation {
  id: string;
  chats: Chat[];
  updated_at: string;
  created_at: string;
  pinned: boolean;
}
