<?php
session_start();
if(!isset($_SESSION["ID"])&&!isset($_COOKIE["USRID"])){
  header("Location: /login.phtml?ref=admin");
}
if($_SESSION['ROLE']==="admin"){ require("template.phtml"); }
else { echo "У вас нет доступа к этой странице. <a href='/'>Вернуться на домашнюю страницу</a>"; }
?>