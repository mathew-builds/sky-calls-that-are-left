# Sky: the calls that are left

A working slice, built for an Accenture take-home. In March 2025 Sky briefed that it takes around
25 million contact centre calls a year across Europe, and the Times reported it expects that to fall
to about 17 million by 2029. It already runs a Virtual Assistant, so answering questions is its
status quo. **This is about the calls that are left: the ones where a customer needs something done
to their account.**

*(The volume figures reached the press as a briefing, not as an on-record Sky statement, and the
European perimeter has changed since: Sky Deutschland went to RTL on 1 June 2026. Treat them as
direction of travel.)*

## Run it

Open `index.html`. That is the whole instruction. One file, no build, no dependencies, no server.

```
node selftest.mjs     # 17 assertions across 6 scenarios, needs playwright
```

## What is real here and what is not

| | |
|---|---|
| **Real** | The four TV platforms and the two delivery models, taken from Sky's live help pages (URLs in `SOURCES.md`, scraped 20 Aug 2026). The classification prompt. The step logic, the staleness guard, the outage short-circuit, the audit log |
| **Faked** | Accounts, service instances, entitlement and telemetry values. None of that is public, so it is synthetic and the demo says so on screen |
| **Replayed** | Model responses. A static page cannot safely hold an API key, so the prompts are real and the responses are recorded. The prompt is displayed rather than hidden |
| **Not built** | Auth, error handling, retries, a real action API, advisor desktop integration. The brief descoped polish and robustness in those words |

The architecture tab marks every box as one of these three, so the boundary is visible rather than
implied.

## The one fact the design turns on

`sky.com/help/articles/sky-tv-no-satellite-signal` offers exactly three device pickers: **Sky+,
Sky Q, Sky Q Mini**. No Glass. No Stream.

Sky Q and Sky+ are satellite. Glass and Stream are IP. So the satellite diagnostic does not merely
differ on an IP platform, **it does not exist**. And a household routinely spans both: Sky Q in the
lounge, a Stream puck in a bedroom. That is why the agent resolves the **service instance** rather
than the account, and why guessing is the most expensive available mistake.

## How I would know it worked

**Deflection rate is the wrong measure.** A contact closed on Monday that returns on Wednesday
counts twice as a win, the dashboard goes green, and actual volume is flat.

- **The measure is repeat contact rate inside seven days.** Definitions and denominator agreed with
  Sky before anything ships, because arguing about the baseline afterwards is how these programmes
  die.
- **Before go-live:** a labelled sample of real contacts, scored against what advisors actually did.
  Accuracy on the platform-resolution step specifically, because everything downstream depends on it.
- **After go-live:** a holdout. Sky runs at about 5 Ofcom complaints per 100,000 customers. At that
  base rate a quality regression caused by this system stays statistically invisible for months
  unless a comparison group exists. A dashboard will not find it.

That is the honest gap in most deflection programmes: the headline constraint is "do not break
quality" and nothing in the design can observe whether quality broke.

## Testing

`selftest.mjs` drives six scenarios and asserts 17 things. **Four of those assertions are positive
controls**, and they are the point:

- The staleness guard fires on conflicting reads, **and does not fire on fresh ones**
- The outage short-circuit fires when toggled on, **and does not fire when toggled off**

A gate that has only ever seen good input is untested. Checking that something fires proves nothing
unless you also check it stays quiet when it should.

## Deliberate gaps

Both are visible in the interface, not hidden in a comment.

1. **It cannot see contract state.** So it cannot tell an in-contract customer from an out-of-contract
   one, which is the fork that decides whether an early-termination charge applies.
2. **It does not know what the Virtual Assistant already tried.** So it may repeat it, and the
   customer would notice before anyone else did.

## How this was built

`DIRECTION.md`. Short version: directed in conversation rather than typed, checked by
running it rather than reading it, and a security check caught an injection hole in a free-text field
that was removed rather than escaped.

## Sources

Sky help pages, scraped 20 August 2026 — URLs in `SOURCES.md`, article text not reproduced · Ofcom complaints data, Q1 2026, published
23 July 2026 · Ofcom Fairness for Customers commitments, 2019, Sky a signatory · One Touch Switch,
live 12 September 2024, broadband and landline only · EU AI Act Article 50, applies from 2 August
2026 · UK automated decision-making rules, Data (Use and Access) Act, in force 5 February 2026.
