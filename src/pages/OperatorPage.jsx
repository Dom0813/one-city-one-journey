import { useState, useMemo } from 'react';
import { journeys, splitOf } from '../lib/journey.js';
import { loadData } from '../lib/data.js';

export default function OperatorPage() {
  const [tripsPerDay, setTripsPerDay] = useState(10000);
  const [discountPct, setDiscountPct] = useState(10);
  const [sharingRule, setSharingRule] = useState('fare'); // 'fare' or 'dist'

  // Load last planned journey from localStorage or fallback to Naroda -> GIFT City
  const journey = useMemo(() => {
    try {
      const raw = localStorage.getItem('oc_last_journey');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    const def = journeys('Naroda', 'GIFT City', loadData());
    return def[0] || null;
  }, []);

  if (!journey) {
    return (
      <section className="wrap" style={{ padding: '24px 20px' }}>
        <h1>Operator view</h1>
        <p className="mut">No journey planned yet. Please plan a journey on the planner page first.</p>
      </section>
    );
  }

  // Recalculate with dynamic discount slider
  const dynamicDiscount = discountPct / 100;
  const dynOneFare = journey.operators.length >= 2
    ? Math.round(journey.ownTickets * (1 - dynamicDiscount))
    : journey.ownTickets;

  const dynDiscountAmountPerTrip = journey.ownTickets - dynOneFare;
  const totalDailyDiscountCost = tripsPerDay * dynDiscountAmountPerTrip;

  // Break-even growth formula: Y = ((own-ticket total / One Journey fare) - 1) * 100
  const breakEvenPct = dynOneFare > 0
    ? +(((journey.ownTickets / dynOneFare) - 1) * 100).toFixed(1)
    : 0;

  // Dynamic splits
  const splits = splitOf(journey.operators, dynOneFare, journey.ownTickets, sharingRule);

  return (
    <section className="wrap" style={{ padding: '16px 20px 48px' }}>
      <div className="pill">
        <span className="dot"></span>PS-08 • Operator Economics & PPP Settlement
      </div>
      <h1>
        Operator <span>view</span>
      </h1>
      <p className="mut" style={{ fontSize: '16px', maxWidth: '640px', lineHeight: 1.5 }}>
        Revenue settlement, daily money flow simulation, and Public-Private Partnership (PPP) model across GMRC, Janmarg BRTS, and AMTS.
      </p>

      {/* Assumptions & Sliders Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Simulation Assumptions & Controls</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '14px' }}>
          <div>
            <label className="fld">
              Multimodal trips per day: <b style={{ color: 'var(--tx)', fontSize: '16px' }}>{tripsPerDay.toLocaleString()}</b>
              <span className="mut" style={{ display: 'block', fontSize: '11px' }}>(assumption: 1,000 to 50,000)</span>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={tripsPerDay}
                onChange={e => setTripsPerDay(+e.target.value)}
                style={{ padding: '6px 0', marginTop: '8px' }}
              />
            </label>
          </div>

          <div>
            <label className="fld">
              One Journey discount: <b style={{ color: 'var(--acc)', fontSize: '16px' }}>{discountPct}%</b>
              <span className="mut" style={{ display: 'block', fontSize: '11px' }}>(assumption: 0% to 25%)</span>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={discountPct}
                onChange={e => setDiscountPct(+e.target.value)}
                style={{ padding: '6px 0', marginTop: '8px' }}
              />
            </label>
          </div>

          <div>
            <label className="fld">
              Clearing sharing rule:
              <select
                value={sharingRule}
                onChange={e => setSharingRule(e.target.value)}
                style={{ marginTop: '8px', minHeight: '44px' }}
              >
                <option value="fare">Proportional to Own Fare</option>
                <option value="dist">Proportional to Distance Traveled</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Daily Money Flow Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="row between" style={{ marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>
            Daily Money Flow ({journey.from} → {journey.to})
          </h2>
          <span className="pill" style={{ margin: 0, padding: '4px 10px', fontSize: '12px' }}>
            Base single-trip: ₹{dynOneFare} (Own: ₹{journey.ownTickets})
          </span>
        </div>

        <div style={{ overflowX: 'auto', margin: '14px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd)', color: 'var(--mut)' }}>
                <th style={{ padding: '10px 8px' }}>Operator</th>
                <th style={{ padding: '10px 8px' }}>Revenue Today (Own Tickets)</th>
                <th style={{ padding: '10px 8px' }}>With One Journey ({sharingRule === 'fare' ? 'By Fare' : 'By Distance'})</th>
                <th style={{ padding: '10px 8px' }}>Daily Change</th>
              </tr>
            </thead>
            <tbody>
              {splits.map(op => {
                const todayRev = op.fare * tripsPerDay;
                const unifiedRev = op.share * tripsPerDay;
                const change = unifiedRev - todayRev;
                const isPositive = change >= 0;

                return (
                  <tr key={op.name} style={{ borderBottom: '1px solid var(--bd)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{op.name}</td>
                    <td style={{ padding: '10px 8px' }}>₹{todayRev.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', fontWeight: '700', color: 'var(--acc)' }}>
                      ₹{unifiedRev.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '10px 8px',
                        fontWeight: '700',
                        color: isPositive ? 'var(--acc2)' : 'var(--red)'
                      }}
                    >
                      {isPositive ? `+₹${change.toLocaleString()}` : `-₹${Math.abs(change).toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: '700', color: 'var(--tx)', borderTop: '2px solid var(--bd)' }}>
                <td style={{ padding: '12px 8px' }}>Total System</td>
                <td style={{ padding: '12px 8px' }}>₹{(journey.ownTickets * tripsPerDay).toLocaleString()}</td>
                <td style={{ padding: '12px 8px', color: 'var(--acc)' }}>
                  ₹{(dynOneFare * tripsPerDay).toLocaleString()}
                </td>
                <td
                  style={{
                    padding: '12px 8px',
                    color: totalDailyDiscountCost === 0 ? 'var(--mut)' : 'var(--red)'
                  }}
                >
                  {totalDailyDiscountCost === 0 ? '₹0' : `-₹${totalDailyDiscountCost.toLocaleString()}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Break-even economics statement */}
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--bd)',
            borderRadius: '14px',
            padding: '14px 18px',
            lineHeight: '1.6',
            fontSize: '14px'
          }}
        >
          <span style={{ color: 'var(--mut)', display: 'block' }}>
            The discount costs about <b style={{ color: 'var(--red)' }}>₹{totalDailyDiscountCost.toLocaleString()}</b> per day (assumption based on {tripsPerDay.toLocaleString()} daily trips).
          </span>
          <span style={{ display: 'block', marginTop: '4px' }}>
            To break even, multimodal trips must grow by about <b style={{ color: 'var(--acc2)' }}>{breakEvenPct}%</b>.
          </span>
        </div>
      </div>

      {/* PPP Framework Card with 4 blocks */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>How a PPP could build, run and fund this</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}
        >
          {/* Build */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bd)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div className="row" style={{ gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--blue)', color: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                BUILD
              </span>
              <b style={{ fontSize: '15px' }}>Journey Gateway</b>
            </div>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--mut)' }}>
              A private technology partner builds the central Journey Gateway (routing engine, unified pricing algorithm, clearing and settlement engine) on open GTFS and fare APIs provided by GMRC, AJL, and AMTS.
            </p>
          </div>

          {/* Run */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bd)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div className="row" style={{ gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--orange)', color: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                RUN
              </span>
              <b style={{ fontSize: '15px' }}>Clearing House</b>
            </div>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--mut)' }}>
              The private partner operates a daily automated clearing house that reconciles every unified NCMC smart card or UPI tap across GMRC, AJL (Janmarg), and AMTS, settling disbursements the next morning (T+1).
            </p>
          </div>

          {/* Pay */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bd)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div className="row" style={{ gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--teal)', color: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                PAY
              </span>
              <b style={{ fontSize: '15px' }}>Self-Sustaining Model</b>
            </div>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--mut)' }}>
              The partner earns a 1.5% transaction fee per settled multimodal journey plus contextual brand partnerships. Transit operators fund the 10% discount entirely through ridership volume expansion.
            </p>
          </div>

          {/* Pilot */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bd)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div className="row" style={{ gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--acc2)', color: 'var(--ink)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                PILOT
              </span>
              <b style={{ fontSize: '15px' }}>3-Month Hub Rollout</b>
            </div>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--mut)' }}>
              Launch at major existing physical interchange nodes (Sabarmati, AEC, Ranip, and Vadaj) for 3 months to measure transfer friction reduction, operator revenue changes, and car-to-transit modal shift.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
