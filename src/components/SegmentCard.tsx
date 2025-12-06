import React from 'react';
import type { CountrySegment, Stay, StayType } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, Map as MapIcon, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getLiveFuelPrice, geocodeCity, getRouteDistance, type Coordinates } from '../utils/geoUtils';

interface Props {
    segment: CountrySegment;
    onChange: (s: CountrySegment) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export const SegmentCard: React.FC<Props> = ({ segment, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
    const [expanded, setExpanded] = React.useState(true);
    const [loadingFuel, setLoadingFuel] = React.useState(false);
    const [loadingDist, setLoadingDist] = React.useState(false);

    const fetchFuelPrice = async () => {
        setLoadingFuel(true);
        try {
            // Use the first stay's city to check for regional pricing (e.g. Kurdistan)
            const city = segment.stays.length > 0 ? segment.stays[0].cityOrArea : '';
            const price = await getLiveFuelPrice(segment.countryCode, city);
            onChange({ ...segment, fuelPricePerLiter: parseFloat(price.toFixed(3)) });
        } catch (error) {
            console.error("Failed to fetch fuel price", error);
        } finally {
            setLoadingFuel(false);
        }
    };

    const calculateDistance = async () => {
        if (segment.stays.length < 2) {
            alert("Please add at least 2 stops to calculate distance.");
            return;
        }
        setLoadingDist(true);
        try {
            const coords: Coordinates[] = [];

            // Geocode all stops
            const updatedStays = [...segment.stays];
            let changed = false;

            for (let i = 0; i < updatedStays.length; i++) {
                const stay = updatedStays[i];
                if (!stay.lat || !stay.lng) {
                    if (!stay.cityOrArea) continue;
                    const loc = await geocodeCity(`${stay.cityOrArea}, ${segment.countryName}`);
                    if (loc) {
                        updatedStays[i] = { ...stay, lat: loc.lat, lng: loc.lng };
                        coords.push(loc);
                        changed = true;
                    }
                } else {
                    coords.push({ lat: stay.lat, lng: stay.lng });
                }
            }

            if (changed) {
                // Update stays with new coords so we don't re-fetch next time
                onChange({ ...segment, stays: updatedStays });
            }

            if (coords.length > 1) {
                const dist = await getRouteDistance(coords);
                onChange({ ...segment, stays: updatedStays, km: dist });
            } else {
                alert("Could not find locations for enough stops.");
            }

        } catch (error) {
            console.error("Failed to calculate distance", error);
        } finally {
            setLoadingDist(false);
        }
    };

    const moveStay = (index: number, direction: 'up' | 'down') => {
        const newStays = [...segment.stays];
        if (direction === 'up' && index > 0) {
            [newStays[index], newStays[index - 1]] = [newStays[index - 1], newStays[index]];
        } else if (direction === 'down' && index < newStays.length - 1) {
            [newStays[index], newStays[index + 1]] = [newStays[index + 1], newStays[index]];
        }
        onChange({ ...segment, stays: newStays });
    };

    const addStay = () => {
        const newStay: Stay = {
            id: uuidv4(),
            countryCode: segment.countryCode,
            cityOrArea: '',
            nights: 1,
            stayType: 'hotel',
        };
        onChange({ ...segment, stays: [...segment.stays, newStay] });
    };

    const updateStay = (id: string, updates: Partial<Stay>) => {
        onChange({
            ...segment,
            stays: segment.stays.map(s => s.id === id ? { ...s, ...updates } : s)
        });
    };

    const deleteStay = (id: string) => {
        onChange({
            ...segment,
            stays: segment.stays.filter(s => s.id !== id)
        });
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-4">
            <div className="p-4 bg-gray-750 flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white">{segment.countryName || 'Unknown Country'}</span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{segment.countryCode}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {expanded && (
                <div className="p-4 space-y-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Country Name</label>
                            <input
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={segment.countryName}
                                onChange={e => onChange({ ...segment, countryName: e.target.value })}
                                placeholder="e.g. Saudi Arabia"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">ISO Code</label>
                            <input
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white uppercase focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={segment.countryCode}
                                onChange={e => onChange({ ...segment, countryCode: e.target.value.toUpperCase() })}
                                maxLength={3}
                                placeholder="KW"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Distance (km)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                    value={segment.km || ''}
                                    onChange={e => onChange({ ...segment, km: parseFloat(e.target.value) })}
                                    placeholder="0"
                                />
                                <button
                                    onClick={calculateDistance}
                                    disabled={loadingDist}
                                    className="absolute right-0 top-0 bottom-0 px-2 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                                    title="Auto-calculate distance from stops"
                                >
                                    {loadingDist ? <Loader2 size={16} className="animate-spin" /> : <MapIcon size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Days</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={segment.days || ''}
                                onChange={e => onChange({ ...segment, days: parseFloat(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Fuel Price</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={segment.fuelPricePerLiter || ''}
                                onChange={e => onChange({ ...segment, fuelPricePerLiter: parseFloat(e.target.value) })}
                                placeholder="0.00"
                            />
                            <button
                                onClick={fetchFuelPrice}
                                disabled={loadingFuel}
                                className="absolute right-0 top-6 mr-1 p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                                title="Fetch Live Price used in this region"
                            >
                                {loadingFuel ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Border Fees</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={segment.borderFees || ''}
                                onChange={e => onChange({ ...segment, borderFees: parseFloat(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Tolls/Other</label>
                            <input
                                type="number"
                                className="w-full bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-3 py-2 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                value={segment.otherFixedCosts || ''}
                                onChange={e => onChange({ ...segment, otherFixedCosts: parseFloat(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-300">Stops & Stays (for distance calc)</label>
                            <button onClick={addStay} className="text-blue-400 text-sm flex items-center hover:text-blue-300">
                                <Plus size={14} className="mr-1" /> Add Stop
                            </button>
                        </div>

                        <div className="space-y-2">
                            {segment.stays.map((stay, index) => (
                                <div key={stay.id} className="bg-gray-700/30 p-3 rounded border border-gray-700 relative">
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            className="flex-1 bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-2 py-1 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                            placeholder="City/Area"
                                            value={stay.cityOrArea}
                                            onChange={e => updateStay(stay.id, { cityOrArea: e.target.value })}
                                        />
                                        <button onClick={() => deleteStay(stay.id)} className="text-red-400 hover:text-red-300">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => moveStay(index, 'up')}
                                                disabled={index === 0}
                                                className="text-gray-400 hover:text-white disabled:opacity-30"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => moveStay(index, 'down')}
                                                disabled={index === segment.stays.length - 1}
                                                className="text-gray-400 hover:text-white disabled:opacity-30"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <select
                                            className="bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-2 py-1 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                            value={stay.stayType}
                                            onChange={e => updateStay(stay.id, { stayType: e.target.value as StayType })}
                                        >
                                            <option value="hotel">Hotel</option>
                                            <option value="paid_camp">Paid Camp</option>
                                            <option value="free_camp">Free Camp</option>
                                            <option value="friend_family">Friend/Family</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-2 py-1 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                            placeholder="Nights"
                                            value={stay.nights}
                                            onChange={e => updateStay(stay.id, { nights: parseFloat(e.target.value) })}
                                        />
                                        <input
                                            type="number"
                                            className="bg-gray-700/50 border-b-2 border-gray-600 rounded-t px-2 py-1 text-sm text-white focus:border-blue-500 focus:bg-gray-700 outline-none transition-colors"
                                            placeholder="Cost/Night"
                                            value={stay.costPerNight || ''}
                                            onChange={e => updateStay(stay.id, { costPerNight: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button disabled={isFirst} onClick={onMoveUp} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronUp size={20} /></button>
                        <button disabled={isLast} onClick={onMoveDown} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronDown size={20} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};
