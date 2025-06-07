import { formatDistanceToNow, format } from 'date-fns';

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  // If the message is from today, show time only
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  
  // If the message is from yesterday, show "Yesterday at time"
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  
  // Otherwise show date and time
  return format(date, 'MMM d, yyyy h:mm a');
};

export const formatLastMessageTime = (timestamp: string): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  // If the message is from today, show time only
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  
  // If the message is recent (within the last week)
  return formatDistanceToNow(date, { addSuffix: true });
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};