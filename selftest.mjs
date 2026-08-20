import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
// Relative, so the pack works wherever it lands.
const URL = pathToFileURL(resolve(import.meta.dirname, 'index.html')).href;
const b = await chromium.launch();
let fails = 0;
const ok = (n, c, d='') => { console.log((c?'  PASS  ':'  FAIL  ')+n+(d?'   '+d:'')); if(!c) fails++; };

async function drive({msg, caller='J. Whitfield', outage=false, pick=null}) {
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL);
  await p.selectOption('#msg', msg);
  await p.selectOption('#caller', caller);
  if (outage) await p.check('#outage');
  await p.click('#run');
  await p.waitForTimeout(1400);
  if (pick !== null) {
    const btns = await p.$$('#flow .choices button');
    if (btns[pick]) { await btns[pick].click(); await p.waitForTimeout(2200); }
  }
  await p.waitForTimeout(600);
  const r = {
    flow: await p.innerText('#flow'),
    log:  await p.innerText('#log'),
    errs
  };
  await p.close();
  return r;
}

console.log('\n=== 1. STALENESS GUARD must FIRE on conflicting reads ===');
let r = await drive({msg:'i upgraded yesterday and now nothing works'});
ok('detects the conflict',        /disagree|conflict/i.test(r.flow));
ok('marks a read STALE',          /STALE/.test(r.flow));
ok('refuses to act',              /Refused to act on stale state/.test(r.log));
ok('does NOT run a diagnostic',  !/Check the cable from the dish|Check broadband is up/.test(r.flow),
   '(guessing a platform here would be the bug)');
ok('no page errors',              r.errs.length===0);

console.log('\n=== 2. CONTROL: same shape of message, fresh reads, MUST diagnose ===');
r = await drive({msg:'my picture keeps breaking up', pick:1});
ok('runs the IP diagnostic',      /Check broadband is up/.test(r.flow));
ok('takes an action',             /Re-send activation/.test(r.log));
ok('no staleness refusal',       !/Refused to act on stale state/.test(r.log),
   '(proves test 1 was a real detection, not always-on)');

console.log('\n=== 3. OUTAGE short-circuit must FIRE when toggled on ===');
r = await drive({msg:'my picture keeps breaking up', outage:true});
ok('matches the incident',        /INC-20418/.test(r.flow));
ok('stops before diagnosis',     !/Check broadband is up|Check the cable from the dish/.test(r.flow));
ok('logs answering from incident',/Answered from incident/.test(r.log));

console.log('\n=== 4. CONTROL: same message, outage OFF, MUST diagnose ===');
r = await drive({msg:'my picture keeps breaking up', outage:false, pick:0});
ok('runs the satellite diagnostic',/Check the cable from the dish/.test(r.flow));
ok('no incident matched',        !/INC-20418/.test(r.flow),
   '(proves test 3 was the toggle, not always-on)');

console.log('\n=== 5. Existing paths still pass ===');
r = await drive({msg:'i want to cancel my sky tv'});
ok('cancellation request completes inline', /Cancellation requested/.test(r.log));
ok('no human queue',                       /does not route to a human queue/.test(r.flow));
ok('logged NOT reversible',                /not reversible/.test(r.log),
   '(a cancellation starts a 31-day notice period and may trigger an ETC)');
ok('the 31-day notice is on screen',       /31 days/.test(r.flow));
ok('the unreadable contract state is stated', /contract state not readable/.test(r.flow));

r = await drive({msg:'no satellite signal on my box', caller:'R. Doyle', pick:0});
ok('unauthorised is blocked',       /Not authorised/.test(r.flow));
ok('but still diagnoses and hands over', /Handed to advisor/.test(r.log));

console.log('\n=== 6. Each contact is SEPARATE: the audit log must not accumulate ===');
/* drive() opens a fresh page per scenario, so it structurally cannot observe state carried
   between runs. This block reuses ONE page on purpose. */
{
  const p = await b.newPage();
  await p.goto(URL);
  const runOne = async (msg, pick) => {
    await p.selectOption('#msg', msg);
    await p.click('#run');
    await p.waitForTimeout(1300);
    if (pick !== null) { const c = p.locator('.choice').first(); if (await c.count()) await c.click(); }
    await p.waitForTimeout(2200);
    return {
      rows: await p.locator('.logrow').count(),
      first: (await p.locator('.logrow .logtop b').allInnerTexts())[0] || ''
    };
  };
  const a = await runOne('my picture keeps breaking up', 0);
  ok('first contact logs its action', a.rows === 1);
  const c = await runOne('i want to cancel my sky tv', null);
  ok('second contact logs ONLY its own action', c.rows === 1,
     '(without the reset this is 2 - the previous contact is still in the ledger)');
  ok('and renumbers from #1',        c.first.startsWith('#1'));
  ok('and it is the NEW action',     /Cancellation/.test(c.first),
     '(proves the log was rebuilt, not merely truncated)');
  await p.close();
}

console.log('\n' + (fails ? 'FAILURES: '+fails : 'ALL PASS'));
await b.close();
process.exit(fails ? 1 : 0);
