# Sources

Everything the design turns on came from Sky's own live help pages, scraped **20 August 2026**.

**The article text itself is not reproduced in this repository.** It is Sky's copyright, the demo
does not load it at runtime, and a public mirror of a company's support content adds nothing to a
piece of interview work. The URLs are below so anything here can be checked at source.

🔴 **What is Sky's and what is mine, because the distinction matters.** The **platform split** is
Sky's, and it is the fact the whole design turns on. The **ordering of the diagnostic steps** the
demo runs is **mine**. Those steps do not appear in any Sky article, and the demo labels them
`informed by` rather than `source` for exactly that reason.

## The pages the design was built from

| Page | What it settled |
|---|---|
| `sky.com/help/articles/sky-tv-no-satellite-signal` | **The load-bearing one.** Offers exactly three device pickers: Sky+, Sky Q, Sky Q Mini. No Glass, no Stream |
| `sky.com/help/articles/setting-up-sky-stream` | The IP delivery path, and that no dish exists on it |
| `sky.com/help/articles/on-screen-message` | Error codes are surfaced to the customer on screen |
| `sky.com/help/articles/set-up-hub-which-sky-hub-do-you-have` | Device identification is already a step Sky asks customers to do |
| `sky.com/help/articles/cancel-sky-tv` | The cancellation journey, and the **31 days' notice** requirement |
| `sky.com/help/articles/charges-for-ending-your-sky-contract-early` | Why contract state is the fork that matters, and why not seeing it is a real gap |
| `sky.com/help/articles/change-your-mix` | Entitlement changes are self-serve |
| `sky.com/help/articles/return-or-recycle-sky-equipment` | The cancellation cluster extends past the cancel itself |
| `sky.com/help/articles/sky-bills-and-payments` | The billing cluster, deliberately out of scope here |
| `sky.com/help/articles/broadband-speeds-explained` | Broadband faults, out of scope for this slice |

## The one fact everything else rests on

`sky-tv-no-satellite-signal` offers **Sky+, Sky Q and Sky Q Mini** and nothing else.

Sky Q and Sky+ are satellite. Glass and Stream are IP. So the satellite diagnostic does not merely
differ on an IP platform, **it does not exist** — and a household routinely spans both. That is why
this resolves the *service instance* rather than the account.

## Everything else cited

| Claim | Source |
|---|---|
| ~25 million contact centre calls a year across Europe, ~17 million by 2029 | Reported March 2025. **Reached the press as a briefing, not an on-record Sky statement.** Treat as direction of travel |
| The European perimeter has changed | Sky Deutschland went to RTL, completed 1 June 2026 |
| Sky joint-lowest for fixed broadband complaints, 5 per 100,000 vs an average of 6 | Ofcom complaints data, Q1 2026, published 23 July 2026. **Narrow measure:** the same release has Sky Mobile as the most complained-about mobile provider |
| Leaving must not be more hassle than joining | Ofcom Fairness for Customers commitments, 2019, commitment 5. Sky a signatory. **Voluntary, not statutory** |
| The binding switching instrument | One Touch Switch, live 12 September 2024. **Broadband and landline only, not pay-TV** |
| Disclosing that a system is an AI | EU AI Act Article 50, applies from 2 August 2026. Sky operates in Ireland and Italy |
| Logging a reason, and the right to contest | UK automated decision-making rules, Data (Use and Access) Act, in force 5 February 2026. Note these **liberalised** the regime and bite on decisions that significantly affect a person; a box reboot is not one. Built to the stricter standard because cancellation and charges share the system |
| The layer names in the architecture tab | TM Forum's agentic AI framework for ODA, and AWS Prescriptive Guidance, *Agentic AI architecture in the enterprise*. Borrowed rather than invented. Accenture publish **AI Refinery** and the **distiller** SDK; what I could not find was a layered reference architecture at this tier to map a contact journey onto |
