# TalkWave - Real-time Chat Application

A modern real-time chat application built with React, TypeScript, and Firebase, featuring a beautiful sky blue and white design aesthetic.

## 🏗️ Architecture Overview

This application follows a clean architecture pattern with clear separation of concerns:

### **Presentation Layer** (`/src/components`)
- **Layout Components**: Navigation, Sidebar
- **Chat Components**: ChatWindow, MessageBubble
- **Auth Components**: AuthScreen
- **Common Components**: LoadingSpinner, ErrorBoundary

### **Domain Layer** (`/src/hooks`, `/src/types`)
- **Custom Hooks**: useAuth, useChat
- **Type Definitions**: User, Message, Conversation, FriendRequest
- **Business Logic**: State management and data flow

### **Data Layer** (`/src/services`)
- **Firebase Services**: Authentication, Firestore operations
- **API Abstractions**: Clean interfaces for external services

## 🎨 Design System

### **Color Palette**
- Primary: Sky Blue (#87CEEB) with extended palette
- Secondary: Neutral grays for text and backgrounds
- Accent: Success, warning, and error states

### **Typography**
- Clean, modern font hierarchy
- Proper line spacing (150% body, 120% headings)
- Maximum 3 font weights

### **Components**
- Glass-morphism effects with backdrop blur
- Smooth animations and micro-interactions
- Responsive design with mobile-first approach
- 8px spacing system for consistency

## 🔥 Firebase Integration

### **Authentication**
- Google Sign-in only
- User session management
- Profile data synchronization

### **Firestore Database Schema**

#### Collections Structure:
```
users/
├── {userId}/
    ├── uid: string
    ├── email: string
    ├── displayName: string
    ├── photoURL?: string
    ├── isOnline: boolean
    ├── lastSeen: timestamp
    └── createdAt: timestamp

friendRequests/
├── {requestId}/
    ├── fromUserId: string
    ├── toUserId: string
    ├── status: 'pending' | 'accepted' | 'rejected'
    └── createdAt: timestamp

conversations/
├── {conversationId}/
    ├── participants: string[]
    ├── lastMessageAt: timestamp
    ├── unreadCount: {userId: number}
    └── createdAt: timestamp

messages/
├── {messageId}/
    ├── conversationId: string
    ├── senderId: string
    ├── content: string
    ├── type: 'text' | 'image' | 'file'
    ├── readBy: string[]
    └── createdAt: timestamp
```

## 🚀 Features

### **Core Features**
- Real-time messaging with live updates
- User authentication via Google
- Friend request system
- Online/offline status indicators
- Message read receipts
- Responsive chat interface

### **UI/UX Features**
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Mobile-responsive design
- Accessible color contrasts
- Professional loading states
- Error handling with user feedback

## 🛠️ Development Setup

### **Prerequisites**
- Node.js 18+
- Firebase project with Authentication and Firestore enabled

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Firebase Configuration**
1. Create a Firebase project
2. Enable Google Authentication
3. Set up Firestore database
4. Update `src/constants/firebase.ts` with your config

### **Environment Setup**
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── chat/            # Chat-related components
│   ├── common/          # Reusable components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── services/            # External service integrations
├── types/               # TypeScript type definitions
├── constants/           # Application constants
└── utils/               # Utility functions
```

## 🔧 Technical Implementation

### **State Management**
- React hooks for local state
- Custom hooks for business logic
- Context API for global state (when needed)

### **Real-time Updates**
- Firestore real-time listeners
- Optimistic UI updates
- Connection state management

### **Performance Optimizations**
- Component memoization
- Lazy loading for routes
- Image optimization
- Bundle splitting

## 🎯 Next Steps

### **Phase 1: Core Implementation**
- [ ] Implement Firebase authentication
- [ ] Set up Firestore real-time listeners
- [ ] Complete message sending/receiving
- [ ] Add friend request functionality

### **Phase 2: Enhanced Features**
- [ ] Image/file sharing
- [ ] Group chat support
- [ ] Push notifications
- [ ] Voice/video calling integration

### **Phase 3: Advanced Features**
- [ ] Message encryption
- [ ] Advanced search
- [ ] Custom themes
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Follow the established architecture patterns
2. Maintain consistent code style
3. Add proper TypeScript types
4. Include comprehensive tests
5. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details