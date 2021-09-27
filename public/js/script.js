
    var nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 100) {
        $("nav").css("background-color", "white");
        $('#branch').css('color', 'black');
        $('.nave').css('color', 'black');
        $("#logo").attr("src", "https://cdn-icons-png.flaticon.com/512/3635/3635987.png")

      } else {
        $("nav").css("background-color", "inherit");

        $('#branch').css('color', 'white');
        $('.nave').css('color', 'white');

        $("#logo").attr("src", "image/bank (1).png")


      }
    })


    //contador de impacto
    $(document).ready(function () {

      $('.counter').each(function () {
        $(this).prop('Counter', 0).animate({
          Counter: $(this).text()
        }, {
          duration: 4000,
          easing: 'swing',
          step: function (now) {
            $(this).text(Math.ceil(now));
          }
        });
      });

    });

