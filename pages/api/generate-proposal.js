import path from 'path';
import fs from 'fs';
import https from 'https';
import { PureDocxProposalGenerator } from '../../pure-docx-generator.js';
import { getClientDetails, save_proposal_detail } from '../../utils.js';

// Increase body size limit for Next.js API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

// API endpoint to generate proposal
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Received proposal request');
    
    // Parse JSON data
    const data = req.body;
    const { clientInfo, projectInfo, services, pricing, signature, images: imageMetadata } = data;
    
    // Validate required data
    if (!clientInfo) {
      console.error('❌ Missing clientInfo in request');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing client information' 
      });
    }
    
    // Fetch client details from database if client_id is provided
    let dbClientData = null;
    let clientFolderName = 'default_client';
    
    if (clientInfo.clientNumber) {
      const clientId = clientInfo.clientNumber;
      console.log('🔍 Fetching client details from database for:', clientId);
      
      const clientDetails = await getClientDetails(clientId);
      
      if (clientDetails && clientDetails.length > 0) {
        dbClientData = clientDetails[0];
        console.log('✅ Client data retrieved:', dbClientData);
        
        // Create folder name: clientid_companyname
        const sanitize = (str) => str ? String(str).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) : 'unknown';
        clientFolderName = `${sanitize(dbClientData.client_id || clientId)}_${sanitize(dbClientData.company_name)}`;
        
        // Use database company name if available, but keep manually entered addresses
        clientInfo.companyName = dbClientData.company_name || clientInfo.companyName;
      } else {
        console.log('⚠️ Client not found in database, using form data');
        const sanitize = (str) => str ? String(str).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) : 'unknown';
        clientFolderName = `${sanitize(clientId)}_${sanitize(clientInfo.companyName)}`;
      }
    } else {
      // No client ID provided, create folder from company name
      const sanitize = (str) => str ? String(str).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) : 'unknown';
      clientFolderName = `${sanitize(clientInfo.companyName)}_${Date.now()}`;
    }
    
    console.log('📁 Client folder name:', clientFolderName);
    
    // Process images (base64 encoded)
    const images = [];
    
    // Handle base64 images
    if (imageMetadata && imageMetadata.length > 0) {
      imageMetadata.forEach((imgData, index) => {
        if (imgData.imageData) {
          // Store base64 data directly or convert if needed
          images.push({
            title: imgData.title || '',
            description: imgData.description || '',
            imageData: imgData.imageData,
            fileType: imgData.fileType || 'image/png'
          });
        }
      });
    }
    
    // Prepare data for DOCX generator
    const docxData = {
      companyName: clientInfo.companyName,
      street: clientInfo.street,
      postalCode: clientInfo.postalCode,
      city: clientInfo.city,
      country: clientInfo.country || 'Deutschland',
      date: projectInfo.date,
      MM: projectInfo.MM,
      DD: projectInfo.DD,
      offerValidUntil: projectInfo.offerValidUntil,
      deliveryDays: projectInfo.deliveryDays,
      subtotalNet: pricing.subtotalNet,
      totalNetPrice: pricing.totalNetPrice,
      totalVat: pricing.totalVat,
      totalGrossPrice: pricing.totalGrossPrice,
      discount: pricing.discount || null,
      signatureName: signature?.signatureName || 'Christopher Helm',
      images: images,
      services: services || []
    };
    
    console.log('📄 Generating DOCX with', images.length, 'images');
    
    // Create client-specific output directory
    const clientOutputDir = path.join(process.cwd(), 'output', clientFolderName);
    if (!fs.existsSync(clientOutputDir)) {
      fs.mkdirSync(clientOutputDir, { recursive: true });
      console.log('📁 Created client directory:', clientOutputDir);
    }
    
    // Generate filename: YYMMDD_Angebot_CompanyName ExposéProfi
    const YY = projectInfo.date ? projectInfo.date.split('.')[2].slice(-2) : '25';
    const MM = projectInfo.MM || '01';
    const DD = projectInfo.DD || '01';
    const safeCompanyName = clientInfo.companyName
      .replace(/[^a-zA-Z0-9äöüÄÖÜß\s&]/g, '')
      .substring(0, 50);
    const filename = `${YY}${MM}${DD}_Angebot_${safeCompanyName} ExposéProfi.docx`;
    
    // Generate DOCX
    const generator = new PureDocxProposalGenerator(docxData);
    const outputPath = path.join(clientOutputDir, filename);
    const logoPath = path.join(process.cwd(), 'logo_2.png');
    
    await generator.save(outputPath, logoPath);
    
    console.log('✅ Proposal generated:', outputPath);

    // Save proposal to database
    const proposalDbData = {
      client_id: dbClientData ? dbClientData.client_id : null,
      company_name: clientInfo.companyName,
      street_no: clientInfo.street,
      city: clientInfo.city,
      country: clientInfo.country || 'Deutschland',
      postal_code: clientInfo.postalCode,
      project_number: projectInfo.projectNumber || null,
      project_name: projectInfo.projectName || null,
      project_type: projectInfo.projectType || null,
      offer_number: generator.offerNumber,
      delivery_time_min: projectInfo.deliveryDays ? parseInt(projectInfo.deliveryDays.split('-')[0]) : null,
      delivery_time_max: projectInfo.deliveryDays ? parseInt(projectInfo.deliveryDays.split('-')[1]) : null,
      services: services,
      pricing: {
        subtotalNet: pricing.subtotalNet,
        totalNetPrice: pricing.totalNetPrice,
        totalVat: pricing.totalVat,
        totalGrossPrice: pricing.totalGrossPrice,
        discount: pricing.discount
      },
      discount_type: pricing.discount?.type || null,
      discount_value: pricing.discount?.amount || null,
      currency: 'EUR',
      total_price: parseFloat(pricing.totalGrossPrice?.replace(/[^0-9.,]/g, '').replace('.', '').replace(',', '.')) || null,
      image_urls: imageMetadata?.map(img => ({ title: img.title, description: img.description })) || [],
      document_url: null
    };

    const savedProposal = await save_proposal_detail(proposalDbData);
    if (savedProposal) {
      console.log('✅ Proposal saved to database with ID:', savedProposal[0]?.id);
    } else {
      console.warn('⚠️ Failed to save proposal to database');
    }

    // Send data to n8n webhook
    const webhookPayload = {
      offerNumber: generator.offerNumber,
      clientInfo: {
        companyName: clientInfo.companyName,
        street: clientInfo.street,
        postalCode: clientInfo.postalCode,
        city: clientInfo.city,
        country: clientInfo.country || 'Deutschland'
      },
      projectInfo: {
        date: projectInfo.date,
        MM: projectInfo.MM,
        DD: projectInfo.DD,
        offerValidUntil: projectInfo.offerValidUntil,
        deliveryDays: projectInfo.deliveryDays
      },
      pricing: {
        totalNetPrice: pricing.totalNetPrice,
        totalVat: pricing.totalVat,
        totalGrossPrice: pricing.totalGrossPrice
      },
      signature: {
        signatureName: signature?.signatureName || 'Christopher Helm'
      },
      filename: filename,
      imagesIncluded: images.length
    };

    const webhookUrl = 'https://n8n.exposeprofi.de/webhook-test/556fd7ca-ef28-4d00-b98e-9271b07a7bad';
    const webhookData = JSON.stringify(webhookPayload);

    const urlObj = new URL(webhookUrl);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(webhookData)
      }
    };

    const webhookRequest = https.request(options, (webhookRes) => {
      let body = '';
      webhookRes.on('data', (chunk) => { body += chunk; });
      webhookRes.on('end', () => {
        console.log('✅ n8n webhook response:', webhookRes.statusCode, body);
      });
    });

    webhookRequest.on('error', (err) => {
      console.error('❌ Error sending to n8n webhook:', err.message);
    });

    webhookRequest.write(webhookData);
    webhookRequest.end();
    
    // Return success response
    res.json({
      success: true,
      message: 'Proposal generated successfully',
      filename: filename,
      fileUrl: `/output/${clientFolderName}/${filename}`,
      filePath: outputPath,
      clientFolder: clientFolderName,
      offerNumber: generator.offerNumber,
      clientName: clientInfo.companyName,
      totalAmount: pricing.totalGrossPrice,
      imagesIncluded: images.length,
      clientDataFromDb: dbClientData ? true : false
    });
    
  } catch (error) {
    console.error('❌ Error generating proposal:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
