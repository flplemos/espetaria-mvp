export const getImageForProduct = (nome, categoria) => {
  const nomeLower = nome.toLowerCase()
  
  if (categoria === 'espetos') {
    if (nomeLower.includes('frango') || nomeLower.includes('coração')) return '/assets/images/frango.jpg'
    return '/assets/images/carne.jpg'
  }
  
  if (categoria === 'acompanhamentos') {
    if (nomeLower.includes('pão')) return '/assets/images/pao_alho.jpg'
    if (nomeLower.includes('vinagrete')) return '/assets/images/vinagrete.jpg'
    return '/assets/images/farofa.jpg'
  }
  
  if (categoria === 'bebidas') {
    if (nomeLower.includes('coca') || nomeLower.includes('refrigerante')) return '/assets/images/coca_cola.jpg'
    if (nomeLower.includes('água') || nomeLower.includes('agua')) return '/assets/images/agua_gas.jpg'
    return '/assets/images/cerveja.jpg'
  }
  
  if (categoria === 'combos') {
    if (nomeLower.includes('família') || nomeLower.includes('familia')) return '/assets/images/combo_familia.jpg'
    return '/assets/images/combo_casal.jpg'
  }

  // Fallback
  return null
}
