import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function BarChart({ data, label }) {
  return (
    <div role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 12, right: 12, bottom: 32, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" name="Jumlah" fill="var(--vd-curator-teal)" radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
      <ul className="visually-hidden">{data.map((item) => <li key={item.name}>{item.name}: {item.value}</li>)}</ul>
    </div>
  );
}
