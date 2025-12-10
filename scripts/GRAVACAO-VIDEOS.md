# 🎬 Guia de Gravação - Kitchen Theater

## Visão Geral

O **Kitchen Theater** é uma experiência imersiva onde o cliente vê seu lanche sendo preparado através de vídeos pré-gravados que são combinados de acordo com o pedido.

## 📁 Estrutura de Arquivos

```
public/videos/
├── intro/
│   └── chef-preparando.mp4          # 5-10s - Chef preparando a estação
│
├── ingredientes/
│   ├── pegando-pao-brioche.mp4      # 2-4s
│   ├── pegando-pao-australiano.mp4
│   ├── pegando-pao-integral.mp4
│   ├── pegando-carne-picanha.mp4
│   ├── pegando-carne-angus.mp4
│   ├── pegando-carne-frango.mp4
│   ├── pegando-queijo-cheddar.mp4
│   ├── pegando-queijo-prato.mp4
│   ├── pegando-queijo-gorgonzola.mp4
│   ├── pegando-alface.mp4
│   ├── pegando-tomate.mp4
│   ├── pegando-cebola.mp4
│   ├── pegando-picles.mp4
│   ├── pegando-bacon.mp4
│   ├── pegando-ovo.mp4
│   ├── pegando-molho-especial.mp4
│   ├── pegando-maionese.mp4
│   ├── pegando-ketchup.mp4
│   ├── pegando-mostarda.mp4
│   └── pegando-barbecue.mp4
│
├── montagem/
│   ├── grelhando-carne.mp4          # 6-10s - Carne na chapa
│   ├── derretendo-queijo.mp4        # 4-6s - Queijo derretendo
│   ├── fritando-bacon.mp4           # 5-8s - Bacon crocante
│   ├── fritando-ovo.mp4             # 4-6s - Ovo na chapa
│   └── montando-burger.mp4          # 8-12s - Montagem final
│
├── finalizacao/
│   ├── fechando-burger.mp4          # 3-5s - Fechando com pão
│   ├── embalando.mp4                # 4-6s - Colocando na embalagem
│   └── pronto-entrega.mp4           # 2-4s - Pronto na bandeja
│
└── extras/
    ├── fritando-batata.mp4          # 5-8s - Batatas fritas
    ├── servindo-refri-lata.mp4      # 2-4s - Pegando latinha
    ├── servindo-refri-1l.mp4        # 2-4s - Pegando garrafa
    └── preparando-sobremesa.mp4     # 3-5s - Sobremesa
```

## 📱 Especificações Técnicas

### Resolução
- **Mobile (recomendado):** 1080x1920 (vertical 9:16)
- **Desktop alternativo:** 1920x1080 (horizontal 16:9)

### Formato
- **Codec:** H.264 (MP4)
- **FPS:** 30
- **Áudio:** Opcional (ASMR dos sons de cozinha)

### Tamanho Alvo
- Cada clipe: 500KB - 2MB
- Total estimado: 30-50MB

## 🎥 Dicas de Gravação

### Equipamento Mínimo
- [ ] Smartphone com boa câmera (ou DSLR)
- [ ] Tripé ou suporte fixo
- [ ] Ring light ou iluminação LED
- [ ] Fundo escuro/neutro

### Configurações da Câmera
```
Resolução: 1080p ou 4K (vertical)
FPS: 30 ou 60
Estabilização: ON
Foco: Manual (fixo nos ingredientes)
Exposição: Manual (evitar flickering)
```

### Ângulos Recomendados

1. **Top-down (Zenital)** - Câmera de cima olhando pra baixo
   - Ideal para: montagem, ingredientes sendo pegos

2. **45 graus** - Câmera inclinada
   - Ideal para: grelhando, fritando, ações dinâmicas

3. **Frontal baixo** - Na altura da bancada
   - Ideal para: finalização, embalagem

### Iluminação
- Luz principal frontal/superior
- Sem sombras fortes nas mãos
- Destaque nos ingredientes (backlight suave)
- Fundo escuro para contraste

## 🎬 Roteiro de Gravação

### Sessão 1: Intro e Finalização (30 min)
1. Chef lavando as mãos
2. Organizando estação
3. Fechando burger
4. Embalando
5. Colocando na bandeja

### Sessão 2: Ingredientes (1 hora)
Para cada ingrediente:
1. Mão entrando no frame
2. Pegando o ingrediente
3. Mostrando brevemente
4. Levando para área de preparo

### Sessão 3: Montagem (1 hora)
1. Carne na chapa (várias tomadas)
2. Queijo derretendo close-up
3. Bacon fritando (som é importante!)
4. Ovo sendo frito
5. Montagem camada por camada

### Sessão 4: Extras (30 min)
1. Batatas na fritadeira
2. Pegando refrigerantes
3. Sobremesa sendo preparada

## 🔧 Processamento dos Vídeos

### Usando o Script

```bash
# Navegar para a pasta de scripts
cd scripts

# Gerar vídeos placeholder para teste
./video-processor.sh --placeholders

# Processar vídeos gravados
./video-processor.sh --process

# Menu interativo
./video-processor.sh
```

### Comando FFmpeg Manual

```bash
# Converter vídeo para formato ideal
ffmpeg -i entrada.mov \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30" \
  -c:v libx264 -preset medium -crf 23 \
  -pix_fmt yuv420p \
  -an \
  -movflags +faststart \
  -t 5 \
  saida.mp4
```

Parâmetros:
- `-vf`: Filtro de vídeo (escala, padding, fps)
- `-crf 23`: Qualidade (18-28, menor = melhor)
- `-an`: Remove áudio (remova para manter ASMR)
- `-t 5`: Duração máxima em segundos
- `-movflags +faststart`: Otimiza para streaming web

### Com Áudio ASMR

```bash
ffmpeg -i entrada.mov \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30" \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k \
  -pix_fmt yuv420p \
  -movflags +faststart \
  saida.mp4
```

## 🎨 Pós-Produção (Opcional)

### Color Grading
- Tons quentes (amarelo/laranja) para apetite
- Contraste aumentado nos ingredientes
- Leve vinheta nas bordas

### Transições
- Não usar transições entre clipes
- O app faz a transição automaticamente

### Efeitos
- Slow motion no queijo derretendo (60fps → 30fps)
- Time-lapse na montagem completa

## ✅ Checklist Final

- [ ] Todos os vídeos em formato vertical (9:16)
- [ ] Nomeação correta dos arquivos
- [ ] Duração dentro do especificado
- [ ] Qualidade visual consistente
- [ ] Sem elementos que identifiquem data/hora
- [ ] Testado no componente KitchenTheater

## 🚀 Testando no App

1. Coloque os vídeos em `public/videos/`
2. Acesse `/acompanhar` no app
3. Verifique se os vídeos tocam na sequência correta
4. Ajuste durações se necessário em `lib/videoMapping.ts`

---

**Dica final:** Grave mais do que precisa! É melhor ter opções para escolher os melhores takes do que ter que regravar depois.
