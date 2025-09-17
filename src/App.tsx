// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import { Cases } from "@/pages/Cases"
import Clients from "@/pages/Clients"
import Dashboard from "@/pages/Dashboard"
import { LoginForm } from './components/auth/LoginForm'
import {AppLayout} from "./components/layout/AppLayout"
import Documents from './pages/Documents'
import Settings from './pages/Settings'
import Tasks from './pages/Tasks'
import AIAssistant from './pages/AIAssistant'
import Calendar from './pages/Calendar'
import Reports from './pages/Reports'
import { CaseDetailPage } from './pages/CaseDetail'

// Componente protegido de rota
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
   console.log('ProtectedRoute - user:', user, 'loading:', loading)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente principal
function AppContent() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          
          <Route path="/" element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/clients" element={
            <ProtectedRoute>
                <Clients />
            </ProtectedRoute>
          } />
          
          <Route path="/cases" element={
            <ProtectedRoute>
                <Cases />
            </ProtectedRoute>
          } />
           <Route path="/cases/:id" element={
  <ProtectedRoute>
    <CaseDetailPage />
  </ProtectedRoute>
} />
          <Route path="/documents" element={
            <ProtectedRoute>
                <Documents />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
                <Calendar />
            </ProtectedRoute>
          } />
          <Route path="/ai-assistant" element={
            <ProtectedRoute>
                <AIAssistant />
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
                <Tasks />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
                <Reports />
            </ProtectedRoute>
          } />
           <Route path="/settings" element={
            <ProtectedRoute>
                <Settings/>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      <Toaster />
    </TooltipProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App