import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Trip, CountrySegment, Vehicle } from '../types';
import { storage } from '../utils/storage';
import { calculateTrip } from '../utils/calculations';
import { SegmentCard } from '../components/SegmentCard';
import { Plus, Save, ArrowLeft, Play } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const TripBuilder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const trips = storage.getTrips();
        const found = trips.find(t => t.id === id);
        if (found) {
            setTrip(found);
        } else {
            navigate('/');
        }
        setVehicles(storage.getVehicles());
        setLoading(false);
    }, [id, navigate]);

    const saveTrip = (updatedTrip: Trip) => {
        setTrip(updatedTrip);
        const trips = storage.getTrips();
        const newTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
        storage.saveTrips(newTrips);
    };

    const addSegment = () => {
        if (!trip) return;
        const newSegment: CountrySegment = {
            id: uuidv4(),
            order: trip.segments.length,
            countryCode: '',
            countryName: '',
            km: 0,
            stays: [],
        };
        saveTrip({ ...trip, segments: [...trip.segments, newSegment] });
    };

    const updateSegment = (index: number, updated: CountrySegment) => {
        if (!trip) return;
        const newSegments = [...trip.segments];
        newSegments[index] = updated;
        saveTrip({ ...trip, segments: newSegments });
    };

    const deleteSegment = (index: number) => {
        if (!trip) return;
        const newSegments = trip.segments.filter((_, i) => i !== index);
        saveTrip({ ...trip, segments: newSegments });
    };

    const moveSegment = (index: number, direction: 'up' | 'down') => {
        if (!trip) return;
        const newSegments = [...trip.segments];
        if (direction === 'up' && index > 0) {
            [newSegments[index], newSegments[index - 1]] = [newSegments[index - 1], newSegments[index]];
        } else if (direction === 'down' && index < newSegments.length - 1) {
            [newSegments[index], newSegments[index + 1]] = [newSegments[index + 1], newSegments[index]];
        }
        saveTrip({ ...trip, segments: newSegments });
    };

    const handleCalculate = () => {
        if (!trip) return;
        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
        if (!vehicle) {
            alert('Please select a vehicle');
            return;
        }
        const settings = storage.getSettings();
        const results = calculateTrip(trip, vehicle, settings);
        const updatedTrip = { ...trip, results };
        saveTrip(updatedTrip);
        navigate(`/results/${trip.id}`);
    };

    if (loading || !trip) return <div className="p-4 text-white">Loading...</div>;

    return (
        <div className="p-4 pb-24 lg:pb-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-white truncate flex-1">{trip.name}</h1>
                <button onClick={() => saveTrip(trip)} className="text-blue-400 hover:text-blue-300">
                    <Save size={24} />
                </button>
            </div>

            <div className="space-y-6">
                <section className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-3">Trip Basics</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Trip Name</label>
                            <input
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={trip.name}
                                onChange={e => saveTrip({ ...trip, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Vehicle</label>
                            <select
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={trip.vehicleId}
                                onChange={e => saveTrip({ ...trip, vehicleId: e.target.value })}
                            >
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 ml-1">Safety Margin %</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                    value={trip.assumptions.safetyMarginPercent}
                                    onChange={e => saveTrip({ ...trip, assumptions: { ...trip.assumptions, safetyMarginPercent: parseFloat(e.target.value) } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 ml-1">Food Budget/Day</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                    value={trip.assumptions.defaultDailyFoodBudgetKwd || ''}
                                    placeholder="Default"
                                    onChange={e => saveTrip({ ...trip, assumptions: { ...trip.assumptions, defaultDailyFoodBudgetKwd: parseFloat(e.target.value) } })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="checkbox"
                                id="isRoundTrip"
                                checked={trip.isRoundTrip || false}
                                onChange={e => saveTrip({ ...trip, isRoundTrip: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                            />
                            <label htmlFor="isRoundTrip" className="text-sm text-gray-300">Round Trip (Calculate return costs)</label>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-white">Route Segments</h2>
                        <button onClick={addSegment} className="text-blue-400 flex items-center text-sm hover:text-blue-300">
                            <Plus size={16} className="mr-1" /> Add Country
                        </button>
                    </div>

                    {trip.segments.map((segment, index) => (
                        <SegmentCard
                            key={segment.id}
                            segment={segment}
                            onChange={(updated) => updateSegment(index, updated)}
                            onDelete={() => deleteSegment(index)}
                            onMoveUp={() => moveSegment(index, 'up')}
                            onMoveDown={() => moveSegment(index, 'down')}
                            isFirst={index === 0}
                            isLast={index === trip.segments.length - 1}
                        />
                    ))}

                    {trip.segments.length === 0 && (
                        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-700 rounded-xl">
                            No countries added yet.
                        </div>
                    )}
                </section>

                <button
                    onClick={handleCalculate}
                    className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl text-white font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-colors"
                >
                    <Play size={24} fill="currentColor" /> Calculate Trip Budget
                </button>
            </div>
        </div>
    );
};
