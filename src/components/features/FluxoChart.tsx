import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useFluxoProjection } from '../../hooks/useFluxoProjection'
import type { ProjectionDay } from '../../hooks/useFluxoProjection'
import { formatCurrency, formatCurrencyCompact } from '../../lib/calculations'
import { useIsMobile } from '../../hooks/useIsMobile'
import { TrendingUp, AlertCircle, Info } from 'lucide-react'

export function FluxoChart() {
  const { days, todayDay, currentTotalBalance, saldoProjetadoFim } = useFluxoProjection()
  const isMobile = useIsMobile()

  const chartHeight = isMobile ? 160 : 220

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ProjectionDay
      const isHistorical = data.day <= todayDay
      const saldo = isHistorical ? data.saldoReal : data.saldoProj

      return (
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>
            {isHistorical ? `Dia ${data.day} (Histórico)` : `Dia ${data.day} (Projeção)`}
          </p>
          <p style={{ fontSize: 16, fontWeight: 800, color: isHistorical ? 'var(--color-accent-primary)' : 'var(--color-warning)', margin: 0 }}>
            {formatCurrency(saldo ?? 0)}
          </p>
          {data.eventos.length > 0 && (
            <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>
              {data.eventos.map((ev, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{ev.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-danger)' }}>-{formatCurrency(ev.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: '20px',
      padding: isMobile ? '16px 0' : '20px',
      marginBottom: 20,
      overflow: 'hidden',
    }}>
      <div style={{ padding: isMobile ? '0 16px' : 0, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
            Projeção de Saldo
          </h3>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
            Maio 2026
          </p>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-primary)' }} />
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Realizado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px dashed var(--color-warning)', background: 'transparent' }} />
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Projetado</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={days} margin={{ top: 10, right: isMobile ? 10 : 30, left: isMobile ? -20 : 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
              interval={isMobile ? 4 : 2}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
              tickFormatter={(v) => formatCurrencyCompact(v).replace('R$', '')}
              width={isMobile ? 0 : 60}
              hide={isMobile}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Real Area */}
            <Area
              type="monotone"
              dataKey="saldoReal"
              stroke="var(--color-accent-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorReal)"
              connectNulls={false}
              animationDuration={1000}
            />

            {/* Projected Area */}
            <Area
              type="monotone"
              dataKey="saldoProj"
              stroke="var(--color-warning)"
              strokeWidth={2}
              strokeDasharray="6 4"
              fillOpacity={1}
              fill="url(#colorProj)"
              connectNulls={true}
              animationDuration={1000}
              animationBegin={500}
            />

            {/* Reference Line for Today */}
            <ReferenceLine 
              x={todayDay} 
              stroke="rgba(255,255,255,0.2)" 
              strokeDasharray="3 3"
              label={{ 
                position: 'top', 
                value: 'HOJE', 
                fill: 'var(--color-text-tertiary)', 
                fontSize: 9, 
                fontWeight: 700 
              }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        marginTop: 20, 
        padding: isMobile ? '0 16px' : 0,
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', 
        gap: 12 
      }}>
        <SummaryCard 
          label="Saldo Atual" 
          value={currentTotalBalance} 
          color="var(--color-accent-primary)"
          icon={<TrendingUp size={14} />}
        />
        <SummaryCard 
          label="Projeção Fim do Mês" 
          value={saldoProjetadoFim} 
          color="var(--color-warning)"
          icon={<AlertCircle size={14} />}
          isProjected
        />
        {!isMobile && (
          <SummaryCard 
            label="Total a Pagar" 
            value={currentTotalBalance - saldoProjetadoFim} 
            color="var(--color-danger)"
            icon={<Info size={14} />}
            isNegative
          />
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color, icon, isProjected, isNegative }: { 
  label: string; 
  value: number; 
  color: string; 
  icon: React.ReactNode;
  isProjected?: boolean;
  isNegative?: boolean;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      padding: '12px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-tertiary)' }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {label}
        </span>
      </div>
      <p style={{ 
        fontSize: 16, 
        fontWeight: 700, 
        color: 'var(--color-text-primary)', 
        margin: 0,
        display: 'flex',
        alignItems: 'baseline',
        gap: 4
      }}>
        {isProjected && <span style={{ color, fontSize: 12 }}>~</span>}
        {isNegative && <span style={{ color: 'var(--color-danger)', fontSize: 12 }}>-</span>}
        {formatCurrency(Math.abs(value))}
      </p>
    </div>
  )
}
