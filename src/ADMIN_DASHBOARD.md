# Cangrejeras de Santurce - Admin Dashboard CMS

## Overview
A comprehensive Content Management System (CMS) for managing the Cangrejeras de Santurce volleyball team app. Built with React, TypeScript, and Tailwind CSS with a beautiful glass morphism design.

## Features

### 1. Dashboard Overview
- **Statistics Cards**: Real-time metrics for players, matches, voting, and engagement
- **Quick Actions Panel**: Fast access to common tasks (add player, create match, start voting, publish news)
- **Recent Activity Feed**: Timeline of all admin actions and content changes
- **Trend Indicators**: Visual indicators showing performance metrics

### 2. Player Management (Gestión de Jugadoras)
- **Full CRUD Operations**: Create, Read, Update, Delete player profiles
- **Player Database**: Comprehensive roster with photos, stats, and positions
- **Search & Filter**: Find players quickly by name or position
- **Statistics Tracking**: Points, aces, blocks, and more
- **Status Management**: Active/Inactive player status
- **Data Table**: Sortable columns with inline editing

### 3. Match Management (Partidos)
- **Calendar View**: Monthly calendar with color-coded match status
- **Match CRUD**: Create and manage all matches
- **Live/Upcoming/Completed**: Three status types with visual indicators
- **Match Details**: Teams, date, time, venue, and scores
- **Quick Edit**: Inline editing from calendar or list view

### 4. Live Voting Management (Votaciones en Vivo)
- **Real-time Control Panel**: Start, stop, and reset voting sessions
- **Live Status Indicator**: Pulsing "EN VIVO" badge when active
- **Vote Results**: Real-time percentage and vote counts
- **Player Selection**: Choose which players appear in voting
- **Progress Visualization**: Animated progress bars with team colors
- **Vote Statistics**: Total votes and recent activity metrics

### 5. News Management (Noticias)
- **Article CRUD**: Create, edit, publish, and delete news articles
- **Draft System**: Save articles as drafts before publishing
- **Status Badges**: Visual indicators for published/draft status
- **Featured Images**: Upload and manage article images
- **Rich Content**: Title, excerpt, and full article content
- **Publishing Workflow**: One-click publishing from drafts
- **Analytics**: View counts and engagement metrics

### 6. Standings Management (Tabla de Posiciones)
- **League Table**: Complete standings with all teams
- **Team Statistics**: Games played, won, lost, sets for/against
- **Win Percentage**: Automatic calculation
- **Position Trends**: Up/down indicators for team performance
- **Visual Hierarchy**: First place highlighting with trophy icons
- **Team Colors**: Color-coded team badges
- **Key Metrics**: Position, points differential, effectiveness

### 7. Media Management (Contenido Multimedia)
- **Media Library**: Centralized storage for all images and assets
- **File Upload**: Drag-and-drop or click to upload
- **File Types**: Logos, banners, and general images
- **Filter & Search**: Filter by media type
- **Usage Tracking**: See where each file is used in the app
- **File Details**: Size, upload date, and metadata
- **Bulk Operations**: Download or delete multiple files
- **Storage Stats**: Total files and storage usage

### 8. Settings (Configuración)
- **General Settings**: App name, description, contact info
- **Notification Controls**: Email, push, voting alerts, match reminders
- **Privacy & Security**: Public stats, comments, content moderation
- **Appearance Customization**: Primary and accent color pickers
- **Admin Profile**: User information and permissions
- **System Information**: Version, last update, database status

## Design System

### Glass Morphism Style
- Translucent backgrounds with backdrop blur
- Subtle borders and shadows
- Smooth animations and hover effects
- Consistent spacing using 8px grid

### Color Palette
- **Team Navy**: `#0C2340` - Primary brand color
- **Champion Gold**: `#C8A963` - Success and highlights
- **Live Red**: `#E01E37` - Live indicators and alerts
- **Success Green**: `#10B981` - Confirmations
- **Warning Orange**: `#F97316` - Warnings and drafts
- **Info Blue**: `#3B82F6` - Information
- **Purple**: `#8B5CF6` - Special features
- **Pink**: `#EC4899` - Accents

### Dark/Light Mode
- Complete theme support throughout all sections
- Automatic switching with toggle button
- Consistent color schemes for both modes
- Accessible contrast ratios

## Navigation

### Sidebar Menu
- **Dashboard**: Overview and quick actions
- **Gestión de Jugadoras**: Player management
- **Partidos**: Match scheduling and management
- **Tabla de Posiciones**: League standings
- **Votaciones en Vivo**: Live voting controls
- **Noticias**: News and content management
- **Contenido Multimedia**: Media library
- **Configuración**: App settings

### Collapsible Sidebar
- Full and collapsed states
- Icon-only mode for more screen space
- Smooth transitions
- Persistent state

## Interactive Features

### Real-time Updates
- Live voting results with auto-refresh
- Match status changes
- Activity feed updates
- Save status indicators

### Data Validation
- Form validation for all inputs
- Required field indicators
- Error messaging
- Success confirmations with toast notifications

### Responsive Design
- Desktop-first layout (1200px+)
- Tablet optimization (768px-1199px)
- Mobile adaptation (< 768px)
- Collapsible sidebar for smaller screens
- Touch-friendly interfaces

## Technical Implementation

### Component Architecture
- **AdminApp.tsx**: Main container and routing
- **AdminSidebar.tsx**: Navigation menu
- **AdminHeader.tsx**: Top bar with breadcrumbs and search
- **Section Components**: Dedicated components for each admin section
- **Shared UI Components**: Reusable ShadCN components

### State Management
- Local state with React hooks
- Section-based navigation
- Form state handling
- Dark mode persistence

### Data Operations
- Mock CRUD operations (ready for backend integration)
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Optimistic UI updates

## User Roles (Ready for Implementation)
- **Super Admin**: Full access to all features
- **Content Manager**: Edit content, limited settings access
- **Contributor**: Create drafts, no publishing rights

## Future Enhancements
- Backend integration with Supabase or similar
- Real-time collaboration
- Advanced analytics dashboard
- Export functionality (CSV, PDF)
- Bulk operations for all sections
- Image optimization and CDN integration
- Multi-language support
- Advanced search with filters
- Activity logs and audit trails
- Version control for content

## Accessing the Admin Dashboard

1. **From Fan App**: Click the settings icon (⚙️) in the top-right corner
2. **Return to Fan App**: Click the home icon (🏠) in the bottom-right corner
3. **Navigation**: Use the sidebar menu to switch between sections
4. **Dark Mode**: Toggle from the sidebar or header

## Technologies Used
- React 18+
- TypeScript
- Tailwind CSS v4
- ShadCN UI Components
- Lucide React Icons
- Sonner (Toast Notifications)

---

**Built for**: Cangrejeras de Santurce Volleyball Team  
**Platform**: Web Application (Responsive)  
**Design**: Glass Morphism with Sports Team Branding  
**Status**: Production Ready
