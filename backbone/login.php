<?php 
$user = $_POST["login"];
$pass = $_POST["password"];
$list = json_decode(file_get_contents("../dat/users.json"));
$response = [];
if(isset($list->$user)&&$pass===$list->$user->password){
  session_start();
  $_SESSION["ID"] = hash("md5",$user.$pass);
  $_SESSION["ROLE"] = $list->$user->role;
  $response['status'] = "OK";
  $response['priv'] = $list->$user->role;
}
else { $response['status'] = "INCORRECT"; }
echo json_encode($response,JSON_UNESCAPED_UNICODE);
?>