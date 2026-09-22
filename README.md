# Você está aqui — experiência interativa

Aplicações de tela grande inspiradas na identidade visual da Magnum Photos e da Martin Parr Foundation. O visitante escolhe um destino em um mapa-múndi e usa a paisagem como cenário de selfie.

## Experiências disponíveis

- `/` — Experiência 1: a TV exibe o cenário em tela cheia e o visitante faz a selfie com o próprio celular.
- `/experiencia-2/` — Experiência 2 preservada: câmera integrada, upload e geração de lembrança para download.

O mapa-base usa uma projeção Robinson com fronteiras do Natural Earth, disponibilizada em domínio público/CC0 pelo Wikimedia Commons.

## Executar localmente

A câmera exige uma origem segura. Em desenvolvimento, `localhost` é aceito:

```powershell
python -m http.server 8080
```

Abra `http://localhost:8080` no Chrome ou Edge.

## Interação de mapa

- Um dedo ou mouse: arrastar o mapa.
- Dois dedos: pinça para ampliar ou reduzir.
- Roda do mouse: zoom centrado no cursor.
- Duplo toque/clique: aproximação rápida.
- Teclado: setas movem, `+`/`-` alteram o zoom e `0` recentraliza.
- Pins: 17 destinos posicionados por latitude e longitude.

## Moldura infravermelha

O mapa usa Pointer Events e aceita multitoque quando a moldura se apresenta ao sistema como dispositivo HID. Dois pontos simultâneos são suficientes para arrasto e pinça; uma moldura de 10 pontos é recomendada para instalações públicas. No Windows/Chrome, desative gestos do sistema que disputem as bordas da tela e execute o navegador em modo kiosk.

Exemplo:

```powershell
chrome.exe --kiosk http://localhost:8080
```

## Privacidade

A câmera e a composição da imagem são processadas apenas no navegador. A aplicação não possui servidor, analytics ou envio de fotos.

## Publicação

O projeto é estático e pode ser publicado diretamente no GitHub Pages, Netlify, Vercel ou em um servidor local da exposição.
