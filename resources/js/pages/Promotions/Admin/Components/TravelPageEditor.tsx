import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Image, Map, Landmark, Settings, Upload, Globe, Trash2, Pencil, ChevronUp, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- TYPE DEFINITIONS ---
interface BannerData {
    image: string | null;
    title: string;
    subtitle: string;
}

interface Culture {
    id: string;
    name: string;
    description: string;
}

interface Destination {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
}

interface Establishment {
    id: string;
    name: string;
    type: 'Restaurant' | 'Inn' | 'Shop' | 'Others';
    contact: string;
}

// --- MAIN COMPONENT ---
export default function TravelPageEditor() {
    const [activeTab, setActiveTab] = useState('banner');

    // 1. Banner State
    const [bannerData, setBannerData] = useState<BannerData>({
        image: null,
        title: 'Welcome to Gasan',
        subtitle: 'The Heart of Marinduque',
    });
    const bannerFileInputRef = useRef<HTMLInputElement>(null);
    const { register: registerBanner, handleSubmit: handleSubmitBanner, watch: watchBanner, setValue: setValueBanner, reset: resetBanner } = useForm<BannerData>({ defaultValues: bannerData });

    // 2. Culture State
    const [cultures, setCultures] = useState<Culture[]>([
        { id: 'c1', name: 'Moriones Festival', description: 'Annual week-long Holy Week tradition.' },
        { id: 'c2', name: 'Putong Ceremony', description: 'Traditional welcome ritual.' },
    ]);
    const { register: registerCulture, handleSubmit: handleSubmitCulture, reset: resetCulture, formState: { errors: errorsCulture } } = useForm<Culture>();
    const [editingCulture, setEditingCulture] = useState<Culture | null>(null);

    // 3. Destination State
    const [destinations, setDestinations] = useState<Destination[]>([
        { id: 'd1', name: 'Guingona Park', latitude: '13.345', longitude: '121.854' },
        { id: 'd2', name: 'Balarte Beach', latitude: '13.350', longitude: '121.840' },
    ]);
    const { register: registerDest, handleSubmit: handleSubmitDest, reset: resetDest, formState: { errors: errorsDest } } = useForm<Destination>();
    const [editingDest, setEditingDest] = useState<Destination | null>(null);

    // 4. Establishment State
    const [establishments, setEstablishments] = useState<Establishment[]>([
        { id: 'e1', name: "Happyroo's Restaurant", type: 'Restaurant', contact: '0917-xxx-xxxx' },
        { id: 'e2', name: "Spencer's Inn", type: 'Inn', contact: '0919-xxx-xxxx' },
    ]);
    const { register: registerEstab, handleSubmit: handleSubmitEstab, reset: resetEstab, formState: { errors: errorsEstab } } = useForm<Establishment>();
    const [editingEstab, setEditingEstab] = useState<Establishment | null>(null);


    // --- GENERIC CRUD HANDLERS ---

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setBannerData(prev => ({ ...prev, image: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Generic Add/Edit function for Culture/Destinations/Establishments
    const handleAddOrUpdate = (
        data: any,
        stateSetter: React.Dispatch<React.SetStateAction<any[]>>,
        editingItem: any,
        setEditingItem: React.Dispatch<React.SetStateAction<any | null>>
    ) => {
        if (editingItem) {
            stateSetter(prev => prev.map(item => item.id === editingItem.id ? { ...data, id: editingItem.id } : item));
        } else {
            stateSetter(prev => [...prev, { ...data, id: Date.now().toString() }]);
        }
        setEditingItem(null);
        resetCulture(); // Use reset for the form currently active
        resetDest();
        resetEstab();
    };


    // --- UI RENDERERS ---

    const renderCultureList = () => (
        <div className="space-y-4">
            <Card className="p-6 dark:bg-neutral-800">
                <h3 className="text-xl font-bold mb-4 text-blue-600">Culture/Tradition Details</h3>
                <form
                    onSubmit={handleSubmitCulture(data => handleAddOrUpdate(data, setCultures, editingCulture, setEditingCulture))}
                    className="space-y-4"
                >
                    <Input
                        placeholder="Name of Tradition (e.g., Moriones Festival)"
                        {...registerCulture('name', { required: true })}
                        className={errorsCulture.name ? 'border-red-500' : ''}
                    />
                    <Textarea
                        placeholder="Detailed Description"
                        {...registerCulture('description', { required: true })}
                        rows={3}
                        className={errorsCulture.description ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-end gap-2">
                        {editingCulture && <Button type="button" variant="outline" onClick={() => { setEditingCulture(null); resetCulture(); }}>Cancel Edit</Button>}
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            {editingCulture ? "Save Changes" : "Add Culture"}
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="space-y-3 pt-4">
                {cultures.map((item, index) => (
                    <Card key={item.id} className="p-4 flex justify-between items-start dark:bg-neutral-800 shadow-sm">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{index + 1}. {item.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingCulture(item); resetCulture(item); }}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id, setCultures)}><X className="w-4 h-4" /></Button>
                        </div>
                    </Card>
                ))}
            </div>

        </div>
    );

    const renderDestinationList = () => (
        <div className="space-y-4">
            <Card className="p-6 dark:bg-neutral-800">
                <h3 className="text-xl font-bold mb-4 text-blue-600">Map Explorer Destinations</h3>
                <form
                    onSubmit={handleSubmitDest(data => handleAddOrUpdate(data, setDestinations, editingDest, setEditingDest))}
                    className="space-y-4"
                >
                    <Input placeholder="Destination Name (e.g., Guingona Park)" {...registerDest('name', { required: true })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Latitude" {...registerDest('latitude', { required: true })} />
                        <Input placeholder="Longitude" {...registerDest('longitude', { required: true })} />
                    </div>
                    <div className="flex justify-end gap-2">
                        {editingDest && <Button type="button" variant="outline" onClick={() => { setEditingDest(null); resetDest(); }}>Cancel Edit</Button>}
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            {editingDest ? "Save Changes" : "Add Destination"}
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="space-y-3 pt-4">
                {destinations.map((item, index) => (
                    <Card key={item.id} className="p-4 flex justify-between items-start dark:bg-neutral-800 shadow-sm">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Coords: {item.latitude}, {item.longitude}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingDest(item); resetDest(item); }}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id, setDestinations)}><X className="w-4 h-4" /></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderEstablishmentList = () => (
        <div className="space-y-4">
            <Card className="p-6 dark:bg-neutral-800">
                <h3 className="text-xl font-bold mb-4 text-blue-600">Establishment Directory</h3>
                <form
                    onSubmit={handleSubmitEstab(data => handleAddOrUpdate(data, setEstablishments, editingEstab, setEditingEstab))}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Name (e.g., Happyroo's)" {...registerEstab('name', { required: true })} />
                        <Input placeholder="Contact (e.g., 0917-xxx-xxxx)" {...registerEstab('contact', { required: true })} />
                    </div>

                    <div className="flex justify-between gap-4 items-center">
                        <select
                            {...registerEstab('type', { required: true })}
                            className="p-2 border rounded-lg w-full dark:bg-neutral-900 dark:border-neutral-700 text-gray-700 dark:text-gray-300"
                            defaultValue={editingEstab?.type || 'Restaurant'}
                        >
                            <option value="Restaurant">Restaurant</option>
                            <option value="Inn">Inn / Lodging</option>
                            <option value="Shop">Shop / Retail</option>
                            <option value="Others">Others</option>
                        </select>
                        <div className="flex gap-2 flex-shrink-0">
                            {editingEstab && <Button type="button" variant="outline" onClick={() => { setEditingEstab(null); resetEstab(); }}>Cancel Edit</Button>}
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {editingEstab ? "Save Changes" : "Add Establishment"}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>

            <div className="space-y-3 pt-4">
                {establishments.map((item, index) => (
                    <Card key={item.id} className="p-4 flex justify-between items-center dark:bg-neutral-800 shadow-sm">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.type} | Contact: {item.contact}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingEstab(item); resetEstab(item); }}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id, setEstablishments)}><X className="w-4 h-4" /></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    // Generic Delete Handler
    const handleDelete = (id: string, stateSetter: React.Dispatch<React.SetStateAction<any[]>>) => {
        if (confirm("Are you sure you want to delete this record?")) {
            stateSetter(prev => prev.filter(item => item.id !== id));
        }
    };


    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

            {/* --- HEADER --- */}
            <div className="mb-8 border-b border-gray-200 dark:border-neutral-700 pb-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                    Travel Page Editor Panel
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage the main content sections for the municipal tourism and visitor guide.
                </p>
            </div>

            {/* --- TAB NAVIGATION --- */}
            <div className="flex space-x-3 sm:space-x-4 mb-6 border-b border-gray-200 dark:border-neutral-700 pb-1 overflow-x-auto">
                {/* Banner Tab */}
                <Button variant={activeTab === 'banner' ? 'default' : 'ghost'} onClick={() => setActiveTab('banner')} className="gap-2">
                    <Image className="w-4 h-4" /> Background Banner
                </Button>
                {/* Culture Tab */}
                <Button variant={activeTab === 'cultures' ? 'default' : 'ghost'} onClick={() => setActiveTab('cultures')} className="gap-2">
                    <Globe className="w-4 h-4" /> Cultures & Traditions
                </Button>
                {/* Destinations Tab */}
                <Button variant={activeTab === 'destinations' ? 'default' : 'ghost'} onClick={() => setActiveTab('destinations')} className="gap-2">
                    <Map className="w-4 h-4" /> Map Explorer
                </Button>
                {/* Establishments Tab */}
                <Button variant={activeTab === 'establishments' ? 'default' : 'ghost'} onClick={() => setActiveTab('establishments')} className="gap-2">
                    <Landmark className="w-4 h-4" /> Establishments
                </Button>
            </div>

            {/* --- TAB CONTENT --- */}

            {/* 1. Background Banner Editor */}
            {activeTab === 'banner' && (
                <Card className="p-6 space-y-6 dark:bg-neutral-800">
                    <CardTitle className="text-xl font-bold text-blue-600">Background Banner Editor</CardTitle>

                    {/* Image Upload Area */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div
                            className="relative w-full max-w-sm aspect-[2/1] rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-900 cursor-pointer group shadow-inner"
                            onClick={() => bannerFileInputRef.current?.click()}
                        >
                            {bannerData.image ? (
                                <img src={bannerData.image} alt="Travel Banner Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-sm">Click to upload banner image (2:1 ratio recommended)</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" ref={bannerFileInputRef} onChange={handleImageUpload} />
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1 space-y-4 w-full">
                            <Input
                                placeholder="Main Title (e.g., Discover Marinduque)"
                                {...registerBanner('title', { required: true })}
                                onChange={(e) => setValueBanner('title', e.target.value)}
                                defaultValue={bannerData.title}
                            />
                            <Input
                                placeholder="Subtitle (e.g., The Heart of the Philippines)"
                                {...registerBanner('subtitle', { required: true })}
                                onChange={(e) => setValueBanner('subtitle', e.target.value)}
                                defaultValue={bannerData.subtitle}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <Button onClick={() => setBannerData({ ...bannerData, image: null })} variant="destructive" disabled={!bannerData.image}>
                                    Remove Image
                                </Button>
                                <Button type="button" onClick={handleSubmitBanner((data) => setBannerData(data))} className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="w-4 h-4 mr-2" /> Save Banner
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* 2. Cultures and Traditions Editor */}
            {activeTab === 'cultures' && renderCultureList()}

            {/* 3. Map Explorer Destinations Editor */}
            {activeTab === 'destinations' && renderDestinationList()}

            {/* 4. Establishments Editor */}
            {activeTab === 'establishments' && renderEstablishmentList()}

        </div>
    );
}