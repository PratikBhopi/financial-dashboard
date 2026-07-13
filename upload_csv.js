const fs = require('fs');

async function upload() {
  const fileBuffer = fs.readFileSync('test_10k.csv');
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer], { type: 'text/csv' }), 'test_10k.csv');
  
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOTdjNzUzMi1lMDFiLTRjNGYtOTYwMC05YzEwNmFkNWQxY2UiLCJyb2xlIjoiQURNSU4iLCJtdXN0Q2hhbmdlUGFzc3dvcmQiOmZhbHNlLCJqd3RfaWQiOiIxYzg0MjMyZC1mZWU5LTQ3OTAtYjFlNi1kZGM0OTFiODY3MGMiLCJpYXQiOjE3Nzg5NTU0MDQsImV4cCI6MTc3OTA0MTgwNH0.C05ofZUhHEpOZpndmlNbMPf-NmYdg2jvFuigAssWsn0';

  console.log('Sending upload request...');
  const start = Date.now();
  const res = await fetch('http://localhost:8000/api/v1/bulk-records/async', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const json = await res.json();
  const end = Date.now();
  console.log(`Upload time: ${end - start}ms`);
  console.log('Response:', json);
  
  if (json.data && json.data.jobId) {
    const jobId = json.data.jobId;
    console.log(`Polling job ${jobId}...`);
    while (true) {
      const pollRes = await fetch(`http://localhost:8000/api/v1/bulk-records/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pollJson = await pollRes.json();
      if (pollJson.data && (pollJson.data.status === 'COMPLETED' || pollJson.data.status === 'FAILED')) {
        console.log('Final Status:', pollJson.data.status);
        console.log('Rows processed:', pollJson.data.totalRows);
        console.log('Saved count:', pollJson.data.savedCount);
        console.log('Started at:', pollJson.data.startedAt);
        console.log('Completed at:', pollJson.data.completedAt);
        const processingTime = new Date(pollJson.data.completedAt) - new Date(pollJson.data.startedAt);
        console.log(`Time to COMPLETED: ${processingTime}ms`);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

upload().catch(console.error);
