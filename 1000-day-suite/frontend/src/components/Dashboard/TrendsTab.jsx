import { useEffect, useRef } from 'react'
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale,
  Filler, Tooltip, Legend
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

const DATES = ['Jan 29','Jan 31','Feb 2','Feb 4','Feb 6','Feb 8','Feb 10','Feb 12','Feb 14','Feb 16','Feb 18','Feb 20','Feb 22','Feb 24','Feb 26','Feb 28']

function BPChart({ vitals }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    chartRef.current?.destroy()

    // Use real vitals data if available, else mock
    const sys = vitals?.length >= 4
      ? vitals.slice(0,16).reverse().map(v => v.bp_systolic)
      : [118,120,122,119,125,128,126,130,128,132,135,131,129,128,130,128]
    const dia = vitals?.length >= 4
      ? vitals.slice(0,16).reverse().map(v => v.bp_diastolic)
      : [76,78,79,77,82,84,83,86,84,87,88,85,83,84,85,84]
    const labels = DATES.slice(0, sys.length)

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label:'Systolic', data:sys, borderColor:'#E07A94', backgroundColor:'rgba(224,122,148,0.08)', tension:0.4, fill:true, pointRadius:4 },
          { label:'Diastolic', data:dia, borderColor:'#9B7ED9', backgroundColor:'rgba(155,126,217,0.08)', tension:0.4, fill:true, pointRadius:4 }
        ]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } }, scales:{ y:{ min:60, max:160 } } }
    })
    return () => chartRef.current?.destroy()
  }, [vitals])

  return <canvas ref={ref} />
}

function RiskChart({ vitals }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    chartRef.current?.destroy()

    const scores = vitals?.length >= 4
      ? vitals.slice(0,16).reverse().map(v => v.risk_score)
      : [20,22,25,30,28,35,38,42,40,45,48,44,42,43,44,42]
    const labels = DATES.slice(0, scores.length)

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label:'Risk Score',
          data: scores,
          borderColor:'#E8963A',
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0,0,0,240)
            g.addColorStop(0,'rgba(232,150,58,0.3)')
            g.addColorStop(1,'rgba(232,150,58,0)')
            return g
          },
          tension:0.4, fill:true, pointRadius:4
        }]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } }, scales:{ y:{ min:0, max:100 } } }
    })
    return () => chartRef.current?.destroy()
  }, [vitals])

  return <canvas ref={ref} />
}

function SugarChart({ vitals }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    chartRef.current?.destroy()

    const sugar = vitals?.length >= 4
      ? vitals.slice(0,16).reverse().map(v => v.blood_sugar).filter(Boolean)
      : [88,90,93,91,95,92,96,95,93,97,95,98,96,95,94,95]
    const labels = DATES.slice(0, sugar.length)

    chartRef.current = new Chart(ref.current, {
      type:'line',
      data:{
        labels,
        datasets:[{ label:'Blood Sugar (mg/dL)', data:sugar, borderColor:'#5DAE7A', backgroundColor:'rgba(93,174,122,0.1)', tension:0.4, fill:true }]
      },
      options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ min:60, max:150 } } }
    })
    return () => chartRef.current?.destroy()
  }, [vitals])

  return <canvas ref={ref} />
}

export default function TrendsTab({ vitals }) {
  return (
    <div className="tab-content active">
      <div className="dashboard-grid">
        <div className="dash-card" style={{gridColumn:'span 2'}}>
          <div className="dash-card-header">
            <span className="dash-card-title">BP Trend — Last 30 Days</span>
            <span className="dash-card-badge badge-watch">Monitoring {vitals?.length > 0 ? '🔴 Live' : ''}</span>
          </div>
          <div className="chart-container" style={{height:240}}>
            <BPChart vitals={vitals} />
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Risk Trajectory</span>
            <span className="dash-card-badge badge-watch">Medium</span>
          </div>
          <div className="chart-container" style={{height:240}}>
            <RiskChart vitals={vitals} />
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Blood Sugar 30-Day</span>
            <span className="dash-card-badge badge-normal">Normal</span>
          </div>
          <div className="chart-container" style={{height:240}}>
            <SugarChart vitals={vitals} />
          </div>
        </div>
      </div>
    </div>
  )
}
