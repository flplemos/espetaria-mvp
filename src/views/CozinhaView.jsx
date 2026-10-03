import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Clock, Flame, Check, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// Helper para calcular tempo decorrido
const formatarTempo = (dataStr) => {
  const diff = Math.floor((new Date() - new Date(dataStr)) / 60000)
  if (diff < 1) return 'Agora'
  return `${diff} min`
}

// Beep sintético
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, 200)
  } catch (e) {
    console.error('Audio falhou', e)
  }
}

export default function CozinhaView({ pedidos }) {
  const [, setTick] = useState(0)
  const prevPedidosCount = useRef(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000) // atualiza cada min
    return () => clearInterval(timer)
  }, [])

  const pendentes = pedidos.filter(p => p.status === 'pendente')
  
  useEffect(() => {
    if (pendentes.length > prevPedidosCount.current) {
      playBeep()
    }
    prevPedidosCount.current = pendentes.length
  }, [pendentes.length])

  const atualizarStatus = async (id, novoStatus) => {
    await supabase.from('pedidos').update({ status: novoStatus }).eq('id', id)
    if (novoStatus === 'preparando') {
      toast.success('Pedido foi para a brasa! 🔥')
    } else if (novoStatus === 'pronto') {
      toast.success('Pedido marcado como pronto! ✅')
    }
  }

  const pedidosPendentes = pendentes
  const pedidosPreparando = pedidos.filter(p => p.status === 'preparando')

  const renderCard = (pedido, isPendente) => (
    <div key={pedido.id} className={`bg-white rounded-xl shadow-md border-2 overflow-hidden flex flex-col ${isPendente ? 'border-red-500 animate-pulse-slow' : 'border-brand-orange'}`}>
      <div className={`p-3 text-white flex justify-between items-center ${isPendente ? 'bg-red-500' : 'bg-brand-orange'}`}>
        <div>
          <h3 className="font-bold text-xl">{pedido.mesa}</h3>
          {pedido.cliente && <span className="text-sm opacity-90">{pedido.cliente}</span>}
        </div>
        <div className="flex items-center gap-1 font-semibold bg-black/20 px-2 py-1 rounded">
          <Clock size={16} />
          {formatarTempo(pedido.created_at)}
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <ul className="space-y-3">
          {pedido.itens_pedido?.map(item => (
            <li key={item.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <div className="flex items-start gap-2 text-lg">
                <span className="font-bold text-slate-800 bg-slate-100 px-2 rounded">{item.quantidade}x</span>
                <span className="font-medium text-slate-700">{item.nome_produto}</span>
              </div>
              {item.observacao && (
                <div className="mt-2 ml-8 text-red-700 text-sm font-bold flex items-start gap-2 bg-red-100 p-2.5 rounded-lg border border-red-200 shadow-sm leading-snug">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> 
                  <span className="whitespace-pre-wrap">{item.observacao}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100">
        {isPendente ? (
          <button 
            onClick={() => atualizarStatus(pedido.id, 'preparando')}
            className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Flame size={20} /> Colocar na Brasa
          </button>
        ) : (
          <button 
            onClick={() => atualizarStatus(pedido.id, 'pronto')}
            className="w-full py-3 bg-brand-green hover:bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Check size={20} /> Pronto! Chamar Garçom
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-full flex flex-col md:flex-row gap-6 overflow-hidden">
      
      {/* Coluna Pendentes */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-100 rounded-2xl p-4">
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-lg">{pedidosPendentes.length}</span>
          Novos Pedidos
        </h2>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {pedidosPendentes.length === 0 ? (
            <p className="text-slate-400 text-center py-10 font-medium">Nenhum pedido novo.</p>
          ) : (
            pedidosPendentes.map(p => renderCard(p, true))
          )}
        </div>
      </div>

      {/* Coluna Preparando */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-100 rounded-2xl p-4">
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-brand-orange text-white w-8 h-8 flex items-center justify-center rounded-lg">{pedidosPreparando.length}</span>
          Na Brasa
        </h2>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {pedidosPreparando.length === 0 ? (
            <p className="text-slate-400 text-center py-10 font-medium">Nenhuma carne na brasa.</p>
          ) : (
            pedidosPreparando.map(p => renderCard(p, false))
          )}
        </div>
      </div>

    </div>
  )
}
