function setTitle(pname) {
	"use strict";
	document.title = pname + " " +document.title;
}

function toggleMenu(menu, dir) {
	"use strict";
	switch (dir)
	{
			case "on":
			  menu.classList.remove("hide-small-block");
			  menu.classList.add("flip-in-horizontal");
			  setTimeout(function(){
					menu.classList.remove("flip-in-horizontal");
				},500);
			  break;
			case "off":
			  menu.classList.add("flip-out-horizontal");
			  setTimeout(function(){
					menu.classList.remove("flip-out-horizontal");
					menu.classList.add("hide-small-block");
				},490);
			  break;
	}
}

function setHeaderImage() {
	"use strict";
	var list = ["circuit","laptop-internet","robot","motherboard","binary-cube"];
	if (window.matchMedia("(min-width:801px)").matches) { list = list.concat(["internet","microchip","tablet","tablet-internet","tablet-sheets","code"]); }
	var index;
	if(sessionStorage.getItem("headerImgIndex")){ 
		index = sessionStorage.getItem("headerImgIndex");
		index = parseInt(index, 10);
	}
	else { index = Math.floor(Math.random()*list.length); }
	var path = "url('/pictures/headers/"+list[index]+".jpg')";
	document.getElementById("header").style.backgroundImage = path;
	sessionStorage.setItem("headerImgIndex", index);
}

function pullAccordion(target){
	"use strict";
	if(!target.querySelector(".accordion-header").classList.contains("expanded"))	{	target.querySelector(".accordion-content-placeholder").classList.add("expanded");	}
}

function pushAccordion(target){
	"use strict";
	var x = target.querySelector(".accordion-content-placeholder");
	if(x.classList.contains("expanded")) { x.classList.remove("expanded"); }
}

function toggleAccordion(header, group){
	"use strict";
	var dir = "";
	if(header.nextElementSibling.classList.contains("hidden")) { dir = "show"; }
	else { dir = "hide"; }
	if (group==="self")	{ toggleAccord(header,dir); }
	else 
	{
		var accordionList = group.getElementsByClassName("accordion");
		for(var i=0; i<accordionList.length; i++) { if(accordionList[i].querySelector(".accordion-header").classList.contains("expanded")) { toggleAccord(accordionList[i].querySelector(".accordion-header")); } }
		if (dir==="show") { toggleAccord(header, dir); }
	}
	
}

function toggleAccord(header, direction){
	"use strict";
	var target = header.parentNode.querySelector(".accordion-content");
	var footer = header.parentNode.querySelector(".accordion-footer");
	if (direction==="show"){
		header.classList.add("expanded");
		footer.classList.add("expanded");
		target.classList.remove("hidden");
		target.style.maxHeight = target.scrollHeight + "px";
		header.parentNode.querySelector(".accordion-content-placeholder").classList.remove("expanded");
		header.querySelector(".accordion-toggle-glyph").classList.add("flipped-180");
	}
	else{
		target.style.maxHeight = null;
		setTimeout(function(){
			target.classList.add("hidden");
			header.classList.remove("expanded");
			footer.classList.remove("expanded");
			header.querySelector(".accordion-toggle-glyph").classList.remove("flipped-180");
		}, 350);
	}
}

function newsbarTstart(e){
	"use strict";
	var bar = document.getElementById("newsbar");
	var point = {};
	point.X = e.changedTouches[0].clientX;
	point.Y = e.changedTouches[0].clientY;
	bar.setAttribute("data-touch",point.X+" "+point.Y);
}

function newsbarTend(e){
	"use strict";
	var bar = document.getElementById("newsbar");
	var start = bar.getAttribute("data-touch");
	bar.removeAttribute("data-touch");
	start = start.split(" ");
	start[0]=parseInt(start[0], 10);
	start[1]=parseInt(start[1], 10);
	var deltaX = e.changedTouches[0].clientX - start[0];
	var deltaY = e.changedTouches[0].clientY - start[1];
	var distance = Math.sqrt(Math.pow(deltaY,2) + Math.pow(deltaX,2));
	if(Math.abs(deltaX)>Math.abs(deltaY)&&distance>75){
		if(deltaX<0){ switchNews("older"); }
		else { switchNews("newer"); }
	}
}

function switchNews(order)
{
	"use strict";
	var bar = document.getElementById("newsbar");
	var index = parseInt(bar.getAttribute("data-news-index"), 10);
	if(!isNaN(index)){
		var list = bar.querySelectorAll(".newscard");
		var direction = "";
		var indexOld = index;
		switch(order){
			case "older":
			direction = "left";
			if(++index >= list.length ) { index = 0; }
			break;
			case "newer":
			direction = "right";
			if(--index < 0 ) { index = list.length - 1; }
			break;
		}
		list[indexOld].classList.add("slide-out-"+direction);
		setTimeout( function(){
			list[indexOld].classList.remove("slide-out-"+direction);
			list[indexOld].classList.add("hidden");
			list[index].classList.remove("hidden");
			list[index].classList.add("slide-in-"+direction);
			setTimeout( function(){ list[index].classList.remove("slide-in-"+direction); }, 350);
		}, 350)
		bar.setAttribute("data-news-index", index);
	}
	else { alert("Вы сломали новостную ленту :'("); }
}

function fillYears(){
	"use strict";
	var select = document.getElementById("year");
	var d = new Date();
	for(var i=d.getFullYear()-100; i<=d.getFullYear(); i++){
		var opt = document.createElement("option");
		opt.setAttribute("value",i);
		opt.innerText = i;
		if(i===1970){ opt.setAttribute("selected", null); }
		select.appendChild(opt);
	}
}
function fillDays(){
	"use strict";
	var select = document.getElementById("day");
	for(var i=1; i<=31; i++){
		var opt = document.createElement("option");
		var d = "" + i;
		if(d.length===1){ d="0"+d; }
		opt.setAttribute("value",d);
		opt.innerText = d;
		if(i===1){ opt.setAttribute("selected", null); }
		select.appendChild(opt);
	}
}

function toggleApproval(){
	"use strict";
	var text = document.getElementsByTagName("label");
	text = text[text.length-1];
	var box = document.getElementById("approval");
	if(box.checked){ 
		text.innerText = "Я даю свое согласие"; 
		document.getElementById("submit").disabled = false; 
	}
	else { 
		text.innerText = "Я не даю свое согласие"; 
		document.getElementById("submit").disabled = true; 
	}
}

function showSnackbar(text){
	"use strict";
	var snack = document.createElement("div");
	snack.classList.add("snackbar");
	snack.innerHTML = text;
	document.body.appendChild(snack);
	snack.classList.add("show");
	setTimeout(function(){
		snack.classList.remove("show");
		snack.classList.add("hide");
		setTimeout(function(){ document.body.removeChild(snack); }, 700);
	},3500);
}

function deleteNodesOnResponse(response){
	"use strict";
	var container = document.getElementById(response.container);
	var mdel = container.querySelectorAll("[data-mdel=true]");
	for(var i=0; i<mdel.length; i++) { container.removeChild(mdel[i]); }
	showSnackbar("Записей удалено: " + response.dqt);
}