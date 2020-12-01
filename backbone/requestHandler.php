<?php
$input = file_get_contents("php://input");
$rq = json_decode($input);
$file = "..".$rq->targetFile;
switch($rq->action){
  case "insert":
  insert_node($file, $rq);
  break;
  case "remove":
  remove_nodes($file, $rq->list, $rq->container);
  break;
  case "get filter":
  break;
  case "get all":
  echo file_get_contents($file);
  break;
}

function remove_nodes($json_file, $list, $container){
  $target = json_decode(file_get_contents($json_file));
  foreach($list as $id){
    for($i=0;$i<count($target);$i++){
      if($target[$i]->regDate===$id){
        array_splice($target, $i, 1);
        break;
      }
    }
  }
  $l = fopen($json_file,"w");
  fwrite($l, json_encode($target,JSON_UNESCAPED_UNICODE));
  $response = ["container"=>$container, "dqt"=>count($list)];
  echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

function insert_node($json_file, $entry){
  $response = $entry->response;
  unset($entry->response);
  unset($entry->action);
  unset($entry->targetFile);
  $entry->regDate = date(DateTime::ATOM);
  $list;
  if(file_exists($json_file)){ 
    $list = json_decode(file_get_contents($json_file));
    array_push($list, $entry);
  } else { $list = array($entry); }
  $l = fopen($json_file,"w");
  fwrite($l, json_encode($list,JSON_UNESCAPED_UNICODE));
  fclose($l);
  send_response($response);
}

function send_response($response){
  $message = "";
  switch($response){
    case "thank":
    $message = "Спасибо за Вашу заявку.<br/>Мы обязательно перезвоним Вам в ближайшем времени";
    break;
    case "review":
    $message = "Спасибо за Ваш отзыв.<br/>Он будет опубликован после проверки модератором";
    break;
  }
  echo json_encode($message,JSON_UNESCAPED_UNICODE);
}
?>
