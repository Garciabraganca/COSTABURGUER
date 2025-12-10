#!/bin/bash

# ============================================
# COSTA-BURGER - Kitchen Theater Video Processor
# ============================================
# Este script processa os vídeos gravados para o formato ideal do app
#
# REQUISITOS:
# - FFmpeg instalado (brew install ffmpeg / apt install ffmpeg)
# - Vídeos originais em ./raw_videos/
#
# FORMATO DE SAÍDA:
# - Resolução: 1080x1920 (vertical 9:16) para mobile
# - Codec: H.264 (compatível com todos os browsers)
# - Audio: Removido (opcional manter para ASMR)
# - FPS: 30
# - Qualidade: CRF 23 (bom equilíbrio tamanho/qualidade)

# Diretórios
RAW_DIR="./raw_videos"
OUTPUT_DIR="../public/videos"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}"
echo "╔════════════════════════════════════════════╗"
echo "║   COSTA-BURGER Video Processor             ║"
echo "║   Kitchen Theater Edition                  ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Verifica se FFmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg não encontrado. Instale com:${NC}"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo "   Windows: choco install ffmpeg"
    exit 1
fi

# Cria estrutura de diretórios
create_directories() {
    echo -e "${YELLOW}📁 Criando estrutura de diretórios...${NC}"

    mkdir -p "$RAW_DIR"/{intro,ingredientes,montagem,finalizacao,extras}
    mkdir -p "$OUTPUT_DIR"/{intro,ingredientes,montagem,finalizacao,extras}

    echo -e "${GREEN}✅ Diretórios criados!${NC}"
}

# Processa um único vídeo
process_video() {
    local input="$1"
    local output="$2"
    local duration="${3:-0}"  # 0 = não cortar

    echo -e "${YELLOW}🎬 Processando: $(basename "$input")${NC}"

    # Comando FFmpeg base
    local cmd="ffmpeg -i \"$input\" -y"

    # Filtro de vídeo: redimensiona para 1080x1920 (vertical)
    # Usa scale e pad para manter proporção e centralizar
    local vf="scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30"

    # Se tiver duração específica, corta
    if [ "$duration" != "0" ]; then
        cmd="$cmd -t $duration"
    fi

    # Codec de vídeo otimizado para web
    cmd="$cmd -vf \"$vf\" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p"

    # Remove áudio (descomente a linha abaixo para manter)
    cmd="$cmd -an"
    # Para manter áudio ASMR, use isso ao invés:
    # cmd="$cmd -c:a aac -b:a 128k"

    # Otimizações para streaming web
    cmd="$cmd -movflags +faststart"

    cmd="$cmd \"$output\""

    eval $cmd 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Concluído: $(basename "$output")${NC}"
    else
        echo -e "${RED}❌ Erro ao processar: $(basename "$input")${NC}"
    fi
}

# Processa todos os vídeos de uma pasta
process_folder() {
    local folder="$1"
    local duration="${2:-0}"

    echo ""
    echo -e "${YELLOW}📂 Processando pasta: $folder${NC}"

    for file in "$RAW_DIR/$folder"/*.{mp4,mov,avi,mkv,webm}; do
        [ -f "$file" ] || continue

        local filename=$(basename "$file")
        local name="${filename%.*}"
        local output="$OUTPUT_DIR/$folder/${name}.mp4"

        process_video "$file" "$output" "$duration"
    done
}

# Processa tudo
process_all() {
    echo -e "${YELLOW}🚀 Iniciando processamento de todos os vídeos...${NC}"
    echo ""

    # Intro: 5-10 segundos
    process_folder "intro" "10"

    # Ingredientes: 2-4 segundos cada
    process_folder "ingredientes" "4"

    # Montagem: 5-10 segundos cada
    process_folder "montagem" "10"

    # Finalização: 3-5 segundos
    process_folder "finalizacao" "5"

    # Extras: 4-6 segundos
    process_folder "extras" "6"

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Processamento concluído!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
}

# Gera vídeo de teste/placeholder
generate_placeholder() {
    local name="$1"
    local output="$2"
    local duration="${3:-3}"
    local text="${4:-$name}"

    echo -e "${YELLOW}🎨 Gerando placeholder: $name${NC}"

    ffmpeg -f lavfi -i "color=c=1a1a2e:s=1080x1920:d=$duration" \
           -vf "drawtext=text='$text':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=text='🍔':fontcolor=white:fontsize=200:x=(w-text_w)/2:y=(h-text_h)/2-150" \
           -c:v libx264 -t $duration -pix_fmt yuv420p \
           -y "$output" 2>/dev/null

    echo -e "${GREEN}✅ Placeholder criado${NC}"
}

# Gera todos os placeholders para teste
generate_all_placeholders() {
    echo -e "${YELLOW}🎨 Gerando vídeos placeholder para teste...${NC}"
    echo ""

    # Intro
    generate_placeholder "chef-preparando" "$OUTPUT_DIR/intro/chef-preparando.mp4" 5 "Preparando..."

    # Ingredientes
    local ingredientes=("pao-brioche" "pao-australiano" "carne-angus" "carne-picanha" "queijo-cheddar" "queijo-prato" "bacon" "alface" "tomate" "cebola" "ovo" "molho-especial" "maionese")
    for ing in "${ingredientes[@]}"; do
        generate_placeholder "pegando-$ing" "$OUTPUT_DIR/ingredientes/pegando-$ing.mp4" 3 "$ing"
    done

    # Montagem
    generate_placeholder "grelhando-carne" "$OUTPUT_DIR/montagem/grelhando-carne.mp4" 8 "Grelhando..."
    generate_placeholder "derretendo-queijo" "$OUTPUT_DIR/montagem/derretendo-queijo.mp4" 5 "Derretendo queijo..."
    generate_placeholder "fritando-bacon" "$OUTPUT_DIR/montagem/fritando-bacon.mp4" 6 "Bacon crocante..."
    generate_placeholder "fritando-ovo" "$OUTPUT_DIR/montagem/fritando-ovo.mp4" 5 "Fritando ovo..."
    generate_placeholder "montando-burger" "$OUTPUT_DIR/montagem/montando-burger.mp4" 10 "Montando..."

    # Finalização
    generate_placeholder "fechando-burger" "$OUTPUT_DIR/finalizacao/fechando-burger.mp4" 4 "Finalizando..."
    generate_placeholder "embalando" "$OUTPUT_DIR/finalizacao/embalando.mp4" 5 "Embalando..."
    generate_placeholder "pronto-entrega" "$OUTPUT_DIR/finalizacao/pronto-entrega.mp4" 3 "Pronto!"

    # Extras
    generate_placeholder "fritando-batata" "$OUTPUT_DIR/extras/fritando-batata.mp4" 6 "Batatas fritas..."
    generate_placeholder "servindo-refri-lata" "$OUTPUT_DIR/extras/servindo-refri-lata.mp4" 3 "Refrigerante"
    generate_placeholder "servindo-refri-1l" "$OUTPUT_DIR/extras/servindo-refri-1l.mp4" 3 "Refri 1L"
    generate_placeholder "preparando-sobremesa" "$OUTPUT_DIR/extras/preparando-sobremesa.mp4" 4 "Sobremesa"

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Placeholders gerados!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
}

# Menu principal
show_menu() {
    echo ""
    echo "Escolha uma opção:"
    echo ""
    echo "  1) Criar estrutura de diretórios"
    echo "  2) Processar todos os vídeos"
    echo "  3) Gerar placeholders de teste"
    echo "  4) Processar pasta específica"
    echo "  5) Mostrar guia de gravação"
    echo "  0) Sair"
    echo ""
    read -p "Opção: " choice

    case $choice in
        1) create_directories ;;
        2) process_all ;;
        3) generate_all_placeholders ;;
        4)
            read -p "Nome da pasta (intro/ingredientes/montagem/finalizacao/extras): " folder
            read -p "Duração máxima em segundos (0 = não cortar): " dur
            process_folder "$folder" "$dur"
            ;;
        5) show_recording_guide ;;
        0) exit 0 ;;
        *) echo -e "${RED}Opção inválida${NC}" ;;
    esac

    show_menu
}

# Guia de gravação
show_recording_guide() {
    echo ""
    echo -e "${YELLOW}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   GUIA DE GRAVAÇÃO                         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}📱 CONFIGURAÇÕES DA CÂMERA:${NC}"
    echo "   • Resolução: 1080p ou 4K (vertical - 9:16)"
    echo "   • FPS: 30 ou 60"
    echo "   • Estabilização: LIGADA"
    echo "   • Foco: Manual (evita refoco durante gravação)"
    echo ""
    echo -e "${GREEN}💡 ILUMINAÇÃO:${NC}"
    echo "   • Use luz frontal suave (ring light funciona bem)"
    echo "   • Evite sombras fortes nas mãos"
    echo "   • Fundo escuro destaca os ingredientes"
    echo ""
    echo -e "${GREEN}🎬 ENQUADRAMENTO:${NC}"
    echo "   • Câmera de cima (ângulo zenital) ou 45°"
    echo "   • Mãos do chef sempre visíveis"
    echo "   • Foco no ingrediente/ação"
    echo ""
    echo -e "${GREEN}🎤 ÁUDIO (OPCIONAL - ASMR):${NC}"
    echo "   • Capture o som do bacon fritando"
    echo "   • Queijo derretendo"
    echo "   • Corte de vegetais"
    echo "   • Evite conversas/barulhos externos"
    echo ""
    echo -e "${GREEN}📁 NOMEAÇÃO DOS ARQUIVOS:${NC}"
    echo ""
    echo "   INTRO:"
    echo "   └── chef-preparando.mp4"
    echo ""
    echo "   INGREDIENTES (pegando-{nome}.mp4):"
    echo "   ├── pegando-pao-brioche.mp4"
    echo "   ├── pegando-carne-angus.mp4"
    echo "   ├── pegando-queijo-cheddar.mp4"
    echo "   ├── pegando-bacon.mp4"
    echo "   ├── pegando-alface.mp4"
    echo "   └── ..."
    echo ""
    echo "   MONTAGEM:"
    echo "   ├── grelhando-carne.mp4"
    echo "   ├── derretendo-queijo.mp4"
    echo "   ├── fritando-bacon.mp4"
    echo "   ├── fritando-ovo.mp4"
    echo "   └── montando-burger.mp4"
    echo ""
    echo "   FINALIZAÇÃO:"
    echo "   ├── fechando-burger.mp4"
    echo "   ├── embalando.mp4"
    echo "   └── pronto-entrega.mp4"
    echo ""
    echo "   EXTRAS:"
    echo "   ├── fritando-batata.mp4"
    echo "   ├── servindo-refri-lata.mp4"
    echo "   └── preparando-sobremesa.mp4"
    echo ""
    echo -e "${GREEN}⏱️ DURAÇÃO RECOMENDADA:${NC}"
    echo "   • Intro: 5-10 segundos"
    echo "   • Ingredientes: 2-4 segundos cada"
    echo "   • Montagem: 5-10 segundos cada"
    echo "   • Finalização: 3-5 segundos"
    echo "   • Extras: 4-6 segundos"
    echo ""
    echo -e "${YELLOW}💡 DICA PRO:${NC}"
    echo "   Grave tudo de uma vez em uma sessão, mantendo"
    echo "   a mesma iluminação e ângulo. Depois corte em"
    echo "   segmentos usando este script!"
    echo ""
}

# Verifica argumentos
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_recording_guide
    exit 0
fi

if [ "$1" == "--placeholders" ]; then
    create_directories
    generate_all_placeholders
    exit 0
fi

if [ "$1" == "--process" ]; then
    process_all
    exit 0
fi

# Executa menu interativo
create_directories
show_menu
