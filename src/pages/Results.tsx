import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Trip } from '../types';
import { storage } from '../utils/storage';
import { analyzeTripWithGemini } from '../utils/gemini';
import { ArrowLeft, PieChart, BarChart2, Sparkles, Loader, Calendar } from 'lucide-react';
import { AIReportRenderer } from '../components/AIReportRenderer';
import { CurrencySwitcher } from '../components/CurrencySwitcher';
import { useCurrency } from '../contexts/CurrencyContext';
import { convertFromKWD, formatCurrency } from '../utils/currency';
import { downloadICS } from '../utils/icsGenerator';

export const Results: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const { currency, exchangeRates } = useCurrency();

    useEffect(() => {
        const trips = storage.getTrips();
        const found = trips.find(t => t.id === id);
        if (found && found.results) {
            setTrip(found);
        } else {
            // If no results, go back to builder
            if (found) navigate(`/trip/${id}`);
            else navigate('/');
        }
    }, [id, navigate]);

    const handleAIAnalysis = async () => {
        if (!trip || !trip.results) return;
        setLoadingAI(true);
        try {
            const report = await analyzeTripWithGemini(trip, trip.results);
            setAiReport(report);
        } catch (error) {
            alert('Failed to generate AI report. Please try again.');
        } finally {
            setLoadingAI(false);
        }
    };

    if (!trip || !trip.results) return <div className="p-4 text-white">Loading...</div>;

    const { results } = trip;

    // Convert amounts to selected currency using live rates
    const convertAmount = (amountInKWD: number) => convertFromKWD(amountInKWD, currency, exchangeRates || undefined);

    return (
        <div className="p-4 pb-24 lg:pb-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/trip/${id}`)} className="text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white truncate">Trip Budget</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => downloadICS(trip)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium"
                        title="Export to Calendar"
                    >
                        <Calendar size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <CurrencySwitcher />
                </div>
            </div>

            <div className="space-y-6">
                {/* Summary Card - Full Width */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-2xl shadow-lg border border-blue-700">
                    <div className="text-blue-200 text-sm font-medium mb-1">Total Estimated Cost</div>
                    <div className="text-4xl font-bold text-white mb-4">
                        {formatCurrency(convertAmount(results.totalCostKwd), currency)}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-blue-300">Cost per Day</div>
                            <div className="text-white font-semibold">{formatCurrency(convertAmount(results.costPerDay || 0), currency)}</div>
                        </div>
                        <div>
                            <div className="text-blue-300">Cost per km</div>
                            <div className="text-white font-semibold">{convertAmount(results.costPerKm || 0).toFixed(2)} {currency}</div>
                        </div>
                        <div>
                            <div className="text-blue-300">Total Distance</div>
                            <div className="text-white font-semibold">{results.perCountry.reduce((acc, c) => acc + c.km, 0).toLocaleString()} km</div>
                        </div>
                        <div>
                            <div className="text-blue-300">Total Days</div>
                            <div className="text-white font-semibold">{results.perCountry.reduce((acc, c) => acc + (c.days || 0), 0)} days</div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout on Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Breakdown */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <PieChart size={20} className="mr-2 text-purple-400" /> Category Breakdown
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Fuel</span>
                                <span className="text-white font-medium">{formatCurrency(convertAmount(results.totalFuelCostKwd), currency)}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-yellow-500 h-full" style={{ width: `${(results.totalFuelCostKwd / results.totalCostKwd) * 100}%` }} />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Stays</span>
                                <span className="text-white font-medium">{formatCurrency(convertAmount(results.totalStayCostKwd), currency)}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{ width: `${(results.totalStayCostKwd / results.totalCostKwd) * 100}%` }} />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Food</span>
                                <span className="text-white font-medium">{formatCurrency(convertAmount(results.totalFoodCostKwd), currency)}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${(results.totalFoodCostKwd / results.totalCostKwd) * 100}%` }} />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Other (Borders/Tolls)</span>
                                <span className="text-white font-medium">{Math.round(results.totalOtherCostKwd)} {currency}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full" style={{ width: `${(results.totalOtherCostKwd / results.totalCostKwd) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Per Country Table */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <h3 className="text-lg font-semibold text-white p-4 border-b border-gray-700 flex items-center">
                            <BarChart2 size={20} className="mr-2 text-orange-400" /> Per Country
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-750 text-gray-400">
                                    <tr>
                                        <th className="p-3 font-medium">Country</th>
                                        <th className="p-3 font-medium text-right">KM</th>
                                        <th className="p-3 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {results.perCountry.map(c => (
                                        <tr key={c.countryCode}>
                                            <td className="p-3 text-white">
                                                <div className="font-medium">{c.countryName}</div>
                                                <div className="text-xs text-gray-500">{c.days} days</div>
                                            </td>
                                            <td className="p-3 text-right text-gray-300">{c.km}</td>
                                            <td className="p-3 text-right text-green-400 font-medium">{Math.round(c.subtotalKwd)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* AI Section - Full Width */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <Sparkles size={20} className="mr-2 text-yellow-400" /> AI Trip Insights
                        </h3>
                        {!aiReport && (
                            <button
                                onClick={handleAIAnalysis}
                                disabled={loadingAI}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {loadingAI ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {loadingAI ? 'Analyzing...' : 'Generate Report'}
                            </button>
                        )}
                    </div>

                    {aiReport && (
                        <AIReportRenderer markdown={aiReport} />
                    )}
                </div>
            </div>
        </div>
    );
};
