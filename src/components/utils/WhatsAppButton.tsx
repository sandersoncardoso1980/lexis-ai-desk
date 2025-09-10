import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  size?: "sm" | "lg" | "icon" | "default"
  variant?: "default" | "outline" | "ghost" | "destructive"
}

export function WhatsAppButton({
  phoneNumber,
  message = "",
  size = "sm",
  variant = "outline"
}: WhatsAppButtonProps) {
  if (!phoneNumber) return null

  // remove caracteres não numéricos
  const cleanedNumber = phoneNumber.replace(/\D/g, "")

  const whatsappLink = `https://wa.me/${cleanedNumber}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`

  return (
    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
      <Button size={size} variant={variant} className="text-green-600 hover:text-green-700">
        {size === "icon" ? (
          <MessageCircle className="h-5 w-5" />
        ) : (
          <>
            <MessageCircle className="h-4 w-4 mr-1" />
            WhatsApp
          </>
        )}
      </Button>
    </a>
  )
}
