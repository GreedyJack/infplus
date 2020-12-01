function stub(){}

function beginTest(dir){
	"use strict";
	var request = {};
	request.object = "question";
	request.directory = dir;
	sendRequestToServerHandler("tests/tester.php",parseQuestions,JSON.stringify(request));
}

function parseQuestions(response){
	"use strict";
	var start = new Date();
	if(response.status!="200"){  }
	var progress = document.getElementById("testProgressBar");
	var container = document.getElementById("tester-frame");
	var w = 100/response.questions.length+"%";
	container.innerHTML = "";
	container.setAttribute("data-dir",response.directory);
	var tfinish = new Date();
	tfinish.setMinutes(tfinish.getMinutes()+parseInt(response.elapsedTime));
	sessionStorage.setItem("testFinish",tfinish.toString());
	for(var i=0; i<response.questions.length; i++){
		var l = document.createElement("div");
		l.classList.add("testProgressBarElement");
		l.style.width = w;
		progress.appendChild(l);
		var d = document.createElement("div");
		d.classList.add("hidden");
		d.setAttribute("data-type",response.questions[i].type);
		d.id = response.questions[i].id;
		d.classList.add("tester-card");
		var c = document.createElement("p");
		var idq = document.createElement("span");
		idq.classList.add("bold");
		idq.innerText = "Вопрос №" + (i+1) +". ";
		c.appendChild(idq);
		idq = document.createElement("span");
		idq.classList.add("action-description");
		idq.innerText = d.dataset.type=="radio" ? "Выберите один правильный вариант ответа:":"Выберите один или более правильных вариантов ответа:";
		c.appendChild(idq);
		d.appendChild(c);
		var q = document.createElement("p");
		q.appendChild(document.createTextNode(response.questions[i].question));
		d.appendChild(q);
		for(var j=0; j<response.questions[i].answers.length; j++){
			var a = document.createElement("input");
			a.setAttribute("type",response.questions[i].type);
			if(a.type=="radio"){ a.setAttribute("name", response.questions[i].id); }
			a.setAttribute("id",response.questions[i].id+"a"+response.questions[i].answers[j].id);
			a.setAttribute("data-aid",response.questions[i].answers[j].id);
			d.appendChild(a);
			var l = document.createElement("label");
			l.setAttribute("for",a.getAttribute("id"));
			l.innerHTML = response.questions[i].answers[j].text;
			d.appendChild(l);
			d.appendChild(document.createElement("br"));
		}
		var b = document.createElement("button");
		b.innerText = "Ответить";
		d.appendChild(b);
		b.onclick = function(){sendAnswer(this.parentNode, this);};
		container.appendChild(d);
	}
	console.log(new Date() - start);
	nextQuestion(0);
}

function sendAnswer(form,sender){
	"use strict";
	form.removeChild(form.querySelector("button"));
	var inputs = form.getElementsByTagName("input");
	var request = { object:"answer", directory:document.getElementById("tester-frame").dataset.dir, 
		qid:form.id, aid:[] 
	};
	for(var i=0;i<inputs.length;i++){ if(inputs[i].checked){ request.aid.push(inputs[i].dataset.aid); } }
	sendRequestToServerHandler("tests/tester.php",getQuestionResult,JSON.stringify(request));
}

function getQuestionResult(response){
	"use strict";
	if(response.status!="200") { console.log(response.status); }
	var qid = parseInt(response.qid);
	document.getElementById("testProgressBar").querySelectorAll(".testProgressBarElement")[qid].classList.add(response.result);
	var form = document.getElementById("tester-frame").querySelectorAll(".tester-card")[qid];
	form.classList.add(response.result);
	form.setAttribute("data-score", response.score);
	if(response.result!="correct"){
		var ans = form.querySelectorAll("input");
		for(var i=0;i<ans.length;i++){
			ans[i].disabled = true;
			if(ans[i].checked){ ans[i].nextElementSibling.classList.add("ans-incorrect"); }
		}
		for(var i=0;i<response.correctAnswers.length;i++){
			ans[parseInt(response.correctAnswers[i])].nextElementSibling.classList.remove("ans-incorrect");
			ans[parseInt(response.correctAnswers[i])].nextElementSibling.classList.add("ans-correct");
		}
	}
	if(response.lastQuestion){ showResult(response.total); }
	else { nextQuestion(qid+1); }
}

function nextQuestion(index){
	"use strict";
	var list = document.getElementById("tester-frame").querySelectorAll(".tester-card");
	if(index==list.length){return;}
	if(index!=0){ list[index-1].classList.add("hidden"); }
	list[index].classList.remove("hidden");
}

function showResult(response){
	"use strict";
	var start = new Date();
	var list = document.getElementById("tester-frame").querySelectorAll(".tester-card");
	var form = list[0].parentElement;
	var score = 0, correct = 0, incorrect = 0, partiallyCorrect = 0;
	for(var i=0; i<list.length; i++){
		if(list[i].classList.contains("correct")){ form.removeChild(list[i]); }
		else { list[i].classList.remove("hidden"); }
	}
	var result = document.createElement("div");
	result.appendChild(setParagraphSummary("Количество вопросов",response.testLength));
	var mins = Math.floor(response.time/60);
	var secs = response.time%60;
	result.appendChild(setParagraphSummary("Продолжительность теста", (mins<10?"0":"")+mins+":"+(secs<10?"0":"")+secs));
	result.appendChild(setParagraphSummary("Правильных ответов",response.correct));
	result.appendChild(setParagraphSummary("Ответов с ошибками",response.partiallyCorrect));
	result.appendChild(setParagraphSummary("Неправильных ответов",response.incorrect));
	result.appendChild(setParagraphSummary("Набрано баллов",response.score + " из " + response.maxScore));
	var credit = document.createElement("p");
	credit.classList.add("centered","highlighted");
	if(response.credited){ credit.innerText = "Тест пройден"; credit.classList.add("ans-correct"); }
	else { credit.innerText = "Тест не пройден"; credit.classList.add("ans-incorrect"); }
	result.appendChild(credit);
	form.insertBefore(result,form.firstChild);
	console.log(new Date() - start);
}

function setParagraphSummary(name, value, classList){
	"use strict";
	var p = document.createElement("p");
	var s = document.createElement("span");
	s.classList.add("bold");
	s.innerText = name + ": ";
	p.appendChild(s);
	s = document.createElement("span");
	s.innerText = value;
	p.appendChild(s);
	if(typeof classList != "undefined") for(var i=0;i<classList.length;i++){
		p.classList.add(classList[i]);
	}
	return p;
}