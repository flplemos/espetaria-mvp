import { ChefHat, Smartphone, Monitor } from 'lucide-react'

const RoleButton = ({ id, currentRole, setRole, icon: Icon, label, badgeCount }) => {
  const isActive = currentRole === id
  return (
    <button
      onClick={() => setRole(id)}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-brand-orange text-white' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {badgeCount}
        </span>
      )}
    </button>
  )
}

export default function Header({ role, setRole, pedidos }) {
  const activeOrders = pedidos.filter(p => p.status === 'pendente' || p.status === 'preparando').length
  const unpaidOrders = pedidos.filter(p => p.status !== 'pago').length

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 text-brand-orange-light font-bold text-lg md:text-xl">
          <img src="/assets/images/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-brand-orange" />
          <span className="hidden md:inline">Espetaria do Gaguinho — Gestão</span>
          <span className="md:hidden">Espetaria</span>
        </div>
        
        <div className="flex items-center gap-2">
          <RoleButton id="garcom" currentRole={role} setRole={setRole} icon={Smartphone} label="Garçom" />
          <RoleButton id="cozinha" currentRole={role} setRole={setRole} icon={ChefHat} label="Churrasqueira" badgeCount={activeOrders} />
          <RoleButton id="caixa" currentRole={role} setRole={setRole} icon={Monitor} label="Caixa" badgeCount={unpaidOrders} />
        </div>
      </div>
    </header>
  )
}
