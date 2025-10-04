# ScrewYouIkea 🛠️

A modern web application that transforms traditional furniture assembly manuals into interactive, step-by-step 3D guides with voice assistance.

## Overview

ScrewYouIkea revolutionizes the furniture assembly experience by converting static instruction manuals into dynamic, interactive guides. Upload your IKEA (or other furniture) assembly instructions and get an enhanced digital experience with 3D visualizations, voice assistance, and step-by-step navigation.

## Features

### 📤 Manual Upload & Processing
- **Drag & Drop Interface**: Easy file upload with support for PDF and image formats
- **Intelligent Processing**: AI-powered analysis to extract steps, parts, and assembly information
- **Progress Tracking**: Real-time processing status with detailed progress indicators

### 📚 Manual Library
- **Personal Collection**: Organize all your processed manuals in one place
- **Smart Search**: Find manuals by name, furniture type, or manufacturer
- **Status Management**: Track processing states (completed, processing, failed)
- **Thumbnail Previews**: Visual identification of your manuals

### 🎯 Interactive 3D Viewer
- **3D Visualization**: Interactive 3D models showing assembly progress
- **Step-by-Step Navigation**: Navigate through each assembly step with clear visual guidance
- **Parts Identification**: Visual highlighting of required parts for each step
- **Fullscreen Mode**: Immersive viewing experience

### 🗣️ Voice Assistant
- **Voice Queries**: Ask questions about specific assembly steps
- **Text-to-Speech**: Audio responses to guide you through the process
- **Hands-Free Operation**: Perfect for when your hands are busy with assembly

### 📱 Responsive Design
- **Mobile Friendly**: Works seamlessly across desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with shadcn/ui components
- **Dark/Light Theme**: Comfortable viewing in any environment

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Radix UI** - Accessible UI primitives

### Key Libraries
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling with validation
- **Framer Motion** - Smooth animations (via class-variance-authority)
- **Web Speech API** - Voice synthesis for assistant features

## Getting Started

### Prerequisites
- Node.js 18+ 
- Next.js

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/donaragalstyan/ScrewYouIkea.git
   cd ScrewYouIkea/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

```bash
next dev      # Start development server
next build    # Build for production
next start    # Start production server
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── library/           # Manual library page
│   ├── processing/[id]/   # Processing status page
│   ├── viewer/[id]/       # 3D manual viewer
│   └── page.tsx          # Home page with upload
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── canvas-3d.tsx     # 3D visualization component
│   ├── voice-assistant-input.tsx
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── public/               # Static assets
└── styles/               # Global styles
```

## Key Pages & Features

### 🏠 Home Page (`/`)
- Manual upload interface with drag & drop
- Search existing manual library
- Quick access to recent manuals

### 📖 Library Page (`/library`)
- Grid view of all processed manuals
- Filter by status (completed, processing, failed)
- Manual management and organization

### 👁️ Viewer Page (`/viewer/[id]`)
- Interactive 3D assembly guide
- Step-by-step navigation
- Parts panel with visual identification
- Voice assistant integration

### ⚙️ Processing Page (`/processing/[id]`)
- Real-time processing status
- Progress tracking with detailed stages
- Error handling and retry options

## Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component patterns
- Ensure responsive design
- Add appropriate error handling
- Write meaningful commit messages

## Roadmap

- [ ] **Backend Integration**: Connect with AI processing backend
- [ ] **User Authentication**: Personal accounts and manual sharing
- [ ] **Collaborative Features**: Share manuals with friends/family  
- [ ] **AR Integration**: Augmented reality overlay for assembly
- [ ] **Multiple Manufacturers**: Support for more furniture brands
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Offline Mode**: Download manuals for offline use

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/donaragalstyan/ScrewYouIkea/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## Acknowledgments

- Built with ❤️ using Next.js and modern web technologies
- UI components powered by shadcn/ui and Radix UI
- Icons by Lucide React
- Inspired by the frustration of confusing furniture assembly manuals

---

**ScrewYouIkea** - Making furniture assembly actually enjoyable! 🪑✨
