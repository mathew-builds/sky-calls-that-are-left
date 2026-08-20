# Direction record

How this was actually built, written while building it rather than reconstructed afterwards.

---

## What actually happened, stated plainly

**I directed this build in conversation. Claude wrote the code. I was not at the keyboard.**

I originally intended to type it myself so the record would be unambiguously mine, and I changed my
mind on 2026-08-20 and had Claude build it while I directed and reviewed. Both are legitimate ways to
work. Describing it as anything other than what it was would not be.

What I did do: chose the company and the problem, decided what the slice had to demonstrate and why,
rejected work that was wrong, and checked the result by running all three paths rather than by
reading the code. Where that catching actually happened, and where it did not, is recorded below
without tidying.

---

## The build

> ⚠️ **This section describes SESSION 1 and is superseded by Session 2 below.** The three files were
> collapsed into one, and the `file://` claim below turned out to be a defect, not a constraint.

| | |
|---|---|
| Files | ~~`index.html` (161), `app.js` (362), `data.js` (132)~~ → now **one file**, 801 lines |
| Runs on | Any static host. No server, no build step, no dependencies |
| Data | 10 real Sky help articles scraped 2026-08-20 (URLs in `SOURCES.md`; article text not reproduced here) |
| Synthetic | Accounts and service instances. None of that is public |
| Tested | Playwright, three paths, all pass |

**Deliberately not built:** auth, error handling, retries, tests, responsive layout. The brief
descoped polish and robustness in those words.

## What was delegated, and what was checked by hand

**Delegated to the model:** all the code, the CSS, the flow structure.

**Checked by running it, not by reading it:**

- Served over HTTP and driven with Playwright. ~~`file://` will not work, because ES modules are
  blocked on that scheme.~~ **This was the defect, not a constraint. Fixed in Session 2: it now opens
  from `file://`.**
- **Three paths run end to end:** authorised fault on an IP platform through to an action; the same
  fault from an unauthorised caller; and cancellation.
- Console checked for errors. One, a missing favicon. Nothing else.
- The audit log verified to render with reason, timestamp, reversibility and a contest link.

## 🔴 Two things that went wrong, and how they were caught

**1. An injection hole in the caller field.**
The first version had a free-text input for the caller's name, and that value went straight into
`innerHTML`. A security check fired on the write and flagged it as an XSS pattern.

**Caught by tooling, not by a person.** The fix was not to escape the input, it was
to remove the free-text surface: callers became a fixed dropdown of three personas. Escaping is also
in place as a second layer. A demo about acting safely on customer accounts cannot itself ship an
injection hole, whatever the brief says about robustness.

**2. The shell working directory drifted mid-build.**
The second batch of scraped articles landed in `build/content/build/content` instead of
`build/content`. Caught because the next command failed with "no such file or directory". Fixed by
flattening and using absolute paths from then on. Trivial, but it is the kind of thing that silently
puts files somewhere nobody looks.

## What emerged during the build that was not designed up front

**The unauthorised path is better than the authorised one for the argument.** When the caller is not
allowed to act, the agent still completes the diagnosis and hands it over with the handoff. So the
advisor does not start again. That was not planned; it fell out of ordering the steps that way, and
it happens to answer question 3 on the single page directly.

## Choices that were defaults, not decisions

Worth saying out loud, because back-filling a rationale for every choice is the tell of someone who
has not shipped this way.

| Choice | Honest status |
|---|---|
| Plain ES modules, no framework | 🔴 **Wrong call, corrected in Session 2.** No framework was right; modules were not. They silently broke `file://` |
| Recorded model responses instead of a live call | **Decision.** A static page cannot hold an API key safely |
| Georgia / system fonts, the colour palette, the layout | **Defaults.** Nobody reasoned about them |
| The 7-second demo clock increment | **Default.** Arbitrary, and it does not mean anything |
| Five example contacts | **Default.** Enough to show the branches, no analysis behind the number |

---

## 🔴 The defect that would have been shipped

**The artifact did not open by double-clicking it.**

It was the only file in the entire repo using `type="module"`, and browsers block ES modules on the
`file://` scheme. So if the hosted link were unavailable, or it arrived as an attachment, or the
machine serving it had stopped, the page rendered blank.

**Nobody caught this by reading the code.** It surfaced from an exploration of what other artifacts
in this repo do differently, and roughly fifteen prior ones all use a single file with a classic
`<script>` and just open. The repo's own notes had already recorded the symptom without anyone
treating it as a defect.

**Fix:** collapsed three files into one. `data.js` and `app.js` folded into `index.html`. No modules,
no build, no server.

**This is the more interesting version of "what went wrong", and better than the injection hole,
because it was invisible in normal use.** The demo worked perfectly every time it was tested, because
it was always tested over HTTP.

## Verified by running it, not reading it

- **Opened from `file://` with no server**, driven by Playwright directly. Renders, no console errors.
  Playwright's MCP wrapper refuses the `file:` scheme; Playwright itself does not, so it was driven
  through Node instead.
- **`selftest.mjs`: 21 assertions across 6 scenarios, all pass.**
- 🔴 **Four of those assertions are positive controls, and they are the point.** The staleness guard
  fires on conflicting reads **and stays quiet on fresh ones**. The outage short-circuit fires when
  toggled on **and stays quiet when toggled off**. Checking that a gate fires proves nothing unless
  you also check it does not fire when it should not.
- The module check was itself controlled: the detection pattern was proved against a deliberately
  bad file first, because a grep returning zero is indistinguishable from a grep that is broken.

## Honest note on the architecture tab

It is labelled **"how I would build it"**, not presented as a reference architecture. The layer split
and the read/write separation are common practice, but the specific choices are mine and the page
says so. Claiming more in front of someone who architects these for a living would be the worst
possible trade.

---

## 🔴 A third round: what an adversarial review found after I thought it was finished

**2026-08-20, one week before the interview.** The build was done and the walkthrough written. I ran
three adversarial reviewers over the work rather than re-reading it myself, each told that "this is
accurate" counted as a failed review. **45 findings. Two rated fatal. Seven I re-verified by hand before changing anything.**

**The important part is where the fatal ones were.** Both were in the walkthrough script, not the
build, and both were introduced while *compressing* text that had been correct. One dropped two words
from a careful sentence and turned "no published **layered agentic** reference architecture I could
find" into a flat claim that Accenture has no reference architecture, said to Accenture. The other
narrated a code path that does not exist: the script said a toggle skipped a step and ended without a
diagnosis, and the code does neither.

**The lesson I did not expect: editing for length is a defect vector.** Every claim in the original
had been checked. The compression was not.

### Two code changes made as a result

Both were found by reading the code against the script, and neither is the "broken in interesting
ways" the brief invited. They were just wrong.

1. **The action log never reset between contacts.** `run()` cleared the step flow but not `auditLog`
   or the `T+` clock, so by the fifth scenario the sidebar showed one household rebooted twice,
   refused, told about a regional outage and then cancelled, all inside 35 seconds. On the one panel
   where the audit log is the point, that reads as broken rather than as evidence. Three lines.
2. **The diagnostic steps were credited to a Sky article that does not contain them.** The step rows
   rendered `source: sky.com/help/articles/...`. I grepped all ten scraped pages for all eight steps:
   **zero hits**, against controls that returned 8 and 2 files, so the search was working. The
   *platform split* is genuinely Sky's and is the fact the design turns on. The *ordering of the
   steps* is mine. The label now reads `informed by`, and the line underneath says so explicitly.

**Verified, and the verification had to be fixed first.** My first test of the log fix passed against
a deliberately un-fixed copy of the file, which meant it was testing nothing. Both assertions were
miscalibrated: a count threshold that the broken build also satisfied, and a timestamp that is
identical either way because the first entry keeps its original stamp. Recalibrated to assert the
second contact logs **exactly one** entry and renumbers from `#1`. It now passes on the fixed build
and fails on the pre-fix build.

`selftest.mjs` now reports **21 of 21, zero failures**. The four new assertions are scenario 6, which reuses a single page on purpose because the rest of the harness opens a fresh one per scenario and therefore cannot see state carried between contacts. They fail on the pre-fix build, which is the only reason passing on the fixed one means anything.

### One thing that was deliberately NOT fixed

The cancellation completes. Sky's own cancellation page, which is in the sources, says a customer
must give **31 days' notice** and that an early termination charge may apply and must be paid
upfront. The agent cannot read contract state at all, and the architecture tab names contract state
as the tier where a stale read becomes a customer detriment. **So completing it is wrong by the
design's own rule.**

It is left in, and named out loud in the walkthrough instead. The brief invited things that are
broken in interesting ways, and a defect you find and state yourself is worth more than a demo
quietly tidied up beforehand. A version that had been patched would also have removed the
only evidence that the rule and the behaviour were ever checked against each other.
