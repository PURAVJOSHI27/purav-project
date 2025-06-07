export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  theme_preference?: string;
  notification_settings?: NotificationSettings;
}

export interface NotificationSettings {
  sound_enabled: boolean;
  desktop_notifications: boolean;
  email_notifications: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_encrypted: boolean;
  attachment_url?: string;
  attachment_type?: string;
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  participants: User[];
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export interface ConversationState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  error: string | null;
}

export interface MessagesState {
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
}