var pieces = [
    [[0, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [0, 1], [1, 0]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [0, 1], [0, 2], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
    [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [1, 2], [1, 3], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 1], [2, 0]],
    [[0, 2], [1, 1], [0, 1], [2, 1], [1, 0]],
    [[1, 2], [1, 1], [0, 1], [2, 1], [1, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 2]]
];

pieces = []


var allpieces = null;
var selected = null;
var dragSelected = null;
var doubleClicked = null;
var showBlocks = false;
var matrix = new Array(10);
var usedPieces = new Set();

function randomNumber(max=99, number=10){
    if (number>max)
        number = max
    var randInts = new Set();
    while(randInts.size != number){
        var randNum = Math.floor( (Math.random() * (max) ))
        randInts.add(randNum);
    }
    return Array.from(randInts)
}

function getRandomPieces(randInt){
    p = []
    randInt.forEach(element => {
        p.push(allpieces[element]);
    });
    return p;
}

function toggleSelect(selectedDiv, update=false) {
    var children = null;
    if(doubleClicked != null){
        children = doubleClicked.children();
        for(var i =0; i < children.length; i++){
            if($(children[i]).hasClass("selected"))
                $(children[i]).removeClass("selected");
        }

        if(selectedDiv.is(doubleClicked) && !update){
            doubleClicked = null;
            return;
        }
        
        children = selectedDiv.children();
        for(var i =0; i < children.length; i++){
            $(children[i]).addClass("selected");
        }
        doubleClicked = selectedDiv;
        return;
    }
    children = selectedDiv.children();
    for(var i =0; i < children.length; i++){
        $(children[i]).addClass("selected");
        doubleClicked = selectedDiv;
    }
    return;
}

function startGame(noInput=null){
    
    $("#board").children().remove();
    $("#pieces").children().remove();

    usedPieces = new Set();
    var randNum = Math.floor( ((Math.random() * (allpieces.length)/2) + 2 ))
   
    var randInts = randomNumber(max=allpieces.length, number=randNum);
    pieces = getRandomPieces(randInts);
    
    for (var i = 0; i < 10; i++) {
        var tr = $("<tr/>").appendTo("#board");
        matrix[i] = new Array(10);
        for (var j = 0; j < 10; j++) {
            if(noInput!=null){
                if(noInput.includes((i*10)+j)){
                    tr.append("<td id='b" +  i + "-" + j + "' class='noBlock'></td>");
                    matrix[i][j] = true;
                }
                else{
                    tr.append("<td id='b" +  i + "-" + j + "'></td>");
                    matrix[i][j] = false;
                }
                    
            }
            else{
                tr.append("<td id='b" +  i + "-" + j + "'></td>");
                matrix[i][j] = false;
            }
                
        }
    }

    $.each(pieces, function(k, v) {
        var piece = $("<div class='piece black' data-id='" + k + "' ondblclick='toggleSelect($(this))' />").appendTo("#pieces");
        drawPiece(piece, v);
        piece.draggable({ revert: true,
            start: function(ev, ui) {
                selected = $(this);
            }, stop: function() {
                selected = null;
            }
        });
    });
}

$(document).ready(function() {    
    $.get( "/allpieces/5", function(err, req, resp){
        allpieces = resp.responseJSON;
    }).then(
        function(){
            startGame();
            run();
            console.log("Start");
        }, function(){
            console.log("Fail");
        }
    );
});

function run(){

    
    $("#randomBlock").click(function(){
        if(!showBlocks){
            var randInts = randomNumber();
            startGame(noInput=randInts);
            showBlocks = !showBlocks;
            return;
        }
        startGame();
        showBlocks = !showBlocks;
        
    });

    $("#rotate").click(function(){
        if(doubleClicked != null){
            var id = doubleClicked.attr("data-id");
            for (var i = 0; i < pieces[id].length; i++) {
                var c = pieces[id][i];
                pieces[id][i] = [c[1], (doubleClicked.height()/34-1)-c[0]];
            }
            drawPiece(doubleClicked, pieces[id]);
            toggleSelect(doubleClicked, update=true);
        }
    });

    

    $("#board").droppable({ drop: function(evt, ui) {
        var e = ui.draggable;
        // process piece drop here
        if (!e.hasClass("piece")) {
            return;
        }
        var c = e.offset();
        var d = $("#board").offset();
        var f = { top: Math.round((c.top - d.top) / 34), left: Math.round((c.left - d.left) / 34) };
        if (f.top > 10 || f.top < 0 || f.left > 10 || f.left < 0) {
            return;
        }
        var pieceid = e.attr("data-id");
        var flag = false;
        $.each(pieces[pieceid], function(k, v) {
            var b = $("td#b" + (f.top + v[0]) + "-" + (f.left + v[1]));
            if (!b.length) {
                flag = true;
                return false;
            }

            if (b.is(".black")) {
                flag = true;
                return false;
            }

            if (b.is(".noBlock")) {
                flag = true;
                return false;
            }
        });
        
        if (flag)
            return;

        $.each(pieces[pieceid], function(k, v) {
            $("td#b" + (f.top + v[0]) + "-" + (f.left + v[1])).addClass('black');
            matrix[f.top + v[0]][f.left + v[1]] = true;
        });
        
        usedPieces.add(pieceid);

        var win = false
        $.each(pieces[pieceid], function(k, v) {
            var rFlag = false;
            for(var i = 0; i<matrix.length; i++){
                if (matrix[f.top + v[0]][i] == false){
                    rFlag = true;
                    break;
                }
            }
            var cFlag = false;
            for(var i = 0; i<matrix.length; i++){
                if (matrix[i][f.left + v[1]] == false){
                    cFlag = true;
                    break;
                }
            }
            if(!rFlag || !cFlag){
                win = true;
                return false;
            }
        });

        if(win && usedPieces.size != pieces.length)
            gameResult(true)
        else if (usedPieces.size == pieces.length)
            gameResult(false)
        
        if(e.is(doubleClicked))
            doubleClicked = null;
        e.remove();
    } });

    function gameResult(res){
        $("#overlay").css("display", "block")
        if(res)
            $("#mainText").text("Winner :)");
        else
            $("#mainText").text("Looser :'(");
    }

    $("#overlay").click(function(){
        $("#overlay").css("display", "none")
        if(showBlocks){
            var randInts = randomNumber();
            startGame(noInput=randInts);
        }
        else
            startGame();
    });
}

function drawPiece(piece, arr) {
    var wmax = 0;
    var vmax = 0;
    piece.children().remove();
    $.each(arr, function(k2, v2) {
        var block = $("<div class='block'/>");
        block.css({
            top: v2[0]*34 + "px",
            left: v2[1]*34 + "px"
        });
        var c = Math.abs(v2[0] + 1)*34;
        var d = Math.abs(v2[1] + 1)*34;
        if (c > wmax) {
            wmax = c;
        }
        if (d > vmax) {
            vmax = d;
        }
        piece.append(block);
    });
    piece.css({
        "width": vmax + "px",
        "height": wmax + "px"
    });
}