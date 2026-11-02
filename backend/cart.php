<?php
// Shopping cart (stored in DB per user).  GET = list, POST {action:add|set|remove, product_id, qty}
require 'config.php';
$uid=need_login();
if($_SERVER['REQUEST_METHOD']==='POST'){
  $b=body(); $pid=(int)($b['product_id']??0); $a=$b['action']??'';
  $s=$pdo->prepare('SELECT stock FROM products WHERE id=? AND active=1'); $s->execute([$pid]); $p=$s->fetch();
  if(!$p) out(['error'=>'Product not found'],404);
  $cur=$pdo->prepare('SELECT qty FROM cart WHERE user_id=? AND product_id=?'); $cur->execute([$uid,$pid]); $q=(int)$cur->fetchColumn();
  if($a==='add') $q++; elseif($a==='set') $q=(int)($b['qty']??0); else $q=0;
  if($q>$p['stock']) out(['error'=>'Only '.$p['stock'].' in stock'],409);
  if($q<=0) $pdo->prepare('DELETE FROM cart WHERE user_id=? AND product_id=?')->execute([$uid,$pid]);
  else $pdo->prepare('INSERT INTO cart(user_id,product_id,qty) VALUES(?,?,?) ON DUPLICATE KEY UPDATE qty=VALUES(qty)')->execute([$uid,$pid,$q]);
}
$s=$pdo->prepare('SELECT c.product_id,c.qty,p.name,p.price,p.image FROM cart c JOIN products p ON p.id=c.product_id WHERE c.user_id=?');
$s->execute([$uid]); $items=$s->fetchAll(); $t=0;
foreach($items as $i) $t+=$i['price']*$i['qty'];
out(['items'=>$items,'total'=>$t]);
