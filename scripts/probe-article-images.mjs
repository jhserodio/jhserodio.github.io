const endpoints = [
  'https://medium.com/feed/@jhserodio',
  'https://medium.com/@jhserodio/mathematical-discretization-in-computing-from-continuous-to-the-limit-of-the-machine-ac13946514b3',
];
for (const url of endpoints) {
  try {
    const response = await fetch(url, {headers: {'User-Agent': 'Mozilla/5.0 (compatible; PortfolioImages/1.0)',Accept: 'text/html,application/rss+xml,application/xml'}});
    const s=await response.text();
    const img=(s.match(/https?:\\?\/\\?\/miro\.medium\.com\/[a-zA-Z0-9_:%/.+?=-]+/g)||[]).length;
    console.log('Endpoint',url,'status',response.status,'bytes',s.length,'RSS item count',(s.match(/<item>/g)||[]).length,'medium urls',img, 'HTML IMG TAGS',(s.match(/<img\b/gi)||[]).length);
    if (!response.ok) process.exitCode=1;
  } catch(e){console.error(url,e.message);process.exitCode=1;}
}
