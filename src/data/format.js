const nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export const fmt = (value) => nf.format(value)
