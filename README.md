# Opiskelijaravintolat

Verkkosovellus, jolla voi selata Metropolian opiskelijaravintoloiden ruokalistoja. Kurssin Web-sovelluskehitys yksilöprojekti.

## Linkit

- Julkaistu sovellus: https://users.metropolia.fi/~kimtun/Javascript-ohtu/yksiloprojekti/
- GitHub-repositorio: https://github.com/tunturikim/Web-Yksiloprojekti

## Tärkeää

Sovellus hakee tiedot koulun rajapinnasta, joka toimii vain koulun verkossa tai VPN-yhteydellä. Ilman sitä ravintolat eivät lataudu.

## Ominaisuudet

- Ravintolalista aakkosjärjestyksessä
- Päivän ja viikon ruokalista ravintolan kortista avautuvassa ikkunassa
- Suodatus kaupungin ja palveluntarjoajan mukaan
- Ravintolat kartalla (Leaflet ja OpenStreetMap), merkkiä klikkaamalla aukeaa ruokalista
- Lähin ravintola korostettuna (selaimen sijaintitieto)
- Rekisteröityminen, kirjautuminen ja uloskirjautuminen (kirjautuminen säilyy sivun päivityksen yli)
- Suosikkiravintolan valinta kirjautuneena
- Mobiilissa Lista/Kartta-vaihto, työpöydällä lista ja kartta rinnakkain

## Toteuttamatta

- Profiilikuva
- Käyttäjätietojen päivitys
- Tumma teema

## Tunnetut rajoitteet

- Suosikkia ei voi poistaa, koska rajapinta ei tue sitä (`favouriteRestaurant` hyväksyy vain ravintolan id:n). Suosikki vaihdetaan valitsemalla toinen ravintola.
- Rekisteröinnissä palvelin palauttaa virheen (sähköpostin lähetys epäonnistuu), vaikka käyttäjä luodaan. Sovellus kirjautuu siksi sisään rekisteröinnin jälkeen joka tapauksessa.
- Lähin ravintola vaatii sijaintiluvan selaimessa. Jos lupa evätään, korostusta ei näytetä.
- Joillakin ravintoloilla ruokalista puuttuu tai rajapinta palauttaa virheen (esim. HAMK Hämeenlinna). Sovellus näyttää tällöin ilmoituksen.
- CSS-validaattori ilmoittaa kaksi virhettä Leafletin omasta `leaflet.css`-tiedostosta. Ne eivät ole oman koodin virheitä.

## Teknologiat

HTML, CSS, JavaScript (ES-moduulit), Leaflet 1.9.4, OpenStreetMap, Metropolian Student Restaurants API.

## Tiedostot

- `src/`: sovelluksen lähdekoodi
  - `index.html`: sivun rakenne
  - `css/style.css`: tyylit
  - `js/main.js`: tapahtumankäsittelijät ja sovelluksen logiikka
  - `js/variables.js`: API-osoite ja yhteinen tila
  - `js/utils.js`: haku rajapinnasta ja etäisyyslaskenta
  - `js/components.js`: kortit ja ruokalistat
  - `js/map.js`: kartta
  - `js/auth.js`: rekisteröinti, kirjautuminen ja suosikki

## Ajaminen paikallisesti

Avaa projekti VS Codessa ja käynnistä `src/index.html` Live Serverillä (ES-moduulit eivät toimi suoraan tiedostona avattuna). Koulun VPN pitää olla päällä.
