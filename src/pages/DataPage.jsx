import { useState } from 'react';
import { loadData, saveData, resetData, validateData } from '../lib/data.js';

export default function DataPage() {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(loadData(), null, 2));
  const [errors, setErrors] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = msg => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const valErrors = validateData(parsed);
      if (valErrors.length > 0) {
        setErrors(valErrors);
        showToast('Validation failed. Please fix errors below.');
        return;
      }
      const res = saveData(parsed);
      if (res.success) {
        setErrors([]);
        showToast('Data applied and saved successfully!');
      } else {
        setErrors(res.errors);
      }
    } catch (e) {
      setErrors(['Invalid JSON syntax: ' + e.message]);
      showToast('Syntax error in JSON');
    }
  };

  const handleReset = () => {
    const def = resetData();
    setJsonText(JSON.stringify(def, null, 2));
    setErrors([]);
    showToast('Reset to default sample feeder data.');
  };

  return (
    <section className="wrap" style={{ padding: '16px 20px 48px' }}>
      <div className="pill">
        <span className="dot"></span>Data & Feeder Configuration Layer
      </div>
      <h1>Feeder Data <span>& Validation</span></h1>
      <p className="mut" style={{ fontSize: '16px', maxWidth: '640px', lineHeight: 1.5 }}>
        BRTS and AMTS feeders are illustrative sample data. Edit the JSON configuration below to drop in real routes and fare slabs. Changes take effect across the entire planner immediately.
      </p>

      {toastMessage && (
        <div id="toast" className="on" role="status">
          {toastMessage}
        </div>
      )}

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="row between" style={{ marginBottom: '12px' }}>
          <h2 style={{ margin: 0 }}>Editable System Configuration</h2>
          <div className="row">
            <button type="button" className="btn" onClick={handleApply}>
              Apply data
            </button>
            <button type="button" className="ghost" onClick={handleReset}>
              Reset to sample data
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--red)',
              borderRadius: '14px',
              padding: '14px 18px',
              marginBottom: '16px'
            }}
          >
            <b style={{ color: 'var(--red)', display: 'block', marginBottom: '8px' }}>
              Validation Errors ({errors.length}):
            </b>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--tx)', fontSize: '14px', lineHeight: '1.6' }}>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <label className="fld" style={{ margin: 0 }}>
          Configuration JSON (fares slabs, discount, and 10 feeder places)
          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            rows={22}
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'pre',
              tabSize: 2
            }}
            spellCheck={false}
          />
        </label>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Assumptions we made</h2>
        <ul style={{ lineHeight: '1.8', color: 'var(--mut)', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
          <li>
            <b style={{ color: 'var(--tx)' }}>Metro data is real public GMRC data:</b> All 53 operational stations across the Blue, Red, Yellow, and Violet lines.
          </li>
          <li>
            <b style={{ color: 'var(--tx)' }}>Feeder network is illustrative sample data:</b> 10 major residential and commercial hubs (Chandkheda, Gota, Naroda, Maninagar, Ghatlodia, Memnagar, Satellite, Bopal, Vasna, Sarkhej) connecting to their nearest metro interchange nodes via BRTS (Janmarg) and AMTS.
          </li>
          <li>
            <b style={{ color: 'var(--tx)' }}>Unified One Journey pricing:</b> Commuters using 2 or more operators receive a 10% discount on the sum of individual fares, rounded to the nearest whole rupee. Single-operator trips retain standard fares.
          </li>
          <li>
            <b style={{ color: 'var(--tx)' }}>Transfer walks and headways:</b> Transfer walks between feeder bus stops and metro concourses are estimated realistically (3–6 minutes). Commuter wait time is modeled as half the published headway.
          </li>
          <li>
            <b style={{ color: 'var(--tx)' }}>Bus distance proxy:</b> Bus route distance is estimated at 0.9 km per stop for proportional fare-split calculations.
          </li>
          <li>
            <b style={{ color: 'var(--tx)' }}>Clearing house settlement:</b> Revenue is settled daily via the Public-Private Partnership clearing house by fare proportion or passenger distance.
          </li>
        </ul>
      </div>
    </section>
  );
}
