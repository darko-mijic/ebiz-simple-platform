"use client";

import { Card } from "../ui/card";
import { PieChart as RechartPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { 
  Area, 
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer as AreaResponsiveContainer
} from "recharts";
import { AccountSummaryProps, ChartTooltipProps } from "../../data/types";
import { formatAmount, CHART_COLORS } from "../../data/mock/dashboard-data";

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, currency = "EUR" }: ChartTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg">
      <div className="grid gap-2">
        <p className="text-sm font-medium">
          {new Date(data.date).toLocaleDateString('de-DE', {month: 'short', year: 'numeric'})}
        </p>
        <div className="grid gap-1">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="font-medium">{formatAmount(data.value, currency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom legend renderer for pie chart
const renderCustomizedLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-2 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AccountSummary({ totalBalance, accounts }: AccountSummaryProps) {
  // Prepare data for the pie chart
  const pieData = accounts.map((account) => ({
    name: account.name,
    value: account.balance,
  }));

  const mainAccount = accounts[0];

  // Format dates for the area chart
  const areaChartData = mainAccount.balanceHistory.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('de-DE', {month: 'short'})
  }));

  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h3 className="text-lg font-medium">Total Balance</h3>
          <p className="text-3xl font-bold text-primary">
            {formatAmount(totalBalance, "EUR")}
          </p>
          <p className="text-sm text-muted-foreground">
            Across {accounts.length} accounts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Distribution Pie Chart */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-4">Account Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatAmount(value, "EUR")} />
                <Legend content={renderCustomizedLegend} />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>

          {/* Main Account Trend */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-4">Main Account Trend</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaChartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 100}k`}
                  width={30}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip content={<CustomTooltip currency="EUR" />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0088FE"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
} 