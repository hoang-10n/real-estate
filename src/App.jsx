import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter
} from 'recharts';
import { Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Removed invalid property access on L.Icon.Default
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// Mock data
const assets = [
  { id: 'A1', name: '1 King St', suburb: 'Surry Hills', postcode: '2010', nabersE: 4.5, nabersW: 4.0, energyConsumption: 450, certification: 'WELL Platinum', bushfire: 12, flood: 8, insurability: 'Low', lat: -33.883, lon: 151.213 },
  { id: 'A2', name: '200 George St', suburb: 'Parramatta', postcode: '2150', nabersE: 3.0, nabersW: 3.5, energyConsumption: 900, certification: 'WiredScore Gold', bushfire: 30, flood: 22, insurability: 'Medium', lat: -33.815, lon: 151.000 },
  { id: 'A3', name: '88 Collins Ave', suburb: 'Richmond', postcode: '2753', nabersE: 4.0, nabersW: 4.5, energyConsumption: 200, certification: 'WELL Silver', bushfire: 60, flood: 45, insurability: 'High', lat: -33.589, lon: 150.737 },
  { id: 'A4', name: '12 Harbour Rd', suburb: 'Mosman', postcode: '2088', nabersE: 5.0, nabersW: 5.0, energyConsumption: 300, certification: 'WELL Platinum', bushfire: 5, flood: 3, insurability: 'Low', lat: -33.830, lon: 151.241 }
];

const competitorAvg = assets.map(a => ({ name: a.name, competitorE: Math.max(2.8, a.nabersE - 0.4) }));

const lineData = assets.map(a => ({ name: a.name, assetEnergy: a.energyConsumption, marketAvg: 600 - a.nabersE * 50 }));

const pieData = [
  { name: 'Low', value: assets.filter(a => a.insurability === 'Low').length },
  { name: 'Medium', value: assets.filter(a => a.insurability === 'Medium').length },
  { name: 'High', value: assets.filter(a => a.insurability === 'High').length }
];
const COLORS = ['#34D399', '#F59E0B', '#EF4444'];

const certificationBreakdown = Object.entries(assets.reduce((acc, a) => { acc[a.certification] = (acc[a.certification] || 0) + 1; return acc; }, {})).map(([k, v]) => ({ name: k, value: v }));

const radarData = assets.map(a => ({ subject: a.name, Bushfire: a.bushfire, Flood: a.flood, Insurability: a.insurability === 'Low' ? 20 : (a.insurability === 'Medium' ? 50 : 80) }));

// Heatmap grid generator per postcode
const heatmapByPostcode = Object.values(assets.reduce((acc, a) => {
  if (!acc[a.postcode]) acc[a.postcode] = { postcode: a.postcode, suburb: a.suburb, bushfire: a.bushfire, flood: a.flood };
  return acc;
}, {}));

export default function App() {
  return (
    <div className="p-6 bg-gray-900 min-h-screen font-sans w-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Real Estate Investor Dashboard</h1>
        <p className="text-sm text-gray-600">One-page investor view — NABERS, certifications, risks and map.</p>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Left column: charts */}
        <div className="col-span-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray rounded-2xl p-4 shadow">
              <h3 className="font-medium mb-2">Asset NABERS Rating vs Competitor Average</h3>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assets.map((a, i) => ({ ...a, competitorE: competitorAvg[i].competitorE }))} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 6]} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="nabersE" name="Asset NABERS (E)" />
                    <Bar dataKey="competitorE" name="Competitor Avg" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray rounded-2xl p-4 shadow">
              <h3 className="font-medium mb-2">% of A-Grade stock in Suburb with WELL certification</h3>
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-4xl font-bold">{Math.round((assets.filter(a => a.certification.includes('WELL')).length / assets.length) * 100)}%</div>
                  <div className="text-sm text-gray-9000">A-Grade stock with WELL</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray rounded-2xl p-4 shadow">
            <h3 className="font-medium mb-2">Energy Consumption (Asset vs Market Average)</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="assetEnergy" name="Asset Consumption" stroke="#8884d8" />
                  <Line type="monotone" dataKey="marketAvg" name="Market Avg" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray rounded-2xl p-4 shadow">
              <h3 className="font-medium mb-2">Asset NABERS Energy & Water Ratings</h3>
              <div className="space-y-3">
                {assets.map(a => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.name} <span className="text-xs text-gray-9000">({a.suburb})</span></div>
                      <div className="text-xs text-gray-9000">Energy: {a.nabersE} • Water: {a.nabersW}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} className={`${i < Math.round(a.nabersE) ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{a.nabersE}/5</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray rounded-2xl p-4 shadow">
              <h3 className="font-medium mb-2">NABERS Energy vs Water (Bubble Chart)</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="nabersE" name="Energy" domain={[0, 6]} />
                    <YAxis type="number" dataKey="nabersW" name="Water" domain={[0, 6]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={assets} fill="#8884d8" shape={(props) => {
                                          const { cx, cy, payload } = props;
                                          const size = Math.max(8, Math.min(40, payload.energyConsumption / 30));
                                          return <circle cx={cx} cy={cy} r={size} opacity={0.7} />;
                                        }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray rounded-2xl p-4 shadow col-span-1">
              <h3 className="font-medium mb-2">Insurability Risk Breakdown</h3>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={60} label>
                      {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray rounded-2xl p-4 shadow col-span-1">
              <h3 className="font-medium mb-2">Certification Status Breakdown</h3>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={certificationBreakdown} dataKey="value" nameKey="name" outerRadius={60} label>
                      {certificationBreakdown.map((_, index) => <Cell key={index} fill={index % 2 ? '#60A5FA' : '#A78BFA'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray rounded-2xl p-4 shadow col-span-1">
              <h3 className="font-medium mb-2">Risk Radar</h3>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Risk" dataKey="Bushfire" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                    <Radar name="Flood" dataKey="Flood" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: map and heatmap */}
        <div className="col-span-4 space-y-4">
          <div className="bg-gray rounded-2xl p-4 shadow">
            <h3 className="font-medium mb-2">Map — Certified Assets</h3>
            <div style={{ height: 360 }} className="rounded">
              <MapContainer center={[-33.86, 151.20]} zoom={10} style={{ height: '100%', borderRadius: 12 }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {assets.map(a => (
                  <Marker key={a.id} position={[a.lat, a.lon]}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{a.name}</div>
                        <div>{a.suburb} {a.postcode}</div>
                        <div className="text-xs text-gray-600">{a.certification}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="bg-gray rounded-2xl p-4 shadow">
            <h3 className="font-medium mb-2">Climate Risk Heatmap (Bushfire / Flood) by Postcode</h3>
            <div className="grid grid-cols-1 gap-2">
              {heatmapByPostcode.map(h => {
                const danger = Math.round((h.bushfire + h.flood) / 2);
                const bg = danger > 50 ? 'bg-red-900' : danger > 25 ? 'bg-yellow-900' : 'bg-green-900';
                return (
                  <div key={h.postcode} className={`p-3 rounded-lg ${bg} flex justify-between items-center`}>
                    <div>
                      <div className="font-semibold">{h.suburb} ({h.postcode})</div>
                      <div className="text-xs text-gray-300">Bushfire: {h.bushfire} • Flood: {h.flood}</div>
                    </div>
                    <div className="text-sm font-medium">Risk: {danger}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray rounded-2xl p-4 shadow">
            <h3 className="font-medium mb-2">Quick Filters</h3>
            <div className="flex flex-col space-y-2">
              <button className="p-2 rounded-lg bg-indigo-600 text-white">Show WELL Certified</button>
              <button className="p-2 rounded-lg border">Show High Insurability Risk</button>
              <button className="p-2 rounded-lg border">Export CSV</button>
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-6 text-xs text-gray-9000">Note: data is mocked for demo purposes.</footer>
    </div>
  );
}
