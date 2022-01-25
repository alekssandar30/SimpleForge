$(document).ready(function () {

    ////GC
    //alert( $(".wrapper").width());
    
    var wrapperW = $(".wrapper").width();
    
    wrapperW = wrapperW/12 ;
    
    /**/
        
        var container = $(".wrapper");
        var numberOfCol = 3;
        $(".wrapper div").css('width', 100/numberOfCol +'%');
       
        var sibTotalWidth;
        $(".wrapper div").resizable({
            handles: 'e',
            grid: wrapperW,
            start: function(event, ui){
                sibTotalWidth = ui.originalSize.width + ui.originalElement.next().outerWidth();
            },
            stop: function(event, ui){     
                var cellPercentWidth=100 * ui.originalElement.outerWidth()/ container.innerWidth();
                ui.originalElement.css('width', cellPercentWidth + '%');  
                var nextCell = ui.originalElement.next();
                var nextPercentWidth=100 * nextCell.outerWidth()/container.innerWidth();
                nextCell.css('width', nextPercentWidth + '%');
            },
            resize: function(event, ui){ 
                ui.originalElement.next().width(sibTotalWidth - ui.size.width); 
            }
        });
    });