
import dataFile from "./data.json" assert {type: "json"};

let appContainer = document.getElementById("app-container");

renderComments();
appContainer.innerHTML += renderForm("send");

let replyButton = document.querySelectorAll(".reply");
let editButton = document.querySelectorAll(".edit");


function renderComments() {
    let generatedString = "";

    dataFile.comments.map(comment => {
        // fucntion that generates string to form comments
            function populateComment(arg) {
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
                        <p class="comment"><span>@${arg.replyingTo} </span>${arg.content}</p>
                        <div class="button-container">
                    `;
                }
                else {
                    string += `
                        <p class="comment">${arg.content}</p>
                        <div class="button-container">
                    `;
                }
                if (dataFile.currentUser.username === arg.user.username) {
                    string += `
                        <button class="action-button red delete" value="${arg.id}"><img class="" src="./images/icon-delete.svg" alt="reply-img"><p>Delete</p></button>
                        <button class="action-button blue edit" value="${arg.id}"><img src="./images/icon-edit.svg" alt="reply-img"><p>Edit</p></button>
                    `;
                }
                else {
                    string += `
                        <button class="action-button blue reply" value="${arg.id}"><img src="./images/icon-reply.svg" alt="reply-img"><p>Reply</p></button>
                    `;
                }
                string += `
                    </div>
                </div>
                `;
                return string
            }

        // puts comments into string
        generatedString += populateComment(comment);
        // checks if comment has replies and if so puts them to string
        if (comment.replies.length) {
            generatedString += `<div class="reply-container">`;
            comment.replies.map(reply => {
                generatedString += populateComment(reply);
            })
            generatedString += `</div>`;
        }
    })
    appContainer.innerHTML = generatedString;
}

function renderForm(buttonName, recipient, id) {
    let string = "";
    string +=`
        <div class="form-container">
            <div class="avatar"><img src="${dataFile.currentUser.image.png}" alt="${dataFile.currentUser.username}"></div>
    `
    if (recipient && id) {
        string += `
                <textarea class="textarea ${recipient} ${buttonName}">@${recipient} </textarea>
                <button class="blue-button" value="${recipient}">${buttonName}</button>
            </div>
        `;
    }
    else {
        string += `
                <textarea class="textarea" name="${buttonName}"></textarea>
                <button class="blue-button" value="${recipient}">${buttonName}</button>
            </div>
        `;
    }


    return string
}


//console.log(replyButton)

replyButton.forEach(button => {
    button.addEventListener("click", () => {
        let targetComment = document.getElementById(button.value);


        let rootComment = false;
        // find the comment
        let selectedComment = {};
        dataFile.comments.forEach(comment => {
            if (comment.id === parseInt(targetComment.id)) {
                selectedComment = comment;
                rootComment = true;
            }
            else {
                comment.replies.forEach(reply => {
                    if (reply.id === parseInt(targetComment.id)) {
                        selectedComment = reply;
                    }
                })
            }
        })
        
        let recipient =  selectedComment.user.username;
        targetComment.insertAdjacentHTML("afterend", renderForm("reply", recipient, targetComment.id));

        let replyTextarea = document.getElementsByClassName(recipient);
        console.log(replyTextarea)

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