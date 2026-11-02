<?php
// Admin dashboard: stats, products, orders, customers.  Admin session required.
require 'config.php';
need_admin();
if($_SERVER['REQUEST_METHOD']==='POST'){
  $b=body(); $a=$b['action']??'';
  if($a==='add_product'){
    $n=trim($b['name']??''); $pr=(float)($b['price']??0);
    if($n===''||$pr<=0) out(['error'=>'Enter name and price'],422);
    $pdo->prepare('INSERT INTO products(category_id,name,price,stock) VALUES(?,?,?,?)')->execute([(int)$b['category_id'],$n,$pr,(int)($b['stock']??0)]);
  }elseif($a==='stock'){ $pdo->prepare('UPDATE products SET stock=stock+? WHERE id=?')->execute([(int)$b['delta'],(int)$b['id']]);
  }elseif($a==='delete_product'){ $pdo->prepare('UPDATE products SET active=0 WHERE id=?')->execute([(int)$b['id']]);
  }elseif($a==='order_status'){
    if(!in_array($b['status'],['Placed','Packed','Shipped','Delivered'])) out(['error'=>'Bad status'],422);
    $pdo->prepare('UPDATE orders SET status=? WHERE id=?')->execute([$b['status'],(int)$b['id']]);
  }
}
$stats=$pdo->query("SELECT (SELECT COUNT(*) FROM products WHERE active=1) products,(SELECT COUNT(*) FROM orders) orders,(SELECT COALESCE(SUM(total),0) FROM orders) sales,(SELECT COUNT(*) FROM products WHERE active=1 AND stock<5) low,(SELECT COUNT(*) FROM users WHERE role='customer') customers")->fetch();
out(['stats'=>$stats,
 'products'=>$pdo->query('SELECT p.id,p.name,p.price,p.stock,p.image,c.name cat FROM products p JOIN categories c ON c.id=p.category_id WHERE p.active=1 ORDER BY p.id')->fetchAll(),
 'categories'=>$pdo->query('SELECT id,name FROM categories')->fetchAll(),
 'orders'=>$pdo->query('SELECT o.id,u.email,o.total,o.status,o.created_at FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.id DESC')->fetchAll()]);
