<?php 
session_start();
$req = json_decode(file_get_contents("php://input"));
if($req->object==="question") { getQuestions($req); }
elseif($req->object==="answer") { checkAnswer($req); }

function getQuestions($qwerty){
	$config = json_decode(file_get_contents($qwerty->directory."/config.json"));
	$config->easy=intval($config->easy);
	$config->medium=intval($config->medium);
	$config->hard=intval($config->hard);
	$easy = glob($qwerty->directory."/easy_*.json");
	$medium = glob($qwerty->directory."/medium_*.json");
	$hard = glob($qwerty->directory."/hard_*.json");
	$response = new stdClass();
	$response->questions = getUniqueValues($easy, $config->easy);
	if($config->medium>0) {
		$arr = getUniqueValues($medium, $config->medium);
		foreach($arr as $q){ array_push($response->questions, $q); }
	}
	if($config->hard>0) {
		$arr = getUniqueValues($hard, $config->hard);
		foreach($arr as $q){ array_push($response->questions, $q); }
	}
	for($i=0;$i<count($response->questions);$i++){
		for($j=0;$j<count($response->questions[$i]->answers);$j++){		
			unset($response->questions[$i]->answers[$j]->result);
		}
	}
	shuffle($response->questions);
	$response->status = "200";
	$response->directory = $qwerty->directory;
	$response->elapsedTime = intval($config->testDuration);
	$_SESSION['testDir'] = $qwerty->directory;
	$_SESSION['testLength'] = count($response->questions);
	$_SESSION['score'] = 0;
	$_SESSION['easy'] = $config->easy;
	$_SESSION['medium'] = $config->medium;
	$_SESSION['hard'] = $config->hard;
	$_SESSION['easy_correct'] = 0;
	$_SESSION['medium_correct'] = 0;
	$_SESSION['hard_correct'] = 0;
	$_SESSION['easy_incorrect'] = 0;
	$_SESSION['medium_incorrect'] = 0;
	$_SESSION['hard_incorrect'] = 0;
	$_SESSION['easy_partiallyCorrect'] = 0;
	$_SESSION['medium_partiallyCorrect'] = 0;
	$_SESSION['hard_partiallyCorrect'] = 0;
	$_SESSION['maxScore'] = $config->easy*1 + $config->medium*2 + $config->hard*3;
	$_SESSION['questionIndex'] = 0;
	$_SESSION['testStartTime']=time();
	$_SESSION['testFinishTime']=$_SESSION['testStartTime']+$response->elapsedTime*60;
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

function getUniqueValues($arr, $qt){
	if($qt>count($arr)){ $qt=count($arr); }
	$index = mt_rand(0, count($arr)-1);
	$used = [$index];
	$res = [json_decode(file_get_contents($arr[$index]))];
	for($i=1;$i<$qt;$i++){
		while(in_array($index,$used)) { $index = mt_rand(0, count($arr)-1); }
		$used[] = $index;
		$res[] = json_decode(file_get_contents($arr[$index]));
	}
	return $res;
}

function checkAnswer($ans){
	$response = new stdClass();
	if($_SESSION['testFinishTime']<time()) { $response->status = "408"; echo $response; return; }
	if($_SESSION['questionIndex']>$_SESSION['testLength']){ $response->status = "418"; echo $response; return; }
	$response->status = "200";
	$question = json_decode(file_get_contents($ans->directory."/".$ans->qid.".json"));
	$score = 0;
	$result = "partiallyCorrect";
	$qtype = "";
	$difficulty = doubleval($question->difficulty);
	switch($difficulty){
		case 1:	$qtype = "easy"; break;
		case 2:	$qtype = "medium"; break;
		case 3:	$qtype = "hard"; break;
	}
	foreach($ans->aid as $aid){
		$score+=doubleval($question->answers[$aid]->result) * $difficulty; }
	$summary = $result;
	if($score>=$difficulty){ $result = $summary = "correct"; $score = $difficulty; }
	elseif($score<=0){ $result = $summary ="incorrect"; $score = 0; }
	$_SESSION[$qtype."_".$summary]++;
	$_SESSION['score'] += $score;
	$response->score = $score;
	$response->result = $result;
	$response->correctAnswers = array();
	foreach($question->answers as $a){ if(doubleval($a->result)>0){ array_push($response->correctAnswers,$a->id); }	}
	$response->qid = $_SESSION["questionIndex"]++;
	if($_SESSION["questionIndex"]==$_SESSION["testLength"]){ $response->lastQuestion = true; $response->total = processResult(); } else { $response->lastQuestion = false; }
	echo json_encode($response,JSON_UNESCAPED_UNICODE);
}

function processResult(){
	$total = new stdClass();
	$total->maxScore = $_SESSION['maxScore'];
	$total->score = $_SESSION['score'];
	$total->correct = $_SESSION['easy_correct'] + $_SESSION['medium_correct'] + $_SESSION['hard_correct'];
	$total->incorrect = $_SESSION['easy_incorrect'] + $_SESSION['medium_incorrect'] + $_SESSION['hard_incorrect'];
	$total->partiallyCorrect = $_SESSION['easy_partiallyCorrect'] + $_SESSION['medium_partiallyCorrect'] + $_SESSION['hard_partiallyCorrect'];
	$total->credited = $total->score>=$total->maxScore * 0.6;
	$total->time = time() - $_SESSION['testStartTime'];
	$total->testLength = $_SESSION['testLength'];

	$total->easy = new stdClass();
	$total->easy->count = $_SESSION['easy'];
	$total->easy->correct = $_SESSION['easy_correct'];
	$total->easy->incorrect = $_SESSION['easy_incorrect'];
	$total->easy->partiallyCorrect = $_SESSION['easy_partiallyCorrect'];

	$total->medium = new stdClass();
	$total->medium->count = $_SESSION['medium'];
	$total->medium->correct = $_SESSION['medium_correct'];
	$total->medium->incorrect = $_SESSION['medium_incorrect'];
	$total->medium->partiallyCorrect = $_SESSION['medium_partiallyCorrect'];

	$total->hard = new stdClass();
	$total->hard->count = $_SESSION['hard'];
	$total->hard->correct = $_SESSION['hard_correct'];
	$total->hard->incorrect = $_SESSION['hard_incorrect'];
	$total->hard->partiallyCorrect = $_SESSION['hard_partiallyCorrect'];

	return $total;
}
?>