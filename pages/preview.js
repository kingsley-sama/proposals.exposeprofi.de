import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Preview.module.css';
import { serviceDescriptions } from '../lib/serviceDescriptions';
import { CONFIG } from '../lib/proposalConfig';

// Helper to format price
const formatPrice = (value) => {
  return (typeof value === 'number' ? value : parseFloat(value)).toFixed(2).replace('.', ',') + ' €';
};

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export default function Preview() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      let dataStr = localStorage.getItem('proposalPreviewData');
      if (!dataStr) {
        dataStr = sessionStorage.getItem('proposalPreviewData');
      }
      
      if (!dataStr) {
        alert('No proposal data found. Please fill out the form first.');
        // window.location.href = '/proposal-form.html'; // Commented out to avoid redirect loop during dev
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(dataStr);
      
      // Ensure pricing structure exists
      if (!parsedData.pricing) parsedData.pricing = {};
      if (!parsedData.pricing.discount) parsedData.pricing.discount = null;
      
      // Ensure terms structure exists
      if (!parsedData.terms) parsedData.terms = {};

      setData(parsedData);
      setLoading(false);
    };

    loadData();
  }, []);

  const updateData = (newData) => {
    setData(newData);
    localStorage.setItem('proposalPreviewData', JSON.stringify(newData));
    // Also update proposalData for compatibility if needed
    localStorage.setItem('proposalData', JSON.stringify(newData));
  };

  const handleFieldChange = (path, value) => {
    const newData = { ...data };
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    updateData(newData);
  };

  const handleServiceUpdate = (index, field, value) => {
    const newData = { ...data };
    const service = newData.services[index];
    
    if (field === 'quantity') {
      const quantity = parseInt(value) || 1;
      service.quantity = quantity;
      
      // Auto-update price if not custom set
      if (!service.customPriceSet) {
        const serviceInfo = Object.values(serviceDescriptions).find(s => s.name === service.name);
        if (serviceInfo) {
          if (serviceInfo.pricingTiers) {
            // Find tier
            let price = serviceInfo.pricingTiers[0].price;
            for (let i = serviceInfo.pricingTiers.length - 1; i >= 0; i--) {
              if (quantity >= serviceInfo.pricingTiers[i].quantity) {
                price = serviceInfo.pricingTiers[i].price;
                break;
              }
            }
            service.unitPrice = price;
          } else if (serviceInfo.defaultPrice) {
            service.unitPrice = serviceInfo.defaultPrice;
          }
        }
      }
    } else if (field === 'unitPrice') {
      service.unitPrice = parseFloat(value.replace(',', '.').replace('€', '').trim()) || 0;
      service.customPriceSet = true;
    } else {
      service[field] = value;
    }

    // Recalculate totals
    recalculateTotals(newData);
    updateData(newData);
  };

  const recalculateTotals = (currentData) => {
    let subtotal = 0;
    currentData.services.forEach(s => {
      subtotal += (parseInt(s.quantity) || 0) * (parseFloat(s.unitPrice) || 0);
    });

    currentData.pricing.subtotalNet = subtotal.toFixed(2).replace('.', ',');
    
    let discountAmount = 0;
    if (currentData.pricing.discount) {
      const { amount, type } = currentData.pricing.discount;
      const discountValue = parseFloat(amount.toString().replace(',', '.')) || 0;
      if (type === 'percentage') {
        discountAmount = subtotal * discountValue / 100;
      } else {
        discountAmount = discountValue;
      }
    }

    const totalNet = subtotal - discountAmount;
    const totalVat = totalNet * 0.19;
    const totalGross = totalNet + totalVat;

    currentData.pricing.totalNetPrice = totalNet.toFixed(2).replace('.', ',');
    currentData.pricing.totalVat = totalVat.toFixed(2).replace('.', ',');
    currentData.pricing.totalGrossPrice = totalGross.toFixed(2).replace('.', ',');
  };

  const addDiscount = () => {
    const newData = { ...data };
    newData.pricing.discount = {
      description: 'Mengenrabatt',
      amount: '0',
      type: 'fixed'
    };
    recalculateTotals(newData);
    updateData(newData);
  };

  const removeDiscount = () => {
    const newData = { ...data };
    newData.pricing.discount = null;
    recalculateTotals(newData);
    updateData(newData);
  };

  const updateDiscount = (field, value) => {
    const newData = { ...data };
    if (!newData.pricing.discount) return;
    
    newData.pricing.discount[field] = value;
    recalculateTotals(newData);
    updateData(newData);
  };

  const generateProposal = async () => {
    setGenerating(true);
    try {
      // Get image files from localStorage (stored during form submission)
      // Note: In a real app, you'd handle file uploads differently
      const imageFiles = JSON.parse(localStorage.getItem('proposalImageFiles') || '[]');
      
      const serverData = {
        clientInfo: data.clientInfo,
        projectInfo: data.projectInfo,
        services: data.services,
        pricing: data.pricing,
        signature: data.signature,
        images: data.images || []
      };

      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ Proposal generated successfully!\n\nOffer Number: ${result.offerNumber}`);
        if (result.fileUrl) {
          window.open(result.fileUrl, '_blank');
        }
      } else {
        throw new Error(result.error || 'Failed to generate proposal');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`❌ Error generating proposal:\n${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className={styles.previewContainer}>Loading...</div>;
  if (!data) return <div className={styles.previewContainer}>No data found</div>;

  const hasVirtualTour = data.services.some(s => s.name.includes('Virtueller Rundgang') || s.name.includes('Virtual Tour'));

  return (
    <div className={styles.previewContainer}>
      <Head>
        <title>Proposal Preview - ExposeProfi.de</title>
      </Head>

      <div className={styles.previewToolbar}>
        <h1>📄 Proposal Preview</h1>
        <div className={styles.previewToolbarActions}>
          <button className={`${styles.toolbarBtn} ${styles.btnBack}`} onClick={() => window.location.href = '/proposal-form.html'}>
            ← Back to Form
          </button>
          <button 
            className={`${styles.toolbarBtn} ${styles.btnGenerate}`} 
            onClick={generateProposal}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '📄 Generate DOCX'}
          </button>
        </div>
      </div>

      {/* PAGE 1: COVER */}
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <div className={styles.exposeprofiLogo}>
            <img src="/logo_2.png" alt="ExposeProfi.de" />
          </div>
          <div className={styles.headerLeft}>
            ExposeProfi.de | EPCS GmbH | Bruder-Klaus-Straße 3a | 78467 Konstanz
          </div>

          <div className={styles.recipientAddress}>
            <div className="address-block">
              <span className={styles.companyName}>{data.clientInfo.companyName}</span><br />
              <span>{data.clientInfo.street}</span><br />
              <span>{data.clientInfo.postalCode} {data.clientInfo.city}</span><br />
              <span>{data.clientInfo.country}</span>
            </div>
          </div>

          <div className={styles.dateOffer}>
            <div>{data.projectInfo.date}</div>
          </div>

          <div className={styles.offerNumberSection}>
            Angebot Nr. 2025-{data.projectInfo.MM}-{data.projectInfo.DD}-{CONFIG.offerNumberStart}
          </div>
          <div className={styles.introText}>
            Vielen Dank für Ihre Anfrage und Ihr damit verbundenes Interesse an einer Zusammenarbeit.
          </div>

          <div className={styles.introText}>
            <strong>Die Vorteile zusammengefasst, die Sie erwarten können:</strong>
          </div>

          <div className={styles.benefitsList}>
            <div><strong>1. Fotorealismus:</strong> Wir erstellen ausschließlich emotionale 3D-Visualisierungen der höchsten Qualitätsstufe.</div>
            <div><strong>2. Persönliche & individuelle Betreuung:</strong> Sie erhalten bei jedem Projekt die Unterstützung von einem persönlichen Ansprechpartner, der die Visualisierungen individuell für Sie erstellt und immer per Telefon oder Email erreichbar ist.</div>
            <div><strong>3. Effiziente Prozesse & schnelle Lieferzeit:</strong> Wie Sie sehen, melden wir uns innerhalb von 24h mit einem Angebot bei Ihnen. Ihr Projekt verläuft ab Start ebenso reibungslos und Sie erhalten die Visualisierungen schnellstmöglich.</div>
            <div><strong>4. Korrekturschleifen:</strong> Falls Sie Änderungswünsche haben, bieten wir Ihnen ein eigenes Tool, mit dem Sie direkt in der Visualisierung Kommentare hinterlassen können. Das spart Zeit und Missverständnisse.</div>
            <div><strong>5. Preiswert:</strong> Aufgrund effizienter Prozesse bieten wir günstigere Preise bei gleicher Qualität und besserer Betreuung.</div>
          </div>
        </div>
        <Footer />
      </div>

      {/* PAGE 2: SERVICES */}
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <div className={styles.headerText}>
            <strong>Basierend auf den zugesandten Unterlagen unterbreiten wir Ihnen folgendes Angebot:</strong>
          </div>

          <table className={styles.servicesTable}>
            <thead>
              <tr>
                <th className={styles.colNumber}>Anzahl</th>
                <th className={styles.colDesignation}>Bezeichnung</th>
                <th className={styles.colDescription}>Beschreibung</th>
                <th className={styles.colPrice}>Stückpreis netto</th>
              </tr>
            </thead>
            <tbody>
              {data.services.length === 0 ? (
                <tr><td colSpan="4" className={styles.emptyState}>Keine Dienste ausgewählt.</td></tr>
              ) : (
                data.services.map((service, index) => (
                  <ServiceRow 
                    key={index} 
                    service={service} 
                    index={index} 
                    onUpdate={handleServiceUpdate}
                    data={data}
                    updateData={updateData}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>

      {/* PAGE 3: PERSPECTIVE IMAGES (Optional) */}
      {data.images && data.images.length > 0 && (
        <div className={styles.page}>
          <div className={styles.pageContent}>
            <div className={styles.sectionTitle}>Empfohlene Perspektiven Außen:</div>
            {data.images.map((image, idx) => (
              <div key={idx} className={styles.perspectiveImageItem}>
                {image.title && <div className={styles.perspectiveImageTitle}>{image.title}</div>}
                {image.description && <div className={styles.perspectiveImageDescription}>{image.description}</div>}
                {image.imageData && (
                  <img src={image.imageData} alt={image.title} className={styles.perspectiveImagePreview} />
                )}
              </div>
            ))}
          </div>
          <Footer />
        </div>
      )}

      {/* PAGE 4: SUMMARY */}
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <div className={styles.sectionTitle}>Zusammenfassung:</div>
          <table className={styles.pricingSummary}>
            <tbody>
              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}><strong>Zwischensumme (Netto)</strong></td>
                <td className={styles.summaryValue}>
                  <strong>
                    <EditableSpan 
                      value={data.pricing.subtotalNet} 
                      onChange={(val) => {
                        const clean = val.replace(/[€\s]/g, '');
                        const newData = { ...data };
                        newData.pricing.subtotalNet = clean;
                        newData.pricing.totalNetPrice = clean; // Simplified logic
                        recalculateTotals(newData);
                        updateData(newData);
                      }} 
                    /> €
                  </strong>
                </td>
              </tr>
              
              {data.pricing.discount && (
                <tr className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <td className={styles.summaryLabel}>
                    <strong>
                      Rabatt: <EditableSpan value={data.pricing.discount.description} onChange={(v) => updateDiscount('description', v)} />
                    </strong>
                  </td>
                  <td className={styles.summaryValue}>
                    <strong>
                      <select 
                        value={data.pricing.discount.type} 
                        onChange={(e) => updateDiscount('type', e.target.value)}
                        style={{ padding: '4px', marginRight: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option value="fixed">EUR</option>
                        <option value="percentage">%</option>
                      </select>
                      - <EditableSpan value={data.pricing.discount.amount} onChange={(v) => updateDiscount('amount', v)} />
                      {data.pricing.discount.type === 'percentage' ? '% ' : ' €'}
                      <button className={styles.removeDiscountBtn} onClick={removeDiscount}>Entfernen</button>
                    </strong>
                  </td>
                </tr>
              )}

              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}><strong>Summe (Netto)</strong></td>
                <td className={styles.summaryValue}><strong>{data.pricing.totalNetPrice} €</strong></td>
              </tr>
              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}>
                  <strong>
                    <EditableSpan 
                      value={data.pricing.vatLabel || 'MwSt. (19%)'} 
                      onChange={(v) => handleFieldChange('pricing.vatLabel', v)} 
                    />
                  </strong>
                </td>
                <td className={styles.summaryValue}>
                  <strong>
                    <EditableSpan 
                      value={data.pricing.totalVat} 
                      onChange={(v) => handleFieldChange('pricing.totalVat', v.replace(/[€\s]/g, ''))} 
                    /> €
                  </strong>
                </td>
              </tr>
              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}><strong>Gesamtbruttopreis</strong></td>
                <td className={styles.summaryValue}>
                  <strong>
                    <EditableSpan 
                      value={data.pricing.totalGrossPrice} 
                      onChange={(v) => handleFieldChange('pricing.totalGrossPrice', v.replace(/[€\s]/g, ''))} 
                    /> €
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>

          {!data.pricing.discount && (
            <button className={styles.addDiscountBtn} onClick={addDiscount}>+ Rabatt hinzufügen</button>
          )}
          
          <div className={styles.editHint} style={{ marginTop: '5px' }}>Preise und Bezeichnungen sind editierbar - klicken Sie zum Bearbeiten</div>

          <p style={{ marginTop: '32px', marginBottom: '20px' }}>
            <strong>
              <EditableSpan value={data.terms.validUntilText || 'Dieses Angebot ist gültig bis:'} onChange={(v) => handleFieldChange('terms.validUntilText', v)} /> 
              {' '}
              <EditableSpan value={formatDate(data.projectInfo.offerValidUntil)} onChange={(v) => handleFieldChange('projectInfo.offerValidUntil', v)} />
            </strong>
          </p>

          <div style={{ marginBottom: '20px' }}>
            <p>
              <strong>Lieferweg:</strong>{' '}
              <EditableSpan 
                value={hasVirtualTour ? CONFIG.deliveryConditions.withVirtualTour : CONFIG.deliveryConditions.standardOnly} 
                onChange={(v) => handleFieldChange('terms.deliveryMethod', v)} 
              />
            </p>
            <p>
              <strong>Lieferzeit:</strong>{' '}
              <EditableSpan value={data.projectInfo.deliveryDays} onChange={(v) => handleFieldChange('projectInfo.deliveryDays', v)} />{' '}
              <EditableSpan value={data.terms.deliveryDaysText || 'Werktage ab Beauftragung und Erhalt der Unterlagen'} onChange={(v) => handleFieldChange('terms.deliveryDaysText', v)} />
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p>
              <strong>Zahlungsbedingungen:</strong>{' '}
              <EditableSpan value={data.terms.paymentTerms || '50% Anzahlung, Rest nach Lieferung - innerhalb 14 Tage netto'} onChange={(v) => handleFieldChange('terms.paymentTerms', v)} />
            </p>
          </div>

          <p style={{ marginBottom: '20px', fontStyle: 'italic' }}>
            <EditableSpan value={data.terms.closingGreeting || 'Mit freundlichen Grüßen'} onChange={(v) => handleFieldChange('terms.closingGreeting', v)} /><br />
            <EditableSpan value={data.signature.signatureName} onChange={(v) => handleFieldChange('signature.signatureName', v)} />
          </p>

          <div className={styles.footnote}>
            <p><strong>Hinweise:</strong></p>
            <p>• <EditableSpan value={data.terms.note1 || CONFIG.footerNotes.note1} onChange={(v) => handleFieldChange('terms.note1', v)} /></p>
            <p>• <EditableSpan value={data.terms.note2 || (hasVirtualTour ? CONFIG.footerNotes.note2.withVirtualTour : CONFIG.footerNotes.note2.withoutVirtualTour)} onChange={(v) => handleFieldChange('terms.note2', v)} /></p>
          </div>

          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ccc', fontSize: '11px', lineHeight: '1.6' }}>
            <p><strong>Korrekturschleifen:</strong> <EditableSpan value={data.terms.revisionPolicy || 'Bis zu 2 Korrekturschleifen sind im Preis inbegriffen. Weitere Korrekturschleifen werden nach Aufwand berechnet.'} onChange={(v) => handleFieldChange('terms.revisionPolicy', v)} /></p>
            <p><strong>Nutzungsrechte:</strong> <EditableSpan value={data.terms.usageRights || 'Mit vollständiger Bezahlung erhalten Sie die uneingeschränkten Nutzungsrechte an den gelieferten Visualisierungen.'} onChange={(v) => handleFieldChange('terms.usageRights', v)} /></p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

const Footer = () => (
  <div className={styles.pageFooter}>
    <div className={styles.footerColumn}>
      <p className={styles.companyName}>ExposeProfi.de</p>
      <p>EPCS GmbH</p>
      <p>GF: Christopher Helm</p>
      <p>Bruder-Klaus-Str. 3a, 78467 Konstanz</p>
      <p>HRB 725172, Amtsgericht Freiburg</p>
      <p>St.-Nr: 0908011277</p>
      <p>USt-ID: DE347265281</p>
    </div>
    <div className={styles.footerColumn}>
      <p className={styles.companyName}>Bankverbindung</p>
      <p>Qonto (Banque de France)</p>
      <p>IBAN DE62100101239488471916</p>
    </div>
    <div className={styles.footerColumn}>
      <p>Email: christopher.helm@exposeprofi.de</p>
      <p>Web: www.exposeprofi.de</p>
      <p>Tel: +49-7531-1227491</p>
    </div>
  </div>
);

const EditableSpan = ({ value, onChange, className }) => {
  const handleBlur = (e) => {
    if (onChange) onChange(e.target.textContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${styles.editable} ${className || ''}`}
    >
      {value}
    </span>
  );
};

const ServiceRow = ({ service, index, onUpdate, data, updateData }) => {
  const serviceInfo = Object.values(serviceDescriptions).find(s => s.name === service.name);
  
  // Determine description to show
  const defaultDescription = service.modifiedDefaults || (serviceInfo ? serviceInfo.description : []);
  const customDescription = service.customDescription || [];

  const handleBulletUpdate = (type, path, newValue) => {
    const newData = { ...data };
    const srv = newData.services[index];
    
    if (type === 'default') {
      if (!srv.modifiedDefaults) {
        srv.modifiedDefaults = JSON.parse(JSON.stringify(serviceInfo ? serviceInfo.description : []));
      }
      updateNestedBullet(srv.modifiedDefaults, path, newValue);
    } else {
      if (!srv.customDescription) srv.customDescription = [];
      updateNestedBullet(srv.customDescription, path, newValue);
    }
    
    updateData(newData);
  };

  const updateNestedBullet = (root, path, newValue) => {
    let current = root;
    for (let i = 0; i < path.length - 1; i++) {
      const idx = path[i];
      if (typeof current[idx] === 'string') {
        current[idx] = { text: current[idx], children: [] };
      }
      if (!current[idx].children) current[idx].children = [];
      current = current[idx].children;
    }
    
    const lastIdx = path[path.length - 1];
    if (typeof current[lastIdx] === 'object') {
      current[lastIdx].text = newValue;
    } else {
      current[lastIdx] = newValue;
    }
  };

  const addBullet = () => {
    const newData = { ...data };
    if (!newData.services[index].customDescription) newData.services[index].customDescription = [];
    newData.services[index].customDescription.push('New bullet point');
    updateData(newData);
  };

  return (
    <>
      <tr>
        <td className={styles.colNumber}>
          <EditableSpan value={service.quantity} onChange={(v) => onUpdate(index, 'quantity', v)} />
        </td>
        <td className={styles.colDesignation}>
          <EditableSpan value={service.name} onChange={(v) => onUpdate(index, 'name', v)} />
        </td>
        <td className={styles.colDescription}>
          <ul>
            {defaultDescription.map((desc, i) => (
              <BulletItem 
                key={`def-${i}`} 
                item={desc} 
                path={[i]} 
                type="default" 
                onUpdate={handleBulletUpdate}
                level={0}
              />
            ))}
            {customDescription.map((desc, i) => (
              <BulletItem 
                key={`cust-${i}`} 
                item={desc} 
                path={[i]} 
                type="custom" 
                onUpdate={handleBulletUpdate}
                level={0}
              />
            ))}
          </ul>
          <button className={styles.addBulletBtn} onClick={addBullet}>+ Add bullet</button>
        </td>
        <td className={styles.colPrice}>
          <EditableSpan value={service.unitPrice} onChange={(v) => onUpdate(index, 'unitPrice', v)} /> €
        </td>
      </tr>
      {serviceInfo && serviceInfo.pricingTiers && (
        <>
          <tr className={`${styles.pricingTierRow} ${styles.pricingTierTitleRow}`}>
            <td className={styles.colNumber}>&nbsp;</td>
            <td className={styles.colDesignation}>&nbsp;</td>
            <td className={styles.colDescription} style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', fontSize: '9pt', padding: '6px 8px' }}>
              Preisstaffelung:
            </td>
            <td className={styles.colPrice}>&nbsp;</td>
          </tr>
          {serviceInfo.pricingTiers.map((tier, i) => (
            <tr key={i} className={styles.pricingTierRow}>
              <td className={styles.colNumber}>&nbsp;</td>
              <td className={styles.colDesignation}>&nbsp;</td>
              <td className={styles.colDescription} style={{ backgroundColor: '#fafbfc', fontSize: '8.5pt', padding: '4px 8px 4px 20px' }}>
                {tier.label}
              </td>
              <td className={styles.colPrice}>&nbsp;</td>
            </tr>
          ))}
        </>
      )}
      {serviceInfo && serviceInfo.defaultPrice && !serviceInfo.pricingTiers && (
        <tr className={styles.pricingTierRow}>
          <td className={styles.colNumber}>&nbsp;</td>
          <td className={styles.colDesignation}>&nbsp;</td>
          <td className={styles.colDescription} style={{ backgroundColor: '#f8f9fa', fontSize: '9pt', padding: '6px 8px' }}>
            <strong>Standardpreis:</strong> {serviceInfo.defaultPrice.toFixed(2)} € pro Einheit
          </td>
          <td className={styles.colPrice}>&nbsp;</td>
        </tr>
      )}
    </>
  );
};

const BulletItem = ({ item, path, type, onUpdate, level }) => {
  const text = typeof item === 'string' ? item : item.text;
  const children = typeof item === 'object' && item.children ? item.children : [];

  return (
    <li>
      <span className={styles.editableBullet}>
        <EditableSpan 
          value={text} 
          onChange={(v) => onUpdate(type, path, v)} 
        />
      </span>
      {children.length > 0 && (
        <ul className={styles.subBullet}>
          {children.map((child, i) => (
            <BulletItem 
              key={i} 
              item={child} 
              path={[...path, i]} 
              type={type} 
              onUpdate={onUpdate}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
