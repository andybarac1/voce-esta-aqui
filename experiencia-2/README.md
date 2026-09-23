# Experiência 2 — retrato de viagem conectado

Experiência para uma TV de 43 polegadas conectada ao celular do visitante por uma sessão temporária e um QR code.

## Fluxo

1. A TV aguarda um toque na abertura rosa.
2. O visitante escolhe uma paisagem na galeria.
3. A TV cria um QR code exclusivo.
4. Ao abrir o QR code, a TV agradece e fica pronta para outra pessoa.
5. No celular, o visitante escreve a legenda, tira uma foto diante de um fundo neutro e ajusta o recorte.
6. A composição final recebe paisagem, moldura Polaroid, legenda e logos.
7. A foto pode ser baixada ou compartilhada pelo menu nativo do celular.

## Executar na rede da exposição

Instale as dependências uma vez:

```powershell
cd experiencia-2
npm install
```

Inicie o servidor:

```powershell
npm start
```

O terminal mostra endereços como:

```text
Experiência 2: http://localhost:8081/experiencia-2/
TV e celular: http://192.168.x.x:8081/experiencia-2/
```

Abra na TV o endereço de rede `TV e celular`, e não o endereço `localhost`. TV e celular precisam estar na mesma rede Wi-Fi. O QR code usará esse mesmo endereço.

Se a aplicação estiver atrás de um domínio ou proxy, defina a URL pública:

```powershell
$env:PUBLIC_BASE_URL="https://experiencia.exemplo.com"
npm start
```

## Privacidade e câmera

- Texto e foto nunca são enviados ao servidor.
- O recorte e a composição acontecem no navegador do celular.
- O botão **Abrir a câmera** usa o capturador nativo do aparelho e funciona em rede local HTTP.
- Para usar APIs de câmera ao vivo em evoluções futuras, publique sob HTTPS.

## Compartilhamento

Em aparelhos compatíveis, os botões usam o compartilhamento nativo com a imagem pronta. Instagram, Facebook e TikTok não permitem postagem automática de uma imagem por um site sem autenticação e permissões próprias; quando o compartilhamento de arquivos não está disponível, a aplicação baixa a Polaroid e abre a rede para que o visitante selecione o arquivo.

## Operação

- Sessões expiram depois de 90 minutos.
- A TV consulta o estado da sessão a cada 900 ms.
- Depois que o celular entra, a TV exibe o agradecimento por 6,5 segundos e retorna à abertura.
- O servidor mantém apenas identificador, destino e estado da sessão em memória.
