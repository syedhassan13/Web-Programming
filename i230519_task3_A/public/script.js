async function login(){

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

const res = await fetch("/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
username:username,
password:password
})
});

const data = await res.json();

if(data.success){
    window.location.href="/dashboard";
}else{
    document.getElementById("msg").innerText = data.message;
}

}


async function register(){

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

const res = await fetch("/register",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
username:username,
password:password
})
});

const data = await res.json();

if(data.success){
    window.location.href="/dashboard";
}else{
    document.getElementById("msg").innerText = data.message;
}

}