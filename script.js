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
// 1-QADAM — PROFIL OYNASI
// ===============================

const profileButton =
    document.getElementById("profileButton");

if (profileButton) {

    profileButton.addEventListener(
        "click",
        function () {

            // Eski profil oynasi bo‘lsa o‘chiramiz
            const oldProfile =
                document.getElementById("profileModal");

            if (oldProfile) {
                oldProfile.remove();
            }

            // ===============================
            // PROFIL OYNASINI YARATISH
            // ===============================

            const modal =
                document.createElement("div");

            modal.id =
                "profileModal";

            modal.style.cssText = `
                position:fixed;
                inset:0;
                z-index:100000;
                background:#111;
                color:white;
                padding:20px;
                overflow-y:auto;
            `;

            modal.innerHTML = `

                <!-- ORQAGA -->
                <button
                    id="closeProfile"
                    style="
                        position:absolute;
                        top:15px;
                        left:15px;
                        background:none;
                        border:0;
                        color:white;
                        font-size:34px;
                        z-index:10;
                    "
                >
                    ‹
                </button>


                <!-- PROFIL -->
                <div
                    style="
                        text-align:center;
                        padding-top:60px;
                    "
                >

                    <!-- PROFIL RASMI -->
                    <div
                        id="profileImage"
                        style="
                            width:105px;
                            height:105px;
                            margin:0 auto 15px;
                            border-radius:50%;
                            background:#333;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            overflow:hidden;
                            border:2px solid #555;
                            font-size:45px;
                        "
                    >
                        👤
                    </div>


                    <!-- ISM -->
                    <div
                        id="profileDisplayName"
                        style="
                            font-size:23px;
                            font-weight:bold;
                            margin-top:5px;
                        "
                    >
                        Ism
                    </div>


                    <!-- USERNAME -->
                    <div
                        id="profileDisplayUsername"
                        style="
                            color:#999;
                            font-size:15px;
                            margin-top:5px;
                        "
                    >
                        @username
                    </div>


                    <!-- OBUNACHILAR / OBUNALAR -->
                    <div
                        style="
                            display:flex;
                            justify-content:center;
                            gap:55px;
                            margin-top:25px;
                        "
                    >

                        <!-- OBUNACHILAR -->
                        <div>

                            <div
                                id="followersCount"
                                style="
                                    font-size:19px;
                                    font-weight:bold;
                                "
                            >
                                0
                            </div>

                            <div
                                style="
                                    color:#999;
                                    font-size:13px;
                                    margin-top:4px;
                                "
                            >
                                Obunachilar
                            </div>

                        </div>


                        <!-- OBUNALAR -->
                        <div>

                            <div
                                id="followingCount"
                                style="
                                    font-size:19px;
                                    font-weight:bold;
                                "
                            >
                                0
                            </div>

                            <div
                                style="
                                    color:#999;
                                    font-size:13px;
                                    margin-top:4px;
                                "
                            >
                                Obunalar
                            </div>

                        </div>

                    </div>


                    <!-- BIO -->
                    <div
                        id="profileDisplayBio"
                        style="
                            text-align:left;
                            margin-top:30px;
                            padding:0 5px;
                            color:#ddd;
                            font-size:15px;
                            line-height:1.5;
                            word-break:break-word;
                        "
                    >
                    </div>


                    <!-- TAHRIRLASH -->
                    <button
                        id="editProfile"
                        style="
                            width:100%;
                            margin-top:25px;
                            padding:14px;
                            border:1px solid #555;
                            border-radius:12px;
                            background:#222;
                            color:white;
                            font-size:16px;
                            font-weight:bold;
                        "
                    >
                        ✏️ Profilni tahrirlash
                    </button>

                </div>

            `;


            // Oynani sahifaga qo‘shish
            document.body.appendChild(modal);


            // ===============================
            // ORQAGA TUGMASI
            // ===============================

            document.getElementById(
                "closeProfile"
            ).onclick =
                function () {

                    modal.remove();

                };


            // ===============================
            // HOZIRCHA TAHRIRLASH ISHLAMAYDI
            // ===============================

            // ===============================
// ALOHIDA PROFIL TAHRIRLASH OYNASI
// ===============================

document.getElementById(
    "editProfile"
).onclick =
    function () {

        // Eski tahrirlash oynasi bo‘lsa o‘chiramiz
        const oldEdit =
            document.getElementById(
                "editProfileModal"
            );

        if (oldEdit) {
            oldEdit.remove();
        }


        // ===============================
        // YANGI OYNA
        // ===============================

        const editModal =
            document.createElement("div");

        editModal.id =
            "editProfileModal";


        editModal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:200000;
            background:#000;
            color:white;
            padding:20px;
            overflow-y:auto;
        `;


        editModal.innerHTML = `

            <!-- ORQAGA -->

            <button
                id="closeEditProfile"
                style="
                    background:none;
                    border:0;
                    color:white;
                    font-size:34px;
                    margin-bottom:20px;
                "
            >
                ‹
            </button>


            <!-- SARLAVHA -->

            <h2
                style="
                    margin:0 0 30px 0;
                    font-size:22px;
                "
            >
                Profilni tahrirlash
            </h2>


            <!-- RASM -->

            <div
                style="
                    text-align:center;
                    margin-bottom:30px;
                "
            >

                <div
                    id="editProfileImage"
                    style="
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
                    "
                >
                    👤
                </div>


                <label
                    for="editProfileImagePicker"
                    style="
                        display:inline-block;
                        margin-top:15px;
                        padding:11px 17px;
                        background:#222;
                        border-radius:10px;
                    "
                >
                    🖼 Rasm yuklash
                </label>


                <input
                    id="editProfileImagePicker"
                    type="file"
                    accept="image/*"
                    style="display:none;"
                >

            </div>


            <!-- ISM -->

            <label>
                Ism
            </label>

            <input
                id="editProfileName"
                type="text"
                maxlength="30"
                placeholder="Ismingiz"
                style="
                    width:100%;
                    margin:8px 0 20px;
                    padding:14px;
                    border-radius:12px;
                    border:1px solid #444;
                    background:#222;
                    color:white;
                    outline:none;
                    font-size:16px;
                "
            >


            <!-- USERNAME -->

            <label>
                Username
            </label>

            <input
                id="editProfileUsername"
                type="text"
                maxlength="30"
                placeholder="@username"
                style="
                    width:100%;
                    margin:8px 0 20px;
                    padding:14px;
                    border-radius:12px;
                    border:1px solid #444;
                    background:#222;
                    color:white;
                    outline:none;
                    font-size:16px;
                "
            >


            <!-- BIO -->

            <label>
                Bio
            </label>

            <textarea
                id="editProfileBio"
                maxlength="50"
                placeholder="O‘zingiz haqingizda..."
                style="
                    width:100%;
                    height:100px;
                    margin:8px 0 5px;
                    padding:14px;
                    border-radius:12px;
                    border:1px solid #444;
                    background:#222;
                    color:white;
                    outline:none;
                    resize:none;
                    font-size:16px;
                "
            ></textarea>


            <div
                style="
                    text-align:right;
                    color:#888;
                    font-size:12px;
                    margin-bottom:25px;
                "
            >
                Maksimum 50 ta belgi
            </div>


            <!-- SAQLASH -->

            <button
                id="saveEditedProfile"
                style="
                    width:100%;
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


        // Oynani chiqarish
        document.body.appendChild(
            editModal
        );


        // ===============================
        // PROFILDAGI HOZIRGI MA'LUMOTLAR
        // ===============================

        const currentName =
            document.getElementById(
                "profileDisplayName"
            );

        const currentUsername =
            document.getElementById(
                "profileDisplayUsername"
            );

        const currentBio =
            document.getElementById(
                "profileDisplayBio"
            );


        document.getElementById(
            "editProfileName"
        ).value =
            currentName
                ? (
                    currentName.innerText === "Ism"
                        ? ""
                        : currentName.innerText
                )
                : "";


        document.getElementById(
            "editProfileUsername"
        ).value =
            currentUsername
                ? (
                    currentUsername.innerText === "@username"
                        ? ""
                        : currentUsername.innerText
                )
                : "";


        document.getElementById(
            "editProfileBio"
        ).value =
            currentBio
                ? currentBio.innerText
                : "";


        // ===============================
        // ESKI PROFIL RASMINI KO‘RSATISH
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
                        border-radius:50%;
                    "
                >

            `;

        }


        // ===============================
        // ORQAGA
        // ===============================

        document.getElementById(
            "closeEditProfile"
        ).onclick =
            function () {

                editModal.remove();

            };


        // ===============================
        // RASM TANLASH
        // ===============================

        document.getElementById(
            "editProfileImagePicker"
        ).onchange =
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
                                    border-radius:50%;
                                "
                            >

                        `;

                    };


                reader.readAsDataURL(
                    file
                );

            };


        // ===============================
        // SAQLASH
        // HOZIRCHA ISHLAMAYDI
        // ===============================

        
