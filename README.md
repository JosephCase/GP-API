# gp-cms

To do

- Change config to .js file
- Change templates to views
- Add data layer and controller directories and seperate homepage and page script into controller and data
- Add models?
- Add JSON web token authentification


## Demo Commands

### Edit page (contents)


[

	//add
	{"action":"create","type":"text","data":"Some text with #markup","position":0,"size":15,"language":"eng"},
	{"action":"create","type":"image","id":"new_0","position":1,"size":1,"language":"eng"},
	{"action":"create","type":"video","id":"new_1","position":2,"size":1,"language":"eng"}

	//edit
	{"id":163,"type":"text","data":"Old text here","action":"edit","position":0,"language":"ita"}
	{"id":266,"type":"img","action":"edit","language":"ita","size":2}

	//delete
	{"id":268,"type":"img","action":"delete"}
]