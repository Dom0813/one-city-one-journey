import { useState } from 'react';
import { ALL } from '../data/metro.js';
import { loadData, resolve } from '../lib/data.js';
import { journeys } from '../lib/journey.js';
import { explainJourney } from '../lib/ai.js';
import MetroMap from '../components/MetroMap.jsx';

const SAMPLE_TRIPS = [
  ['Naroda', 'GIFT City'],
  ['Chandkheda', 'Paldi'],
  ['Maninagar', 'Mahatma Mandir'],
  ['Satellite', 'Motera Stadium']
];

export default function JourneyPage() {
  const [data] = useState(() => loadData());
  const [fromInput, setFromInput] = useState('Naroda');
  const [toInput, setToInput] = useState('GIFT City');
  const [results, setResults] = useState(() => {
    const initial = journeys('Naroda', 'GIFT City', loadData());
    try {
      if (initial && initial[0]) {
        localStorage.setItem('oc_last_journey', JSON.stringify(initial[0]));
      }
    } catch {
      // ignore
    }
    return initial;
  });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [savedJourneys, setSavedJourneys] = useState(() => {
    try {
      const raw = localStorage.getItem('oc_saved');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const showToast = msg => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const areas = Object.keys(data.places || {});
  const allSuggestions = [...areas, ...ALL];

  const handlePlan = (f = fromInput, t = toInput) => {
    const fRes = resolve(f, data);
    const tRes = resolve(t, data);

    if (!fRes || !tRes) {
      showToast('Please enter a valid area or metro station name.');
      return;
    }
    if (fRes.name === tRes.name) {
      showToast('From and To destinations must be different.');
      return;
    }

    const res = journeys(fRes.name, tRes.name, data);
    if (!res || res.length === 0) {
      showToast('No multimodal route found between these locations.');
      setResults([]);
      return;
    }

    setResults(res);
    setSelectedIdx(0);
    setAiResult(null);

    try {
      localStorage.setItem('oc_last_journey', JSON.stringify(res[0]));
    } catch {
      // ignore
    }
  };

  const currentJourney = results[selectedIdx] || null;

  const handleSaveJourney = () => {
    if (!currentJourney) return;
    try {
      const updated = [
        {
          id: Date.now(),
          from: currentJourney.from,
          to: currentJourney.to,
          oneFare: currentJourney.oneFare,
          minutes: currentJourney.totalMinutes,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...savedJourneys.filter(s => !(s.from === currentJourney.from && s.to === currentJourney.to))
      ].slice(0, 10);

      localStorage.setItem('oc_saved', JSON.stringify(updated));
      setSavedJourneys(updated);
      showToast('Journey saved to device (available offline)!');
    } catch {
      showToast('Could not save journey.');
    }
  };

  const handleOpenSaved = item => {
    setFromInput(item.from);
    setToInput(item.to);
    handlePlan(item.from, item.to);
  };

  const handleShareWhatsApp = () => {
    if (!currentJourney) return;
    const text = encodeURIComponent(
      `Trip: ${currentJourney.from} to ${currentJourney.to}\n` +
      `⏱️ Duration: ${currentJourney.totalMinutes} mins | 🚶 Walk: ${currentJourney.walkMinutes} mins\n` +
      `🎫 One Journey Fare: ₹${currentJourney.oneFare} (Saved ₹${currentJourney.savings} vs ₹${currentJourney.ownTickets})\n` +
      `Planned via One Journey (Metro + BRTS + AMTS).`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleExplainAi = async () => {
    if (!currentJourney) return;
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const res = await explainJourney(currentJourney);
      setAiResult(res);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <section className="wrap" style={{ padding: '16px 20px 48px' }}>
      {toastMessage && (
        <div id="toast" className="on" role="status">
          {toastMessage}
        </div>
      )}

      {/* Hero Header */}
      <div className="pill">
        <span className="dot"></span>PS-08 • Metro + BRTS + AMTS in one journey
      </div>
      <h1>
        One city, <span>one journey.</span>
      </h1>
      <p className="mut" style={{ fontSize: '17px', lineHeight: '1.55', maxWidth: '620px', margin: '0 0 20px' }}>
        Seamless unified journey planner combining Ahmedabad & Gandhinagar Metro, Janmarg BRTS, and AMTS with one single discounted fare, walking transfer guidance, and automated clearing house settlement.
      </p>

      {/* Top Planner Grid */}
      <section className="top">
        {/* Form Card */}
        <div className="col">
          <form
            id="pf"
            className="card"
            onSubmit={e => {
              e.preventDefault();
              handlePlan();
            }}
          >
            <label className="fld">
              From (area or metro station)
              <input
                id="from-input"
                list="transit-nodes"
                value={fromInput}
                onChange={e => setFromInput(e.target.value)}
                placeholder="e.g. Naroda or Kalupur"
                autoComplete="off"
                required
              />
            </label>

            <label className="fld">
              To (area or metro station)
              <input
                id="to-input"
                list="transit-nodes"
                value={toInput}
                onChange={e => setToInput(e.target.value)}
                placeholder="e.g. GIFT City or Paldi"
                autoComplete="off"
                required
              />
            </label>

            <datalist id="transit-nodes">
              {allSuggestions.map(n => (
                <option key={n} value={n} />
              ))}
            </datalist>

            <div style={{ margin: '14px 0 16px' }}>
              <span className="mut" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                One-tap sample trips:
              </span>
              <div className="row">
                {SAMPLE_TRIPS.map(([f, t]) => (
                  <button
                    key={`${f}-${t}`}
                    type="button"
                    className="ghost"
                    style={{ fontSize: '12px', minHeight: '36px', padding: '0 12px' }}
                    onClick={() => {
                      setFromInput(f);
                      setToInput(t);
                      handlePlan(f, t);
                    }}
                  >
                    {f} → {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="row">
              <button type="submit" className="btn" style={{ flex: '1 1 180px' }}>
                Plan journey
              </button>
            </div>
          </form>

          {/* Saved Journeys Card */}
          {savedJourneys.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '16px' }}>Saved journeys (available offline)</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedJourneys.map(s => (
                  <div key={s.id} className="row between" style={{ padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
                    <div>
                      <b style={{ fontSize: '14px' }}>
                        {s.from} → {s.to}
                      </b>
                      <div className="mut" style={{ fontSize: '12px' }}>
                        ₹{s.oneFare} • {s.minutes} mins • Saved at {s.time}
                      </div>
                    </div>
                    <button type="button" className="ghost" style={{ minHeight: '34px', padding: '0 10px', fontSize: '12px' }} onClick={() => handleOpenSaved(s)}>
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="col">
          {results.length > 0 && currentJourney ? (
            <div>
              {/* Tabs */}
              <div className="row" style={{ marginBottom: '12px', gap: '8px' }}>
                {results.map((j, idx) => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => {
                      setSelectedIdx(idx);
                      setAiResult(null);
                    }}
                    style={{
                      flex: '1 1 auto',
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      border: selectedIdx === idx ? '2px solid var(--acc)' : '1px solid var(--bd)',
                      background: selectedIdx === idx ? 'var(--card)' : 'transparent',
                      color: 'var(--tx)',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="row" style={{ gap: '6px', marginBottom: '4px' }}>
                      {j.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '99px',
                            background: tag === 'Saathi Pick' ? 'var(--acc)' : tag === 'Walk Less' ? 'var(--acc2)' : 'var(--yellow)',
                            color: 'var(--ink)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700' }}>
                      {j.totalMinutes} min • ₹{j.oneFare}
                    </div>
                    <div className="mut" style={{ fontSize: '12px' }}>
                      {j.walkMinutes} min walk
                    </div>
                  </button>
                ))}
              </div>

              {/* Journey Details Card */}
              <div className="card">
                <h2>
                  {currentJourney.from} to {currentJourney.to}
                </h2>

                {/* 4 Stat Tiles */}
                <div className="stats">
                  <div>
                    <b>{currentJourney.totalMinutes}</b>
                    total minutes
                  </div>
                  <div>
                    <b style={{ color: 'var(--acc)' }}>₹{currentJourney.oneFare}</b>
                    One Journey fare
                  </div>
                  <div>
                    <b>{currentJourney.walkMinutes}</b>
                    walking minutes
                  </div>
                  <div>
                    <b>{currentJourney.busMetroTransfers}</b>
                    bus-metro transfers
                  </div>
                </div>

                {/* Savings Box */}
                <div className="eco" style={{ lineHeight: '1.5' }}>
                  <b>
                    One Journey fare ₹{currentJourney.oneFare} instead of {currentJourney.operators.length} separate tickets totalling ₹{currentJourney.ownTickets}.
                    {currentJourney.savings > 0 ? ` You save ₹${currentJourney.savings}.` : ' Standard single-mode fare.'}
                  </b>
                  <div className="mut" style={{ fontSize: '13px', marginTop: '4px' }}>
                    Distance {currentJourney.totalKm} km • Saves ~{currentJourney.co2Kg} kg CO₂ compared to personal vehicle.
                  </div>
                </div>

                {/* Timeline Bar */}
                <h3 style={{ fontSize: '14px', margin: '14px 0 6px' }}>Journey Timeline</h3>
                <div
                  style={{
                    display: 'flex',
                    height: '24px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    margin: '6px 0 10px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--bd)'
                  }}
                >
                  {currentJourney.steps.map((step, idx) => {
                    const widthPct = Math.max(4, (step.min / currentJourney.totalMinutes) * 100);
                    let color = '#64748B'; // walk grey
                    if (step.type === 'wait') color = '#334155'; // wait dark grey
                    else if (step.mode === 'BRTS') color = 'var(--orange)';
                    else if (step.mode === 'AMTS') color = 'var(--teal)';
                    else if (step.mode === 'METRO') color = `var(--${step.line || 'blue'})`;

                    return (
                      <div
                        key={idx}
                        title={`${step.text} (${step.min} min)`}
                        style={{
                          width: `${widthPct}%`,
                          background: color,
                          height: '100%',
                          borderRight: '1px solid rgba(0,0,0,0.2)'
                        }}
                      />
                    );
                  })}
                </div>

                {/* Timeline Legend */}
                <div className="row" style={{ fontSize: '12px', color: 'var(--mut)', marginBottom: '16px' }}>
                  <span><i style={{ display: 'inline-block', width: '10px', height: '10px', background: '#64748B', borderRadius: '2px', marginRight: '4px' }}></i>Walk</span>
                  <span><i style={{ display: 'inline-block', width: '10px', height: '10px', background: '#334155', borderRadius: '2px', marginRight: '4px' }}></i>Wait</span>
                  <span><i style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--orange)', borderRadius: '2px', marginRight: '4px' }}></i>BRTS</span>
                  <span><i style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--teal)', borderRadius: '2px', marginRight: '4px' }}></i>AMTS</span>
                  <span><i style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--blue)', borderRadius: '2px', marginRight: '4px' }}></i>Metro</span>
                </div>

                {/* Step List */}
                <h3 style={{ fontSize: '14px', margin: '14px 0 8px' }}>Itinerary Steps</h3>
                <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                  {currentJourney.steps.map((st, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '8px 12px',
                        marginBottom: '6px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        background: st.isTransfer ? 'rgba(34, 211, 238, 0.12)' : 'var(--bg2)',
                        borderLeft: st.isTransfer ? '4px solid var(--acc)' : '4px solid var(--bd)'
                      }}
                    >
                      <div className="row between">
                        <span>
                          {st.text}
                          {st.isTransfer && (
                            <span style={{ color: 'var(--acc)', fontWeight: '700', marginLeft: '6px' }}>
                              (transfer walk)
                            </span>
                          )}
                        </span>
                        <b style={{ color: 'var(--mut)', fontSize: '13px' }}>{st.min} min</b>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Fare Split Table */}
                <h3 style={{ fontSize: '15px', margin: '18px 0 8px' }}>How the fare is shared between operators</h3>
                <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--bd)', color: 'var(--mut)' }}>
                        <th style={{ padding: '8px 6px' }}>Operator</th>
                        <th style={{ padding: '8px 6px' }}>Own Ticket</th>
                        <th style={{ padding: '8px 6px' }}>Share by Fare</th>
                        <th style={{ padding: '8px 6px' }}>Share by Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentJourney.splitByFare.map((op, i) => {
                        const distOp = currentJourney.splitByDist[i] || op;
                        return (
                          <tr key={op.name} style={{ borderBottom: '1px solid var(--bd)' }}>
                            <td style={{ padding: '8px 6px', fontWeight: '600' }}>{op.name}</td>
                            <td style={{ padding: '8px 6px' }}>₹{op.fare}</td>
                            <td style={{ padding: '8px 6px', color: 'var(--acc)', fontWeight: '700' }}>₹{op.share}</td>
                            <td style={{ padding: '8px 6px', color: 'var(--acc2)', fontWeight: '700' }}>₹{distOp.share}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ fontWeight: '700', color: 'var(--tx)' }}>
                        <td style={{ padding: '8px 6px' }}>Total</td>
                        <td style={{ padding: '8px 6px' }}>₹{currentJourney.ownTickets}</td>
                        <td style={{ padding: '8px 6px', color: 'var(--acc)' }}>₹{currentJourney.oneFare}</td>
                        <td style={{ padding: '8px 6px', color: 'var(--acc2)' }}>₹{currentJourney.oneFare}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Proportional Split Bar */}
                <div
                  style={{
                    display: 'flex',
                    height: '14px',
                    borderRadius: '7px',
                    overflow: 'hidden',
                    marginBottom: '18px',
                    background: 'var(--bg2)'
                  }}
                >
                  {currentJourney.splitByFare.map((op, i) => {
                    const widthPct = (op.share / currentJourney.oneFare) * 100;
                    const colors = ['var(--blue)', 'var(--orange)', 'var(--teal)'];
                    return (
                      <div
                        key={op.name}
                        title={`${op.name}: ₹${op.share}`}
                        style={{ width: `${widthPct}%`, background: colors[i % colors.length] }}
                      />
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="row" style={{ marginTop: '14px' }}>
                  <button type="button" className="ghost" onClick={handleSaveJourney}>
                    Save journey
                  </button>
                  <button type="button" className="ghost" onClick={handleShareWhatsApp}>
                    Share on WhatsApp
                  </button>
                  <button type="button" className="ghost" onClick={handleExplainAi} disabled={isAiLoading}>
                    {isAiLoading ? 'Explaining...' : 'Explain with local AI'}
                  </button>
                </div>

                {/* AI Explanation Card */}
                {aiResult && (
                  <div
                    style={{
                      marginTop: '16px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--bd)',
                      borderRadius: '16px',
                      padding: '14px 18px'
                    }}
                  >
                    <div className="row between" style={{ marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '99px',
                          background: aiResult.source.includes('Local AI') ? 'var(--acc2)' : 'var(--card)',
                          color: aiResult.source.includes('Local AI') ? 'var(--ink)' : 'var(--mut)'
                        }}
                      >
                        {aiResult.source}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--tx)' }}>
                      {aiResult.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card mut" style={{ textAlign: 'center', padding: '40px 20px' }}>
              Select From and To above and tap "Plan journey" to compute your multimodal route.
            </div>
          )}
        </div>
      </section>

      {/* Network Map Card */}
      <MetroMap
        legs={currentJourney?.metroRoute?.legs}
        originOpt={currentJourney?.originOpt}
        destOpt={currentJourney?.destOpt}
        fromName={currentJourney?.from || fromInput}
        toName={currentJourney?.to || toInput}
        onSelectStation={name => {
          if (!fromInput) setFromInput(name);
          else if (!toInput) {
            setToInput(name);
            handlePlan(fromInput, name);
          } else {
            setFromInput(name);
          }
        }}
      />
    </section>
  );
}
