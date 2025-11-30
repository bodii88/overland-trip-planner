import React, { useState, useEffect, useMemo } from 'react';
import {
    Shield,
    MapPin,
    TrendingUp,
    Globe,
    DollarSign,
    Route,
    BarChart3,
    Eye,
    RefreshCw,
    Download,
    FileJson,
    Filter,
    PieChart
} from 'lucide-react';
import {
    getAllUsersTrips,
    calculateTripStatistics,
    getPopularRoutes,
    type UserTripData
} from '../utils/adminAnalytics';
import { formatCurrency } from '../utils/currency';
import {
    exportAnalyticsToCSV,
    exportAnalyticsToJSON,
    filterTripsByCountry,
    filterTripsByCostRange,
    sortTrips
} from '../utils/analyticsExport';
import { AnalyticsCharts } from '../components/AnalyticsCharts';

export const AdminAnalytics: React.FC = () => {
    const [allTrips, setAllTrips] = useState<UserTripData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState<UserTripData | null>(null);

    // Filter states
    const [countryFilter, setCountryFilter] = useState('');
    const [minCost, setMinCost] = useState<number | null>(null);
    const [maxCost, setMaxCost] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'distance' | 'cost' | 'date'>('date');
    const [showFilters, setShowFilters] = useState(false);
    const [showCharts, setShowCharts] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const trips = await getAllUsersTrips();
            setAllTrips(trips);
        } catch (error) {
            console.error('Error loading trips:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Apply filters and sorting
    const filteredTrips = useMemo(() => {
        let filtered = [...allTrips];

        if (countryFilter) {
            filtered = filterTripsByCountry(filtered, countryFilter);
        }

        if (minCost !== null || maxCost !== null) {
            filtered = filterTripsByCostRange(filtered, minCost, maxCost);
        }

        filtered = sortTrips(filtered, sortBy, 'desc');

        return filtered;
    }, [allTrips, countryFilter, minCost, maxCost, sortBy]);

    const stats = calculateTripStatistics(filteredTrips); // Use filtered trips for stats
    const popularRoutes = getPopularRoutes(filteredTrips);
    const topRoutes = Array.from(popularRoutes.entries()).slice(0, 5);

    if (loading) {
        return (
            <div className="p-4 pb-24 lg:pb-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-400">Loading analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 lg:pb-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <BarChart3 size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Trip Analytics</h1>
                        <p className="text-gray-400 text-sm">Research & Observation Dashboard</p>
                    </div>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <RefreshCw size={18} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Export and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Export Buttons */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Download size={18} className="text-green-400" />
                        Export Data
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => exportAnalyticsToCSV(filteredTrips)}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Download size={16} />
                            CSV
                        </button>
                        <button
                            onClick={() => exportAnalyticsToJSON(filteredTrips, stats)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <FileJson size={16} />
                            JSON
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Filter size={18} className="text-purple-400" />
                            Filters
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCharts(!showCharts)}
                                className={`text-sm px-3 py-1 rounded-lg transition-colors ${showCharts ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                <PieChart size={16} className="inline mr-1" />
                                Charts
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="text-sm text-purple-400 hover:text-purple-300"
                            >
                                {showFilters ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Filter by country..."
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-purple-500 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min cost (KWD)"
                                    value={minCost || ''}
                                    onChange={(e) => setMinCost(e.target.value ? Number(e.target.value) : null)}
                                    className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-purple-500 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Max cost (KWD)"
                                    value={maxCost || ''}
                                    onChange={(e) => setMaxCost(e.target.value ? Number(e.target.value) : null)}
                                    className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-purple-500 outline-none"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-purple-500 outline-none"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="name">Sort by Name</option>
                                <option value="distance">Sort by Distance</option>
                                <option value="cost">Sort by Cost</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Notice */}
            <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <Shield size={20} className="text-purple-400" />
                    <div>
                        <p className="text-purple-200 font-medium">Admin View</p>
                        <p className="text-purple-300 text-sm">You're viewing aggregated trip data for research purposes.</p>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl border border-blue-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-blue-200 text-sm">Total Trips</h3>
                        <MapPin size={20} className="text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalTrips}</p>
                </div>

                <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl border border-green-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-green-200 text-sm">Total Distance</h3>
                        <Route size={20} className="text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalDistance.toLocaleString()} km</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl border border-purple-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-purple-200 text-sm">Countries Visited</h3>
                        <Globe size={20} className="text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.countriesVisited.size}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-xl border border-orange-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-orange-200 text-sm">Total Cost</h3>
                        <DollarSign size={20} className="text-orange-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalCost, 'KWD')}</p>
                </div>
            </div>

            {/* Charts Section */}
            {showCharts && filteredTrips.length > 0 && (
                <AnalyticsCharts trips={filteredTrips} />
            )}

            {/* Averages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={20} className="text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Average Trip Cost</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.averageTripCost, 'KWD')}</p>
                    <p className="text-gray-400 text-sm mt-1">Per trip</p>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Route size={20} className="text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Average Distance</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.round(stats.averageTripDistance).toLocaleString()} km</p>
                    <p className="text-gray-400 text-sm mt-1">Per trip</p>
                </div>
            </div>

            {/* Popular Routes */}
            {topRoutes.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Route size={20} className="text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Popular Routes</h3>
                    </div>
                    <div className="space-y-3">
                        {topRoutes.map(([route, count], index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <span className="text-white">{route}</span>
                                </div>
                                <span className="text-gray-400">{count} trip{count > 1 ? 's' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Trips List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Eye size={20} className="text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">All Trips ({filteredTrips.length})</h3>
                </div>

                {filteredTrips.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No trips found</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredTrips.map((tripData, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                                onClick={() => setSelectedTrip(tripData)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium">{tripData.trip.name}</h4>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {tripData.trip.segments?.length || 0} segments • {' '}
                                            {tripData.trip.segments?.reduce((sum, s) => sum + s.km, 0).toLocaleString() || 0} km
                                        </p>
                                        {tripData.trip.results && (
                                            <p className="text-gray-400 text-sm">
                                                Cost: {formatCurrency(tripData.trip.results.totalCostKwd, 'KWD')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs">{tripData.userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trip Detail Modal */}
            {selectedTrip && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedTrip(null)}
                >
                    <div
                        className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-white">{selectedTrip.trip.name}</h3>
                            <button
                                onClick={() => setSelectedTrip(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm text-gray-400 mb-2">Route Segments</h4>
                                <div className="space-y-2">
                                    {selectedTrip.trip.segments?.map((segment, idx) => (
                                        <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-white font-medium">{segment.countryName}</p>
                                            <p className="text-gray-400 text-sm">{segment.km} km • {segment.days || 0} days</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedTrip.trip.results && (
                                <div>
                                    <h4 className="text-sm text-gray-400 mb-2">Cost Breakdown</h4>
                                    <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Fuel</span>
                                            <span className="text-white">{formatCurrency(selectedTrip.trip.results.totalFuelCostKwd, 'KWD')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Accommodation</span>
                                            <span className="text-white">{formatCurrency(selectedTrip.trip.results.totalStayCostKwd, 'KWD')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Food</span>
                                            <span className="text-white">{formatCurrency(selectedTrip.trip.results.totalFoodCostKwd, 'KWD')}</span>
                                        </div>
                                        <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between font-bold">
                                            <span className="text-white">Total</span>
                                            <span className="text-white">{formatCurrency(selectedTrip.trip.results.totalCostKwd, 'KWD')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
