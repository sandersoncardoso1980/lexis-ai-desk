// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Atualiza o estado inicial
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    // Listener para mudanças no tamanho da tela
    const listener = () => setMatches(media.matches)
    
    // Adiciona o listener
    media.addEventListener('change', listener)
    
    // Remove o listener na limpeza
    return () => media.removeEventListener('change', listener)
  }, [query, matches])

  return matches
}