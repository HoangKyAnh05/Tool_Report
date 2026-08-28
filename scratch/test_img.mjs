async function testWikimedia(query) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=12&prop=pageimages&piprop=original|thumbnail&pithumbsize=600&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.query?.pages) {
      const pages = Object.values(data.query.pages);
      console.log('Wikimedia for', query, 'count:', pages.length);
      console.log('Items:', pages.map(p => ({ title: p.title, url: p.thumbnail?.source || p.original?.source })));
    } else {
      console.log('No pages found for', query);
    }
  } catch (e) {
    console.error(e);
  }
}

testWikimedia('pubg');
testWikimedia('battlegrounds');
