
import dataFile from "./data.json" assert {type: "json"};


let appContainer = document.getElementById("app-container");

mainRender();

let sendButton = document.getElementById("send-0");
let postText = document.getElementById("textarea-0");

let replyFormCall = document.querySelectorAll(".reply");
let editFormCall = document.querySelectorAll(".edit");
let deleteFormCall = document.querySelectorAll(".delete");


function mainRender() {
    let generatedString = "";

    dataFile.comments.map(comment => {
        // fucntion that generates string to form comments
            function commentFragment(arg) {
                let string = "";
                string +=`
                <div class="comment-container" id="${arg.id}">
                    <div class="vote-container">
                        <button class="upvote" name="${arg.user.username}" value="${arg.id}" id="upvote-${arg.id}"><img src="./images/icon-plus.svg" alt="+"></button>
                        <p class="vote-score" id="score-${arg.id}">${arg.score}</p>
                        <button class="downvote" name="${arg.user.username}" value="${arg.id}" id="downvote-${arg.id}"><img src="./images/icon-minus.svg" alt="-"></button>
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
            <div contenteditable="true" class="textarea" id="textarea-${id}"><span contenteditable="false">${extra}</span></div>
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
        this.content = textarea.innerText.replace(/^[@]\w+\s/, "");
        this.createdAt = "now";
        this.score = 0;
        this.replyingTo = button.name;
        this.replies = [];
        this.user = {};
        this.user.image = dataFile.currentUser.image;
        this.user.username = dataFile.currentUser.username;
    }
}


sendButton.addEventListener("click",() => {
    let newPost = new CommenteClass(sendButton, postText);
    delete newPost.replyingTo;
    dataFile.comments.push(newPost);
    mainRender();
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
                console.log("tic")
                let replyText = document.getElementById(`textarea-${button.value}`);
                let newReply = new CommenteClass(button, replyText);
                delete newReply.replies;

                dataFile.comments.forEach(comment => {
                    if (comment.id === parseInt(button.value)) {
                        comment.replies.push(newReply);
                    }
                    else {
                        comment.replies.forEach(reply => {
                            if (reply.id === parseInt(button.value)) {
                                comment.replies.push(newReply);
                            }
                        })
                    }
                })
                mainRender();
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
            mainRender();
        })
    })
})


deleteFormCall.forEach(button => {
    button.addEventListener("click", () => {
        
        for (let c in dataFile.comments) {
            if (dataFile.comments[c].id ===  parseInt(button.value)) {
                dataFile.comments.splice(c, 1);
            }
            else {
                for (let r in dataFile.comments[c].replies) {
                    if (dataFile.comments[c].replies[r].id === parseInt(button.value)) {
                        dataFile.comments[c].replies.splice(r, 1);
                    }
                }
            }
        }
        mainRender()
    })
})


let upvoteBtn = document.querySelectorAll(".upvote");
let downvoteBtn = document.querySelectorAll(".downvote");

class VoteClass {
    constructor (id, author) {
        this.id = id;
        this.author = author;
        this.incremented = false;
        this.decremented = false;
    }
    run(arg) {
        if (this.author !== dataFile.currentUser.username) {
            if (!this.incremented || !this.decremented) {
                arg > 0 ? this.incremented = true : this.decremented = true;
                dataFile.comments.forEach(comment => {
                    if (comment.id === parseInt(this.id)) {
                        comment.score += parseInt(arg);
                    }
                    else {
                        comment.replies.forEach(reply => {
                            if (reply.id === parseInt(this.id)) {
                                reply.score += parseInt(arg);
                            }
                        })
                    }
                })
            }   
        }
    }
}

upvoteBtn.forEach(button => {
    button.addEventListener("click", () => {
        button.incrementScore = new VoteClass(button.value, button.name);
        button.incrementScore.run("1");
        mainRender();
    })
})


downvoteBtn.forEach(button => {
    button.addEventListener("click", () => {
        button.decrimentScore = new VoteClass(button.value, button.name);
        button.decrimentScore.run("-1");
        mainRender();
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