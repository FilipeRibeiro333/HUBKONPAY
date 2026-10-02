// ---------------------------------------------
// Test script for HUBKON Company Dashboard
// Fetches company info, wallet, and transactions
// ---------------------------------------------

import axios from 'axios';

// Replace with your actual JWT token
const TOKEN = '<SEU_TOKEN_DE_LOGIN>';

const API_URL = 'http://localhost:5000/api/company/dashboard';

const testDashboard = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    console.log('✅ Dashboard Data:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error fetching dashboard:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

testDashboard();