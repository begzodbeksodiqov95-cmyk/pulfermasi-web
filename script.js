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
        box.querySelector(
            ".comment-button"
        );


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
        box.querySelector(
            ".share-button"
        );


    shareButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            const videoURL =
                item.videos_url;

            const telegramShareURL =
                "https://t.me/share/url?url=" +
                encodeURIComponent(
                    videoURL
                );

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



function openComments(
    videoId,
    commentButton
) {

    const oldModal =
        document.getElementById(
            "commentsModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");


    modal.id =
        "commentsModal";


    modal.style.position =
        "fixed";

    modal.style.left =
        "0";

    modal.style.right =
        "0";

    modal.style.bottom =
        "0";

    modal.style.height =
        "70%";

    modal.style.background =
        "#111";

    modal.style.color =
        "#fff";

    modal.style.zIndex =
        "99999";

    modal.style.borderRadius =
        "20px 20px 0 0";

    modal.style.padding =
        "15px";

    modal.style.boxSizing =
        "border-box";


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
        ">
            ×
        </button>

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


    document.body.appendChild(
        modal
    );


    const list =
        document.getElementById(
            "commentsList"
        );


    const input =
        document.getElementById(
            "commentInput"
        );


    const sendButton =
        document.getElementById(
            "sendComment"
        );


    function addComment(text) {
const noComments =
    document.getElementById(
        "noComments"
    );


if (noComments) {
    noComments.remove();
}


const comment =
    document.createElement(
        "div"
    );


comment.style.padding =
    "12px 5px";

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
    .querySelector(
        "div:last-child"
    )
    .textContent =
        text;


list.appendChild(
    comment
);

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


        if (
            comments.length > 0
        ) {

            comments.forEach(
                function(item) {

                    if (
                        item.comment_text
                    ) {

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


        sendButton.disabled =
            true;


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


addComment(
    text
);


input.value =
    "";


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

    sendButton.disabled =
        false;

    sendButton.innerText =
        "Yuborish";

}

};


input.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            sendButton.click();

        }

    }
);


document
    .getElementById(
        "closeComments"
    )
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


    current =
        index;


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

        video.currentTime =
            0;

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


        if (
            distance > 0
        ) {

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

            picker.value =
                "";

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


    picker.value =
        "";

    }
);


loadVideos();
// ===============================
// PROFIL OYNASI
// NAME + USERNAME + BIO + RASM
// ===============================

const profileButton =
    document.getElementById("profileButton");


profileButton.addEventListener(
    "click",
  async  function() {

        const oldProfile =
            document.getElementById("profileModal");

        if (oldProfile) {
            oldProfile.remove();
        }


        const modal =
            document.createElement("div");

        modal.id =
            "profileModal";


        modal.style.position =
            "fixed";

        modal.style.inset =
            "0";

        modal.style.background =
            "#111";

        modal.style.color =
            "#fff";

        modal.style.zIndex =
            "100000";

        modal.style.padding =
            "20px";

        modal.style.overflowY =
            "auto";
      modal.innerHTML = `

    <!-- ORQAGA -->
    <button id="closeProfile" style="
        position:absolute;
        top:15px;
        left:15px;
        background:none;
        border:0;
        color:white;
        font-size:32px;
        z-index:10;
    ">‹</button>


    <!-- PROFIL -->
    <div style="
        text-align:center;
        padding-top:55px;
    ">

        <!-- PROFIL RASMI -->
        <div id="profileImage"
            style="
                width:105px;
                height:105px;
                border-radius:50%;
                background:#333;
                margin:0 auto 14px;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:45px;
                overflow:hidden;
                border:2px solid #555;
            ">
            👤
        </div>


        <!-- ISM -->
        <div id="profileDisplayName"
            style="
                font-size:23px;
                font-weight:bold;
                margin-top:5px;
            ">
            Ism
        </div>


        <!-- USERNAME -->
        <div id="profileDisplayUsername"
            style="
                color:#999;
                font-size:15px;
                margin-top:5px;
            ">
            @username
        </div>


        <!-- OBUNACHI / OBUNA -->
        <div style="
            display:flex;
            justify-content:center;
            gap:45px;
            margin-top:22px;
        ">

            <div>
                <div id="followersCount"
                    style="
                        font-size:19px;
                        font-weight:bold;
                    ">
                    0
                </div>

                <div style="
                    color:#999;
                    font-size:13px;
                    margin-top:3px;
                ">
                    Obunachilar
                </div>
            </div>


            <div>
                <div id="followingCount"
                    style="
                        font-size:19px;
                        font-weight:bold;
                    ">
                    0
                </div>

                <div style="
                    color:#999;
                    font-size:13px;
                    margin-top:3px;
                ">
                    Obunalar
                </div>
            </div>

        </div>


        <!-- TAHRIRLASH -->
        <button id="editProfile"
            style="
                width:100%;
                margin-top:25px;
                padding:13px;
                border:1px solid #555;
                border-radius:12px;
                background:#222;
                color:white;
                font-size:16px;
                font-weight:bold;
            ">
            ✏️ Profilni tahrirlash
        </button>


        <!-- BIO -->
        <div id="profileDisplayBio"
            style="
                text-align:left;
                margin-top:25px;
                padding:0 5px;
                color:#ddd;
                font-size:15px;
                line-height:1.5;
                word-break:break-word;
            ">
        </div>

    </div>

`;

        document.body.appendChild(
            modal
        );
// ===============================
// ALOHIDA PROFIL TAHRIRLASH
// ===============================

document.getElementById("editProfile").onclick = function () {

    const editModal = document.createElement("div");

    editModal.id = "editProfileModal";

    editModal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        background:#000;
        color:white;
        overflow-y:auto;
        padding:20px;
    `;

    editModal.innerHTML = `

        <button id="closeEditProfile" style="
            background:none;
            border:0;
            color:white;
            font-size:32px;
            margin-bottom:20px;
        ">‹</button>

        <h2 style="
            margin:0 0 25px 0;
            font-size:22px;
        ">
            Profilni tahrirlash
        </h2>

        <div style="
            text-align:center;
            margin-bottom:25px;
        ">

            <div id="editProfileImage" style="
                width:110px;
                height:110px;
                margin:auto;
                border-radius:50%;
                background:#333;
                display:flex;
                align-items:center;
                justify-content:center;
                overflow:hidden;
                font-size:45px;
            ">
                👤
            </div>

            <label for="editProfileImagePicker"
                style="
                    display:inline-block;
                    margin-top:15px;
                    padding:11px 16px;
                    background:#222;
                    border-radius:10px;
                ">
                🖼 Rasmni o‘zgartirish
            </label>

            <input
                id="editProfileImagePicker"
                type="file"
                accept="image/*"
                style="display:none;"
            >

        </div>

        <label>Ism</label>

        <input
            id="editProfileName"
            type="text"
            maxlength="30"
            placeholder="Ismingiz"
            style="
                width:100%;
                margin:8px 0 18px;
                padding:14px;
                border-radius:12px;
                border:1px solid #444;
                background:#222;
                color:white;
                outline:none;
            "
        >

        <label>Username</label>

        <input
            id="editProfileUsername"
            type="text"
            maxlength="30"
            placeholder="@username"
            style="
                width:100%;
                margin:8px 0 18px;
                padding:14px;
                border-radius:12px;
                border:1px solid #444;
                background:#222;
                color:white;
                outline:none;
            "
        >

        <label>Bio</label>

        <textarea
            id="editProfileBio"
            maxlength="50"
            placeholder="O‘zingiz haqingizda..."
            style="
                width:100%;
                height:90px;
                margin:8px 0 5px;
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
        ">
            Maksimum 50 ta belgi
        </div>

        <button
            id="saveEditedProfile"
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
            "
        >
            💾 Saqlash
        </button>

    `;

    document.body.appendChild(editModal);


    // ===============================
    // HOZIRGI MA'LUMOTLARNI OLISH
    // ===============================

    const currentName =
        document.getElementById(
            "profileDisplayName"
        ).innerText;

    const currentUsername =
        document.getElementById(
            "profileDisplayUsername"
        ).innerText;

    const currentBio =
        document.getElementById(
            "profileDisplayBio"
        ).innerText;


    document.getElementById(
        "editProfileName"
    ).value =
        currentName === "Ism"
        ? ""
        : currentName;


    document.getElementById(
        "editProfileUsername"
    ).value =
        currentUsername === "@username"
        ? ""
        : currentUsername;


    document.getElementById(
        "editProfileBio"
    ).value =
        currentBio;


    // ===============================
    // ESKI RASMNI KO‘RSATISH
    // ===============================

    const oldImage =
        document.querySelector(
            "#profileImage img"
        );

    if (oldImage) {

        document.getElementById(
            "editProfileImage"
        ).innerHTML = `

            <img
                src="${oldImage.src}"
                style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                "
            >

        `;
    }


    // ===============================
    // ORQAGA
    // ===============================

    document.getElementById(
        "closeEditProfile"
    ).onclick = function () {

        editModal.remove();

    };


    // ===============================
    // RASM TANLASH
    // ===============================

    document.getElementById(
        "editProfileImagePicker"
    ).onchange = function () {

        const file = this.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            alert("Faqat rasm tanlang!");

            this.value = "";

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                document.getElementById(
                    "editProfileImage"
                ).innerHTML = `

                    <img
                        src="${event.target.result}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                        "
                    >

                `;

            };


        reader.readAsDataURL(file);

    };


    // ===============================
    // SAQLASH
    // ===============================

    document.getElementById(
        "saveEditedProfile"
    ).onclick = async function () {

        const button = this;

        const telegramId =
            window.Telegram &&
            window.Telegram.WebApp &&
            window.Telegram.WebApp.initDataUnsafe &&
            window.Telegram.WebApp.initDataUnsafe.user
                ? String(
                    window.Telegram.WebApp
                        .initDataUnsafe
                        .user.id
                )
                : null;


        if (!telegramId) {

            alert(
                "Telegram ID topilmadi ❌"
            );

            return;

        }


        const name =
            document.getElementById(
                "editProfileName"
            ).value.trim();


        let username =
            document.getElementById(
                "editProfileUsername"
            ).value.trim();


        const bio =
            document.getElementById(
                "editProfileBio"
            ).value.trim();


        if (
            username &&
            !username.startsWith("@")
        ) {

            username =
                "@" + username;

        }


        const imagePicker =
            document.getElementById(
                "editProfileImagePicker"
            );


        const imageFile =
            imagePicker.files[0];


        try {

            button.disabled = true;

            button.innerText =
                "Saqlanmoqda...";


            // ===============================
            // RASM
            // ===============================

            let avatarURL = null;


            if (imageFile) {

                const fileName =
                    telegramId +
                    "_" +
                    Date.now() +
                    "_" +
                    imageFile.name.replace(
                        /[^a-zA-Z0-9._-]/g,
                        "_"
                    );


                const uploadResponse =
                    await fetch(
                        SUPABASE_URL +
                        "/storage/v1/object/Profiles/" +
                        fileName,
                        {
                            method:"POST",

                            headers:{
                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    "Bearer " +
                                    SUPABASE_KEY,

                                "Content-Type":
                                    imageFile.type,

                                "x-upsert":
                                    "false"
                            },

                            body:imageFile
                        }
                    );


                if (!uploadResponse.ok) {

                    throw new Error(
                        "Rasm yuklanmadi: " +
                        await uploadResponse.text()
                    );

                }


                avatarURL =
                    SUPABASE_URL +
                    "/storage/v1/object/public/Profiles/" +
                    fileName;

            }


            // ===============================
            // PROFIL BORLIGINI TEKSHIRISH
            // ===============================

            const checkResponse =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/profiles" +
                    "?telegram_id=eq." +
                    encodeURIComponent(
                        telegramId
                    ) +
                    "&select=id",
                    {
                        headers:{
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY
                        }
                    }
                );


            if (!checkResponse.ok) {

                throw new Error(
                    await checkResponse.text()
                );

            }


            const existing =
                await checkResponse.json();


            let response;


            // ===============================
            // UPDATE
            // ===============================

            if (
                existing.length > 0
            ) {

                const profileId =
                    existing[0].id;


                response =
                    await fetch(
                        SUPABASE_URL +
                        "/rest/v1/profiles?id=eq." +
                        encodeURIComponent(
                            profileId
                        ),
                        {
                            method:"PATCH",

                            headers:{
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

                                    display_name:
                                        name,

                                    username:
                                        username,

                                    bio:
                                        bio,

                                    ...(avatarURL
                                        ? {
                                            avatar_url:
                                                avatarURL
                                        }
                                        : {})

                                })
                        }
                    );


            } else {

                // ===============================
                // INSERT
                // ===============================

                response =
                    await fetch(
                        SUPABASE_URL +
                        "/rest/v1/profiles",
                        {
                            method:"POST",

                            headers:{
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

                                    telegram_id:
                                        telegramId,

                                    display_name:
                                        name,

                                    username:
                                        username,

                                    bio:
                                        bio,

                                    avatar_url:
                                        avatarURL

                                })
                        }
                    );

            }


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            // ===============================
            // PROFIL OYNASINI YANGILASH
            // ===============================

            document.getElementById(
                "profileDisplayName"
            ).innerText =
                name || "Ism";


            document.getElementById(
                "profileDisplayUsername"
            ).innerText =
                username || "@username";


            document.getElementById(
                "profileDisplayBio"
            ).innerText =
                bio;


            if (avatarURL) {

                document.getElementById(
                    "profileImage"
                ).innerHTML = `

                    <img
                        src="${avatarURL}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                        "
                    >

                `;

            }


            // ===============================
            // TAHRIRLASH OYNASINI YOPISH
            // ===============================

            editModal.remove();

            alert(
                "Profil saqlandi ✅"
            );


        } catch (error) {

            console.log(
                "Profil saqlash xatosi:",
                error
            );

            alert(
                "Profil saqlanmadi ❌\n\n" +
                error.message
            );

        } finally {

            button.disabled = false;

            button.innerText =
                "💾 Saqlash";

        }

    };

};
      // ===============================
// PROFILNI TAHRIRLASHNI OCHISH
// ===============================

document
    .getElementById("editProfile")
    .onclick = function() {

        document
            .getElementById("editProfileBox")
            .style.display = "block";

    };
// ===============================
// BAZADAN PROFILNI OLISH
// ===============================

const telegramId =
    window.Telegram &&
    window.Telegram.WebApp &&
    window.Telegram.WebApp.initDataUnsafe &&
    window.Telegram.WebApp.initDataUnsafe.user
        ? String(
            window.Telegram.WebApp.initDataUnsafe.user.id
        )
        : null;

if (telegramId) {

    const response = await fetch(
        SUPABASE_URL +
        "/rest/v1/profiles" +
        "?telegram_id=eq." +
        encodeURIComponent(telegramId) +
        "&select=display_name,username,bio,avatar_url",
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization":
                    "Bearer " + SUPABASE_KEY
            }
        }
    );

    if (response.ok) {

        const data =
            await response.json();

        if (data.length > 0) {

            document.getElementById(
                "profileName"
            ).value =
                data[0].display_name || "";

            document.getElementById(
                "profileUsername"
            ).value =
                data[0].username || "";

            document.getElementById(
                "profileBio"
            ).value =
                data[0].bio || "";
        // ===============================
// BAZADAGI RASMNI CHIQARISH
// ===============================

if (data[0].avatar_url) {

    document.getElementById(
        "profileImage"
    ).innerHTML = `

        <img
            src="${data[0].avatar_url}"
            style="
                width:100%;
                height:100%;
                object-fit:cover;
            "
        >

    `;

}
        }
    }
}
        // ===============================
        // ORQAGA
        // ===============================

        document
            .getElementById("closeProfile")
            .onclick =
            function() {

                modal.remove();

            };


        // ===============================
        // RASM TANLASH
        // ===============================

        document
            .getElementById("profileImagePicker")
            .addEventListener(
                "change",
                function() {

                    const file =
                        this.files[0];

                    if (!file) {
                        return;
                    }


                    if (
                        !file.type.startsWith("image/")
                    ) {

                        alert(
                            "Faqat rasm tanlang!"
                        );

                        return;
                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function(event) {

                            document
                                .getElementById(
                                    "profileImage"
                                )
                                .innerHTML = `

                                <img
                                    src="${event.target.result}"
                                    style="
                                        width:100%;
                                        height:100%;
                                        object-fit:cover;
                                    "
                                >

                            `;

                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );


        // ===============================
        // SAQLASH
        // ===============================

        document
            .getElementById("saveProfile")
            .onclick =
            async function() {

                const telegramId =
                    window.Telegram &&
                    window.Telegram.WebApp &&
                    window.Telegram.WebApp.initDataUnsafe &&
                    window.Telegram.WebApp.initDataUnsafe.user
                        ? String(
                            window.Telegram.WebApp.initDataUnsafe.user.id
                        )
                        : null;


                if (!telegramId) {

                    alert(
                        "Telegram ID topilmadi ❌"
                    );

                    return;
                }


                const name =
                    document
                        .getElementById("profileName")
                        .value
                        .trim();


                let username =
                    document
                        .getElementById("profileUsername")
                        .value
                        .trim();


                const bio =
                    document
                        .getElementById("profileBio")
                        .value
                        .trim();

// Tanlangan rasmni olish
const imagePicker =
    document.getElementById(
        "profileImagePicker"
    );

const imageFile =
    imagePicker.files[0];
              

                try {
// ===============================
// RASMNI PROFILES BUCKETGA YUKLASH
// ===============================

let avatarURL = null;

if (imageFile) {

    const fileName =
        telegramId +
        "_" +
        Date.now() +
        "_" +
        imageFile.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    const uploadResponse =
        await fetch(
            SUPABASE_URL +
            "/storage/v1/object/Profiles/" +
            fileName,
            {
                method: "POST",

                headers: {
                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        "Bearer " +
                        SUPABASE_KEY,

                    "Content-Type":
                        imageFile.type,

                    "x-upsert":
    "false"
                },

                body:
                    imageFile
            }
        );


    if (!uploadResponse.ok) {

        const errorText =
            await uploadResponse.text();

        throw new Error(
            "Rasm yuklanmadi: " +
            errorText
        );

    }


    avatarURL =
        SUPABASE_URL +
        "/storage/v1/object/public/Profiles/" +
        fileName;
} 
                if (
                    username &&
                    !username.startsWith("@")
                ) {

                    username =
                        "@" + username;

                }


                const button =
                    document.getElementById(
                        "saveProfile"
                    );


                button.disabled =
                    true;

                button.innerText =
                    "Saqlanmoqda...";
                    
                    // Avval profilni tekshiramiz

                    const checkResponse =
                        await fetch(
                            SUPABASE_URL +
                            "/rest/v1/profiles" +
                            "?telegram_id=eq." +
                            encodeURIComponent(
                                telegramId
                            ) +
                            "&select=id",
                            {
                                method: "GET",

                                headers: {

                                    "apikey":
                                        SUPABASE_KEY,

                                    "Authorization":
                                        "Bearer " +
                                        SUPABASE_KEY

                                }
                            }
                        );


                    if (!checkResponse.ok) {

                        const errorText =
                            await checkResponse.text();

                        throw new Error(
                            errorText
                        );

                    }


                    const existing =
                        await checkResponse.json();


                    let response;


                    // Profil bor bo'lsa yangilaymiz

                    if (
                        existing.length > 0
                    ) {

                        const profileId =
                            existing[0].id;


                        response =
                            await fetch(
                                SUPABASE_URL +
                                "/rest/v1/profiles?id=eq." +
                                encodeURIComponent(
                                    profileId
                                ),
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

        display_name:
            name,

        username:
            username,

        bio:
            bio,

        ...(avatarURL
            ? { avatar_url: avatarURL }
            : {})

    })

                                }
                            );


                    } else {

                        // Profil yo'q bo'lsa yaratamiz

                        response =
                            await fetch(
                                SUPABASE_URL +
                                "/rest/v1/profiles",
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

        telegram_id:
            telegramId,

        display_name:
            name,

        username:
            username,

        bio:
            bio,

        avatar_url:
            avatarURL

    })

                                }
                            );

                    }


                    if (!response.ok) {

                        const errorText =
                            await response.text();

                        throw new Error(
                            errorText
                        );

                    }


                    alert(
                        "Profil saqlandi ✅"
                    );


                    // ===============================
// PROFIL OYNASINI YANGILASH
// ===============================

document.getElementById(
    "profileDisplayName"
).innerText = name || "Ism";

document.getElementById(
    "profileDisplayUsername"
).innerText = username || "@username";

document.getElementById(
    "profileDisplayBio"
).innerText = bio || "";

if (avatarURL) {

    document.getElementById(
        "profileImage"
    ).innerHTML = `

        <img
            src="${avatarURL}"
            style="
                width:100%;
                height:100%;
                object-fit:cover;
            "
        >

    `;

}

document.getElementById(
    "editProfileBox"
).style.display = "none";

alert(
    "Profil saqlandi ✅"
);


                } catch (error) {

                    console.log(
                        "Profil saqlash xatosi:",
                        error
                    );


                    alert(
                        "Profil saqlanmadi ❌\n\n" +
                        error.message
                    );


                } finally {

                    button.disabled =
                        false;

                    button.innerText =
                        "💾 Saqlash";

                }

            };

    }
);
