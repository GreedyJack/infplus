<?php 
$file = file_get_contents("pages/list.json");
$list = json_decode($file);
$output ="";
foreach ($list as $page)
{
	if($page->published==="true"&&$page->parent==="root") { $output.="<a href='/index.php?p=$page->node' class='navbar-element'>$page->title</a>"; }
}
echo $output;
?>