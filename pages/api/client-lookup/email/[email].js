import { getClientDetailsByEmail } from '../../../utils.js';

// API endpoint to lookup client by company email
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;
    console.log('🔍 Looking up client by email:', email);
    
    const clientDetails = await getClientDetailsByEmail(email);
    
    if (clientDetails && clientDetails.length > 0) {
      res.json({
        success: true,
        data: clientDetails[0]
      });
    } else {
      res.json({
        success: false,
        message: 'Client not found'
      });
    }
  } catch (error) {
    console.error('❌ Error looking up client:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
