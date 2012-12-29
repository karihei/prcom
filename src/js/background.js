chrome.extension.onRequest.addListener(function(req, sender, sendRes) {
    switch(req.action) {
        case 'getComments':
            sendRes(getComments(req.pullId));
            break;
        casedefault:
            break;
    }
});


function getComments(pullId) {
    var data = localStorage.getItem(pullId) ;
    var json = data ? JSON.parse(data) : {};
    return json['comments'];
};
