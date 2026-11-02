<?php
// Product catalogue with search + category filter.  GET ?q=&cat=
require 'config.php';
$sql='SELECT p.id,p.name,p.price,p.stock,p.image,c.name AS cat FROM products p JOIN categories c ON c.id=p.category_id WHERE p.active=1';
$args=[];
if(!empty($_GET['q'])){ $sql.=' AND p.name LIKE ?'; $args[]='%'.$_GET['q'].'%'; }
if(!empty($_GET['cat']) && $_GET['cat']!=='All'){ $sql.=' AND c.name=?'; $args[]=$_GET['cat']; }
$s=$pdo->prepare($sql.' ORDER BY p.id'); $s->execute($args);
out(['products'=>$s->fetchAll(),'categories'=>$pdo->query('SELECT name FROM categories')->fetchAll(PDO::FETCH_COLUMN)]);
