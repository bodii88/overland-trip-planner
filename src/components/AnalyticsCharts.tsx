import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import type { UserTripData } from '../utils/adminAnalytics';

interface AnalyticsChartsProps {
    trips: UserTripData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ trips }) => {
    // 1. Prepare Cost Distribution Data
    const costData = trips.reduce(
        (acc, { trip }) => {
            if (trip.results) {
                acc[0].value += trip.results.totalFuelCostKwd;
                acc[1].value += trip.results.totalStayCostKwd;
                acc[2].value += trip.results.totalFoodCostKwd;
            }
            return acc;
        },
        [
            { name: 'Fuel', value: 0 },
            { name: 'Accommodation', value: 0 },
            { name: 'Food', value: 0 }
        ]
    );

    // 2. Prepare Country Frequency Data
    const countryMap = new Map<string, number>();
    trips.forEach(({ trip }) => {
        trip.segments?.forEach((segment: any) => {
            const country = segment.countryName;
            countryMap.set(country, (countryMap.get(country) || 0) + 1);
        });
    });

    const countryData = Array.from(countryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 countries

    // 3. Prepare Trip Distances Data (Top 10 longest)
    const distanceData = trips
        .map(({ trip }) => ({
            name: trip.name.length > 15 ? trip.name.substring(0, 15) + '...' : trip.name,
            distance: trip.segments?.reduce((sum: number, s: any) => sum + s.km, 0) || 0,
            cost: trip.results?.totalCostKwd || 0
        }))
        .sort((a, b) => b.distance - a.distance)
        .slice(0, 10);

    return (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Distribution Pie Chart */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-white font-semibold mb-4">Total Cost Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {costData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`${value.toFixed(1)} KWD`, 'Cost']}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Countries Bar Chart */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-white font-semibold mb-4">Most Visited Countries</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={countryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                />
                                <Bar dataKey="count" fill="#8884d8">
                                    {countryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Trip Distance vs Cost Area Chart */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-white font-semibold mb-4">Top 10 Longest Trips (Distance vs Cost)</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={distanceData}>
                            <defs>
                                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', fill: '#8884d8' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Cost (KWD)', angle: 90, position: 'insideRight', fill: '#82ca9d' }} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="distance" stroke="#8884d8" fillOpacity={1} fill="url(#colorDistance)" name="Distance (km)" />
                            <Area yAxisId="right" type="monotone" dataKey="cost" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCost)" name="Cost (KWD)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
