
import dataFile from "./data.json" assert {type: "json"};

let appContainer = document.getElementById("app-container");

function renderComments() {
    let generatedString = "";
   
    dataFile.comments.map(comment => {

        function populateComment(arg) {
            let string = "";
            string +=`
            <div class="comment-container">
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
            `
            if (dataFile.currentUser.username === arg.user.username) {
                string += `<div class="you">you</div>`
            }
            string += `
                    <div class="created-at">${arg.createdAt}</div>
                </div>
                <p class="comment">${arg.content}</p>
                <div class="button-container">
            `
            if (dataFile.currentUser.username === arg.user.username) {
                string += `
                    <button class="action-button red"><img class="" src="./images/icon-delete.svg" alt="reply-img"><p class="delete">Delete</p></button>
                    <button class="action-button blue"><img src="./images/icon-edit.svg" alt="reply-img"><p class="edit">Edit</p></button>
                `
            }
            else {
                string += `
                    <button class="action-button blue"><img src="./images/icon-reply.svg" alt="reply-img"><p class="reply">Reply</p></button>
                `
            }
            string += `
                </div>
            </div>
            `
            return string
        }
        generatedString += populateComment(comment);
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

function renderPostForm() {
    appContainer.innerHTML += `
        <div class="form-container">
            <div class="avatar"><img src="${dataFile.currentUser.image.png}" alt="${dataFile.currentUser.username}"></div>
            <textarea class="textarea" name="post" id="post" cols="30" rows="7"></textarea>
            <button class="blue-button">SEND</button>
        </div>
    `;
}


renderComments();
renderPostForm();