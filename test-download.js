// Test script to debug download functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDownloads() {
  try {
    console.log('🧪 Testing download functionality...\n');
    
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    try {
      const response = await axios.get(`${BASE_URL}/`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Start with: npm run server');
      return;
    }
    
    // Test 2: Check project structure
    console.log('\n2️⃣ Testing project structure...');
    try {
      const response = await axios.get(`${BASE_URL}/api/projects/default`);
      const project = response.data;
      console.log('✅ Project loaded successfully');
      console.log(`   Root files: ${Object.keys(project.files).length}`);
      console.log(`   Folders: ${Object.keys(project.folders).length}`);
      
      // Show file details
      if (Object.keys(project.files).length > 0) {
        const firstFile = Object.values(project.files)[0];
        console.log(`   First file: ${firstFile.name} (ID: ${firstFile.id})`);
      }
      
      if (Object.keys(project.folders).length > 0) {
        const firstFolder = Object.values(project.folders)[0];
        console.log(`   First folder: ${firstFolder.name} (ID: ${firstFolder.id})`);
        if (firstFolder.children) {
          console.log(`   Folder children: ${Object.keys(firstFolder.children).length}`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to load project:', error.message);
    }
    
    // Test 3: Test individual file download
    console.log('\n3️⃣ Testing individual file download...');
    try {
      const response = await axios.get(`${BASE_URL}/api/projects/default`);
      const project = response.data;
      
      if (Object.keys(project.files).length > 0) {
        const firstFile = Object.values(project.files)[0];
        console.log(`   Testing download for: ${firstFile.name}`);
        
        const downloadResponse = await axios.get(`${BASE_URL}/api/download/${firstFile.id}`, {
          responseType: 'text'
        });
        console.log('✅ File download successful');
        console.log(`   Content length: ${downloadResponse.data.length} characters`);
      } else {
        console.log('⚠️  No files to test download');
      }
    } catch (error) {
      console.log('❌ File download failed:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.error || 'Unknown error'}`);
      }
    }
    
    // Test 4: Test project ZIP download
    console.log('\n4️⃣ Testing project ZIP download...');
    try {
      const response = await axios.get(`${BASE_URL}/api/download-project`, {
        responseType: 'arraybuffer'
      });
      console.log('✅ Project ZIP download successful');
      console.log(`   ZIP size: ${response.data.length} bytes`);
    } catch (error) {
      console.log('❌ Project ZIP download failed:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.error || 'Unknown error'}`);
      }
    }
    
    console.log('\n🎯 Download testing complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDownloads();
