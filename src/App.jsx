import { useState, useEffect } from 'react'
import Header from './components/Header'
import GarcomView from './views/GarcomView'
import CozinhaView from './views/CozinhaView'
import CaixaView from './views/CaixaView'
import { supabase } from './lib/supabase'
import { Toaster } from 'react-hot-toast'

function App() {
  const [role, setRole] = useState('garcom') // 'garcom', 'cozinha', 'caixa'
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    // Fetch initial pedidos
    const fetchPedidos = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`*, itens_pedido(*)`)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Erro ao buscar pedidos:', error)
      } else {
        setPedidos(data || [])
      }
    }

    fetchPedidos()

    // Realtime subscription for pedidos and itens_pedido
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (_payload) => {
          fetchPedidos() // Quick way to sync for MVP, better would be to update state directly
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itens_pedido' },
        (_payload) => {
          fetchPedidos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-center" toastOptions={{ className: 'font-medium' }} />
      <Header role={role} setRole={setRole} pedidos={pedidos} />
      
      <main className="flex-1 overflow-auto">
        {role === 'garcom' && <GarcomView pedidos={pedidos} />}
        {role === 'cozinha' && <CozinhaView pedidos={pedidos} />}
        {role === 'caixa' && <CaixaView pedidos={pedidos} />}
      </main>
    </div>
  )
}

export default App
