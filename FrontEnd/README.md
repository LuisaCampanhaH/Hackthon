# Cuida Mais — App

MVP em React Native (Expo + TypeScript + Tamagui) para gestão de medicação de pacientes idosos, integrado a uma caixinha de remédios com ESP32 (mock por enquanto).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ (testado com Node 24)
- npm (vem junto com o Node)
- Um celular com o app **Expo Go** instalado ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) — ou um emulador Android / simulador iOS

## Instalação

```bash
cd FrontEnd
npm install
```

## Rodando o app

```bash
npx expo start
```

Isso abre o Metro Bundler no terminal com um QR Code.

### Rodando no celular com Expo Go

1. Abra o app **Expo Go** no celular.
2. Aponte a câmera (iPhone) ou use a opção "Scan QR code" dentro do próprio Expo Go (Android) para o QR Code que aparece no terminal.
3. O app carrega direto no celular — qualquer alteração salva no código atualiza a tela automaticamente (Fast Refresh).

Celular e computador precisam estar na **mesma rede Wi-Fi**.

### Rodando em emulador/simulador

Com o Metro Bundler já rodando (`npx expo start`), pressione:

- `a` — abre no emulador Android (precisa do Android Studio configurado)
- `i` — abre no simulador iOS (precisa de macOS + Xcode)
- `w` — abre a versão web no navegador

Ou diretamente:

```bash
npm run android
npm run ios
npm run web
```

## Problemas comuns

### "An unknown error occurred while installing React Native DevTools" / erro de sandbox do Chrome

Acontece em algumas máquinas Linux — o Expo tenta abrir uma janela de debug baseada em Chromium e o sandbox dela não está configurado no sistema. Isso **não impede o app de funcionar**; para não ver o erro, rode com:

```bash
EXPO_UNSTABLE_HEADLESS=1 npx expo start
```

### "Project is incompatible with this version of Expo Go" / "requires a newer version"

O Expo Go (app da loja) só entende **uma versão de SDK por vez**. Se a mensagem pedir uma versão mais nova, o projeto está à frente do app instalado; se dependências ficarem sem sincronizar, o projeto pode ficar atrás. Para saber qual SDK o seu Expo Go suporta, abra o app — a versão aparece na tela inicial dele. Para alinhar o projeto a essa versão:

```bash
npx expo install expo@<versão-do-sdk>   # ex: expo@54.0.36
npx expo install --fix                  # ajusta as demais dependências (react, react-native, etc.)
```

Este projeto está atualmente na **SDK 54**.

### Erros depois de instalar uma nova dependência

Depois de `npx expo install <pacote>`, sempre rode de novo:

```bash
npx tsc --noEmit
```

para conferir que nada quebrou a tipagem antes de testar no app.

## Estrutura do projeto

```
FrontEnd/
├── App.tsx                    # shell de navegação (tabs + telas), ThemeProvider, TamaguiProvider
├── tamagui.config.ts          # configuração do Tamagui
├── src/
│   ├── data/mockData.ts       # estado mockado (pacientes, remédios, doses, adesão semanal)
│   ├── theme/
│   │   ├── tokens.ts          # cores (claro/escuro), espaçamento, raios, sombras
│   │   └── ThemeContext.tsx   # contexto de tema claro/escuro
│   └── screens/
│       ├── DashboardScreen.tsx      # visão do dia
│       ├── AddMedicationScreen.tsx  # cadastro de medicamento
│       ├── AlertScreen.tsx          # alerta de dose atrasada
│       └── ReportScreen.tsx         # relatório de adesão
```

Não há backend real ainda — todo o estado (pacientes, remédios, doses tomadas/atrasadas) vive em memória em `mockData.ts` e é resetado a cada reinício do app.
