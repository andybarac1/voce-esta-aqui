# Experiência 2 — retrato de viagem sem servidor

Experiência estática para uma TV de 43 polegadas que transfere o destino escolhido ao celular por QR code, sem backend, banco de dados ou sincronização entre os aparelhos.

## Fluxo

1. A TV aguarda um toque na abertura laranja.
2. O visitante escolhe uma paisagem no mapa.
3. O navegador da TV gera um QR code exclusivo com o destino e um identificador aleatório na própria URL.
4. O QR permanece na tela por 25 segundos.
5. A TV agradece e reinicia para a próxima pessoa, independentemente do celular.
6. No celular, o visitante escreve a legenda, tira a foto diante de um fundo neutro e ajusta o recorte.
7. A Polaroid recebe paisagem, legenda e logos e pode ser baixada ou compartilhada.

## Executar localmente

Na raiz do projeto:

```powershell
python -m http.server 8080
```

Abra `http://localhost:8080/polaroid/`.

Para testar o QR em outro aparelho, sirva a pasta por HTTPS ou use um endereço acessível pelo celular. Em uma rede local, ambos precisam alcançar o mesmo endereço da TV.

## Publicação

A aplicação é inteiramente estática e pode ser publicada gratuitamente em GitHub Pages, Cloudflare Pages, Netlify ou serviço equivalente. O QR preserva automaticamente o caminho da hospedagem, inclusive quando o site está dentro de um subdiretório.

## Privacidade

- Não existe servidor de sessões.
- O QR contém somente o identificador público do destino e um código aleatório sem dados pessoais.
- Texto e foto permanecem no navegador do celular.
- A segmentação da pessoa, o recorte, a montagem e o download acontecem localmente. O MODNet produz a máscara principal; o MediaPipe permanece como contingência para aparelhos incompatíveis.
- Nenhuma imagem é enviada à TV ou à internet.

## Compartilhamento

Em aparelhos compatíveis, os botões usam o compartilhamento nativo com a imagem pronta. Instagram, Facebook e TikTok não permitem postagem automática por um site sem autenticação e permissões próprias; quando o compartilhamento de arquivos não está disponível, a aplicação baixa a Polaroid e abre a rede para que o visitante selecione o arquivo.

O gerador de QR code local usa `qrcode-generator`, de Kazuhiko Arase, sob licença MIT.

O recorte de pessoas usa MODNet e ONNX Runtime Web, sob licença Apache 2.0, com MediaPipe Selfie Segmentation como contingência. A fonte manuscrita Reenie Beanie é distribuída sob a SIL Open Font License.
