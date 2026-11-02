<?php
// Database settings + shared helpers (used by every backend file)
session_start();
header('Content-Type: application/json');
function env_value($name,$default){ $value=getenv($name); return $value===false?$default:$value; }
$DB = [
  'host'=>env_value('FITGEAR_DB_HOST','localhost'),
  'name'=>env_value('FITGEAR_DB_NAME','fitgear'),
  'user'=>env_value('FITGEAR_DB_USER','root'),
  'pass'=>env_value('FITGEAR_DB_PASSWORD','')
];
function out($d,$c=200){ http_response_code($c); echo json_encode($d); exit; }
function body(){ return json_decode(file_get_contents('php://input'),true) ?: []; }
function need_login(){ if(empty($_SESSION['uid'])) out(['error'=>'Please login first'],401); return $_SESSION['uid']; }
function need_admin(){ need_login(); if(($_SESSION['role']??'')!=='admin') out(['error'=>'Admin access only'],403); }
try{
  $pdo = new PDO("mysql:host={$DB['host']};dbname={$DB['name']};charset=utf8mb4",$DB['user'],$DB['pass'],
    [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
}catch(Exception $e){ out(['error'=>'Database connection failed. Start MySQL and import database/fitgear.sql'],500); }
