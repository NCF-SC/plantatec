# Plantatec — Planta técnica para embalagem flexível

App local (sem instalação) para parametrizar e exportar a planta técnica em SVG.

## Como usar

1. Abra `index.html` no navegador (duplo clique ou arraste para o Chrome/Edge).
2. Ajuste tipo de embalagem, solda, medidas e opcionais.
3. Clique em **Exportar SVG** e abra o arquivo no Adobe Illustrator.

## Opções

| Campo | Descrição |
|--------|-----------|
| Tipo de embalagem | Stand-up, envelope, sanfonada lateral |
| Tipo de solda | U, K, somente lateral |
| Solda lateral / fundo / boca | Larguras em mm |
| Sanfona | Fundo (stand-up) ou lateral |
| Suspensão | Nenhuma, chapéu mexicano 25×9 mm, ou furo Ø |
| Zipper | Opcional + distância até a boca |
| Corte facilitador | Opcional + distância até a boca |

## Arquivos

- `index.html` — interface
- `styles.css` — layout
- `app.js` — geometria e exportação
