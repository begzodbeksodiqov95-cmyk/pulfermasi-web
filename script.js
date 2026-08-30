let current = 0;
let startY = 0;

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");

const SUPABASE_URL =
"https://bbgruqvwkygjwqdocnsb.supabase.co";

const SUPABASE_KEY =
"sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";

function getVideos() {
return document.querySelectorAll(".video");
}

function addVideoToFeed(item) {

const box = document.createElement("div");  

box.className = "video";  

const likes =  
    item.likes === null ||  
    item.likes === undefined  
        ? 0  
        : item.likes;  

box.innerHTML = `  
    <video  
        src="${item.videos_url}"  
        controls  
        playsinline  
        preload="metadata">  
    </video>  

    <div class="info">  
        <div class="username">@video_uz</div>  
        <div class="caption">🎬 Video</div>  
    </div>  

    <div class="actions">  

        <div class="action like-button">  
            ❤️  
            <span>${likes}</span>  
        </div>  

        <div class="action comment-button">  
💬  
<span>0</span>

</div>  
<div class="action share-button">
    ↗️
    <span>Ulashish</span>
</div>
    </div>  
`;  

box.dataset.id = item.id;  


const likeButton =  
    box.querySelector(".like-button");  


likeButton.addEventListener(  
    "click",  
    async function(event) {  

        event.stopPropagation();  

        const videoId =  
            box.dataset.id;  

        const countElement =  
            likeButton.querySelector("span");  

        let currentLikes =  
            Number(  
                countElement.innerText  
            );  

        currentLikes++;  

        countElement.innerText =  
            currentLikes;  


        const response =  
            await fetch(  
                SUPABASE_URL +  
                "/rest/v1/videos?id=eq." +  
                videoId,  
                {  
                    method: "PATCH",  

                    headers: {  
                        "apikey":  
                            SUPABASE_KEY,  

                        "Authorization":  
                            "Bearer " +  
                            SUPABASE_KEY,  

                        "Content-Type":  
                            "application/json",  

                        "Prefer":  
                            "return=minimal"  
                    },  

                    body:  
                        JSON.stringify({  
                            likes:  
                                currentLikes  
                        })  
                }  
            );  


        if (!response.ok) {  

            currentLikes--;  

            countElement.innerText =  
                currentLikes;  

            console.log(  
                "Like xatosi:",  
                await response.text()  
            );  

        }  

    }  
);

const commentButton =
box.querySelector(".comment-button");

commentButton.addEventListener(
"click",
function(event) {

event.stopPropagation();  

    openComments(  
box.dataset.id,  
commentButton

);
}
);
const shareButton =
    box.querySelector(".share-button");

shareButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        const videoURL =
            item.videos_url;

        const telegramShareURL =
            "https://t.me/share/url?url=" +
            encodeURIComponent(videoURL);

        window.open(
            telegramShareURL,
            "_blank"
        );
    }
);
feed.appendChild(box);
}

async function loadVideos() {

try {  

    const response =  
        await fetch(  
            SUPABASE_URL +  
            "/rest/v1/videos?select=id,videos_url,likes",  
            {  
                headers: {  
                    "apikey":  
                        SUPABASE_KEY,  

                    "Authorization":  
                        "Bearer " +  
                        SUPABASE_KEY  
                }  
            }  
        );  


    if (!response.ok) {  

        alert(  
            "Database xatosi: " +  
            response.status  
        );  

        return;  
    }  


    const data =  
        await response.json();  


    data.forEach(  
        function(item) {  

            if (  
                item.videos_url  
            ) {  

                addVideoToFeed(  
                    item  
                );  

            }  

        }  
    );  


    if (  
        getVideos().length > 0  
    ) {  

        showVideo(0);  

    }  

} catch (error) {  

    console.log(  
        "Xato:",  
        error  
    );  

}

}

function openComments(videoId, commentButton) {

    const oldModal =
        document.getElementById("commentsModal");

    if (oldModal) {
        oldModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.id = "commentsModal";

    modal.style.position = "fixed";
    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.height = "70%";
    modal.style.background = "#111";
    modal.style.color = "#fff";
    modal.style.zIndex = "99999";
    modal.style.borderRadius = "20px 20px 0 0";
    modal.style.padding = "15px";
    modal.style.boxSizing = "border-box";

    modal.innerHTML = `
        <div style="
            text-align:center;
            font-size:20px;
            font-weight:bold;
            margin-bottom:15px;
        ">
            💬 Kommentlar
        </div>

        <button id="closeComments" style="
            position:absolute;
            right:15px;
            top:10px;
            background:none;
            border:0;
            color:white;
            font-size:25px;
        ">×</button>

        <div id="commentsList" style="
            height:calc(100% - 110px);
            overflow-y:auto;
        ">
            <div id="noComments"
                style="
                    text-align:center;
                    color:#888;
                    padding:30px;
                ">
                Hali komment yo‘q.
            </div>
        </div>

        <div style="
            position:absolute;
            bottom:10px;
            left:10px;
            right:10px;
            display:flex;
            gap:8px;
        ">

            <input
                id="commentInput"
                placeholder="Komment yozing..."
                style="
                    flex:1;
                    padding:12px;
                    border-radius:20px;
                    border:1px solid #555;
                    background:#222;
                    color:white;
                    outline:none;
                "
            >

            <button
                id="sendComment"
                style="
                    padding:10px 16px;
                    border:0;
                    border-radius:20px;
                "
            >
                Yuborish
            </button>

        </div>
    `;

    document.body.appendChild(modal);


    const list =
        document.getElementById("commentsList");

    const input =
        document.getElementById("commentInput");

    const sendButton =
        document.getElementById("sendComment");


    function addComment(text) {

        const noComments =
            document.getElementById("noComments");

        if (noComments) {
            noComments.remove();
        }

        const comment =
            document.createElement("div");

        comment.style.padding = "12px 5px";
        comment.style.borderBottom =
            "1px solid #333";
        comment.style.wordBreak =
            "break-word";

        comment.innerHTML = `
            <div style="
                font-weight:bold;
                margin-bottom:5px;
            ">
                👤 Foydalanuvchi
            </div>

            <div></div>
        `;

        comment
            .querySelector("div:last-child")
            .textContent = text;

        list.appendChild(comment);
    }


    async function loadComments() {

        try {

            const response =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/comments" +
                    "?select=comment_text" +
                    "&video_id=eq." +
                    Number(videoId),
                    {
                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY
                        }
                    }
                );


            if (!response.ok) {

                console.log(
                    "Kommentlarni olish xatosi:",
                    await response.text()
                );

                return;
            }


            const comments =
                await response.json();


            if (comments.length > 0) {

                comments.forEach(
                    function(item) {

                        if (item.comment_text) {

                            addComment(
                                item.comment_text
                            );

                        }

                    }
                );

            }

        } catch (error) {

            console.log(
                "Komment xatosi:",
                error
            );

        }

    }


    sendButton.onclick =
        async function() {

            const text =
                input.value.trim();

            if (!text) {
                return;
            }

            sendButton.disabled = true;

            sendButton.innerText =
                "Yuborilmoqda...";


            try {

                const response =
                    await fetch(
                        SUPABASE_URL +
                        "/rest/v1/comments",
                        {
                            method: "POST",

                            headers: {
                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    "Bearer " +
                                    SUPABASE_KEY,

                                "Content-Type":
                                    "application/json",

                                "Prefer":
                                    "return=minimal"
                            },

                            body:
                                JSON.stringify({
                                    video_id:
                                        Number(videoId),

                                    comment_text:
                                        text
                                })
                        }
                    );


                if (!response.ok) {

                    console.log(
                        "Komment xatosi:",
                        await response.text()
                    );

                    alert(
                        "Komment yuborilmadi ❌"
                    );

                    return;
                }


                addComment(text);

                input.value = "";

                list.scrollTop =
                    list.scrollHeight;


                const countElement =
                    commentButton.querySelector(
                        "span"
                    );

                if (countElement) {

                    let count =
                        Number(
                            countElement.innerText
                        ) || 0;

                    count++;

                    countElement.innerText =
                        count;
                }


            } catch (error) {

                console.log(
                    "Xato:",
                    error
                );

                alert(
                    "Internet xatosi ❌"
                );

            } finally {

                sendButton.disabled = false;

                sendButton.innerText =
                    "Yuborish";
            }

        };


    input.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                sendButton.click();

            }

        }
    );


    document
        .getElementById("closeComments")
        .onclick =
        function() {

            modal.remove();

        };


    loadComments();
}

function showVideo(index) {

const videos =  
    getVideos();  


if (  
    index < 0 ||  
    index >= videos.length  
) {  

    return;  

}  


videos.forEach(  
    function(box) {  

        box.classList.remove(  
            "active"  
        );  


        const video =  
            box.querySelector(  
                "video"  
            );  


        if (video) {  

            video.pause();  

        }  

    }  
);  


current = index;  


const box =  
    videos[current];  


box.classList.add(  
    "active"  
);  


const video =  
    box.querySelector(  
        "video"  
    );  


if (video) {  

    video.currentTime = 0;  

}

}

document.addEventListener(
"touchstart",
function(event) {

startY =  
        event.touches[0].clientY;  

}

);

document.addEventListener(
"touchend",
function(event) {

const endY =  
        event.changedTouches[0].clientY;  


    const distance =  
        startY - endY;  


    if (  
        Math.abs(distance) < 60  
    ) {  

        return;  

    }  


    if (distance > 0) {  

        showVideo(  
            current + 1  
        );  

    } else {  

        showVideo(  
            current - 1  
        );  

    }  

}

);

picker.addEventListener(
"change",
function() {

const file =  
        picker.files[0];  


    if (!file) {  

        return;  

    }  


    if (  
        !file.type.startsWith(  
            "video/"  
        )  
    ) {  

        alert(  
            "Faqat video tanlang!"  
        );  

        picker.value = "";  

        return;  

    }  


    const fileName =  
        Date.now() +  
        "_" +  
        Math.random()  
            .toString(36)  
            .substring(2) +  
        "_" +  
        file.name.replace(  
            /[^a-zA-Z0-9._-]/g,  
            "_"  
        );  


    const uploadURL =  
        SUPABASE_URL +  
        "/storage/v1/object/Videos/" +  
        fileName;  


    const progress =  
        document.createElement(  
            "div"  
        );  


    progress.style.position =  
        "fixed";  

    progress.style.top =  
        "50%";  

    progress.style.left =  
        "50%";  

    progress.style.transform =  
        "translate(-50%, -50%)";  

    progress.style.background =  
        "#111";  

    progress.style.color =  
        "#fff";  

    progress.style.padding =  
        "20px 30px";  

    progress.style.borderRadius =  
        "15px";  

    progress.style.zIndex =  
        "99999";  


    progress.innerText =  
        "Yuklanmoqda: 0%";  


    document.body.appendChild(  
        progress  
    );  


    const xhr =  
        new XMLHttpRequest();  


    xhr.open(  
        "POST",  
        uploadURL,  
        true  
    );  


    xhr.setRequestHeader(  
        "Authorization",  
        "Bearer " +  
        SUPABASE_KEY  
    );  


    xhr.setRequestHeader(  
        "apikey",  
        SUPABASE_KEY  
    );  


    xhr.setRequestHeader(  
        "Content-Type",  
        file.type  
    );  


    xhr.setRequestHeader(  
        "x-upsert",  
        "false"  
    );  


    xhr.upload.onprogress =  
        function(event) {  

            if (  
                event.lengthComputable  
            ) {  

                const percent =  
                    Math.round(  
                        event.loaded /  
                        event.total *  
                        100  
                    );  


                progress.innerText =  
                    "Yuklanmoqda: " +  
                    percent +  
                    "%";  

            }  

        };  


    xhr.onload =  
        async function() {  

            if (  
                xhr.status >= 200 &&  
                xhr.status < 300  
            ) {  


                const publicURL =  
                    SUPABASE_URL +  
                    "/storage/v1/object/public/Videos/" +  
                    fileName;  


                progress.innerText =  
                    "Saqlanmoqda...";  


                const dbResponse =  
                    await fetch(  
                        SUPABASE_URL +  
                        "/rest/v1/videos",  
                        {  
                            method: "POST",  

                            headers: {  

                                "apikey":  
                                    SUPABASE_KEY,  

                                "Authorization":  
                                    "Bearer " +  
                                    SUPABASE_KEY,  

                                "Content-Type":  
                                    "application/json",  

                                "Prefer":  
                                    "return=minimal"  

                            },  

                            body:  
                                JSON.stringify({  
                                    videos_url:  
                                        publicURL,  

                                    likes:  
                                        0  

                                })  

                        }  
                    );  


                if (  
                    !dbResponse.ok  
                ) {  

                    progress.innerText =  
                        "Database xatosi: " +  
                        dbResponse.status;  


                    console.log(  
                        await dbResponse.text()  
                    );  


                    setTimeout(  
                        function() {  

                            progress.remove();  

                        },  
                        4000  
                    );  


                    return;  

                }  


                progress.innerText =  
                    "Yuklandi! ✅";  


                addVideoToFeed({  

                    id:  
                        Date.now(),  

                    videos_url:  
                        publicURL,  

                    likes:  
                        0  

                });  


                showVideo(  
                    getVideos().length - 1  
                );  


                setTimeout(  
                    function() {  

                        progress.remove();  

                    },  
                    1000  
                );  


            } else {  


                progress.innerText =  
                    "Upload xatosi: " +  
                    xhr.status;  


                setTimeout(  
                    function() {  

                        progress.remove();  

                    },  
                    4000  
                );  

            }  

        };  


    xhr.onerror =  
        function() {  

            progress.innerText =  
                "Internet xatosi ❌";  


            setTimeout(  
                function() {  

                    progress.remove();  

                },  
                3000  
            );  

        };  


    xhr.send(file);  


    picker.value = "";  

}

);

loadVideos();
// ===============================
// PROFIL OYNASI
// ===============================

const profileButton =
    document.getElementById("profileButton");

profileButton.addEventListener(
    "click",
    function () {

        const oldProfile =
            document.getElementById("profileModal");

        if (oldProfile) {
            oldProfile.remove();
        }

        const modal =
            document.createElement("div");

        modal.id = "profileModal";

        modal.style.position = "fixed";
        modal.style.inset = "0";
        modal.style.background = "#111";
        modal.style.color = "#fff";
        modal.style.zIndex = "100000";
        modal.style.padding = "20px";
        modal.style.overflowY = "auto";

        modal.innerHTML = `

            <button id="closeProfile" style="
                position:absolute;
                top:15px;
                left:15px;
                background:none;
                border:0;
                color:white;
                font-size:30px;
            ">‹</button>

            <div style="
                text-align:center;
                margin-top:20px;
            ">

                <div id="profileImage"
                    style="
                        width:90px;
                        height:90px;
                        border-radius:50%;
                        background:#333;
                        margin:0 auto 15px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:40px;
                        overflow:hidden;
                    ">
                    👤
                </div>

                <h2>Profil</h2>

                <div style="
                    color:#888;
                    margin-top:5px;
                ">
                    Profilingizni sozlang
                </div>

            </div>


            <div style="
                margin-top:30px;
            ">

                <label>
                    Ism
                </label>

                <input
                    id="profileName"
                    type="text"
                    placeholder="Ismingiz"
                    maxlength="30"
                    style="
                        width:100%;
                        margin-top:8px;
                        margin-bottom:18px;
                        padding:14px;
                        border-radius:12px;
                        border:1px solid #444;
                        background:#222;
                        color:white;
                        outline:none;
                    "
                >


                <label>
                    Username
                </label>

                <input
                    id="profileUsername"
                    type="text"
                    placeholder="@username"
                    maxlength="30"
                    style="
                        width:100%;
                        margin-top:8px;
                        margin-bottom:18px;
                        padding:14px;
                        border-radius:12px;
                        border:1px solid #444;
                        background:#222;
                        color:white;
                        outline:none;
                    "
                >


                <label>
                    Bio
                </label>

                <textarea
                    id="profileBio"
                    placeholder="O'zingiz haqingizda..."
                    maxlength="50"
                    style="
                        width:100%;
                        height:90px;
                        margin-top:8px;
                        padding:14px;
                        border-radius:12px;
                        border:1px solid #444;
                        background:#222;
                        color:white;
                        outline:none;
                        resize:none;
                    "
                ></textarea>

                <div style="
                    text-align:right;
                    color:#888;
                    font-size:12px;
                    margin-top:4px;
                ">
                    Maksimum 50 ta belgi
                </div>


                <label
                    for="profileImagePicker"
                    style="
                        display:block;
                        margin-top:20px;
                        padding:14px;
                        background:#222;
                        border-radius:12px;
                        text-align:center;
                        cursor:pointer;
                    ">
                    🖼 Profil rasmi yuklash
                </label>

                <input
                    id="profileImagePicker"
                    type="file"
                    accept="image/*"
                    style="display:none;"
                >


                <button
                    id="saveProfile"
                    style="
                        width:100%;
                        margin-top:20px;
                        padding:15px;
                        border:0;
                        border-radius:12px;
                        background:white;
                        color:black;
                        font-size:16px;
                        font-weight:bold;
                    ">
                    💾 Saqlash
                </button>

            </div>
        `;

        document.body.appendChild(modal);


        // Oldingi ma'lumotlarni olish
        document.getElementById("profileName").value =
            localStorage.getItem("profileName") || "";

        document.getElementById("profileUsername").value =
            localStorage.getItem("profileUsername") || "";

        document.getElementById("profileBio").value =
            localStorage.getItem("profileBio") || "";


        // Rasmni ko'rsatish
        const savedImage =
            localStorage.getItem("profileImage");

        if (savedImage) {

            document.getElementById(
                "profileImage"
            ).innerHTML = `
                <img
                    src="${savedImage}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                    "
                >
            `;
        }


        // Rasm tanlash
        document
            .getElementById("profileImagePicker")
            .addEventListener(
                "change",
                function () {

                    const file =
                        this.files[0];

                    if (!file) {
                        return;
                    }

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {
                        alert(
                            "Faqat rasm tanlang!"
                        );
                        return;
                    }

                    const reader =
                        new FileReader();

                    reader.onload =
                        function (event) {

                            const image =
                                event.target.result;

                            localStorage.setItem(
                                "profileImage",
                                image
                            );

                            document.getElementById(
                                "profileImage"
                            ).innerHTML = `
                                <img
                                    src="${image}"
                                    style="
                                        width:100%;
                                        height:100%;
                                        object-fit:cover;
                                    "
                                >
                            `;
                        };

                    reader.readAsDataURL(file);
                }
            );


        // Profilni saqlash
        document
            .getElementById("saveProfile")
            .addEventListener(
                "click",
                function () {

                    const name =
                        document
                            .getElementById(
                                "profileName"
                            )
                            .value
                            .trim();

                    const username =
                        document
                            .getElementById(
                                "profileUsername"
                            )
                            .value
                            .trim();

                    const bio =
                        document
                            .getElementById(
                                "profileBio"
                            )
                            .value
                            .trim();


                    localStorage.setItem(
                        "profileName",
                        name
                    );

                    localStorage.setItem(
                        "profileUsername",
                        username
                    );

                    localStorage.setItem(
                        "profileBio",
                        bio
                    );


                    alert(
                        "Profil ma'lumotlari saqlandi ✅"
                    );

                    modal.remove();
                }
            );


        // Orqaga qaytish
        document
            .getElementById("closeProfile")
            .addEventListener(
                "click",
                function () {

                    modal.remove();

                }
            );

    }
);
