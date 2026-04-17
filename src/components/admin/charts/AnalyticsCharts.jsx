import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  packed: '#8b5cf6',
  shipped: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

function formatINR(value) {
  if (typeof value !== 'number') return value;
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(1)}k`;
  return `\u20B9${value}`;
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatShortMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function ChartCard({ title, subtitle, children, actions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ label = 'No data available' }) {
  return (
    <div className="h-64 flex items-center justify-center text-sm text-gray-400">
      {label}
    </div>
  );
}

export function RevenueAreaChart({ data = [], title = 'Revenue Trend' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  return (
    <ChartCard title={title} subtitle={`Revenue & orders over ${data.length} days`}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue' ? [formatINR(value), 'Revenue'] : [value, 'Orders']
            }
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function OrdersBarChart({ data = [], title = 'Daily Orders' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  const formatted = data.map((d) => ({ ...d, label: formatShortDate(d.date) }));

  return (
    <ChartCard title={title} subtitle="Order volume per day">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StatusDistributionPie({ data = [], title = 'Order Status' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle="Distribution across statuses">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            label={(entry) => `${entry.status}: ${entry.count}`}
            labelLine={false}
            style={{ fontSize: 11 }}
          >
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={STATUS_COLORS[entry.status] || PALETTE[idx % PALETTE.length]}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function UserTypeDonut({ data = [], title = 'Customer vs Wholesaler' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  const total = data.reduce((acc, d) => acc + (d.revenue || 0), 0);

  return (
    <ChartCard title={title} subtitle="Revenue share by buyer type">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="userType"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            label={(entry) => {
              const pct = total > 0 ? ((entry.revenue / total) * 100).toFixed(0) : 0;
              return `${entry.userType}: ${pct}%`;
            }}
            labelLine={false}
            style={{ fontSize: 11 }}
          >
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.userType === 'wholesaler' ? '#8b5cf6' : '#3b82f6'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatINR(value)}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopProductsBar({ data = [], title = 'Top Products' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  const items = data.slice(0, 8).map((p) => ({
    name: (p.name || 'Unknown').length > 22 ? (p.name || 'Unknown').slice(0, 22) + '...' : p.name,
    quantity: p.quantity,
    revenue: p.revenue,
  }));

  return (
    <ChartCard title={title} subtitle="Best sellers by quantity sold">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={items} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#374151' }}
            width={140}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue' ? [formatINR(value), 'Revenue'] : [value, 'Quantity']
            }
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategorySalesBar({ data = [], title = 'Sales by Category' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  const items = data.slice(0, 10).map((c) => ({
    name: (c.category || 'Uncategorized').length > 18 ? (c.category || 'Uncategorized').slice(0, 18) + '...' : (c.category || 'Uncategorized'),
    revenue: c.revenue,
    quantity: c.quantity,
  }));

  return (
    <ChartCard title={title} subtitle="Revenue distribution by category">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={items} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue' ? [formatINR(value), 'Revenue'] : [value, 'Quantity']
            }
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyRevenueLine({ data = [], title = 'Monthly Revenue (12 months)' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  const formatted = data.map((d) => ({ ...d, label: formatShortMonth(d.month) }));

  return (
    <ChartCard title={title} subtitle="Rolling 12-month performance">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue' ? [formatINR(value), 'Revenue'] : [value, 'Orders']
            }
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} yAxisId={0} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function NewUsersChart({ data = [], title = 'New Users (12 months)' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  // Pivot rows into { month, customer, wholesaler }
  const monthsMap = {};
  data.forEach((row) => {
    if (!monthsMap[row.month]) monthsMap[row.month] = { month: row.month, customer: 0, wholesaler: 0 };
    monthsMap[row.month][row.role] = row.count;
  });
  const rows = Object.values(monthsMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((r) => ({ ...r, label: formatShortMonth(r.month) }));

  return (
    <ChartCard title={title} subtitle="Customer and wholesaler sign-ups">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="customer" fill="#3b82f6" stackId="users" radius={[6, 6, 0, 0]} />
          <Bar dataKey="wholesaler" fill="#8b5cf6" stackId="users" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PaymentBreakdownPie({ data = [], title = 'Payment Modes' }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title}>
        <EmptyState />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle="Revenue by payment method">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="mode"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry.mode || 'N/A'}`}
            labelLine={false}
            style={{ fontSize: 11 }}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatINR(value)}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
