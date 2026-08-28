const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 35000);

console.log('Sending request to https://tool-report-2.onrender.com ...');
fetch('https://tool-report-2.onrender.com', { signal: controller.signal })
  .then(async res => {
    clearTimeout(timeout);
    console.log('Status:', res.status, res.statusText);
    console.log('Routing header:', res.headers.get('x-render-routing'));
    const text = await res.text();
    console.log('Body length:', text.length);
    console.log('Body snippet:', text.substring(0, 300));
  })
  .catch(err => {
    clearTimeout(timeout);
    console.error('Fetch error:', err.message);
  });
