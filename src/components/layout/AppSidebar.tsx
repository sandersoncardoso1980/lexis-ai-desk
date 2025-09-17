// components/layout/AppSidebar.tsx
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Settings,
  X,
  Book,
  Files,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useAuth } from "@/hooks/useAuth"

interface AppSidebarProps {
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export function AppSidebar({ isOpen, setIsOpen }: AppSidebarProps) {
  const location = useLocation()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()

  const links = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/clients", label: "Clientes", icon: Users },
    { to: "/cases", label: "Casos", icon: Briefcase },
    { to: "/documents", label: "Documentos", icon: FileText },
    { to: "/calendar", label: "Agenda", icon: Calendar },
    {to: "/ai-assistant", label: "Harvey IA", icon:Users},
    { to: "/tasks", label: "Tarefas", icon: Book },
    {to: "/reports", label: "Relatórios", icon:Files},
    
    
    
    { to: "/settings", label: "Configurações", icon: Settings },
  ]

  const handleLinkClick = () => {
    if (isMobile && setIsOpen) {
      setIsOpen(false)
    }
  }

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Cabeçalho do sidebar no mobile */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-all",
              "hover:bg-accent hover:text-accent-foreground",
              location.pathname === to
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      
      {/* Footer do sidebar com informações do usuário em mobile */}
      {isMobile && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              {getUserInitials()}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">{user?.email || "Usuário"}</p>
              <p className="text-xs text-muted-foreground truncate">Conta</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Sidebar fixa no desktop - SEMPRE visível */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Drawer apenas no mobile */}
      {isMobile && (
        <Sheet 
          open={isOpen} 
          onOpenChange={setIsOpen}
        >
          <SheetContent 
            side="left" 
            className="p-0 w-64 h-full flex flex-col"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}