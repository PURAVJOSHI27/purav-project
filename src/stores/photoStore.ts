import { create } from 'zustand';
import { format } from 'date-fns';

export type Photo = {
  id: string;
  url: string;
  title: string;
  description?: string;
  uploadedBy: number;
  uploadedAt: string;
  likes: number;
  comments: Comment[];
};

export type Comment = {
  id: string;
  userId: number;
  text: string;
  createdAt: string;
};

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

interface PhotoState {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  addPhoto: (photo: Omit<Photo, 'id' | 'uploadedAt' | 'likes' | 'comments'>) => void;
  likePhoto: (photoId: string) => void;
  addComment: (photoId: string, userId: number, text: string) => void;
  deletePhoto: (photoId: string) => void;
  initPhotos: () => void;
}

// Some sample photos to start with
const samplePhotos: Photo[] = [
  {
    id: 'photo1',
    url: 'https://images.pexels.com/photos/1447092/pexels-photo-1447092.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Sunset at the beach',
    description: 'Remember our trip last summer?',
    uploadedBy: 1,
    uploadedAt: '2023-06-15T18:30:00Z',
    likes: 1,
    comments: [
      {
        id: 'comment1',
        userId: 2,
        text: 'This was such a beautiful day!',
        createdAt: '2023-06-15T19:00:00Z'
      }
    ]
  },
  {
    id: 'photo2',
    url: 'https://images.pexels.com/photos/2174656/pexels-photo-2174656.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Dinner date',
    description: 'That amazing Italian restaurant',
    uploadedBy: 2,
    uploadedAt: '2023-07-20T20:15:00Z',
    likes: 1,
    comments: [
      {
        id: 'comment2',
        userId: 1,
        text: 'We should go back there soon!',
        createdAt: '2023-07-20T21:00:00Z'
      }
    ]
  },
  {
    id: 'photo3',
    url: 'https://images.pexels.com/photos/1262302/pexels-photo-1262302.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Hiking adventure',
    description: 'That challenging trail we conquered',
    uploadedBy: 1,
    uploadedAt: '2023-08-05T14:20:00Z',
    likes: 1,
    comments: []
  },
  {
    id: 'photo4',
    url: 'https://images.pexels.com/photos/1714455/pexels-photo-1714455.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Coffee date',
    description: 'Our favorite cafe',
    uploadedBy: 2,
    uploadedAt: '2023-09-12T09:45:00Z',
    likes: 1,
    comments: [
      {
        id: 'comment3',
        userId: 1,
        text: 'Their lattes are the best!',
        createdAt: '2023-09-12T10:30:00Z'
      }
    ]
  },
  {
    id: 'photo5',
    url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Concert night',
    description: 'Front row seats!',
    uploadedBy: 1,
    uploadedAt: '2023-10-30T21:00:00Z',
    likes: 1,
    comments: []
  }
];

export const usePhotoStore = create<PhotoState>((set, get) => ({
  photos: [],
  loading: false,
  error: null,
  
  initPhotos: () => {
    // Check if we have photos in localStorage first
    const storedPhotos = localStorage.getItem('photos');
    if (storedPhotos) {
      set({ photos: JSON.parse(storedPhotos) });
    } else {
      // Otherwise use our sample photos
      set({ photos: samplePhotos });
      localStorage.setItem('photos', JSON.stringify(samplePhotos));
    }
  },
  
  addPhoto: (photoData) => {
    const newPhoto: Photo = {
      ...photoData,
      id: generateId(),
      uploadedAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    };
    
    const updatedPhotos = [newPhoto, ...get().photos];
    localStorage.setItem('photos', JSON.stringify(updatedPhotos));
    set({ photos: updatedPhotos });
  },
  
  likePhoto: (photoId) => {
    const updatedPhotos = get().photos.map(photo => 
      photo.id === photoId ? { ...photo, likes: photo.likes + 1 } : photo
    );
    
    localStorage.setItem('photos', JSON.stringify(updatedPhotos));
    set({ photos: updatedPhotos });
  },
  
  addComment: (photoId, userId, text) => {
    const newComment: Comment = {
      id: generateId(),
      userId,
      text,
      createdAt: new Date().toISOString(),
    };
    
    const updatedPhotos = get().photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, comments: [...photo.comments, newComment] } 
        : photo
    );
    
    localStorage.setItem('photos', JSON.stringify(updatedPhotos));
    set({ photos: updatedPhotos });
  },
  
  deletePhoto: (photoId) => {
    const updatedPhotos = get().photos.filter(photo => photo.id !== photoId);
    localStorage.setItem('photos', JSON.stringify(updatedPhotos));
    set({ photos: updatedPhotos });
  },
}));