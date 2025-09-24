// Simple authentication for CostFlowAI admin
// Only allows costflowai@gmail.com to access admin features

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, action } = req.body;

  // Only allow costflowai@gmail.com
  const authorizedEmail = 'costflowai@gmail.com';

  if (action === 'login') {
    if (email === authorizedEmail) {
      // In production, you'd use proper JWT tokens
      // For now, we'll use a simple session approach
      return res.status(200).json({
        success: true,
        token: 'costflowai_admin_token',
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Only costflowai@gmail.com can access the admin panel.'
      });
    }
  }

  if (action === 'verify') {
    const { token } = req.body;
    if (token === 'costflowai_admin_token' && email === authorizedEmail) {
      return res.status(200).json({
        success: true,
        message: 'Token valid'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or unauthorized email'
      });
    }
  }

  return res.status(400).json({ message: 'Invalid action' });
}