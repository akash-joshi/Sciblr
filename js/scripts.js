
  var temp=$('.search_collapse').html();
  $('#search_button').click(function(){
    $('.search_collapse').fadeOut("fast",function(){
      var new_div=$("<div class='container form-group' id='new'><input class='form-control' id='search-bar' type='text'/></div>");
      $(this).replaceWith(new_div);
      $("#new").fadeIn("fast");
    });
  });
  $('#content').click(function(){
    $('#new').fadeOut("fast",function(){
    $('#new').replaceWith("<div class='container search_collapse'>"+temp+"</div>");
    $('.search_collapse').fadeIn("fast");

    $('#search_button').click(function(){
      $('.search_collapse').fadeOut("fast",function(){
        var new_div=$("<div class='container form-group' id='new'><input class='form-control active' id='search-bar' type='text'/></div>");
        $(this).replaceWith(new_div);
        $("#new").fadeIn("fast");
      });
    });
    });
  });


// multi item slider


$(() => {

const cleanInput = input => $('<div/>').text(input).html(); 
const checkLogin = () => {
    $.ajax({
        url: '/check-login',
        type: 'GET',
        statusCode : {
          200 : () => {
              $(".logged-in").css("display","block");
          },
          500 : () => {
              alert("REEEEEEEEEEE");
          },
          403 : () => {
            $(".logged-out").css("display","block");
          }
        },
        error: function (xhr, status, err) {
          console.error(status, err.toString());
        }
      });
}

checkLogin();
var itemsMainDiv = ('.MultiCarousel');
var itemsDiv = ('.MultiCarousel-inner');
var itemWidth = "";

$('.leftLst, .rightLst').click(function () {
    var condition = $(this).hasClass("leftLst");
    if (condition)
        click(0, this);
    else
        click(1, this)
});

ResCarouselSize();




$(window).resize(function () {
    ResCarouselSize();
});

//this function define the size of the items
function ResCarouselSize() {
    var incno = 0;
    var dataItems = ("data-items");
    var itemClass = ('.item');
    var id = 0;
    var btnParentSb = '';
    var itemsSplit = '';
    var sampwidth = $(itemsMainDiv).width();
    var bodyWidth = $('body').width();
    $(itemsDiv).each(function () {
        id = id + 1;
        var itemNumbers = $(this).find(itemClass).length;
        btnParentSb = $(this).parent().attr(dataItems);
        itemsSplit = btnParentSb.split(',');
        $(this).parent().attr("id", "MultiCarousel" + id);


        if (bodyWidth >= 1200) {
            incno = itemsSplit[3];
            itemWidth = sampwidth / incno;
        }
        else if (bodyWidth >= 992) {
            incno = itemsSplit[2];
            itemWidth = sampwidth / incno;
        }
        else if (bodyWidth >= 768) {
            incno = itemsSplit[1];
            itemWidth = sampwidth / incno;
        }
        else {
            incno = itemsSplit[0];
            itemWidth = sampwidth / incno;
        }
        $(this).css({ 'transform': 'translateX(0px)', 'width': itemWidth * itemNumbers });
        $(this).find(itemClass).each(function () {
            $(this).outerWidth(itemWidth);
        });

        $(".leftLst").addClass("over");
        $(".rightLst").removeClass("over");

    });
}


//this function used to move the items
function ResCarousel(e, el, s) {
    var leftBtn = ('.leftLst');
    var rightBtn = ('.rightLst');
    var translateXval = '';
    var e2='#'+($(el).children().attr("id"));
    var divStyle = $(e2 + ' ' + itemsDiv).css('transform');
    var values = divStyle.match(/-?[\d\.]+/g);
    var xds = Math.abs(values[4]);
    if (e == 0) {
        translateXval = parseInt(xds) - parseInt(itemWidth * s);
        $(rightBtn).removeClass("over");

        if (translateXval <= itemWidth / 2) {
            translateXval = 0;
            $(leftBtn).addClass("over");
        }
    }
    else if (e == 1) {
        var itemsCondition = $(e2).find(itemsDiv).width() - $(e2).width();
        translateXval = parseInt(xds) + parseInt(itemWidth * s);
        $(leftBtn).removeClass("over");

        if (translateXval >= itemsCondition - itemWidth / 2) {
            translateXval = itemsCondition;
            $(rightBtn).addClass("over");
        }
    }
    $(e2 + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
}

//It is used to get some elements from btn
function click(ell, ee) {
   var Parent = "#" + $(ee).parent().attr("id");
    var slide = $(Parent).children().attr("data-slide");
    ResCarousel(ell, Parent, slide);
}

$("#signup").submit(() => {
    const email = cleanInput($("#emailup").val());
    const userid = cleanInput($("#userup").val());
    const password = cleanInput($("#passup").val());

    if(email && userid && password){
        $.ajax({
            url: '/create-user',
            type: 'POST',
            data: JSON.stringify({"userid":userid,"password":password,"email":email}),
            headers: {
              'Content-Type' : 'application/json'
            },
            statusCode : {
              200 : function (data,status,xhttp) {
                alert("User Created");
                window.location.href = "/";
              },
              500 : () => {
                  alert("We f*cked up. Contact support");
              }
            },
            error: function (xhr, status, err) {
              console.error(status, err.toString());
            }
          });
    }
});

$("#signin").submit(()=>{
    const userid = cleanInput($("#userin").val());
    const password = cleanInput($("#passin").val());

    if(userid && password){
        $.ajax({
            url: '/login',
            type: 'POST',
            data: JSON.stringify({"userid":userid,"password":password}),
            headers: {
              'Content-Type' : 'application/json'
            },
            statusCode : {
              200 : () => {
                alert("You have logged in");
                $(".logged-in").css("display","block");
                window.location.href = "/";
              },
              403 : () => {
                  alert("username/password invalid");
              }
            },
            error: function (xhr, status, err) {
              console.error(status, err.toString());
            }
          });
    }
});

$("#signin").submit((event) => {
    event.preventDefault();
  });

});
