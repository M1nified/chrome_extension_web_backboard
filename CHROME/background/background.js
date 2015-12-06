chrome.browserAction.onClicked.addListener(function(tab){
	switchNote(tab);
})
var switchNote = function(tab){
	if(!tab){
		return;
	}
	var url = tab.url;
	chrome.tabs.executeScript(tab.id,{
		file:"/lib/jquery.min.js",
		runAt:"document_end"
	},function(r){
		chrome.tabs.executeScript(tab.id,{
			file:"/background/note.js",
			runAt:"document_end"
		},function(r){
			chrome.tabs.executeScript(tab.id,{
				code:"runWebNote();",
				runAt:"document_end"
			})
		})
	})
	chrome.tabs.insertCSS(tab.id,{
		file:"/background/note.css"
	})
}
