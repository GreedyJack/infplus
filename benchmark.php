<?php 
$time = time();
$counter = 0;
$hash = "";
while(time()-$time<10){
  $hash = hash("sha3-512",$hash);
  $counter++;
}
echo "sha3-512: $counter ttimes in 10 seconds\n";
$time = time();
$counter = 0;
$hash = "";
while(time()-$time<10){
  $hash = hash("sha-512",$hash);
  $counter++;
}
echo "sha-512: $counter ttimes in 10 seconds";
?>