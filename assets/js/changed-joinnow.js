

function promo() {
    x = document.getElementsByClassName("card-title");  // Find the elements
    for (var i = 0; i < x.length; i++) {
        x[i].innerText = "Join Now";    // Change the content
    }

}

promo();