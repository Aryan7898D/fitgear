<?php
// Register / Login / Logout / current user.  POST JSON {action:...}
require 'config.php';
$b = body(); $a = $b['action'] ?? ($_GET['action'] ?? 'me');
if($a==='register'){
  $n=trim($b['name']??''); $e=strtolower(trim($b['email']??'')); $p=$b['password']??'';
  if($n==='') out(['error'=>'Enter your name'],422);
  if(!filter_var($e,FILTER_VALIDATE_EMAIL)) out(['error'=>'Enter a valid email'],422);
  if(strlen($p)<6) out(['error'=>'Password must be at least 6 characters'],422);
  $s=$pdo->prepare('SELECT id FROM users WHERE email=?'); $s->execute([$e]);
  if($s->fetch()) out(['error'=>'Email already registered'],409);
  $pdo->prepare('INSERT INTO users(name,email,password) VALUES(?,?,?)')->execute([$n,$e,password_hash($p,PASSWORD_DEFAULT)]);
  $_SESSION['uid']=$pdo->lastInsertId(); $_SESSION['role']='customer';
  out(['user'=>['name'=>$n,'email'=>$e,'role'=>'customer']]);
}
if($a==='login'){
  $s=$pdo->prepare('SELECT * FROM users WHERE email=?'); $s->execute([strtolower(trim($b['email']??''))]); $u=$s->fetch();
  if(!$u || !password_verify($b['password']??'',$u['password'])) out(['error'=>'Invalid email or password'],401);
  session_regenerate_id(true); $_SESSION['uid']=$u['id']; $_SESSION['role']=$u['role'];
  out(['user'=>['name'=>$u['name'],'email'=>$u['email'],'role'=>$u['role']]]);
}
if($a==='logout'){ session_destroy(); out(['ok'=>true]); }
if(empty($_SESSION['uid'])) out(['user'=>null]);
$s=$pdo->prepare('SELECT name,email,role FROM users WHERE id=?'); $s->execute([$_SESSION['uid']]);
out(['user'=>$s->fetch()]);
