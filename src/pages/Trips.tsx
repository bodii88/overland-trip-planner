import React from 'react';
import type { Trip } from '../types';
import { useData } from '../contexts/DataContext';
import { storage } from '../utils/storage';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Trips: React.FC = () => {
    const { trips, vehicles, settings } = useData();
    const navigate = useNavigate();

    const createNewTrip = () => {
        if (vehicles.length === 0) {
            alert('Please add a vehicle first!');
            navigate('/vehicles');
            return;
        }

        const newTrip: Trip = {
            id: uuidv4(),
            name: 'New Trip',
            vehicleId: vehicles[0].id,
            segments: [],
            assumptions: {
                safetyMarginPercent: settings.defaultSafetyMarginPercent,
                comfortLevel: settings.defaultComfortLevel,
            }
        };

        const updated = [...trips, newTrip];
        storage.saveTrips(updated);
        navigate(`/trip/${newTrip.id}`);
    };

    return (
        <div className="p-4 pb-24 lg:pb-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">My Trips</h1>
                <button
                    onClick={createNewTrip}
                    className="bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-500 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="space-y-4">
                {trips.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No trips yet. Start planning!
                    </div>
                )}
                {trips.map(trip => (
                    <Link key={trip.id} to={`/trip/${trip.id}`} className="block group">
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-sm transition-all duration-200 group-hover:bg-gray-750 group-hover:border-blue-500/50 group-hover:shadow-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">{trip.name}</h3>
                                    <div className="flex items-center text-gray-400 text-sm mt-1">
                                        <MapPin size={14} className="mr-1" />
                                        <span>{trip.segments.length} countries</span>
                                        {trip.results && (
                                            <span className="ml-3 font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                                                {Math.round(trip.results.totalCostKwd).toLocaleString()} KWD
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
