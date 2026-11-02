<?php
// Place order (with simulated payment) and list the customer's orders.
require 'config.php';
$uid=need_login();
if($_SERVER['REQUEST_METHOD']==='POST'){
  $b=body(); $addr=trim($b['address']??''); $m=$b['method']??'UPI';
  if(strlen($addr)<6) out(['error'=>'Enter a full delivery address'],422);
  try{
    $pdo->beginTransaction();
    $s=$pdo->prepare('SELECT c.product_id,c.qty,p.price,p.stock,p.name FROM cart c JOIN products p ON p.id=c.product_id WHERE c.user_id=? FOR UPDATE');
    $s->execute([$uid]); $items=$s->fetchAll();
    if(!$items) throw new Exception('Cart is empty');
    $t=0; foreach($items as $i){ if($i['qty']>$i['stock']) throw new Exception($i['name'].' is out of stock'); $t+=$i['price']*$i['qty']; }
    $pdo->prepare('INSERT INTO orders(user_id,total,address) VALUES(?,?,?)')->execute([$uid,$t,$addr]); $oid=$pdo->lastInsertId();
    foreach($items as $i){
      $pdo->prepare('INSERT INTO order_items(order_id,product_id,qty,price) VALUES(?,?,?,?)')->execute([$oid,$i['product_id'],$i['qty'],$i['price']]);
      $pdo->prepare('UPDATE products SET stock=stock-? WHERE id=?')->execute([$i['qty'],$i['product_id']]);
    }
    // Payment: sandbox simulation. Replace this block with Razorpay/Instamojo API verification for live use.
    $pdo->prepare('INSERT INTO payments(order_id,method,txn_id,amount) VALUES(?,?,?,?)')->execute([$oid,$m,'TXN'.strtoupper(bin2hex(random_bytes(5))),$t]);
    $pdo->prepare('DELETE FROM cart WHERE user_id=?')->execute([$uid]);
    $pdo->commit(); out(['order_id'=>$oid]);
  }catch(Exception $e){ if($pdo->inTransaction()) $pdo->rollBack(); out(['error'=>$e->getMessage()],409); }
}
$s=$pdo->prepare('SELECT o.id,o.total,o.status,o.address,o.created_at,p.method,p.txn_id FROM orders o LEFT JOIN payments p ON p.order_id=o.id WHERE o.user_id=? ORDER BY o.id DESC');
$s->execute([$uid]); $o=$s->fetchAll();
foreach($o as &$r){ $i=$pdo->prepare('SELECT p.name,i.qty FROM order_items i JOIN products p ON p.id=i.product_id WHERE i.order_id=?'); $i->execute([$r['id']]); $r['items']=$i->fetchAll(); }
out(['orders'=>$o]);
