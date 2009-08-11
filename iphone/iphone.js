/*
 * VLC Webinterface for iPhone / iPod Touch
 *
 * Javascript functions
 */

function isIPhoneOrIPod() {
	return ((navigator.userAgent.indexOf('iPhone')!=-1) || (navigator.userAgent.indexOf('iPod')!=-1));
}

function showError(txt) {
	window.alert(txt);
}

function control(cmd,param) {
	var url="json.html";
	if(cmd) url+="?control="+cmd;
	if(param) {
		if(cmd=="volume") url+="&value="+encodeURIComponent(param);
		else if(cmd=="seek") url+="&seek_value="+encodeURIComponent(param);
		else if(cmd=="play") url+="&item="+encodeURIComponent(param);
		else showError("Don't know parameter for cmd command "+cmd);
	}
	var xmlRequest = new XMLHttpRequest();
	xmlRequest.onload = function(){
		if(xmlRequest.status==200) { 
			updateState(xmlRequest.responseText);
		}
	};
	xmlRequest.open("GET",url);
	xmlRequest.setRequestHeader("Cache-control", "no-cache");
	xmlRequest.send(null);
	return false;
}

function setVar(key,value) {
	try {
		localStorage.setItem(key,value);
		// console.log('setVar('+key+','+value+')')
	}
	catch(e) {
	}
}

function getVar(key,defaultVal) {
	var ret;
	try {
		ret=localStorage.getItem(key);
		if(ret==null) ret=defaultVal;
	}
	catch(e) {
		ret=defaultVal;
	}
	// console.log('getVar(' + key + ',' + defaultVal + ') => ' + ret);
	return ret;
}

function isHidden(id) {
	var elem=document.getElementById(id);
	if(elem) return (elem.className.substr(0,7)=='hidden ');
	return null;
}

function hide(id,val,saved) {

	if(saved) val=getVar('hide_'+id,val);
	if((val) && (typeof val=='string')) val=(val!='false');
	
	var elem=document.getElementById(id);
	if(elem.className.substr(0,7)=='hidden ') {
		if((val==undefined) || (!val)) {
			elem.className=elem.className.substr(7);
			setVar('hide_'+id,false);
		} 
	}
	else if((val==undefined) || (val)) {
		elem.className='hidden '+elem.className;
		setVar('hide_'+id,true);
	}
}

function updateState(json) {
	json=eval('('+json+')');
	hide('play_button',json.State=='playing');
	hide('pause_button',json.State!='playing');
	document.getElementById('State').innerHTML=json.State;
	document.getElementById('Length').innerHTML=timeString(json.Length);
	document.getElementById('Time').innerHTML=timeString(json.Time);
	document.getElementById('Volume').value=""+Math.floor(100*json.Volume/256);
	progressBar("Position",json.Time,json.Length);
	progressBar("VolumeBar",json.Volume,1024);
	var elem=document.getElementById('playlist_control');
	elem.replaceChild(createPlaylist(json.Playlist),elem.getElementsByTagName('ul')[0]);
	elem=document.getElementById('media_info');
	elem.replaceChild(createInfo(json.Info),elem.firstChild);
}

function createInfo(info) {
	var ul=document.createElement('ul');
	for(i in info) {
		if(i!="Index") {
			var li=document.createElement('li');
			if(typeof info[i]=="object") {
				li.appendChild(document.createTextNode(i));
				li.appendChild(createInfo(info[i]));
			}
			else {
				li.appendChild(document.createTextNode(i+":"+info[i]));
			}
			ul.appendChild(li);
		}
	}
	return ul;
}

function createPlaylist(pl) {
	var ul=document.createElement('ul');
	for(var i=0;i<pl.length;i++) {
		var li=document.createElement('li');
		if(pl[i].type=='Node') {
			li.appendChild(document.createTextNode(pl[i].name));
			li.appendChild(createPlaylist(pl[i].items));
		}
		else if(pl[i].current) {
			li.appendChild(document.createTextNode(pl[i].name));
		}
		else {
			var a=document.createElement('a');
			a.appendChild(document.createTextNode(pl[i].name));
			a.setAttribute('href','javascript:control("play","'+pl[i].index+'");');
			li.appendChild(a);
		}
		ul.appendChild(li);
	}
	return ul;
}

function progressBar(id,val,max) {
	var canvas=document.getElementById(id);
	var context=canvas.getContext('2d');
	context.clearRect(0,0,canvas.width,canvas.height);
	if(max>0) {
		context.fillStyle='rgb(90, 90, 187)';
		context.fillRect(0,0,canvas.width*val/max,canvas.height);
	}
}

function documentLoaded() {
	document.getElementById('State').innerHTML="please wait";
	document.getElementById('Length').innerHTML="00:00:00";
	document.getElementById('Time').innerHTML="00:00:00";
	document.getElementById('Volume').value="100";
	if(localStorage && localStorage.getItem) {
		hide('status',false,true);
		hide('volume_control',false,true);
		hide('playback_control',false,true);
		hide('media_info',false,true);
		hide('playlist_control',false,true);
		// hide('status',localStorage.getItem('hide_status'));
		// hide('volume_control',localStorage.getItem('hide_volume_control'));
		// hide('playback_control',localStorage.getItem('hide_playback_control'));
		// hide('media_info',localStorage.getItem('hide_media_info'));
		// hide('playlist_control',localStorage.getItem('hide_playlist_control'));
	}
	window.setTimeout(function(){window.scrollTo(0,1);},100);
	window.setInterval("control();",1000);
}

function timeString(got_time) {
	var hours = Math.floor(got_time/ 3600);
	var minutes = Math.floor((got_time/60) % 60);
	var seconds = got_time % 60;
	if ( hours < 10 ) hours = "0" + hours;
	if ( minutes < 10 ) minutes = "0" + minutes;
	if ( seconds < 10 ) seconds = "0" + seconds;
    return ""+hours+":"+minutes+":"+seconds;
}
