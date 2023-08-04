# TOC
- [Kodedokumentasjon](#kodedokumentasjon)
- [FreeMarker](#freemarker)
- [Libs og verktøy](#libs-og-verkt-y)
  * [Xptool (verktøy)](#xptool--verkt-y-)
  * [Util-ex (lib)](#util-ex--lib-)
- [SCSS](#scss)
  * [Bruk](#bruk-1)
  * [Wepack](#Webpack)

# Kodedokumentasjon

For informasjon om oppsett og bygging, se [systemdokumentasjon](../README.md)

# FreeMarker
Vi bruker [FreeMarker](https://freemarker.apache.org/) for å rendre HTML i backend. Dette gir oss "Powerful template language: Conditional blocks, iterations, assignments, string and arithmetic operations and formatting, macros and functions, including other templates, escaping by default (optional), and many more".

Gjennom bruk av macroer er det stort potensiale for å gjenbruke kode på tvers av mange filer.

# Libs og verktøy
Vi inkluderer et par ekstra biblioteker med funksjonalitet. Disse er egne bulker med funksjonalitet som brukes på tvers av prosjekter.

De er inkludert som *private libs*, det vil si at de ligger på Bouvet sin Git bak innlogging. De er tilgjengelig som andre libs gjennom for eksempel

```
utilx: require("/site/lib/bouvet/util-ex")
```

## Xptool (verktøy)
Hjelpeverktøy for å bygge prosjektet, generere brukerdokumentasjon og tar over noen manuelle oppgaver, som for eksempel å lage en ny part: den lager mapper og filer med et standard template.

## Util-ex (lib)
Sett med generelle gjengående hjelpfunksjoner, se [kildekode](https://git.bouvet.no/projects/EXM/repos/lib-util-ex/browse) for muligheter. Prosjektspesifikke funksjoner puttes i `code/src/main/resources/lib` som vanlig.

# SCSS og ES6
SCSS er brukt for å lage CSS for prosjektet. SCSS-filene finnes i `/code/src/frontend/styles/`. Vi skriver alle scripts i ES6. Disse transpileres til JS med Webpack.

## Bruk
Hver part har egen SCSS-fil som blir inkludert i pageContributions der den trengs. Dette gjør at vi ikke laster inn mer CSS enn vi trenger, det blir en del ekstra HTTP requester, men siden vi bruker HTTP/2 bør ikke dette være noe problem.

SCSS for parts legges i `/components/parts`. Hvis navn på SCSS-filen matcher navn på part vil den bli lagt til i pageContributions gjennom `libs.util.getPartCssContribution(component)`

## Webpack
For å kunne bruke filer i frontend-mappen må det gjennom webpack.

Script filer legges til manuelt i entry-listen i `/code/src/frontend/webpack.common.config.js`:
```
module.exports = {
  entry: {
    ...
    main: "./scripts/main.es6",
    ...
  }
```
Dette gir en bundlet fil med navn `main.js` i asset-folderen klar til å brukt i pageContributions i parten.
