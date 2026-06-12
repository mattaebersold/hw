const CONDITIONS = ['In Packaging', 'Near Mint', 'Good', 'Fair', 'Poor'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Limited Edition'];
const BRANDS = ['Hot Wheels', 'Matchbox', 'Johnny Lightning', 'Majorette', 'Greenlight', 'M2 Machines', 'Auto World', 'Other'];

export default function AiDraftForm({ data, onChange }) {
  const field = (key) => ({
    value: data[key] ?? '',
    onChange: (e) => onChange({ ...data, [key]: e.target.value }),
  });

  const checkField = (key) => ({
    checked: !!data[key],
    onChange: (e) => onChange({ ...data, [key]: e.target.checked }),
  });

  return (
    <div className="space-y-5">
      <Field label="Title *">
        <input {...field('title')} placeholder="e.g. Hot Wheels 2019 Super Treasure Hunt Mustang" className={inputCls} />
      </Field>

      <Field label="Description">
        <textarea {...field('description')} rows={3} className={`${inputCls} resize-none`} placeholder="Describe the car and its condition..." />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Your Price ($) *">
          <input type="number" min={0} step={0.01} {...field('price')} placeholder="0.00" className={inputCls} />
        </Field>
        <Field label="Brand">
          <select {...field('brand')} className={inputCls}>
            <option value="">Select brand</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Make">
          <input {...field('make')} placeholder="e.g. Ford" className={inputCls} />
        </Field>
        <Field label="Model">
          <input {...field('model')} placeholder="e.g. Mustang GT500" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Series">
          <input {...field('series')} placeholder="e.g. Treasure Hunt" className={inputCls} />
        </Field>
        <Field label="Year">
          <input type="number" {...field('year')} placeholder="e.g. 2019" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Condition">
          <select {...field('condition')} className={inputCls}>
            <option value="">Select condition</option>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Rarity">
          <select {...field('rarity')} className={inputCls}>
            <option value="">Select rarity</option>
            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      {(data.estimatedValueLow || data.estimatedValueHigh) && (
        <div className="bg-gray-800 rounded-xl p-4 space-y-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">AI Estimated Value</p>
          <p className="text-white font-semibold">${data.estimatedValueLow} – ${data.estimatedValueHigh}</p>
        </div>
      )}

      {/* {data.aiNotes && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">AI Notes</p>
          <p className="text-gray-300 text-sm">{data.aiNotes}</p>
        </div>
      )} */}
    </div>
  );
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-gray-500 placeholder-gray-500';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
