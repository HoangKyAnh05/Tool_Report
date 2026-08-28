async function testDDGImages(query) {
  try {
    const res1 = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(query));
    const body1 = await res1.text();
    const match = body1.match(/vqd=([\'\"]?)([0-9-]+)\1/);
    if (!match) {
      // Try alternate match
      const match2 = body1.match(/vqd=([0-9-]+)/);
      console.log('Alternate match:', match2 ? match2[1] : 'none');
      return;
    }
    const vqd = match[2];
    console.log('Found vqd:', vqd);
    const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,;&p=1`;
    const res2 = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/'
      }
    });
    const data = await res2.json();
    console.log('Results length:', data.results?.length);
    if (data.results?.length > 0) {
      console.log('Sample image 1:', data.results[0].image);
      console.log('Sample title 1:', data.results[0].title);
    }
  } catch (e) {
    console.error(e);
  }
}
testDDGImages('pubg');
