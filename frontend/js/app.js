// FitGear frontend – talks to the PHP backend in ../backend/ using fetch()
const API='../backend/', IMG='images/', STEPS=['Placed','Packed','Shipped','Delivered'];
const st={user:null,cat:'All',q:'',sort:'',cart:{items:[],total:0}};
const $=s=>document.querySelector(s), inr=n=>'₹'+Number(n).toLocaleString('en-IN');
let demoMode=location.protocol==='file:'||location.hostname.endsWith('.github.io')||location.hostname.endsWith('.vercel.app');
async function api(f,body){
  if(demoMode)return useDemo(f,body);
  try{
    const r=await fetch(API+f,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
    const d=await r.json();
    if(d.error?.startsWith('Database connection failed'))return useDemo(f,body);
    if(!r.ok) d.error=d.error||'Error'; return d;
  }catch(e){return useDemo(f,body)}
}
function useDemo(f,body){
  demoMode=true;
  $('#modeNotice').hidden=false;
  return window.demoApi(f,body);
}
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',2500)}
function modal(h){$('#mb').innerHTML=h;$('#m').classList.add('show')} function closeM(){$('#m').classList.remove('show')}
$('#m').onclick=e=>{if(e.target.id=='m')closeM()};
const cartCount=()=>st.cart.items.reduce((a,i)=>a+ +i.qty,0);
async function refresh(){
  const a=await api('auth.php'); st.user=a.user||null;
  if(st.user){const c=await api('cart.php'); if(c.items) st.cart=c} else st.cart={items:[],total:0};
  $('#cc').textContent=cartCount(); $('#auth').textContent=st.user?`Logout (${st.user.name})`:'Login';
  $('#adminLink').style.display=st.user&&st.user.role=='admin'?'':'none';
}
function card(p){return `<div class="card"><img src="${IMG+p.image}" alt="${p.name}"><div><small>${p.cat}</small><h3>${p.name}</h3><span class="price">${inr(p.price)}</span><button class="btn" ${p.stock<1?'disabled':''} onclick="add(${p.id})">${p.stock<1?'Out of stock':'Add to Cart'}</button></div></div>`}
async function add(id){
  if(!st.user){toast('Please login to add items');return authForm(0)}
  const r=await api('cart.php',{action:'add',product_id:id}); if(r.error)return toast(r.error);
  st.cart=r; $('#cc').textContent=cartCount(); toast('Added to cart');
}
function authForm(reg){modal(`<h2>${reg?'Register':'Login'}</h2>${reg?'<label>Name</label><input id="an">':''}<label>Email</label><input id="ae" type="email"><label>Password (min 6)</label><input id="ap" type="password"><p><button class="btn" onclick="doAuth(${reg})">${reg?'Create account':'Login'}</button> <button class="btn alt" onclick="authForm(${reg?0:1})">${reg?'Have an account?':'New user? Register'}</button></p><small>Admin: admin@fitgear.com / admin123</small>`)}
async function doAuth(reg){
  const r=await api('auth.php',{action:reg?'register':'login',name:reg?$('#an').value:'',email:$('#ae').value,password:$('#ap').value});
  if(r.error)return toast(r.error); closeM(); toast('Welcome, '+r.user.name); await refresh(); view();
}
$('#auth').onclick=async()=>{if(st.user){await api('auth.php',{action:'logout'});await refresh();toast('Logged out');location.hash='#home';view()}else authForm(0)};

async function home(){
  const d=await api('products.php'); if(d.error)return err(d); const p=d.products;
  return `<section class="hero" style="margin:-28px -4vw 28px"><div><h1>FUEL YOUR <span>STRENGTH.</span></h1><p>Whey protein, creatine, mass gainers and shakers – everything for your gym routine in one dedicated store.</p><a class="btn" href="#shop">Shop Now</a></div><div class="imgs">${p.slice(0,4).map(x=>`<img src="${IMG+x.image}" alt="${x.name}">`).join('')}</div></section>
  <h2>Featured Products</h2><div class="grid">${p.slice(0,8).map(card).join('')}</div>
  <div class="feat"><div><b>🔍 Search & Categories</b>Find the right product quickly.</div><div><b>🛒 Smart Cart</b>Saved in your account.</div><div><b>💳 Secure Checkout</b>Payment gateway (sandbox).</div><div><b>📦 Order Tracking</b>Follow your order status.</div></div>`;
}
const err=d=>`<h2>Error</h2><p>${d.error}</p>`;
async function shop(){
  const d=await api(`products.php?q=${encodeURIComponent(st.q)}&cat=${encodeURIComponent(st.cat)}`); if(d.error)return err(d);
  let l=d.products; if(st.sort)l=[...l].sort((a,b)=>st.sort=='lo'?a.price-b.price:b.price-a.price);
  return `<h2>Shop</h2><div class="bar"><input id="sq" placeholder="Search products…" value="${st.q}" oninput="st.q=this.value;clearTimeout(window.sT);window.sT=setTimeout(async()=>{const p=$('#sq').selectionStart;await view();$('#sq').focus();$('#sq').setSelectionRange(p,p)},300)"><select onchange="st.sort=this.value;view()"><option value="">Sort: Default</option><option value="lo" ${st.sort=='lo'?'selected':''}>Price: Low to High</option><option value="hi" ${st.sort=='hi'?'selected':''}>Price: High to Low</option></select></div>
  <div class="chips">${['All',...d.categories].map(c=>`<button class="chip ${c==st.cat?'on':''}" onclick="st.cat='${c}';view()">${c}</button>`).join('')}</div>
  <div class="grid">${l.map(card).join('')||'<p>No products found.</p>'}</div>`;
}
async function cartView(){
  if(!st.user)return `<h2>Your Cart</h2><p>Please <a href="#" onclick="authForm(0);return false">login</a> to use the cart.</p>`;
  const c=await api('cart.php'); st.cart=c; $('#cc').textContent=cartCount();
  if(!c.items.length)return `<h2>Your Cart</h2><p>Your cart is empty. <a href="#shop">Browse products</a></p>`;
  return `<h2>Your Cart</h2><div class="two"><div class="tw"><table><tr><th></th><th>Product</th><th>Price</th><th>Qty</th><th></th></tr>${c.items.map(i=>`<tr class="row"><td><img src="${IMG+i.image}"></td><td>${i.name}</td><td>${inr(i.price)}</td><td><span class="qty"><button onclick="setQ(${i.product_id},${i.qty-1})">−</button>${i.qty}<button onclick="setQ(${i.product_id},${+i.qty+1})">+</button></span></td><td><button class="btn sm alt" onclick="rem(${i.product_id})">Remove</button></td></tr>`).join('')}</table></div>
  <div class="box"><h3>Checkout</h3><p>Total: <b>${inr(c.total)}</b></p><label>Delivery address</label><input id="ad" placeholder="House, city, PIN"><label>Payment</label><select id="pm"><option>UPI (Razorpay sandbox)</option><option>Credit / Debit Card</option><option>Net Banking</option></select><p><button class="btn" onclick="checkout()">Pay & Place Order</button></p></div></div>`;
}
async function setQ(id,q){const r=await api('cart.php',{action:'set',product_id:id,qty:q}); if(r.error)toast(r.error); await view()}
async function rem(id){await api('cart.php',{action:'remove',product_id:id}); await view()}
async function checkout(){
  const r=await api('orders.php',{address:$('#ad').value,method:$('#pm').value}); if(r.error)return toast(r.error);
  toast('Payment successful! Order #'+r.order_id+' placed'); await refresh(); location.hash='#orders'; if(!location.hash)view();
}
async function orders(){
  if(!st.user)return `<h2>My Orders</h2><p>Please <a href="#" onclick="authForm(0);return false">login</a> to see your orders.</p>`;
  const d=await api('orders.php'); if(d.error)return err(d);
  return `<h2>My Orders</h2>${d.orders.map(o=>{const s=STEPS.indexOf(o.status);return `<div class="box" style="max-width:none;margin-bottom:12px"><b>Order #${o.id}</b> · ${o.created_at} · ${inr(o.total)} · ${o.method||''} (${o.txn_id||''})<br>${o.items.map(i=>i.name+' ×'+i.qty).join(', ')}<br><small>${o.address}</small><br><b style="color:var(--red)">${o.status}</b><div class="track">${STEPS.map((_,k)=>`<i class="${k<=s?'d':''}"></i>`).join('')}</div></div>`}).join('')||'<p>No orders yet.</p>'}`;
}
async function admin(){
  if(!st.user||st.user.role!='admin')return `<h2>Admin Dashboard</h2><p>Admin access only. <a href="#" onclick="authForm(0);return false">Login as admin</a> (admin@fitgear.com / admin123).</p>`;
  const d=await api('admin.php'); if(d.error)return err(d); window.AC=d.categories; const s=d.stats;
  return `<h2>Admin Dashboard</h2><div class="stats"><div><b>${s.products}</b>Products</div><div><b>${s.orders}</b>Orders</div><div><b>${inr(s.sales)}</b>Sales</div><div><b>${s.low}</b>Low stock</div><div><b>${s.customers}</b>Customers</div></div>
  <h3>Products & Stock</h3><p><button class="btn sm" onclick="addP()">+ Add Product</button></p><div class="tw"><table><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>${d.products.map(p=>`<tr class="row"><td><img src="${IMG+p.image}"></td><td>${p.name}</td><td>${p.cat}</td><td>${inr(p.price)}</td><td>${p.stock}</td><td><button class="btn sm alt" onclick="adm({action:'stock',id:${p.id},delta:5})">+5 stock</button> <button class="btn sm" onclick="if(confirm('Delete product?'))adm({action:'delete_product',id:${p.id}})">Delete</button></td></tr>`).join('')}</table></div>
  <h3>Orders</h3><div class="tw"><table><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th></tr>${d.orders.map(o=>`<tr><td>#${o.id}</td><td>${o.email}</td><td>${inr(o.total)}</td><td><select onchange="adm({action:'order_status',id:${o.id},status:this.value})">${STEPS.map(x=>`<option ${x==o.status?'selected':''}>${x}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan=4>No orders yet</td></tr>'}</table></div>`;
}
async function adm(b){const r=await api('admin.php',b); if(r.error)return toast(r.error); closeM(); toast('Saved'); view()}
function addP(){modal(`<h2>Add Product</h2><label>Name</label><input id="pn"><label>Category</label><select id="pc">${AC.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select><label>Price (₹)</label><input id="pp" type="number"><label>Stock</label><input id="ps" type="number" value="10"><p><button class="btn" onclick="adm({action:'add_product',name:$('#pn').value,category_id:$('#pc').value,price:$('#pp').value,stock:$('#ps').value})">Save</button></p>`)}
const V={home,shop,cart:cartView,orders,admin};
async function view(){
  const h=(location.hash||'#home').slice(1), k=V[h]?h:'home';
  document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v==k));
  $('#app').innerHTML=await V[k]();
}
addEventListener('hashchange',()=>{view();scrollTo(0,0)});
refresh().then(view);
