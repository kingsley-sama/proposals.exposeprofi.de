import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/ProposalForm.module.css';
import { CONFIG as proposalConfig } from '../lib/proposalConfig';

export default function ProposalForm() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', ''
    
    // Form State
    const [clientInfo, setClientInfo] = useState({
        companyEmail: '',
        companyName: '',
        street: '',
        postalCode: '',
        city: '',
        country: ''
    });

    const [projectInfo, setProjectInfo] = useState({
        projectNumber: '',
        projectName: '',
        projectType: '',
        customProjectType: '',
        unitCount: '',
        deliveryDays: 'Calculated automatically',
        offerValidUntil: ''
    });

    const [discount, setDiscount] = useState({
        type: '', // 'percentage', 'fixed', ''
        value: 0,
        description: ''
    });

    // Services State
    const initialServiceState = {
        selected: false,
        quantity: 0,
        customPrice: '',
        customDescription: [], // Array of bullet objects
        customDescriptionText: '',
        // Service specific fields
        buildingType: '',
        apartmentSize: '',
        projectType: '',
        areaSize: ''
    };

    const [services, setServices] = useState({
        'exterior-ground': { ...initialServiceState },
        'exterior-bird': { ...initialServiceState },
        '3d-floorplan': { ...initialServiceState },
        '3d-complete-floor': { ...initialServiceState },
        '2d-floorplan': { ...initialServiceState },
        'home-staging': { ...initialServiceState },
        'renovation': { ...initialServiceState },
        '360-interior': { ...initialServiceState },
        '360-exterior': { ...initialServiceState },
        'slideshow': { ...initialServiceState },
        'site-plan': { ...initialServiceState },
        'social-media': { ...initialServiceState },
        'interior': { ...initialServiceState },
        'terrace': { ...initialServiceState }
    });

    const [images, setImages] = useState([]);
    const [totals, setTotals] = useState({
        subtotalNet: 0,
        discountAmount: 0,
        totalNet: 0,
        totalVat: 0,
        totalGross: 0
    });

    const [jsonOutput, setJsonOutput] = useState(null);

    // Pricing Logic
    const pricing = {
        'exterior-ground': (qty, buildingType) => {
            if (qty === 0) return 0;
            if (!buildingType) return 0;
            const priceMatrix = {
                'EFH': [499, 349, 299, 229, 199],
                'DHH': [599, 399, 359, 329, 299],
                'MFH-6-10': [699, 499, 399, 349, 329],
                'MFH-11-15': [799, 599, 499, 399, 349]
            };
            const prices = priceMatrix[buildingType] || [0, 0, 0, 0, 0];
            if (qty <= 5) return prices[qty - 1];
            return prices[4];
        },
        'exterior-bird': () => 12,
        '3d-floorplan': () => 69,
        '3d-complete-floor': () => 199,
        '2d-floorplan': () => 49,
        'home-staging': () => 99,
        'renovation': () => 139,
        '360-interior': (apartmentSize) => {
            if (!apartmentSize) return 0;
            const prices = {
                '30': 999, '40': 1299, '50': 1499, '60': 1699,
                '70': 1799, '80': 1899, '90': 1999, '100': 2299, 'EFH': 2499
            };
            return prices[apartmentSize] || 0;
        },
        '360-exterior': (buildingType) => {
            if (!buildingType) return 0;
            const prices = {
                'EFH-DHH': 1299, 'MFH-3-5': 1299, 'MFH-6-10': 1699, 'MFH-11-15': 1999
            };
            return prices[buildingType] || 0;
        },
        'slideshow': () => 499,
        'site-plan': () => 99,
        'social-media': () => 299,
        'interior': (qty) => {
            if (qty === 0) return 0;
            if (qty === 1) return 399;
            if (qty === 2) return 299;
            if (qty === 3) return 289;
            if (qty === 4) return 269;
            if (qty === 5) return 259;
            if (qty === 6) return 249;
            if (qty === 7) return 239;
            if (qty === 8) return 229;
            if (qty === 9) return 219;
            return 199;
        },
        'terrace': () => 0
    };

    // Load Data
    useEffect(() => {
        const savedData = localStorage.getItem('proposalFormData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.clientInfo) setClientInfo(prev => ({ ...prev, ...parsed.clientInfo }));
                if (parsed.projectInfo) setProjectInfo(prev => ({ ...prev, ...parsed.projectInfo }));
                if (parsed.discount) setDiscount(prev => ({ ...prev, ...parsed.discount }));
                if (parsed.images) setImages(parsed.images);
                
                // Restore services
                if (parsed.servicesState) {
                    setServices(parsed.servicesState);
                }
            } catch (e) {
                console.error("Failed to load saved data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Auto-save
    useEffect(() => {
        if (!isLoaded) return;

        const timer = setTimeout(() => {
            setSaveStatus('saving');
            const dataToSave = {
                clientInfo,
                projectInfo,
                discount,
                servicesState: services,
                images: images.map(img => ({ ...img, imageData: undefined })) // Don't save base64 to localStorage
            };
            try {
                localStorage.setItem('proposalFormData', JSON.stringify(dataToSave));
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus(''), 2000);
            } catch (e) {
                console.error("Storage quota exceeded", e);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [clientInfo, projectInfo, discount, services, images, isLoaded]);

    // Calculate Totals
    useEffect(() => {
        let subtotal = 0;

        Object.entries(services).forEach(([key, service]) => {
            if (service.selected && service.quantity > 0) {
                let price = 0;
                if (service.customPrice && parseFloat(service.customPrice) > 0) {
                    price = parseFloat(service.customPrice);
                } else {
                    const priceFunc = pricing[key];
                    if (priceFunc) {
                        if (key === 'exterior-ground') price = priceFunc(service.quantity, service.buildingType);
                        else if (key === '360-interior') price = priceFunc(service.apartmentSize);
                        else if (key === '360-exterior') price = priceFunc(service.buildingType);
                        else if (key === 'interior') price = priceFunc(service.quantity);
                        else price = priceFunc();
                    }
                }
                subtotal += price * service.quantity;
            }
        });

        let discountAmt = 0;
        if (discount.type === 'percentage') {
            discountAmt = subtotal * (parseFloat(discount.value) / 100);
        } else if (discount.type === 'fixed') {
            discountAmt = parseFloat(discount.value);
        }

        const net = subtotal - discountAmt;
        const vat = net * 0.19;
        const gross = net + vat;

        setTotals({
            subtotalNet: subtotal,
            discountAmount: discountAmt,
            totalNet: net,
            totalVat: vat,
            totalGross: gross
        });
    }, [services, discount]);

    // Calculate Delivery Time
    useEffect(() => {
        let maxDays = 0;
        
        Object.entries(services).forEach(([key, service]) => {
            if (service.selected && service.quantity > 0) {
                const rule = proposalConfig.deliveryTimeRules[key];
                if (rule) {
                    // Base time is for 1 unit. Additional is for extra units.
                    // If quantity is 0, days is 0 (handled by if check)
                    // If quantity is 1, days = baseTime
                    // If quantity > 1, days = baseTime + (additional * (qty - 1))
                    const days = rule.baseTime + (rule.additionalPerUnit * (service.quantity - 1));
                    if (days > maxDays) maxDays = days;
                }
            }
        });

        if (maxDays > 0) {
            // Add buffer
            const minDays = maxDays;
            const maxDaysRange = Math.ceil(maxDays * 1.2);
            setProjectInfo(prev => ({
                ...prev,
                deliveryDays: `${minDays}-${maxDaysRange} Werktage`
            }));
        } else {
             setProjectInfo(prev => ({
                ...prev,
                deliveryDays: 'Calculated automatically'
            }));
        }
    }, [services]);

    const handleServiceChange = (serviceId, field, value) => {
        setServices(prev => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                [field]: value
            }
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setImages(prev => [...prev, {
                id: Date.now(),
                title: '',
                description: '',
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                imageData: event.target.result
            }]);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const updateImage = (id, field, value) => {
        setImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
    };

    const generateJSON = () => {
        const activeServices = Object.entries(services)
            .filter(([_, s]) => s.selected && s.quantity > 0)
            .map(([key, s]) => {
                // Calculate unit price for JSON
                let unitPrice = 0;
                if (s.customPrice) unitPrice = parseFloat(s.customPrice);
                else {
                    const priceFunc = pricing[key];
                    if (key === 'exterior-ground') unitPrice = priceFunc(s.quantity, s.buildingType);
                    else if (key === '360-interior') unitPrice = priceFunc(s.apartmentSize);
                    else if (key === '360-exterior') unitPrice = priceFunc(s.buildingType);
                    else if (key === 'interior') unitPrice = priceFunc(s.quantity);
                    else unitPrice = priceFunc();
                }

                return {
                    name: key, // Should map to display name
                    quantity: s.quantity,
                    unitPrice: unitPrice.toFixed(2).replace('.', ','),
                    totalPrice: (unitPrice * s.quantity).toFixed(2).replace('.', ','),
                    customPrice: s.customPrice ? parseFloat(s.customPrice) : undefined,
                    buildingType: s.buildingType,
                    apartmentSize: s.apartmentSize,
                    customDescription: s.customDescription.length > 0 ? s.customDescription : undefined
                };
            });

        const today = new Date();
        const data = {
            clientInfo,
            projectInfo: {
                ...projectInfo,
                date: today.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                MM: String(today.getMonth() + 1).padStart(2, '0'),
                DD: String(today.getDate()).padStart(2, '0')
            },
            services: activeServices,
            images,
            pricing: {
                subtotalNet: totals.subtotalNet.toFixed(2).replace('.', ','),
                totalNetPrice: totals.totalNet.toFixed(2).replace('.', ','),
                totalVat: totals.totalVat.toFixed(2).replace('.', ','),
                totalGrossPrice: totals.totalGross.toFixed(2).replace('.', ',')
            },
            signature: { signatureName: 'Christopher Helm' }
        };

        if (discount.type && discount.value > 0) {
            data.pricing.discount = {
                type: discount.type,
                value: discount.value,
                amount: totals.discountAmount.toFixed(2).replace('.', ','),
                description: discount.description
            };
        }

        return data;
    };

    const handlePreview = () => {
        if (!clientInfo.companyName || !clientInfo.street || !clientInfo.postalCode || !clientInfo.city || !clientInfo.country) {
            alert('Please fill in all required client information fields.');
            return;
        }

        const data = generateJSON();
        if (data.services.length === 0) {
            alert('Please select at least one service.');
            return;
        }

        try {
            localStorage.setItem('proposalPreviewData', JSON.stringify(data));
            // Use window.open to open in new tab, but pointing to the Next.js route
            window.open('/preview', '_blank');
        } catch (e) {
            console.error("Storage error", e);
            alert('Error preparing preview. Data might be too large.');
        }
    };

    const formatPrice = (p) => p.toFixed(2).replace('.', ',') + ' €';

    // Helper to get display name for service
    const getServiceName = (key) => {
        const names = {
            'exterior-ground': '3D-Außenvisualisierung Bodenperspektive',
            'exterior-bird': '3D-Außenvisualisierung Vogelperspektive',
            '3d-floorplan': '3D-Grundriss',
            '3d-complete-floor': '3D-Geschossansicht',
            '2d-floorplan': '2D-Grundriss',
            'home-staging': 'Digital Home Staging',
            'renovation': 'Digitale Renovierung',
            '360-interior': '360° Tour Innen (Virtuelle Tour)',
            '360-exterior': 'Video Außen',
            'slideshow': 'Slideshow Video',
            'site-plan': '3D-Lageplan',
            'social-media': 'Social Media Paket',
            'interior': '3D-Innenvisualisierung',
            'terrace': '3D-Visualisierung Terrasse'
        };
        return names[key] || key;
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <Head>
                <title>Request Proposal</title>
            </Head>

            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>Request Proposal</h1>
                    <p>Request your project visualization proposal</p>
                </div>
                <div className={styles.headerLogo}>
                    {/* <img src="logo.png" alt="ExposeProfi Logo" /> */}
                </div>
            </div>

            <div className={styles.formContainer}>
                {/* Client Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>👤 Client Information</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Company Email *</label>
                            <input 
                                type="email" 
                                value={clientInfo.companyEmail}
                                onChange={e => setClientInfo({...clientInfo, companyEmail: e.target.value})}
                                placeholder="e.g. info@company.com" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Company Name *</label>
                            <input 
                                type="text" 
                                value={clientInfo.companyName}
                                onChange={e => setClientInfo({...clientInfo, companyName: e.target.value})}
                                placeholder="Your company name" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Address *</label>
                            <input 
                                type="text" 
                                value={clientInfo.street}
                                onChange={e => setClientInfo({...clientInfo, street: e.target.value})}
                                placeholder="e.g. Sample Street 123" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Postal Code *</label>
                            <input 
                                type="text" 
                                value={clientInfo.postalCode}
                                onChange={e => setClientInfo({...clientInfo, postalCode: e.target.value})}
                                placeholder="e.g. 12345" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>City *</label>
                            <input 
                                type="text" 
                                value={clientInfo.city}
                                onChange={e => setClientInfo({...clientInfo, city: e.target.value})}
                                placeholder="e.g. Berlin" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Country *</label>
                            <select 
                                value={clientInfo.country}
                                onChange={e => setClientInfo({...clientInfo, country: e.target.value})}
                            >
                                <option value="">Select Country</option>
                                <option value="Deutschland">Deutschland</option>
                                <option value="Österreich">Österreich</option>
                                <option value="Schweiz">Schweiz</option>
                                <option value="Frankreich">Frankreich</option>
                                <option value="Italien">Italien</option>
                                <option value="Spanien">Spanien</option>
                                <option value="Niederlande">Niederlande</option>
                                <option value="Belgien">Belgien</option>
                                <option value="Polen">Polen</option>
                                <option value="Tschechien">Tschechien</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Project Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🏢 Project Information</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Project Name</label>
                            <input 
                                type="text" 
                                value={projectInfo.projectName}
                                onChange={e => setProjectInfo({...projectInfo, projectName: e.target.value})}
                                placeholder="e.g. Sunshine Residential Complex" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Project Type *</label>
                            <select 
                                value={projectInfo.projectType}
                                onChange={e => setProjectInfo({...projectInfo, projectType: e.target.value})}
                            >
                                <option value="">Select Project Type...</option>
                                <option value="EFH">EFH (Einfamilienhaus)</option>
                                <option value="DHH">DHH & MFH (2-5 WE)</option>
                                <option value="MFH-6-10">MFH (6-10 WE)</option>
                                <option value="MFH-11-15">MFH (11-15 WE)</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Offer Valid Until *</label>
                            <input 
                                type="date" 
                                value={projectInfo.offerValidUntil}
                                onChange={e => setProjectInfo({...projectInfo, offerValidUntil: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🎨 Select Services</h2>
                    
                    {Object.keys(services).map(serviceId => {
                        const service = services[serviceId];
                        return (
                            <div key={serviceId} className={`${styles.serviceItem} ${service.selected ? styles.active : ''}`}>
                                <div className={styles.serviceHeader}>
                                    <input 
                                        type="checkbox" 
                                        checked={service.selected}
                                        onChange={e => handleServiceChange(serviceId, 'selected', e.target.checked)}
                                    />
                                    <label onClick={() => handleServiceChange(serviceId, 'selected', !service.selected)}>
                                        {getServiceName(serviceId)}
                                    </label>
                                </div>
                                
                                {service.selected && (
                                    <div className={styles.serviceDetails} style={{display: 'grid'}}>
                                        {/* Specific Fields */}
                                        {serviceId === 'exterior-ground' && (
                                            <div className={styles.formGroup}>
                                                <label>Building Type *</label>
                                                <select 
                                                    value={service.buildingType}
                                                    onChange={e => handleServiceChange(serviceId, 'buildingType', e.target.value)}
                                                >
                                                    <option value="">Select Building Type...</option>
                                                    <option value="EFH">EFH (Einfamilienhaus)</option>
                                                    <option value="DHH">DHH & MFH (2-5 WE)</option>
                                                    <option value="MFH-6-10">MFH (6-10 WE)</option>
                                                    <option value="MFH-11-15">MFH (11-15 WE)</option>
                                                </select>
                                            </div>
                                        )}

                                        {serviceId === '360-interior' && (
                                            <div className={styles.formGroup}>
                                                <label>Apartment Size *</label>
                                                <select 
                                                    value={service.apartmentSize}
                                                    onChange={e => handleServiceChange(serviceId, 'apartmentSize', e.target.value)}
                                                >
                                                    <option value="">Select Apartment Size...</option>
                                                    <option value="30">bis 30 m²</option>
                                                    <option value="40">Etwa 40 m²</option>
                                                    <option value="50">Etwa 50 m²</option>
                                                    <option value="60">Etwa 60 m²</option>
                                                    <option value="70">Etwa 70 m²</option>
                                                    <option value="80">Etwa 80 m²</option>
                                                    <option value="90">90 m² bis 100 m²</option>
                                                    <option value="100">100 m² bis 120 m²</option>
                                                    <option value="EFH">EFH und DHH</option>
                                                </select>
                                            </div>
                                        )}

                                        {serviceId === '360-exterior' && (
                                            <div className={styles.formGroup}>
                                                <label>Building Type *</label>
                                                <select 
                                                    value={service.buildingType}
                                                    onChange={e => handleServiceChange(serviceId, 'buildingType', e.target.value)}
                                                >
                                                    <option value="">Select Building Type...</option>
                                                    <option value="EFH-DHH">EFH & DHH</option>
                                                    <option value="MFH-3-5">MFH (3-5 WE)</option>
                                                    <option value="MFH-6-10">MFH (6-10 WE)</option>
                                                    <option value="MFH-11-15">MFH (11-15 WE)</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className={styles.formGroup}>
                                            <label>Quantity *</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={service.quantity}
                                                onChange={e => handleServiceChange(serviceId, 'quantity', parseInt(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Custom Description (Optional)</label>
                                            <textarea 
                                                placeholder="Enter bullet points (one per line). Use - for sub-bullets."
                                                value={service.customDescriptionText || ''}
                                                onChange={e => {
                                                    const text = e.target.value;
                                                    // Parse text to bullet objects
                                                    const lines = text.split('\n').filter(l => l.trim());
                                                    const bullets = lines.map(line => {
                                                        if (line.trim().startsWith('-')) {
                                                            return { text: line.trim().substring(1).trim(), isSub: true };
                                                        }
                                                        return { text: line.trim(), isSub: false };
                                                    });
                                                    
                                                    // Convert to hierarchical structure if needed, or just flat list for now
                                                    // The preview expects array of strings or objects with children
                                                    // For simplicity, let's just store strings for now, or simple objects
                                                    
                                                    handleServiceChange(serviceId, 'customDescriptionText', text);
                                                    handleServiceChange(serviceId, 'customDescription', lines);
                                                }}
                                                rows={4}
                                            />
                                            <span className={styles.helperText}>One bullet per line. Start with - for sub-bullets.</span>
                                        </div>

                                        {/* Price Display */}
                                        <div className={styles.priceDisplay}>
                                            <span>Price: <strong>
                                                {(() => {
                                                    let price = 0;
                                                    if (service.customPrice) price = parseFloat(service.customPrice) * service.quantity;
                                                    else {
                                                        const priceFunc = pricing[serviceId];
                                                        if (priceFunc) {
                                                            if (serviceId === 'exterior-ground') price = priceFunc(service.quantity, service.buildingType) * service.quantity;
                                                            else if (serviceId === '360-interior') price = priceFunc(service.apartmentSize) * service.quantity;
                                                            else if (serviceId === '360-exterior') price = priceFunc(service.buildingType) * service.quantity;
                                                            else if (serviceId === 'interior') price = priceFunc(service.quantity) * service.quantity;
                                                            else price = priceFunc() * service.quantity;
                                                        }
                                                    }
                                                    return formatPrice(price);
                                                })()}
                                            </strong></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Images Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🖼️ Perspective Images</h2>
                    {images.map(img => (
                        <div key={img.id} className={styles.imageItem}>
                            <div className={styles.imageItemHeader}>
                                <span className={styles.imageItemTitle}>Image</span>
                                <button type="button" className={styles.removeImageBtn} onClick={() => removeImage(img.id)}>
                                    🗑️ Remove
                                </button>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Image Title</label>
                                <input 
                                    type="text" 
                                    value={img.title}
                                    onChange={e => updateImage(img.id, 'title', e.target.value)}
                                    placeholder="e.g. Perspective 1"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea 
                                    value={img.description}
                                    onChange={e => updateImage(img.id, 'description', e.target.value)}
                                    placeholder="Image description..."
                                />
                            </div>
                            {img.imageData && (
                                <img src={img.imageData} className={styles.imagePreview} style={{display: 'block'}} alt="Preview" />
                            )}
                        </div>
                    ))}
                    <div className={styles.imageUploadArea}>
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <div className={styles.imageUploadIcon}>📷</div>
                            <div className={styles.imageUploadText}>Click to upload image</div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                style={{display: 'none'}} 
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* Summary */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>💰 Summary</h2>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal Net:</span>
                            <span>{formatPrice(totals.subtotalNet)}</span>
                        </div>
                        {totals.discountAmount > 0 && (
                            <div className={styles.summaryRow}>
                                <span>Discount:</span>
                                <span>- {formatPrice(totals.discountAmount)}</span>
                            </div>
                        )}
                        <div className={styles.summaryRow}>
                            <span>Total Net Price:</span>
                            <span>{formatPrice(totals.totalNet)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>VAT (19%):</span>
                            <span>{formatPrice(totals.totalVat)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total Gross Price:</span>
                            <span>{formatPrice(totals.totalGross)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.buttonGroup}>
                    <button 
                        type="button" 
                        className={styles.btnSecondary} 
                        onClick={() => {
                            if (confirm('Are you sure you want to reset the form?')) {
                                localStorage.removeItem('proposalFormData');
                                window.location.reload();
                            }
                        }}
                    >
                        🔄 Reset
                    </button>
                    <button 
                        type="button" 
                        className={styles.btnPrimary} 
                        onClick={() => {
                            const data = generateJSON();
                            setJsonOutput(JSON.stringify(data, null, 2));
                        }}
                    >
                        📋 Generate JSON
                    </button>
                    <button 
                        type="button" 
                        className={styles.btnPrimary} 
                        onClick={handlePreview}
                    >
                        👁️ Preview Proposal
                    </button>
                </div>

                {jsonOutput && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>JSON Output</h2>
                        <pre className={styles.jsonOutput + ' ' + styles.show}>
                            {jsonOutput}
                        </pre>
                        <button 
                            className={styles.copyBtn}
                            onClick={() => {
                                navigator.clipboard.writeText(jsonOutput);
                                alert('Copied to clipboard!');
                            }}
                        >
                            📋 Copy JSON
                        </button>
                    </div>
                )}
            </div>

            {/* Auto-save Indicator */}
            <div className={`${styles.autosaveIndicator} ${saveStatus ? styles.show : ''} ${saveStatus === 'saved' ? styles.saved : styles.saving}`}>
                <span>{saveStatus === 'saving' ? '⏳ Saving...' : '✅ Saved'}</span>
            </div>
        </div>
    );
}
