# Itemszop

[![Discord](https://img.shields.io/badge/discord-%237289DA.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/Nx28v3yAER)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/michaljaz/itemszop)
[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/michaljaz/itemszop)

**ItemSzop to sklep twojego serwera minecraftowego za darmo!** Działa dzięki złożeniu serverless'owych funkcji z hostowaniem statycznych plików. Nie wymaga żadnej instalacji - model SaaS. Serwis jest zrobiony we frameworku [Nuxt.js](https://nuxtjs.org/). Uwierzytelnianie użytkowników i zapisywanie konfiguracji sklepów odbywa się za pośrednictwem bazy danych [Firebase](https://firebase.google.com/). Dodatkowo użyty jest framework [Vuetify](https://vuetifyjs.com/) do ładnych stylów strony.

## Spis treści
- [Wersja produkcyjna](#wersja-produkcyjna)
- [Plugin do serwera minecraftowego](#plugin-do-serwera-minecraftowego)
- [Wspierani operatorzy płatności](#wspierani-operatorzy-płatności)
- [Własne hostowanie](#własne-hostowanie)
	- [instalacja przez cli](#instalacja-przez-cli)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Limity na darmowych hostingach](#limity-na-darmowych-hostingach)
- [Dla deweloperów](#dla-deweloperów)
- [Forum discordowe](#forum-discordowe)

## Wersja produkcyjna

Wersja produkcyjna znajduje się pod adresem: https://itemszop.tk.

Nie jest wymagane hostowanie własnego sklepu - model Software as a Service. Na tej stronie może się każdy zarejestrować i założyć swój sklep. Wówczas sklep dostanie adres https://itemszop.tk/shop/id_sklepu. Jest również możliwość przekierowania własnej domeny, lecz wtedy trzeba poprosić na forum discordowym.

## Plugin do serwera minecraftowego

Adres do repozytorium z pluginem: https://github.com/michaljaz/itemszop-plugin

Aby itemszop działał prawidłowo niezbędne jest zainstalowanie pluginu na serwerze minecraftowym. Gdy serwer jest offline komendy odkładają się na stos i wywołają się gdy będzie online.

## Wspierani operatorzy płatności

- [x] microsms.pl - [api przelew](https://microsms.pl/documents/przelewy_online.pdf), [api sms](https://microsms.pl/kernel/Mails/files/dokumentacja_techniczna_mirosms.pdf)
- [x] lvlup.pro - [api](https://api.lvlup.pro/v4/redoc)


## Własne hostowanie

> **_Ważne:_**  Pamiętaj, że nie potrzebujesz stawiać własnego sklepu. Możesz po prostu skorzystać z modelu SaaS, czyli ze strony itemszop.tk.

#### instalacja przez cli

```bash
#https://github.com/git-guides/install-git
git clone https://github.com/michaljaz/itemszop
cd itemszop

#https://firebase.google.com/docs/cli
firebase login --reauth
firebase projects:create [project-id]
firebase init database --project=[project-id]
firebase deploy --only database

#https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud projects list
gcloud config set project [project-id]
gcloud iam service-accounts list
gcloud iam roles create itemszopRole --project [project-id] --title "Itemszop role" --description "Itemszop role" --permissions "serviceusage.services.enable,serviceusage.services.get"
gcloud projects add-iam-policy-binding [project-id] --member='serviceAccount:[email]' --role='projects/[project-id]/roles/itemszopRole'
gcloud iam service-accounts keys create serviceAccountKey.json --iam-account=[email]

#https://nodejs.org/en/download/
npm install
npm run sak
npm run generate

#https://developers.cloudflare.com/workers/wrangler/get-started/
wrangler login
wrangler pages publish ./dist/
```

## Zmienne środowiskowe

| Nazwa zmiennej | Wartość | Wymagane | Informacje |
| --- | --- | --- | --- |
| FIREBASE_CONFIG | Klucz serviceAccount | TAK | Umożliwia łączenie się z bazą (nie pokazuj go nikomu) |
| SINGLE_SHOP | Id sklepu | NIE | Sklep hostowany jest w 'roocie' projektu |
| OWNER_ID | Id użytkownika firebase | NIE | Blokuje możliwość tworzenia sklepów dla innych użytkowników |

## Limity na darmowych hostingach

| Limit wysyłanych requestów | Cloudflare | Vercel | Netlify |
| --- | --- | --- | --- |
| Serverlessowe funkcje | 100k / dzień | 100k / dzień | 125k / miesiąc |
| Statyczna strona | bez limitu | bez limitu | bez limitu |

## Dla deweloperów

```bash
# Instalowanie bibliotek
$ npm install

############ KONFIGURACJA DEWELOPERA ############
# używając nuxta
$ npm run dev

# używając netlify
$ netlify dev

############ KONFIGURACJA PRODUKCYJNA ############
# Budowanie aplikacji
$ npm run build

# Hostowanie na porcie 8080
$ npm start

```
Aby uzyskać szczegółowe wyjaśnienie, jak to działa, sprawdź [dokumentację](https://nuxtjs.org).

## Forum discordowe

Pod tym linkiem: https://discord.com/invite/Nx28v3yAER znajduje się serwer discordowy, na którym można zadawać pytania, składać propozycje lub zgłaszać problemy techniczne.
