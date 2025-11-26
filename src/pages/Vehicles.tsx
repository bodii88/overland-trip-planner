import React, { useState, useEffect } from 'react';
import type { Vehicle } from '../types';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const Vehicles: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle>>({});

    useEffect(() => {
        setVehicles(storage.getVehicles());
    }, []);

    const handleSave = () => {
        if (!currentVehicle.name || !currentVehicle.consumption) return;

        const newVehicle: Vehicle = {
            id: currentVehicle.id || uuidv4(),
            name: currentVehicle.name,
            fuelType: currentVehicle.fuelType || '95',
            fuelUnit: currentVehicle.fuelUnit || 'liters_per_100km',
            consumption: Number(currentVehicle.consumption),
            tankSizeLiters: Number(currentVehicle.tankSizeLiters) || undefined,
            notes: currentVehicle.notes || '',
        };

        let updatedVehicles;
        if (currentVehicle.id) {
            updatedVehicles = vehicles.map(v => v.id === newVehicle.id ? newVehicle : v);
        } else {
            updatedVehicles = [...vehicles, newVehicle];
        }

        setVehicles(updatedVehicles);
        storage.saveVehicles(updatedVehicles);
        setIsEditing(false);
        setCurrentVehicle({});
    };

    const handleDelete = (id: string) => {
        const updated = vehicles.filter(v => v.id !== id);
        setVehicles(updated);
        storage.saveVehicles(updated);
    };

    const startEdit = (v?: Vehicle) => {
        setCurrentVehicle(v || { fuelUnit: 'liters_per_100km', fuelType: '95' });
        setIsEditing(true);
    };

    if (isEditing) {
        return (
            <div className="p-4 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">{currentVehicle.id ? 'Edit Vehicle' : 'Add Vehicle'}</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 ml-1">Name</label>
                        <input
                            className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                            value={currentVehicle.name || ''}
                            onChange={e => setCurrentVehicle({ ...currentVehicle, name: e.target.value })}
                            placeholder="e.g. Subaru Outback"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1 ml-1">Fuel Type</label>
                        <input
                            className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                            value={currentVehicle.fuelType || ''}
                            onChange={e => setCurrentVehicle({ ...currentVehicle, fuelType: e.target.value })}
                            placeholder="e.g. 95, Diesel"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Unit</label>
                            <select
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={currentVehicle.fuelUnit}
                                onChange={e => setCurrentVehicle({ ...currentVehicle, fuelUnit: e.target.value as any })}
                            >
                                <option value="liters_per_100km">L/100km</option>
                                <option value="km_per_liter">km/L</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Consumption</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={currentVehicle.consumption || ''}
                                onChange={e => setCurrentVehicle({ ...currentVehicle, consumption: parseFloat(e.target.value) })}
                                placeholder="e.g. 10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1 ml-1">Tank Size (L) (Optional)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                            value={currentVehicle.tankSizeLiters || ''}
                            onChange={e => setCurrentVehicle({ ...currentVehicle, tankSizeLiters: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded text-white font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded text-white font-medium"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 lg:pb-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Vehicles</h1>
                <button
                    onClick={() => startEdit()}
                    className="bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-500 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="space-y-4">
                {vehicles.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No vehicles added yet. Tap + to add one.
                    </div>
                )}
                {vehicles.map(v => (
                    <div key={v.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-white">{v.name}</h3>
                                <p className="text-gray-400 text-sm">{v.fuelType} • {v.consumption} {v.fuelUnit === 'liters_per_100km' ? 'L/100km' : 'km/L'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(v)} className="p-2 text-gray-400 hover:text-white">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(v.id)} className="p-2 text-red-400 hover:text-red-300">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
