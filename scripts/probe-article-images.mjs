
const response=await fetch('https://medium.com/feed/@jhserodio',{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/rss+xml'}});
const rss=await response.text();
console.log('RSS status',response.status,'bytes',rss.length);
const items=[...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(x=>x[1]);
for(const [i,item] of items.entries()){
 const title=item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]??'unknown';
 const link=item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.slice(0,140)??'none';
 const urls=[...item.matchAll(/<img[^>]+?src=["']([^"']+)["']/g)].map(x=>x[1]);
 console.log(JSON.stringify({i,title,link,images:urls.length,srcs:urls.map(u=>u.slice(0,160))}));
}
