
import dataFile from "./data.json" assert {type: "json"};


let appContainer = document.getElementById("app-container");

mainRender();

const observer = new MutationObserver(entire => {
    sendPost();
    replyPost();
    editPost();
    delModalCall();
    upvote();
    downvote();
});
observer.observe(appContainer, {childList:true});




function mainRender() {
    let generatedString = "";


    dataFile.comments.sort((a, b) => compareFunction(a.score, b.score));

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
            <div contenteditable="true" class="textarea" id="textarea-${id}">${extra} </div>
            <button class="blue-button ${buttonName}-upload" id="${buttonName}-${id}" name="${recipient}" value="${id}">${buttonName}</button>
        </div>
        `   
    }
    if (recipient && id) {
        string += formFragment(`
        <span contenteditable="false">@${recipient} </span>
        `);
    }
    else {
        string += formFragment("");
    }
    return string
}

function renderModal(button) {
    let string = "";
    string += `
    <div class="modal-main" id="delete-modal">
        <div class="modal-container">
            <h3>Delete comment</h3>
            <p>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
            <div class="modal-buttons" id="modal-buttons">
                <button id="cancel-modal">NO, CANCEL</button>
                <button class="red" value="${button.value}" id="del-btn-${button.value}">YES, DELETE</button>
            </div>
        </div>
    </div>
    `;
    return string
}


function compareFunction(a, b) {
    if (parseInt(a) < parseInt(b)) {
        return +1;
    }
    else if (parseInt(a) > parseInt(b)) {
        return -1;
    }
    else return 0;
}



function lastIndex() {
    let arr = [];
    for (const comment in dataFile.comments) {
        arr.push(dataFile.comments[comment].id);
        if (dataFile.comments[comment].replies.length > 0) {
            for (const reply in dataFile.comments[comment].replies) {
                arr.push(dataFile.comments[comment].replies[reply].id);
            }
        }
    }

    arr.sort((a, b) => compareFunction(a, b));
    for (let i = arr.length - 1; i >= 0; i--) {
        if (i === 0 || parseInt(arr[i]) + 1 !== parseInt(arr[i-1])) {
            return arr[i]
        }
    }
}



class CommenteClass {
    constructor (button, textarea) {
        this.id = lastIndex() + 1
        this.content = textarea.innerText.replace(/^[@]\w+/, "");
        this.createdAt = "now";
        this.score = 0;
        this.replyingTo = button.name;
        this.replies = [];
        this.user = {};
        this.user.image = dataFile.currentUser.image;
        this.user.username = dataFile.currentUser.username;
    }
}



function sendPost() {
    let sendButton = document.getElementById("send-0");
    let postText = document.getElementById("textarea-0");

    sendButton.addEventListener("click",() => {
        let newPost = new CommenteClass(sendButton, postText);
        delete newPost.replyingTo;
        dataFile.comments.push(newPost);
        mainRender();
    })
}
sendPost();



function replyPost() {
    let replyFormCall = document.querySelectorAll(".reply");

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
}
replyPost();



function editPost() {
    let editFormCall = document.querySelectorAll(".edit");

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
}
editPost();



function delModalCall() {
    let delModalCall = document.querySelectorAll(".delete");

    delModalCall.forEach(button => {
        button.addEventListener("click", () => {

            appContainer.innerHTML += renderModal(button);

            let modal = document.getElementById("delete-modal");
            let cancelModal = document.getElementById("cancel-modal");
            cancelModal.addEventListener("click", () => {
                modal.outerHTML = "";
            })

            let deleteBtn = document.getElementById(`del-btn-${button.value}`);
            deleteBtn.addEventListener("click", () => {
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
    })
}
delModalCall();



function voteFragment(arg) {
    return {
        commentID: parseInt(arg),
        incremented: false,
        decremented: false
    }
}
dataFile.currentUser.voted = [];


function voting(id, action, increment, decrement) {

    let currentUserVotes = dataFile.currentUser.voted;

    if (!currentUserVotes.find(vote => vote.commentID === id)) {
        currentUserVotes.push(voteFragment(id))
    }
    for (let i in currentUserVotes) {
        if (currentUserVotes[i].commentID === id && !currentUserVotes[i][action]) {
            currentUserVotes[i].incremented = increment;
            currentUserVotes[i].decremented = decrement;
            updateScore();
        }
    }
    function updateScore(arg) {
        action === "incremented" ? arg = "+1" : arg = "-1";
        dataFile.comments.forEach(comment => {
            if (comment.id === id) {
                comment.score += parseInt(arg);
            }
            else {
                comment.replies.forEach(reply => {
                    if (reply.id === id) {
                        reply.score += parseInt(arg);
                    }
                })
            }
        })
    }
}


function upvote() {
    let upvoteBtn = document.querySelectorAll(".upvote");

    upvoteBtn.forEach(button => {
        button.addEventListener("click", () => {
            let commentID = parseInt(button.value);
            let author = button.name;

            if (author !== dataFile.currentUser.username) {
                voting(commentID, "incremented", true, false);
                mainRender();
            }
        })
    })
}
upvote();



function downvote() {
    let downvoteBtn = document.querySelectorAll(".downvote");

    downvoteBtn.forEach(button => {
        button.addEventListener("click", () => {
            let commentID = parseInt(button.value);
            let author = button.name;

            if (author !== dataFile.currentUser.username) {
                voting(commentID, "decremented", false, true);
                mainRender();
            }
        })
    })
}
downvote();


