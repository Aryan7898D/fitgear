(() => {
  const KEY = 'fitgear-demo-v1';
  const categories = [
    { id: 1, name: 'Whey Protein' }, { id: 2, name: 'Combos' },
    { id: 3, name: 'Mass Gainer' }, { id: 4, name: 'Creatine' },
    { id: 5, name: 'Shakers' }
  ];
  const seedProducts = [
    ['Gold Standard 100% Whey',3499,24,'a1.jpg',1],['Gold Standard Whey + Creatine Combo',3899,16,'a2.jpg',2],
    ['Legion Whey+ Dutch Chocolate',3299,11,'a3.jpg',1],['Isopure Whey Isolate',4999,11,'a4.jpg',1],
    ['Performance Whey',2799,21,'a5.jpg',1],['Birdman Protein + Creatine',3199,13,'a6.jpg',2],
    ['Myotrax Whey Isolate + Creatine',3599,22,'a7.jpg',2],['Vega Protein + Creatine',3399,26,'a8.jpg',2],
    ['Nutrimuscle Mass Gainer 3kg',2599,25,'a9.jpg',3],['Labrada CreaLean Powder',1799,24,'a10.jpg',4],
    ['Urban Creatine Gummies',1499,13,'a11.jpg',4],['Myprotein Impact Creatine',1999,20,'b1.jpg',4],
    ['NAKPRO Impact Whey + Creatine',2999,17,'b2.jpg',2],['GNC Pro Performance Stack',4299,25,'b3.jpg',2],
    ['Kaged Post-Workout Protein',3799,18,'b4.jpg',1],['Lifelong Gym Shaker 700ml',399,18,'b5.jpg',5],
    ['Boldfit Spider Shaker',449,17,'b6.jpg',5],['Cult Shaker for Gym',499,16,'b7.jpg',5],
    ['Boldfit Blue-Lid Shaker',349,19,'b8.jpg',5],['Carbamide Forte Storm Shaker',549,15,'b9.jpg',5]
  ];
  const load = () => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error('Unable to load FitGear demo data', error);
    }
    return {
      users: [{ name: 'Admin', email: 'admin@fitgear.com', password: 'admin123', role: 'admin' }],
      products: seedProducts.map((p, i) => ({
        id: i + 1, name: p[0], price: p[1], stock: p[2], image: p[3],
        category_id: p[4], active: true
      })),
      carts: {}, orders: [], currentEmail: null, nextOrderId: 1, nextProductId: 21
    };
  };
  let data = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(data));
  const user = () => data.users.find(u => u.email === data.currentEmail) || null;
  const cartForUser = () => {
    const u = user();
    if (!u) return [];
    data.carts[u.email] ||= [];
    return data.carts[u.email];
  };
  const cartResult = () => {
    const items = cartForUser().map(entry => {
      const p = data.products.find(x => x.id === entry.product_id && x.active);
      return p ? { product_id: p.id, qty: entry.qty, name: p.name, price: p.price, image: p.image } : null;
    }).filter(Boolean);
    return { items, total: items.reduce((sum, item) => sum + item.price * item.qty, 0) };
  };
  const categoryName = id => categories.find(c => c.id === id)?.name || 'Other';

  window.demoApi = async (file, body) => {
    const [endpoint, query = ''] = file.split('?');
    const params = new URLSearchParams(query);
    if (endpoint === 'auth.php') {
      const action = body?.action || params.get('action') || 'me';
      if (action === 'logout') {
        data.currentEmail = null;
        save();
        return { ok: true };
      }
      if (action === 'register') {
        const name = (body.name || '').trim(), email = (body.email || '').trim().toLowerCase();
        if (!name) return { error: 'Enter your name' };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email' };
        if ((body.password || '').length < 6) return { error: 'Password must be at least 6 characters' };
        if (data.users.some(u => u.email === email)) return { error: 'Email already registered' };
        data.users.push({ name, email, password: body.password, role: 'customer' });
        data.currentEmail = email;
        save();
      } else if (action === 'login') {
        const email = (body.email || '').trim().toLowerCase();
        const found = data.users.find(u => u.email === email && u.password === body.password);
        if (!found) return { error: 'Invalid email or password' };
        data.currentEmail = email;
        save();
      }
      const current = user();
      return { user: current ? { name: current.name, email: current.email, role: current.role } : null };
    }
    if (endpoint === 'products.php') {
      const q = (params.get('q') || '').toLowerCase(), cat = params.get('cat') || 'All';
      const products = data.products.filter(p => p.active && p.name.toLowerCase().includes(q) && (cat === 'All' || categoryName(p.category_id) === cat))
        .map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, image: p.image, cat: categoryName(p.category_id) }));
      return { products, categories: categories.map(c => c.name) };
    }
    if (endpoint === 'cart.php') {
      if (!user()) return { error: 'Please login first' };
      if (body) {
        const id = Number(body.product_id), product = data.products.find(p => p.id === id && p.active);
        if (!product) return { error: 'Product not found' };
        const cart = cartForUser(), entry = cart.find(item => item.product_id === id);
        const qty = body.action === 'add' ? (entry?.qty || 0) + 1 : body.action === 'set' ? Number(body.qty) : 0;
        if (qty > product.stock) return { error: `Only ${product.stock} in stock` };
        if (qty <= 0) data.carts[user().email] = cart.filter(item => item.product_id !== id);
        else if (entry) entry.qty = qty;
        else cart.push({ product_id: id, qty });
        save();
      }
      return cartResult();
    }
    if (endpoint === 'orders.php') {
      if (!user()) return { error: 'Please login first' };
      if (!body) return { orders: data.orders.filter(o => o.email === user().email) };
      const address = (body.address || '').trim();
      if (address.length < 6) return { error: 'Enter a full delivery address' };
      const cart = cartResult();
      if (!cart.items.length) return { error: 'Cart is empty' };
      for (const item of cart.items) {
        const p = data.products.find(product => product.id === item.product_id);
        if (item.qty > p.stock) return { error: `${p.name} is out of stock` };
      }
      cart.items.forEach(item => {
        data.products.find(p => p.id === item.product_id).stock -= item.qty;
      });
      const id = data.nextOrderId++;
      data.orders.unshift({
        id, email: user().email, total: cart.total, status: 'Placed', address,
        method: body.method || 'UPI', txn_id: `DEMO${id}`, created_at: new Date().toLocaleString(),
        items: cart.items.map(item => ({ name: item.name, qty: item.qty }))
      });
      data.carts[user().email] = [];
      save();
      return { order_id: id };
    }
    if (endpoint === 'admin.php') {
      if (!user() || user().role !== 'admin') return { error: 'Admin access only' };
      if (body?.action === 'add_product') {
        if (!body.name?.trim() || Number(body.price) <= 0) return { error: 'Enter name and price' };
        data.products.push({
          id: data.nextProductId++, name: body.name.trim(), price: Number(body.price),
          stock: Number(body.stock) || 0, image: 'default.jpg', category_id: Number(body.category_id), active: true
        });
      } else if (body?.action === 'stock') {
        const product = data.products.find(p => p.id === Number(body.id));
        if (product) product.stock = Math.max(0, product.stock + Number(body.delta));
      } else if (body?.action === 'delete_product') {
        const product = data.products.find(p => p.id === Number(body.id));
        if (product) product.active = false;
      } else if (body?.action === 'order_status') {
        const order = data.orders.find(o => o.id === Number(body.id));
        if (order && ['Placed', 'Packed', 'Shipped', 'Delivered'].includes(body.status)) order.status = body.status;
      }
      save();
      const products = data.products.filter(p => p.active).map(p => ({
        id: p.id, name: p.name, price: p.price, stock: p.stock, image: p.image, cat: categoryName(p.category_id)
      }));
      return {
        stats: {
          products: products.length, orders: data.orders.length,
          sales: data.orders.reduce((sum, o) => sum + o.total, 0),
          low: products.filter(p => p.stock < 5).length,
          customers: data.users.filter(u => u.role === 'customer').length
        },
        products, categories, orders: data.orders.map(o => ({ id: o.id, email: o.email, total: o.total, status: o.status, created_at: o.created_at }))
      };
    }
    return { error: 'Unknown demo API endpoint' };
  };
})();
