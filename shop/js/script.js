//<Detecting mobile devices>--------------------------------
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
//</Detecting mobile devices>---------------------------

;

cl = document.querySelectorAll('.menu__item')
function _removeClasses() {
    
    for (var i = 0; i < cl.length; i++) {
      cl[i].classList.remove("_hover")
    }
   }

window.onload = function () {
    document.addEventListener("click", documentActions);

    //Actions (делегування події click)
    function documentActions(e) {
        const targetElement = e.target;
        if(window.innerWidth>768 && isMobile.any()){
            if(targetElement.classList.contains('menu__arrow')){
                targetElement.closest('.menu__item').classList.toggle('_hover')
            }
            if(!targetElement.closest('.menu__item') ){
                _removeClasses()
            }
        }
    }
}