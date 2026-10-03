import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { DollarSign, Plus, Receipt, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CaixaView({ pedidos }) {
  const [showModal, setShowModal] = useState(false)
  const [novoProd, setNovoProd] = useState({ nome: '', categoria: 'espetos', preco: '' })

  const contasAbertas = pedidos.filter(p => p.status !== 'pago')

  // Agrupar pedidos pela mesma mesa
  const contasPorMesa = contasAbertas.reduce((acc, pedido) => {
    const key = pedido.mesa.trim().toUpperCase() // Normalizar nome da mesa
    if (!acc[key]) {
      acc[key] = {
        mesa: pedido.mesa,
        cliente: pedido.cliente,
        pedidosIds: [],
        itens: [],
        temPendenteOuPreparando: false,
        temPronto: false
      }
    }
    
    acc[key].pedidosIds.push(pedido.id)
    if (pedido.itens_pedido) {
      acc[key].itens = [...acc[key].itens, ...pedido.itens_pedido]
    }
    
    if (!acc[key].cliente && pedido.cliente) {
      acc[key].cliente = pedido.cliente
    }

    if (pedido.status === 'pendente' || pedido.status === 'preparando') {
      acc[key].temPendenteOuPreparando = true
    }
    if (pedido.status === 'pronto') {
      acc[key].temPronto = true
    }

    return acc
  }, {})

  const mesasAgrupadas = Object.values(contasPorMesa)

  const calcularTotal = (itens) => {
    if (!itens) return 0
    return itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0)
  }

  const fecharConta = (pedidosIds) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-slate-800">Confirma o recebimento e fechamento desta conta ({pedidosIds.length} {pedidosIds.length > 1 ? 'pedidos agrupados' : 'pedido'})?</span>
        <div className="flex gap-2 justify-end">
          <button 
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button 
            className="px-3 py-1.5 bg-brand-green hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors"
            onClick={async () => {
              toast.dismiss(t.id)
              const { error } = await supabase.from('pedidos').update({ status: 'pago' }).in('id', pedidosIds)
              if (error) {
                toast.error('Erro ao fechar conta')
                console.error(error)
              } else {
                toast.success('Conta fechada com sucesso!')
              }
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  const cadastrarProduto = async (e) => {
    e.preventDefault()
    if (!novoProd.nome || !novoProd.preco) return toast.error('Preencha os campos obrigatórios')
    
    const { error } = await supabase.from('produtos').insert([{
      nome: novoProd.nome,
      categoria: novoProd.categoria,
      preco: parseFloat(novoProd.preco.replace(',', '.')),
      disponivel: true
    }])

    if (error) {
      toast.error('Erro ao cadastrar')
      console.error(error)
    } else {
      toast.success('Produto cadastrado!')
      setShowModal(false)
      setNovoProd({ nome: '', categoria: 'espetos', preco: '' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Receipt className="text-brand-orange" /> Caixa / Contas Abertas
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Produto Rápido
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesasAgrupadas.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            Nenhuma conta aberta no momento.
          </div>
        ) : (
          mesasAgrupadas.map((conta, index) => {
            const total = calcularTotal(conta.itens)
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">{conta.mesa}</h3>
                    {conta.cliente && <p className="text-slate-500 flex items-center gap-1"><Users size={14}/> {conta.cliente}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {conta.pedidosIds.length > 1 && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{conta.pedidosIds.length} Pedidos</span>
                    )}
                    {conta.temPendenteOuPreparando ? (
                      <div className="px-2 py-1 rounded text-xs font-bold uppercase bg-brand-orange/20 text-brand-orange-light">ATIVOS / PREPARANDO</div>
                    ) : conta.temPronto ? (
                      <div className="px-2 py-1 rounded text-xs font-bold uppercase bg-blue-100 text-blue-600">PRONTO PARA ENTREGA</div>
                    ) : (
                      <div className="px-2 py-1 rounded text-xs font-bold uppercase bg-brand-green/20 text-brand-green">ENTREGUE</div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 flex-1">
                  <ul className="space-y-2 mb-4">
                    {conta.itens?.map(item => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600 leading-tight">
                          {item.quantidade}x {item.nome_produto}
                        </span>
                        <span className="font-medium text-slate-800 ml-2 whitespace-nowrap">
                          R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-300">Total da Mesa</span>
                    <span className="text-2xl font-bold text-brand-green">R$ {total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => fecharConta(conta.pedidosIds)}
                    className="w-full py-3 bg-brand-green hover:bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <DollarSign size={20} /> Receber e Fechar
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Cadastro de Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800">Novo Produto</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={cadastrarProduto} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Produto</label>
                <input 
                  type="text" required
                  value={novoProd.nome} onChange={e => setNovoProd({...novoProd, nome: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none"
                  placeholder="Ex: Espeto de Picanha"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
                <select 
                  value={novoProd.categoria} onChange={e => setNovoProd({...novoProd, categoria: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none"
                >
                  <option value="espetos">Espetos</option>
                  <option value="acompanhamentos">Acompanhamentos</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="combos">Combos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Preço (R$)</label>
                <input 
                  type="number" step="0.01" required
                  value={novoProd.preco} onChange={e => setNovoProd({...novoProd, preco: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none"
                  placeholder="Ex: 12.50"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-lg transition-colors">
                  Cadastrar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
