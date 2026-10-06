# Você está aqui — experiência interativa

Aplicações de tela grande da exposição Martin Parr — Mundo Pequeno. A assinatura visual usa exclusivamente o selo circular oficial fornecido pelo cliente.

## Experiências disponíveis

- `/selfie/` — Experiência 1 — Autorretrato: seleção por galeria; a TV exibe o cenário em tela cheia e o visitante faz o autorretrato com o próprio celular.
- `/polaroid/` — Experiência 2 — Meu próximo destino: seleção por galeria, continuação por QR code no celular e criação de uma lembrança com recorte de fundo, legenda, enquadramento, download e compartilhamento.
- `/` e `/experiencia-2/` redirecionam para as novas rotas.

## Executar localmente

A câmera exige uma origem segura. Em desenvolvimento, `localhost` é aceito:

```powershell
python -m http.server 8080
```

Abra `http://localhost:8080/selfie/` ou `http://localhost:8080/polaroid/` no Chrome ou Edge.

## Interação da galeria

- Um toque ou clique seleciona um destino.
- Na experiência Autorretrato, a seleção abre a confirmação do cenário.
- Na experiência Meu próximo destino, a seleção atualiza a passagem à direita antes de gerar o QR Code.

## Moldura infravermelha

As galerias aceitam toque quando a moldura se apresenta ao sistema como dispositivo HID. Uma moldura de 10 pontos continua recomendada para instalações públicas, embora a navegação atual exija apenas um toque. No Windows/Chrome, desative gestos do sistema que disputem as bordas da tela e execute o navegador em modo kiosk.

Exemplo:

```powershell
chrome.exe --kiosk http://localhost:8080
```

## Privacidade

A câmera e a composição da imagem são processadas apenas no navegador. A aplicação não possui servidor nem envio de fotos.

## Publicação

As duas experiências são estáticas e podem ser publicadas diretamente no GitHub Pages, Cloudflare Pages, Netlify ou serviço equivalente. Na Experiência 2, o destino é transferido ao celular pela própria URL do QR code; fotos e legendas permanecem no aparelho do visitante.
