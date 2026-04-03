// ===== PROMOÇÕES DO DIA =====
// Para editar as promoções, altere o objeto abaixo.
// Cada dia da semana pode ter múltiplas promoções (array).
// Array vazio [] = sem promoção = banner não aparece.
// "destaque: true" dá ênfase extra ao texto.
var promocoesData = {
  "domingo":  [],
  "segunda":  [],
  "terca":    [{ "texto": "Prato em Dobro — peça um prato principal e ganhe outro!" }],
  "quarta":   [{ "texto": "Rodízio de Risoto", "destaque": true }],
  "quinta":   [{ "texto": "Happy Hour — drinks com 20% de desconto até 21h" }],
  "sexta":    [{ "texto": "Menu Degustação Especial do Chef" }, { "texto": "DJ ao vivo a partir das 21h" }],
  "sabado":   [{ "texto": "Noite Especial — menu exclusivo com harmonização de vinhos", "destaque": true }]
};
