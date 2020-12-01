function stub(){

}

function requestDataFileContents(callback, filename){
	"use strict";
	var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
	var xhttp = new XHR();
	xhttp.open("GET", "/data/" + filename + ".json", true);
	xhttp.timeout = 25000;
	var d = new Date();
	xhttp.setRequestHeader("Expires",d.setDate(d.getDate()+1));
	xhttp.send();
	xhttp.onload = function(){
		var result = JSON.parse(this.responseText);
		callback(result);
	}
	xhttp.ontimeout = function(){
		errorBox = document.getElementById("errorBox");
		errorBox.innerText = "Время ожидания превышено";
		errorBox.classList.add("active");
		setTimeout(function(){errorBox.classList.remove("active");},2500);
	}
	xhttp.onerror = function(){
		errorBox = document.getElementById("errorBox");
		errorBox.innerText = this.status + ": " + this.statusText;
		errorBox.classList.add("active");
		setTimeout(function(){errorBox.classList.remove("active");},2500);
	}
}

function setNews(news){
	"use strict";
	var template = document.getElementById("templateContainer").querySelector(".newscard");
	var newsNode = [];
	newsNode.push(createNewsNode(news[0], template, false));
	for (var i=news.length-1;i>0;i--){
		newsNode.push(createNewsNode(news[i], template, true));
	}
	for(var i=0; i<newsNode.length;i++){ document.getElementById("newsbar").appendChild(newsNode[i]); }
	document.getElementById("newsbar").setAttribute("data-news-index", 0);
}
function createNewsNode(news, template, hidden)
{
	"use strict";
	var newsNode = template.cloneNode(true);
	if(hidden){ newsNode.classList.add("hidden"); }
	newsNode.querySelector(".newscard-header").querySelector("h1").innerHTML = news.header;
	newsNode.querySelector(".newscard-footer").querySelector(".right").innerHTML = news.date;
	if(news.content.img!==null&&news.content.img!==""){
		var img = document.createElement("img");
		img.classList.add("newscard-img");
		img.setAttribute("src",news.content.img);
		newsNode.querySelector(".newscard-content").appendChild(img);
	}
	for(var i=0; i<news.content.text.length; i++)
	{
		var paragraph = document.createElement("p");
		var text = news.content.text[i];
		if(text.indexOf("{")!==-1){
			text = fillWildcards(text, news.content.variables);
		}
		paragraph.innerHTML = text;
		newsNode.querySelector(".newscard-content").appendChild(paragraph);
	}
	return newsNode;
}
function fillWildcards(text, vars) {
	"use strict";
	var wildcards = text.match(/{\w*?}/g);
	for (var i = 0; i < wildcards.length; i++) {
		var node = wildcards[i].substr(1, wildcards[i].length - 2);
		text = text.replace(wildcards[i], vars[node]);
	}
	return text;
}

function setCitation(list){
	"use strict";
	var citebar = document.getElementById("citebar");
	var index;
	if(sessionStorage.getItem("citeIndex")){
		index = parseInt(sessionStorage.getItem("citeIndex")) + 1;
		if(index>=list.length) { index = 0; }
	}
	else{
		index = Math.floor(Math.random()*list.length);
	}
	sessionStorage.setItem("citeIndex", index);
	citebar.querySelector("i").textContent = list[index].text;
	citebar.querySelector("strong").textContent = list[index].author;
}

function processStaffList(staff){
	"use strict";
	var template = document.getElementById("templateContainer").querySelector(".showcase.card");
	var base = document.getElementById("employees");
	for (var i=0; i<staff.length; i++){
		var card = template.cloneNode(true);
		card.querySelector("img").setAttribute("src","/pictures/staff/"+staff[i].photo);
		var text = card.querySelector(".textarea");
		text.querySelector("h4").innerText = staff[i].name;
		var t = document.createElement("p");
		t.innerHTML = "<strong>Должность:</strong> " + staff[i].post + "<br/><strong>Опыт преподавания:</strong> " + staff[i].teachingExperience + "<br/><strong>Опыт работы:</strong> " + staff[i].workExperience;
		text.appendChild(t);
		t = document.createElement("p");
		t.innerHTML = staff[i].about;
		text.appendChild(t);
		base.appendChild(card);
	}
}

function processClassesList(classes){
	"use strict";
	var template = document.getElementById("templateContainer").querySelector(".accordion");
	var base = document.getElementById("accordionSet");
	processClassesSubList(classes.basic, template, base, "");
	processClassesSubList(classes.enterprise, template, base, "");
	processClassesSubList(classes.professional, template, base, "");
}
function processClassesSubList(list, template, base, color){
	"use strict";
	var header = document.createElement("h3");
	header.classList.add("centered");
	header.classList.add("margin-top-bottom");
	header.innerText = list.header;
	base.appendChild(header);
	for(var i=0; i<list.list.length; i++){
		var accord = template.cloneNode(true);
		accord.querySelector(".accordion-header p").innerText = list.list[i].header;
		var text = document.createElement("p");
		text.classList.add("margin-top");
		text.innerHTML = "<strong>Стоимость:</strong> " + list.list[i].cost + " руб." + "<br/><span class='small'>Учащимся, пенсионерам и безработным скидка 10%</span>" + "<br/><strong>Количество занятий:</strong> " + list.list[i].classes + "<br/><strong>Количество часов:</strong> " + list.list[i].hours + "<br/><strong>Продолжительность:</strong> " + list.list[i].shedule;
		accord.querySelector(".accordion-content").appendChild(text);
		text = document.createElement("p");
		text.classList.add("margin-top");
		text.innerHTML = list.list[i].description;
		accord.querySelector(".accordion-content").appendChild(text);
		text = document.createElement("p");
		text.classList.add("margin-top");
		var ol = document.createElement("ol");
		ol.classList.add("no-margin");
		for(var x=0; x<list.list[i].themes.length; x++){
			var li = document.createElement("li");
			li.innerText = list.list[i].themes[x];
			ol.appendChild(li);
		}
		text.innerHTML = "<strong>Список тем:</strong><br/>";
		text.appendChild(ol);
		accord.querySelector(".accordion-content").appendChild(text);
		base.appendChild(accord);
	}
}
function processClassesOptgroup(classes){
	"use strict";
	var select = document.getElementById("class");
	var optgroup = processClassesOptions(classes.basic);
	select.appendChild(optgroup);
	optgroup = processClassesOptions(classes.enterprise);
	select.appendChild(optgroup);
	optgroup = processClassesOptions(classes.professional);
	select.appendChild(optgroup);
}
function processClassesOptions(list){
	"use strict";
	var optgroup = document.createElement("optgroup");
	optgroup.setAttribute("label",list.header);
	for(var i=0; i<list.list.length; i++){
		var option = document.createElement("option");
		option.setAttribute("value",list.list[i].header);
		option.innerText = list.list[i].header;
		optgroup.appendChild(option);
	}
	return optgroup;
}

//#region user-database
function sendRequestToServerHandler(handler, callback, requestString){
	"use strict";
	var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
	var xhttp = new XHR();
	xhttp.open("POST", "/"+handler, true);
	xhttp.timeout = 25000;
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	xhttp.send(requestString);
	xhttp.onload = function(){
		//console.log(this.responseText);
		var result = JSON.parse(this.responseText);
		//var result = this.responseText;
		callback(result);
	}
	xhttp.ontimeout = function(){
		errorBox = document.getElementById("errorBox");
		errorBox.innerText = "Время ожидания превышено";
		errorBox.classList.add("active");
		setTimeout(function(){errorBox.classList.remove("active");},2500);
	}
	xhttp.onerror = function(){
		errorBox = document.getElementById("errorBox");
		errorBox.innerText = this.status + ": " + this.statusText;
		errorBox.classList.add("active");
		setTimeout(function(){errorBox.classList.remove("active");},2500);
	}
}

function sendApplication(){
	"use strict";
	var form = document.getElementById("form");
	var inputs = form.getElementsByTagName("input");
	var requiredEmpty = false;
	for(var i=0; i<inputs.length; i++){
		if(inputs[i].required&&inputs[i].value===""){
			inputs[i].classList.add("input-incorrect");
			inputs[i].addEventListener("focus",function(){ this.classList.remove("input-incorrect"); });
			requiredEmpty = true;
		}
	}
	if(requiredEmpty){
		var errorText = document.createElement("p");
		errorText.innerText = "Не все обязательные поля заполнены!";
		errorText.style.color = "red";
		form.insertBefore(errorText,form.firstChild);
		if(errorText.getBoundingClientRect().top<40){ document.getElementById("content").scrollIntoView(); }
		setTimeout(function(){ form.removeChild(errorText); }, 5000 );
		return false;
	}
	var userdata = {};
	userdata.lastName = escapeText(inputs.lname.value);
	userdata.firstName = escapeText(inputs.fname.value);
	userdata.patronim = escapeText(inputs.patr.value);
	if(validatePhoneNumber(inputs.tel.value)){ userdata.telephone = inputs.tel.value; }
	else{
		inputs.tel.classList.add("input-incorrect");
		var errorText = document.createElement("p");
		errorText.style.color = "red";
		errorText.style.cursor = "help";
		errorText.setAttribute("title", "Номер должен начинаться с цифры или плюса.\r\nВ качестве разделителя частей номера можно использовать пробел или минус.\r\nМаксимальная длина номера - 15 цифр без учета разделителей.")
		errorText.innerText = "Телефонный номер не распознан. Проверьте правильность ввода номера.";
		form.insertBefore(errorText, inputs.tel.nextSibling);
		if(inputs.tel.getBoundingClientRect().top<40){ inputs.fname.scrollIntoView(); }
		inputs.tel.addEventListener("focus",function(){ this.classList.remove("input-incorrect"); if(form.contains(errorText)){ form.removeChild(errorText); } });
		return false;
	}
	var selects = form.getElementsByTagName("select");
	userdata.birthday = selects.day.value + "." + selects.month.value + "." + selects.year.value;
	userdata.class = selects.class.value;
	var wd = form.querySelectorAll("[name=wd]");
	for(var i=0; i<wd.length; i++){ if(wd[i].checked){ userdata.days = wd[i].value; } }
	var dt = form.querySelectorAll("[name=dt]");
	for(var i=0; i<dt.length; i++){ if(dt[i].checked){ userdata.time = dt[i].value; } }
	userdata.targetFile = "/dat/clients.json";
	userdata.action = "insert";
	userdata.response = "thank";
	sendRequestToServerHandler("backbone/requestHandler.php",showSnackbar, JSON.stringify(userdata));
	return true;
}
function escapeText(input){
	"use strict";
	var dict = {"<":"&lt;",">":"&gt;","&":"&amp;"};
	return input.replace(/[<>&]/g, function(c) { return dict[c]; });
}
function validatePhoneNumber(input){
	"use strict";
	if(/^\+?\d+[\(\- ]?\d{3,5}[\)\- ]?[\-\d ]+$/.test(input)&&input.replace(/\D/g,"").length<=15){
		return true;
	} else { 
		return false;
	}
}

function getApplicationsList(){
	"use strict";
	var request = {};
	request.action = "get all";
	request.targetFile = "/dat/clients.json";
	sendRequestToServerHandler("backbone/requestHandler.php",fillApplicationsTable,JSON.stringify(request));
}

function fillApplicationsTable(data){
	"use strict";
	var table = document.getElementById("appList");
	for(var i=0; i<data.length; i++){
		var row = document.createElement("tr");
		row.setAttribute("data-id",data[i].regDate);
		var date = new Date(data[i].regDate);
		if((Date.now-date)/(3600 * 1000 * 24) > 30 ) { row.classList.add("old-app"); }
		var cell = document.createElement("td");
		cell.setAttribute("data-content","ФИО");
		cell.innerText = data[i].lastName + " " + data[i].firstName + " " + data[i].patronim;
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.setAttribute("data-content","Телефон");
		cell.innerText = data[i].telephone;
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.setAttribute("data-content","Курс");
		cell.innerText = data[i].class;
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.setAttribute("data-content","Время");
		cell.innerText = data[i].days + " " + data[i].time;
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.setAttribute("data-content","ДР");
		cell.innerText = data[i].birthday;
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.setAttribute("data-content","Заявка");
		var dopt = {day:"numeric",month:"numeric",year:"numeric"};
		cell.innerText = date.toLocaleString("ru",dopt);
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.appendChild(document.createElement("span"));
		cell.firstChild.classList.add("fas");
		cell.firstChild.classList.add("fa-trash-alt");
		cell.addEventListener("click",function(){
			var parent = this.parentNode;
			//this.firstChild.classList.toggle("fa-trash-alt");
			if(!parent.dataset.mdel){ parent.setAttribute("data-mdel","true"); }
			else { parent.removeAttribute("data-mdel"); } 
		});
		row.appendChild(cell);
		table.appendChild(row);
	}
}

function requestDeletion(container, place){
	"use strict";
	var delList = container.querySelectorAll("[data-mdel=true]");
	if(delList.length===0){ return; }
	var request = {action:"remove"};
	switch (place){
		case "applications":
		request.targetFile = "/dat/clients.json";
		request.container = container.id;
		break;
	}
	request.list = [];
	for(var i=0; i<delList.length; i++){
		request.list.push(delList[i].dataset.id);
	}
	sendRequestToServerHandler("backbone/requestHandler.php",deleteNodesOnResponse,JSON.stringify(request));
}

function sendReview()
{
    "use strict";
    var name = document.getElementById("reviewer").value;
    if(name==="") name = "Аноним";
    var rating = document.getElementById("rating").getAttribute("data-rated");
    if(rating=="no"){
        var error = document.createElement("p");
        error.setAttribute("id", "errorRating");
        error.style.color = "red";
        error.innerText = "Укажите, пожалуйста, оценку!";
        document.getElementById("form").insertBefore(error, document.getElementById("form").firstChild);
        return false;
    }
    var review = document.getElementById("review").value;
    var request = {action:"insert"};
    request.name = name;
    request.rating = rating;
    request.review = review;
    request.published = false;
    if(parseInt(rating)>=4)request.targetFile = "/data/private/reviews/good.json";
    else request.targetFile = "/data/private/reviews/bad.json"
	request.response = "review";
    document.getElementById("submit").disabled = true;
	sendRequestToServerHandler("backbone/requestHandler.php",showSnackbar, JSON.stringify(request));
    setTimeout(function(){ window.location.replace("https://infplus.ru"); },4000);
}
//#regionend
