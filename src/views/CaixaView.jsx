import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { DollarSign, Plus, Receipt, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CaixaView({ pedidos }) {
  const [showModal, setShowModal] = useState(false)
  const [novoProd, setNovoProd] = useState({ nome: '', categoria: 'espetos', preco: '' })

  const contasAbertas = pedidos.filter(p => p.status !== 'pago')

  const calcularTotal = (itens) => {
    if (!itens) return 0
    return itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0)
  }

  const fecharConta = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-slate-800">Confirma o recebimento e fechamento desta conta?</span>
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
              await supabase.from('pedidos').update({ status: 'pago' }).eq('id', id)
              toast.success('Conta fechada com sucesso!')
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
        {contasAbertas.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            Nenhuma conta aberta no momento.
          </div>
        ) : (
          contasAbertas.map(pedido => {
            const total = calcularTotal(pedido.itens_pedido)
            return (
              <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">{pedido.mesa}</h3>
                    {pedido.cliente && <p className="text-slate-500">{pedido.cliente}</p>}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    pedido.status === 'entregue' ? 'bg-brand-green/20 text-brand-green' : 
                    pedido.status === 'pronto' ? 'bg-blue-100 text-blue-600' :
                    'bg-brand-orange/20 text-brand-orange-light'
                  }`}>
                    {pedido.status}
                  </div>
                </div>
                
                <div className="p-4 flex-1">
                  <ul className="space-y-2 mb-4">
                    {pedido.itens_pedido?.map(item => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.quantidade}x {item.nome_produto}</span>
                        <span className="font-medium text-slate-800">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-300">Total</span>
                    <span className="text-2xl font-bold text-brand-green">R$ {total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => fecharConta(pedido.id)}
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
