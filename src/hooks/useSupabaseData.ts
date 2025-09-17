// hooks/useSupabaseData.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useSupabaseData<T>(
  table: string,
  query: string = '*',
  options: { 
    filter?: string, 
    value?: any, 
    limit?: number,
    cacheKey?: string 
  } = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar cache local primeiro
      const cacheKey = options.cacheKey || `${table}-${query}-${JSON.stringify(options)}`
      const cachedData = localStorage.getItem(cacheKey)
      
      if (cachedData) {
        setData(JSON.parse(cachedData) as T[])
      }

      let supabaseQuery = supabase.from(table).select(query)

      if (options.filter && options.value) {
        supabaseQuery = supabaseQuery.eq(options.filter, options.value)
      }

      if (options.limit) {
        supabaseQuery = supabaseQuery.limit(options.limit)
      }

      const { data: fetchedData, error: supabaseError } = await supabaseQuery

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      if (fetchedData) {
        setData(fetchedData as T[])
        // Salvar no cache por 5 minutos
        localStorage.setItem(cacheKey, JSON.stringify(fetchedData))
        localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())
      }
    } catch (err) {
      console.error(`Erro ao buscar dados de ${table}:`, err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Limpar cache antigo (mais de 5 minutos)
    const cleanupOldCache = () => {
      const now = Date.now()
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.endsWith('-timestamp')) {
          const timestamp = parseInt(localStorage.getItem(key) || '0')
          if (now - timestamp > 5 * 60 * 1000) {
            const dataKey = key.replace('-timestamp', '')
            localStorage.removeItem(dataKey)
            localStorage.removeItem(key)
          }
        }
      }
    }

    cleanupOldCache()
  }, [table, query, JSON.stringify(options)])

  return { data, loading, error, refetch: fetchData }
}