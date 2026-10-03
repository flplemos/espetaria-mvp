import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getImageForProduct } from '../utils/imageMapper'
import { Plus, Minus, Trash2, Send, CheckCircle2, UtensilsCrossed } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GarcomView({ pedidos }) {
  const [produtos, setProdutos] = useState([])
  const [categoria, setCategoria] = useState('Todos')
  const [mesa, setMesa] = useState('')
  const [cliente, setCliente] = useState('')
  const [carrinho, setCarrinho] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProdutos = async () => {
      const { data } = await supabase.from('produtos').select('*').eq('disponivel', true)
      if (data) setProdutos(data)
    }
    fetchProdutos()
  }, [])

  const categorias = ['Todos', 'espetos', 'acompanhamentos', 'bebidas', 'combos']

  const produtosFiltrados = categoria === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.categoria === categoria)

  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => {
      const existe = prev.find(i => i.produto.id === produto.id && i.observacao === '')
      if (existe) {
        return prev.map(i => i.id === existe.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      }
      return [...prev, { id: Date.now().toString(), produto, quantidade: 1, observacao: '' }]
    })
  }

  const atualizarQuantidade = (id, delta) => {
    setCarrinho(prev => prev.map(i => {
      if (i.id === id) {
        const novaQtd = i.quantidade + delta
        return novaQtd > 0 ? { ...i, quantidade: novaQtd } : i
      }
      return i
    }))
  }

  const removerDoCarrinho = (id) => {
    setCarrinho(prev => prev.filter(i => i.id !== id))
  }

  const atualizarObservacao = (id, obs) => {
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, observacao: obs } : i))
  }

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0)

  const enviarPedido = async () => {
    if (!mesa) return toast.error('Informe o número da mesa!')
    if (carrinho.length === 0) return toast.error('Adicione itens ao carrinho!')
    
    setLoading(true)
    try {
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{ mesa, cliente, status: 'pendente' }])
        .select()
        .single()
      
      if (pedidoError) throw pedidoError

      const itensParaInserir = carrinho.map(item => ({
        pedido_id: pedidoData.id,
        produto_id: item.produto.id,
        nome_produto: item.produto.nome,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco,
        observacao: item.observacao
      }))

      const { error: itensError } = await supabase.from('itens_pedido').insert(itensParaInserir)
      if (itensError) throw itensError

      setCarrinho([])
      setMesa('')
      setCliente('')
      toast.success('Pedido enviado para a churrasqueira!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar pedido.')
    } finally {
      setLoading(false)
    }
  }

  const marcarEntregue = async (id) => {
    await supabase.from('pedidos').update({ status: 'entregue' }).eq('id', id)
    toast.success('Pedido marcado como entregue!')
  }

  const pedidosProntos = pedidos.filter(p => p.status === 'pronto')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Infos do Pedido */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mesa *</label>
            <input 
              type="text" 
              placeholder="Ex: 04" 
              value={mesa}
              onChange={e => setMesa(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente (Opcional)</label>
            <input 
              type="text" 
              placeholder="Nome" 
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
            />
          </div>
        </div>

        {/* Categorias */}
        <div className="flex overflow-x-auto pb-2 gap-2 snap-x hide-scrollbar">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors ${
                categoria === cat 
                  ? 'bg-brand-orange text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid Produtos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {produtosFiltrados.map(produto => (
            <div key={produto.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col transition-transform hover:-translate-y-1">
              <div className="h-32 bg-slate-200 relative">
                {getImageForProduct(produto.nome, produto.categoria) ? (
                  <img src={getImageForProduct(produto.nome, produto.categoria)} alt={produto.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <UtensilsCrossed size={32} />
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{produto.nome}</h3>
                  <p className="text-brand-orange font-bold">R$ {Number(produto.preco).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="mt-3 w-full flex items-center justify-center gap-1 bg-slate-100 hover:bg-brand-orange hover:text-white text-slate-700 font-medium py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Carrinho */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <h2 className="font-bold text-lg">Comanda</h2>
            <span className="bg-slate-800 px-2 py-1 rounded text-sm">{carrinho.length} itens</span>
          </div>
          
          <div className="p-4 flex-1 overflow-auto space-y-4">
            {carrinho.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Nenhum item adicionado.</p>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-slate-800 pr-2">{item.produto.nome}</div>
                    <div className="font-bold text-slate-800 whitespace-nowrap">
                      R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                      <button onClick={() => atualizarQuantidade(item.id, -1)} className="p-1 hover:bg-white rounded-md text-slate-600"><Minus size={16} /></button>
                      <span className="font-semibold w-4 text-center">{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, 1)} className="p-1 hover:bg-white rounded-md text-slate-600"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removerDoCarrinho(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Observação (ex: sem cebola)" 
                    value={item.observacao}
                    onChange={(e) => atualizarObservacao(item.id, e.target.value)}
                    className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-brand-orange"
                  />
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-800">
              <span>Total:</span>
              <span className="text-brand-orange">R$ {totalCarrinho.toFixed(2)}</span>
            </div>
            <button 
              onClick={enviarPedido}
              disabled={loading || carrinho.length === 0}
              className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
              {loading ? 'Enviando...' : 'Enviar p/ Churrasqueira'}
            </button>
          </div>
        </div>

        {/* Prontos para entregar */}
        {pedidosProntos.length > 0 && (
          <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4">
            <h3 className="font-bold text-brand-green flex items-center gap-2 mb-3">
              <CheckCircle2 /> Prontos para Entregar!
            </h3>
            <div className="space-y-3">
              {pedidosProntos.map(pedido => (
                <div key={pedido.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between border border-brand-green/20">
                  <div>
                    <p className="font-bold text-slate-800">{pedido.mesa}</p>
                    {pedido.cliente && <p className="text-sm text-slate-500">{pedido.cliente}</p>}
                  </div>
                  <button 
                    onClick={() => marcarEntregue(pedido.id)}
                    className="px-4 py-2 bg-brand-green text-white font-semibold rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    Marcar Entregue
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
