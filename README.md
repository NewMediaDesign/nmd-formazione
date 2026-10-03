# web/ — pagine pubbliche dei corsi, HTML statico

## Stato e ripresa

Lo stato aggiornato, le decisioni e le cose aperte stanno in **`../docs/REGISTRO-SESSIONE-2026-10-02.md`** e in **`../CLAUDE.md`**. Questa cartella è `web/`, la parte **pubblicata** (repo `NewMediaDesign/nmd-formazione`, dominio `nmd-formazione.it`). Contiene ancora la versione precedente della pagina del corso; il ridisegno è nella bozza `../bozze/vibe-coding-v3/` (non pubblicata).

Fatto fin qui: pagina del corso, pagina di ringraziamento, pagine legali (testi da redigere), pagina neutra sulla radice, Payment Link di test collegati, modulo Formspree dedicato, posta `info@nmd-formazione.it`. Aperto: vedi il registro.

Non è un sito: è **una pagina per corso**, dove chi arriva legge, chiede informazioni, si iscrive e paga. Niente home, niente menu, niente catalogo (i corsi a catalogo stanno sulla landing principale new-media-design.it). Nessuna build, nessun framework.

Sostituisce la bozza Astro in `site/`, che resta nel progetto finché non decidi di archiviarla.

## Struttura

| File | Cosa contiene |
|---|---|
| `vibe-coding/index.html` | La pagina del corso Vibe Coding (quella da condividere su LinkedIn) |
| `vibe-coding/grazie.html` | Pagina dopo il pagamento: Stripe rimanda qui |
| `condizioni.html` · `privacy.html` | Comuni a tutti i corsi; per ora solo la struttura, testi da redigere |
| `assets/css/style.css` · `assets/js/site.js` | Stile e comportamenti comuni |
| `assets/ds/` | Design system New Media Design (token, font, loghi), copiato senza modifiche |
| `assets/img/` | Ritratto e loghi clienti, presi dalla landing `new-media-design/landing` |

Un nuovo corso = una nuova cartella accanto a `vibe-coding/`, con le sue due pagine.

## Grafica

Design system New Media Design con la veste della landing `new-media-design/landing` (`css/theme-ds.css`; sulla macchina del 2 ottobre 2026 era in `G:\____DEVELOPER\new-media-design\landing`, su un'altra macchina il percorso può cambiare):
- foglio bianco su fondo grigio, con barra in alto (logo e filetto);
- etichette monospazio blu e titoli maiuscoli con una parola in accento;
- trattino blu centrato fra le sezioni;
- righe editoriali numerate, chiusura blu con contatti e footer;
- modulo «Richiedi informazioni» in sovrimpressione.

**Non** usa il linguaggio delle slide: una pagina web ha la sua gerarchia.

## Vederlo in locale

Con il server «web» (porta 8130, già in `.claude/launch.json`): `http://localhost:8130/vibe-coding/`

## Segnaposto

Tutto ciò che è da decidere o completare è in **testo rosso** (classe `placeholder-note`). Per trovarli basta cercare `placeholder-note` nei file HTML.

## Stripe: cosa impostare

Due Payment Link, uno per prezzo (i nomi delle voci sono quelli del pannello Stripe in inglese e possono variare leggermente):

1. **Prodotto** «Vibe Coding, edizione ottobre 2026» con due prezzi una tantum: 199 € (early bird) e 240 € (prezzi aggiornati il 2026-10-03; i primi due prezzi da 230 e 290 € restano in Stripe, non più usati).
2. **Due Payment Link**, uno per prezzo. In ciascuno:
   - *Collect customers' addresses* → indirizzo di fatturazione;
   - *Collect tax IDs* → partita IVA per chi compra come azienda;
   - *Add custom fields* (massimo 3): «Codice fiscale», «Codice SDI o PEC (solo aziende)», «Nome ed email del partecipante, se diverso da chi paga». L'email del partecipante serve per l'accesso personale alle registrazioni;
   - *Limit the number of payments* → 25 sul link early bird; alla scadenza, sul link pieno metti 25 meno gli iscritti già fatti;
   - *After payment* → *Redirect customers to your website* → l'indirizzo pubblico di `vibe-coding/grazie.html`;
   - *Require customers to accept your terms of service*, dopo aver pubblicato `condizioni.html` e averne inserito l'indirizzo nelle impostazioni pubbliche dell'account.
3. Incolla i due link in `vibe-coding/index.html`, nel bottone `data-pay`: `data-link-early="…"` e `data-link-full="…"`. La pagina sceglie da sola quello giusto in base alla data (`data-early-until`). Finché i link sono vuoti, il bottone mostra «Iscrizioni in apertura».

Stripe incassa ma **non emette la fattura elettronica**: la emetti tu dal tuo gestionale, con i dati raccolti al pagamento.

## Modulo «Richiedi informazioni»

Usa un modulo Formspree dedicato ai corsi (`https://formspree.io/f/xdekradz`, notifiche su `info@nmd-formazione.it`), con i campi `corso` e `motivo` per distinguere le richieste. Il modulo della landing principale resta separato.

Campi inviati: `nome`, `cognome`, `email`, `azienda`, `motivo`, `messaggio`, `consenso_privacy`, `consenso_aggiornamenti`, `corso`.

## Registrazioni: accesso personale (proposta)

Obiettivo: evitare che un'azienda iscriva una persona e poi giri le registrazioni ai colleghi. Nessuno strumento lo impedisce del tutto, ma si può rendere la condivisione scomoda e visibile:

1. **Condivisione nominale, non tramite link** (su Google Drive: accesso «Con restrizioni»). Un link girato a un collega non si apre: il collega deve chiedere l'accesso, e la richiesta arriva a te con il suo indirizzo.
2. **Download disattivato** per chi guarda.
3. **Scadenza:** accesso per un periodo limitato (es. 30 giorni), poi si toglie.
4. **Chi ha guardato:** con un account Google Workspace di tipo business, il pannello attività di Drive mostra chi ha aperto il file e quando. Con un Gmail personale questa funzione non c'è.
5. **Regola scritta** nelle condizioni di vendita: accesso personale e non cedibile.
6. **Una strada comoda per le aziende:** iscrizione di gruppo o edizione dedicata.

## Calendario proposto (da confermare)

| Data | Cosa |
|---|---|
| entro il 7 ottobre | pagina online, Stripe collegato |
| fino al 16 ottobre | early bird a 199 € |
| 19 ottobre | una settimana prima: comunicazione agli iscritti se il corso parte (almeno 5 iscritti); altrimenti rimborso e nota di credito |
| 26, 28 e 30 ottobre, 18:00–21:00 | le tre sessioni |

## Stripe LIVE (dal 2026-10-03)

Prodotto `prod_VNLO1kzFfvtXYj`, prezzi 199 € (early bird, fino al 16/10) e 240 €. Payment Link live: `https://buy.stripe.com/5kQ7sK53b9IFcxyea7gA800` (199 €) e `https://buy.stripe.com/5kQbJ0fHP6wt69ad63gA801` (240 €). Solo carta, 25 posti per link (il totale lo controlla l'utente), ritorno a `vibe-coding/grazie.html`. Creati con `server/setup_live.py` e una chiave con restrizioni in `server/.env.live` (non versionato). Webhook live verso Render; il server crea la fattura in Fatture in Cloud e l'invio allo SDI lo fa l'utente a mano.
