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
	{"id":500,"action":"update","type":"text","data":"Test for ID #500","size":10,"language":"all","position":100},
	{"id":518,"action":"update","type":"image","size":3,"language":"all","position":118},
	{"id":525,"action":"update","type":"video","size":1,"language":"eng","position":1000}

	//delete
	{"id":507,"type":"text","action":"delete"},
	{"id":529,"type":"image","action":"delete"},
	{"id":529,"type":"video","action":"delete"}
]