import { useMemo } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { isPaidForMonth, getEffectiveAmount } from '../lib/calculations'
import { useShallow } from 'zustand/react/shallow'

export interface ProjectionDay {
  day: number
  date: string
  saldoReal?: number | null
  saldoProj?: number | null
  eventos: { name: string; amount: number }[]
}

export function useFluxoProjection() {
  const { divisoes, entradas, saidasVariaveis, saidasFixas } = useAppStore(
    useShallow((s) => ({
      divisoes: s.divisoes,
      entradas: s.entradas,
      saidasVariaveis: s.saidasVariaveis,
      saidasFixas: s.saidasFixas,
    }))
  )

  const projection = useMemo(() => {
    const now = new Date()
    const todayDay = now.getDate()
    const yearMonth = now.toISOString().slice(0, 7)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

    const currentTotalBalance = divisoes.reduce((sum, cx) => sum + cx.balance, 0)

    // Entradas e variáveis do mês atual
    const monthEntradas = entradas.filter((e) => e.date.startsWith(yearMonth))
    const monthVariaveis = saidasVariaveis.filter((s) => s.date.startsWith(yearMonth))

    // Fixas pendentes
    const pendingFixas = saidasFixas.filter((f) => !isPaidForMonth(f, yearMonth))

    const days: ProjectionDay[] = []

    // 1. Reconstrução do Histórico (1 até hoje)
    // saldo(hoje) = currentTotalBalance
    // saldo(d-1) = saldo(d) - entradas(d) + variaveis(d)
    
    let runningBalanceHistory = currentTotalBalance
    const historicalData: Record<number, number> = {}
    historicalData[todayDay] = currentTotalBalance

    // Percorre de hoje para trás para reconstruir o que era o saldo
    for (let d = todayDay - 1; d >= 1; d--) {
      const dayStr = `${yearMonth}-${(d + 1).toString().padStart(2, '0')}`
      const dayEntradas = monthEntradas.filter((e) => e.date === dayStr).reduce((sum, e) => sum + e.amount, 0)
      const dayVariaveis = monthVariaveis.filter((v) => v.date === dayStr).reduce((sum, v) => sum + v.amount, 0)
      
      runningBalanceHistory = runningBalanceHistory - dayEntradas + dayVariaveis
      historicalData[d] = runningBalanceHistory
    }

    // 2. Projeção (hoje até fim do mês)
    let runningBalanceProj = currentTotalBalance
    const projectionData: Record<number, number> = {}
    projectionData[todayDay] = currentTotalBalance

    for (let d = todayDay + 1; d <= lastDayOfMonth; d++) {
      const dayFixas = pendingFixas
        .filter((f) => f.dueDay === d)
        .reduce((sum, f) => sum + getEffectiveAmount(f, yearMonth), 0)
      
      runningBalanceProj -= dayFixas
      projectionData[d] = runningBalanceProj
    }

    // Montar array final
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const dateStr = `${yearMonth}-${d.toString().padStart(2, '0')}`
      const eventos = pendingFixas
        .filter((f) => f.dueDay === d)
        .map((f) => ({ name: f.name, amount: getEffectiveAmount(f, yearMonth) }))

      days.push({
        day: d,
        date: dateStr,
        saldoReal: d <= todayDay ? historicalData[d] : null,
        saldoProj: d >= todayDay ? projectionData[d] : null,
        eventos,
      })
    }

    return {
      days,
      todayDay,
      currentTotalBalance,
      saldoProjetadoFim: projectionData[lastDayOfMonth] ?? currentTotalBalance,
    }
  }, [divisoes, entradas, saidasVariaveis, saidasFixas])

  return projection
}
