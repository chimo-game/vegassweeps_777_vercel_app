document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("Username").value;
    var email = document.getElementById("exampleInputEmail1").value;
    // var password = document.getElementById("exampleInputPassword1").value;

    if (name !== "" && email !== "") {
        CPABuildLock();
    } else {
        alert("Please fill out all required fields.");
    }
});