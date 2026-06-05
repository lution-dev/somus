import { useMemo } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { isPaidForMonth, getEffectiveAmount } from '../lib/calculations'
import { useShallow } from 'zustand/react/shallow'
import { currentYM } from '../lib/months'

export interface ProjectionDay {
  day: number
  date: string
  saldoReal?: number | null
  saldoProj?: number | null
  eventos: { name: string; amount: number }[]
}

export function useFluxoProjection(month?: string) {
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
    const TODAY = currentYM()
    const yearMonth = month ?? TODAY
    const isPastMonth = yearMonth < TODAY

    // For current month: split at today. For past months: all days are "historical".
    const todayDay = isPastMonth
      ? new Date(parseInt(yearMonth.split('-')[0]), parseInt(yearMonth.split('-')[1]), 0).getDate() // last day of month
      : now.getDate()

    const lastDayOfMonth = new Date(
      parseInt(yearMonth.split('-')[0]),
      parseInt(yearMonth.split('-')[1]),
      0,
    ).getDate()

    const currentTotalBalance = divisoes.reduce((sum, cx) => sum + cx.balance, 0)

    // Entradas e variáveis do mês selecionado
    const monthEntradas = entradas.filter((e) => e.date.startsWith(yearMonth))
    const monthVariaveis = saidasVariaveis.filter((s) => s.date.startsWith(yearMonth))

    // Custos pendentes (Fixos + Variáveis agendadas) — only relevant for current month
    const pendingFixas = isPastMonth ? [] : saidasFixas.filter((f) => !isPaidForMonth(f, yearMonth))
    const pendingVariaveis = isPastMonth ? [] : saidasVariaveis.filter(v => v.status === 'pending' && v.date.startsWith(yearMonth))
    const pendingEntradas = isPastMonth ? [] : entradas.filter(e => e.status === 'pending' && e.date.startsWith(yearMonth))

    const days: ProjectionDay[] = []

    // 1. Reconstrução do Histórico (1 até hoje/fim do mês)
    let runningBalanceHistory = currentTotalBalance
    const historicalData: Record<number, number> = {}
    historicalData[todayDay] = currentTotalBalance

    for (let d = todayDay - 1; d >= 1; d--) {
      const dayStr = `${yearMonth}-${(d + 1).toString().padStart(2, '0')}`
      const dayEntradas = monthEntradas.filter((e) => e.date === dayStr).reduce((sum, e) => sum + e.amount, 0)
      const dayVariaveis = monthVariaveis
        .filter((v) => v.date === dayStr && v.status !== 'pending')
        .reduce((sum, v) => sum + v.amount, 0)
      
      runningBalanceHistory = runningBalanceHistory - dayEntradas + dayVariaveis
      historicalData[d] = runningBalanceHistory
    }

    // 2. Projeção (só para mês atual)
    let runningBalanceProj = currentTotalBalance
    const projectionData: Record<number, number> = {}
    if (!isPastMonth) {
      projectionData[todayDay] = currentTotalBalance

      for (let d = todayDay + 1; d <= lastDayOfMonth; d++) {
        const dayFixas = pendingFixas
          .filter((f) => f.dueDay === d)
          .reduce((sum, f) => sum + getEffectiveAmount(f, yearMonth), 0)
        
        const dayVariaveis = pendingVariaveis
          .filter(v => parseInt(v.date.split('-')[2]) === d)
          .reduce((sum, v) => sum + v.amount, 0)

        const dayEntradasPending = pendingEntradas
          .filter(e => parseInt(e.date.split('-')[2]) === d)
          .reduce((sum, e) => sum + e.amount, 0)
        
        runningBalanceProj += dayEntradasPending
        runningBalanceProj -= (dayFixas + dayVariaveis)
        projectionData[d] = runningBalanceProj
      }
    }

    // Montar array final
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const dateStr = `${yearMonth}-${d.toString().padStart(2, '0')}`
      const eventos = [
        ...pendingFixas.filter((f) => f.dueDay === d).map((f) => ({ name: f.name, amount: getEffectiveAmount(f, yearMonth) })),
        ...pendingVariaveis.filter(v => parseInt(v.date.split('-')[2]) === d).map(v => ({ name: v.description, amount: v.amount })),
        ...pendingEntradas.filter(e => parseInt(e.date.split('-')[2]) === d).map(e => ({ name: `+${e.sourceName}`, amount: e.amount }))
      ]

      days.push({
        day: d,
        date: dateStr,
        saldoReal: d <= todayDay ? historicalData[d] : null,
        saldoProj: !isPastMonth && d >= todayDay ? projectionData[d] : null,
        eventos,
      })
    }

    return {
      days,
      todayDay,
      currentTotalBalance,
      saldoProjetadoFim: isPastMonth
        ? (historicalData[1] ?? currentTotalBalance)
        : (projectionData[lastDayOfMonth] ?? currentTotalBalance),
    }
  }, [divisoes, entradas, saidasVariaveis, saidasFixas, month])

  return projection
}

