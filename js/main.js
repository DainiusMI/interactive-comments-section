
import dataFile from "./data.json" assert {type: "json"};

let appContainer = document.getElementById("app-container");

renderComments();

let sendPostBtn = document.getElementById("send-0");
let postText = document.getElementById("textarea-0");

let replyFormCall = document.querySelectorAll(".reply");
let editFormCall = document.querySelectorAll(".edit");
let deleteFormCall = document.querySelectorAll(".delete");


function renderComments() {
    let generatedString = "";
    dataFile.comments.map(comment => {
        // fucntion that generates string to form comments
            function commentFragment(arg) {
                let string = "";
                string +=`
                <div class="comment-container" id="${arg.id}">
                    <div class="vote-container">
                        <button class="upvote" value="${arg.id}"><img src="./images/icon-plus.svg" alt="+"></button>
                        <p class="vote-score">${arg.score}</p>
                        <button class="downvote" value="${arg.id}"><img src="./images/icon-minus.svg" alt="-"></button>
                    </div>
                    <div class="user-info">
                        <div class="avatar">
                            <img src="${arg.user.image.png}" alt="${arg.user.username}-img">
                        </div>
                        <div class="user-name">${arg.user.username}</div>
                `;
                if (dataFile.currentUser.username === arg.user.username) {
                    string += `<div class="you">you</div>`
                }
                string += `
                        <div class="created-at">${arg.createdAt}</div>
                    </div>
                `;
                if (arg.replyingTo) {
                    string += `
                        <div contenteditable="false" class="comment" id="comment-${arg.id}"><span contenteditable="false">@${arg.replyingTo} </span>${arg.content}</div>
                        <div class="button-container">
                    `;
                }
                else {
                    string += `
                        <div contenteditable="false" class="comment" id="comment-${arg.id}">${arg.content}</div>
                        <div class="button-container">
                    `;
                }
                if (dataFile.currentUser.username === arg.user.username) {
                    string += `
                        <button class="action-button red delete" value="${arg.id}" id="delete-${arg.id}"><img class="" src="./images/icon-delete.svg" alt="reply-img"><p>Delete</p></button>
                        <button class="action-button blue edit" value="${arg.id}" id="edit-${arg.id}"><img src="./images/icon-edit.svg" alt="reply-img"><p>Edit</p></button>
                    `;
                }
                else {
                    string += `
                        <button class="action-button blue reply" name="${arg.user.username}" value="${arg.id}"><img src="./images/icon-reply.svg" alt="reply-img"><p>Reply</p></button>
                    `;
                }
                string += `
                    </div>
                    <button class="blue-button update" value="${arg.id}" id="update-${arg.id}">UPDATE</button>
                </div>
                `;
                return string
            }

        // puts comments into string
        generatedString += commentFragment(comment);
        // checks if comment has replies and if so puts them to string
        if (comment.replies)
            if (comment.replies.length > 0) {
                generatedString += `<div class="reply-container">`;
                comment.replies.map(reply => {
                    generatedString += commentFragment(reply);
                })
                generatedString += `</div>`;
            }
    })
    appContainer.innerHTML = generatedString;

    // place a send form after all comments
    appContainer.innerHTML += renderForm("send", "", "0");
}


function renderForm(buttonName, recipient, id) {
    let string = "";

    function formFragment(extra) {
        return`
        <div class="form-container">
            <div class="avatar"><img src="${dataFile.currentUser.image.png}" alt="${dataFile.currentUser.username}"></div>
            <textarea class="textarea" id="textarea-${id}">${extra}</textarea>
            <button class="blue-button ${buttonName}-upload" id="${buttonName}-${id}" name="${recipient}" value="${id}">${buttonName}</button>
        </div>
        `   
    }
    if (recipient && id) {
        string += formFragment(`@${recipient} `);
    }
    else {
        string += formFragment("");
    }
    return string
}


class CommenteClass {
    constructor (button, textarea) {
        this.id = button.value
        this.content = textarea.value.replace(/^[@]\w+\s/, "");
        this.createdAt = "now";
        this.score = 0;
        this.replyingTo = button.name;
        this.replies = [];
        this.user = {};
        this.user.image = dataFile.currentUser.image;
        this.user.username = dataFile.currentUser.username;
    }
}


sendPostBtn.addEventListener("click",() => {
    let newPost = new CommenteClass(sendPostBtn, postText);
    delete newPost.replyingTo;
    dataFile.comments.push(newPost);
    renderComments();
})


replyFormCall.forEach(button => {
    button.addEventListener("click", () => {

        let targetComment = document.getElementById(button.value);
        // generate reply form , update simplified the process by putting variables inside the button
        targetComment.insertAdjacentHTML("afterend", renderForm("reply", button.name, button.value));


        // look for attempts to semd a reply
        let replyUpload = document.querySelectorAll(".reply-upload");
        
        replyUpload.forEach(button => {
            button.addEventListener("click", () => {

                let replyText = document.getElementById(`textarea-${button.value}`);

                
                function pushComment() {
                    let result = {};
                    result.id = 0;
                    result.content = replyText.value.replace(/^[@]\w+\s/, "");
                    result.createdAt = "now";
                    result.score = 0;
                    result.replyingTo = button.name;
                    result.user = {};
                    result.user.image = dataFile.currentUser.image;
                    result.user.username = dataFile.currentUser.username;
                    return result
                }
                dataFile.comments.forEach(comment => {
                    if (comment.id === parseInt(button.value)) {
                        comment.replies.push(pushComment());
                    }
                    else {
                        comment.replies.forEach(reply => {
                            if (reply.id === parseInt(button.value)) {
                                comment.replies.push(pushComment());
                            }
                        })
                    }
                })
                renderComments();
            })
        })
    })
})


editFormCall.forEach(button => {
    button.addEventListener("click", () => {

        let targetComment = document.getElementById(`comment-${button.value}`);
        targetComment.setAttribute("contenteditable", true);

        let updateButton = document.getElementById(`update-${button.value}`);
        updateButton.style.display = "block";
 
        updateButton.addEventListener("click", () => {
            let commentText = document.getElementById(`comment-${button.value}`).innerText.replace(/^[@]\w+\s/, "");
            console.log(commentText)

            dataFile.comments.forEach(comment => {
                if (comment.id === parseInt(button.value)) {
                    comment.content = commentText;
                }
                else {
                    comment.replies.forEach(reply => {
                        if (reply.id === parseInt(button.value)) {
                            reply.content = commentText;
                        }
                    })
                }
            })
            renderComments();
        })
    })
})




















let textareas = document.querySelectorAll("textarea");

textareas.forEach(textarea => {
    textarea.style.height = textarea.scrollHeight + 5 + "px";
    textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + 5 + "px";
    })
});