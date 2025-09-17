// components/layout/AppLayout.tsx
import { ReactNode, useEffect, useState } from "react"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Bell, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { LawFirmService, Profile } from "@/services/lawFirmService"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: { label: string; href?: string }[]
  title?: string
}

export function AppLayout({
  children,
  breadcrumbs = [],
  title = "",
}: AppLayoutProps) {
  const { user, signOut } = useAuth()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await LawFirmService.getProfile(user.id)
          setUserProfile(profile)
        } catch (error) {
          console.error("Erro ao carregar perfil:", error)
        }
      }
    }

    fetchUserProfile()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }

    return "U"
  }

  return (
    <SidebarProvider>
      {/* Sidebar + Conteúdo */}
      <AppSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Conteúdo principal */}
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-card sticky top-0 z-30">
          {/* Botão que abre/fecha apenas no mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Removemos o SidebarTrigger para desktop já que o sidebar é fixo */}
          
          <Separator orientation="vertical" className="mr-2 h-4" />

          {/* Breadcrumbs - escondido em mobile quando há muitos itens */}
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título simplificado para mobile */}
          {isMobile && breadcrumbs.length > 0 && (
            <div className="sm:hidden text-sm font-medium truncate max-w-[140px]">
              {breadcrumbs[breadcrumbs.length - 1].label}
            </div>
          )}

          {/* Ações do usuário */}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userProfile?.avatar_url}
                      alt={
                        userProfile?.full_name || user?.email || "Usuário"
                      }
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userProfile?.avatar_url}
                      alt={
                        userProfile?.full_name || user?.email || "Usuário"
                      }
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {userProfile?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {!isMobile && (
              <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
              </div>
            )}
            <div className="space-y-4 md:space-y-6">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}